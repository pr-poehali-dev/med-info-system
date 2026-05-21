"""
Авторизация МИС: login, me, logout.
Пароли — bcrypt. Токены — JWT (HS256). Сессии хранятся в БД.
"""
import os
import json
import hashlib
import hmac
import base64
import time
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p69760893_med_info_system")

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Authorization",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

# ─── Minimal JWT (HS256, no external deps) ────────────────────────────────────

def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

def _b64url_decode(s: str) -> bytes:
    pad = 4 - len(s) % 4
    if pad != 4:
        s += "=" * pad
    return base64.urlsafe_b64decode(s)

def create_jwt(payload: dict, secret: str, expires_in: int = 86400 * 7) -> str:
    header = _b64url_encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    payload["exp"] = int(time.time()) + expires_in
    body = _b64url_encode(json.dumps(payload).encode())
    sig = hmac.new(secret.encode(), f"{header}.{body}".encode(), hashlib.sha256).digest()
    return f"{header}.{body}.{_b64url_encode(sig)}"

def verify_jwt(token: str, secret: str) -> dict | None:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header, body, sig = parts
        expected_sig = hmac.new(secret.encode(), f"{header}.{body}".encode(), hashlib.sha256).digest()
        if not hmac.compare_digest(_b64url_decode(sig), expected_sig):
            return None
        payload = json.loads(_b64url_decode(body))
        if payload.get("exp", 0) < time.time():
            return None
        return payload
    except Exception:
        return None

def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()

# ─── bcrypt via pg crypt() ─────────────────────────────────────────────────────

def check_password(plain: str, stored_hash: str, conn) -> bool:
    with conn.cursor() as cur:
        cur.execute("SELECT crypt(%s, %s) = %s", (plain, stored_hash, stored_hash))
        return cur.fetchone()[0]

def hash_password(plain: str, conn) -> str:
    with conn.cursor() as cur:
        cur.execute("SELECT crypt(%s, gen_salt('bf', 12))", (plain,))
        return cur.fetchone()[0]

# ─── Handler ──────────────────────────────────────────────────────────────────

def handler(event: dict, context) -> dict:
    """Авторизация: action=login|me|logout в теле или пути запроса"""
    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")

    if method == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    # Определяем action из тела или пути
    body_raw = event.get("body") or "{}"
    body_action_check = {}
    try:
        body_action_check = json.loads(body_raw)
    except Exception:
        pass
    action = body_action_check.get("action") or ""
    if "login" in path or action == "login":
        effective_action = "login"
    elif "me" in path or action == "me":
        effective_action = "me"
    elif "logout" in path or action == "logout":
        effective_action = "logout"
    else:
        effective_action = action or "login"

    # ── POST /login ──────────────────────────────────────────────────────────
    if method == "POST" and effective_action == "login":
        body = json.loads(event.get("body") or "{}")
        username = (body.get("username") or "").strip().lower()
        password = body.get("password") or ""

        if not username or not password:
            return _err(400, "Укажите логин и пароль")

        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    f"""
                    SELECT s.id, s.password_hash, s.first_name, s.last_name,
                           s.is_active, s.failed_attempts, s.locked_until,
                           ag.name as access_group, ag.permissions,
                           s.specialization_id, sp.name as specialization
                    FROM {SCHEMA}.staff s
                    LEFT JOIN {SCHEMA}.access_groups ag ON ag.id = s.access_group_id
                    LEFT JOIN {SCHEMA}.specializations sp ON sp.id = s.specialization_id
                    WHERE LOWER(s.username) = %s
                    """,
                    (username,)
                )
                row = cur.fetchone()

            if not row:
                return _err(401, "Неверный логин или пароль")

            (staff_id, pw_hash, first_name, last_name, is_active,
             failed_attempts, locked_until, access_group, permissions,
             spec_id, spec_name) = row

            if not is_active:
                return _err(403, "Учётная запись заблокирована")

            # Проверка блокировки по попыткам
            import datetime
            if locked_until and locked_until > datetime.datetime.now(datetime.timezone.utc):
                return _err(403, "Слишком много попыток. Попробуйте позже")

            if not check_password(password, pw_hash, conn):
                # Инкрементируем счётчик неудач
                new_attempts = (failed_attempts or 0) + 1
                lock_sql = ""
                if new_attempts >= 5:
                    lock_sql = f", locked_until = NOW() + INTERVAL '15 minutes'"
                with conn.cursor() as cur:
                    cur.execute(
                        f"UPDATE {SCHEMA}.staff SET failed_attempts = %s {lock_sql} WHERE id = %s",
                        (new_attempts, staff_id)
                    )
                conn.commit()
                return _err(401, "Неверный логин или пароль")

            # Сбрасываем счётчик
            with conn.cursor() as cur:
                cur.execute(
                    f"UPDATE {SCHEMA}.staff SET failed_attempts = 0, locked_until = NULL, last_login_at = NOW() WHERE id = %s",
                    (staff_id,)
                )

            secret = os.environ.get("JWT_SECRET", "fallback-secret-change-me")
            token = create_jwt({
                "sub": staff_id,
                "username": username,
                "group": access_group,
                "perms": permissions if isinstance(permissions, dict) else {},
            }, secret)

            th = token_hash(token)
            ip = (event.get("requestContext") or {}).get("identity", {}).get("sourceIp")
            ua = (event.get("headers") or {}).get("user-agent", "")

            with conn.cursor() as cur:
                cur.execute(
                    f"""
                    INSERT INTO {SCHEMA}.auth_sessions (staff_id, token_hash, ip_address, user_agent, expires_at)
                    VALUES (%s, %s, %s::inet, %s, NOW() + INTERVAL '7 days')
                    """,
                    (staff_id, th, ip, ua)
                )
            conn.commit()

            return {
                "statusCode": 200,
                "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
                "body": json.dumps({
                    "token": token,
                    "user": {
                        "id": staff_id,
                        "firstName": first_name,
                        "lastName": last_name,
                        "accessGroup": access_group,
                        "permissions": permissions if isinstance(permissions, dict) else {},
                        "specialization": spec_name,
                    }
                })
            }
        finally:
            conn.close()

    # ── GET /me ───────────────────────────────────────────────────────────────
    if effective_action == "me":
        token = _extract_token(event)
        if not token:
            return _err(401, "Требуется авторизация")

        secret = os.environ.get("JWT_SECRET", "fallback-secret-change-me")
        payload = verify_jwt(token, secret)
        if not payload:
            return _err(401, "Токен недействителен или истёк")

        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    f"""
                    SELECT s.id, s.first_name, s.last_name, s.middle_name,
                           s.username, s.email, s.phone, s.position,
                           ag.name as access_group, ag.permissions,
                           sp.name as specialization, b.name as branch
                    FROM {SCHEMA}.staff s
                    LEFT JOIN {SCHEMA}.access_groups ag ON ag.id = s.access_group_id
                    LEFT JOIN {SCHEMA}.specializations sp ON sp.id = s.specialization_id
                    LEFT JOIN {SCHEMA}.branches b ON b.id = s.branch_id
                    WHERE s.id = %s AND s.is_active = true
                    """,
                    (payload["sub"],)
                )
                row = cur.fetchone()
            if not row:
                return _err(401, "Пользователь не найден")

            (sid, fn, ln, mn, uname, email, phone, position,
             ag, perms, spec, branch) = row

            return {
                "statusCode": 200,
                "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
                "body": json.dumps({
                    "id": sid,
                    "firstName": fn,
                    "lastName": ln,
                    "middleName": mn,
                    "username": uname,
                    "email": email,
                    "phone": phone,
                    "position": position,
                    "accessGroup": ag,
                    "permissions": perms if isinstance(perms, dict) else {},
                    "specialization": spec,
                    "branch": branch,
                })
            }
        finally:
            conn.close()

    # ── POST /logout ──────────────────────────────────────────────────────────
    if effective_action == "logout":
        token = _extract_token(event)
        if token:
            conn = get_conn()
            try:
                th = token_hash(token)
                with conn.cursor() as cur:
                    cur.execute(
                        f"UPDATE {SCHEMA}.auth_sessions SET expires_at = NOW() WHERE token_hash = %s",
                        (th,)
                    )
                conn.commit()
            finally:
                conn.close()
        return {
            "statusCode": 200,
            "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
            "body": json.dumps({"ok": True})
        }

    return _err(404, "Not found")


def _extract_token(event: dict) -> str | None:
    headers = event.get("headers") or {}
    auth = headers.get("X-Authorization") or headers.get("authorization") or ""
    if auth.startswith("Bearer "):
        return auth[7:]
    return None

def _err(code: int, msg: str) -> dict:
    return {
        "statusCode": code,
        "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
        "body": json.dumps({"error": msg})
    }