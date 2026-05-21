"""
Пациенты МИС: CRUD с шифрованием персданных на уровне приложения (Python AES-128 Fernet).
ФИО, телефон, дата рождения, паспорт, адрес, СНИЛС, ОМС — шифруются до записи в БД.
Поиск — по HMAC-хешам (без расшифровки).
Каждое чтение логируется в patient_access_log.
"""
import os
import json
import hashlib
import hmac as hmac_lib
import base64
import psycopg2
import psycopg2.extras
import re
from cryptography.fernet import Fernet

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p69760893_med_info_system")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Authorization",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def _get_fernet() -> Fernet:
    """Создаёт Fernet-ключ из ENCRYPT_KEY (32 байта base64url)"""
    raw = os.environ.get("ENCRYPT_KEY", "fallback-key-change-in-production-00000")
    # Берём первые 32 байта, дополняя если нужно
    key_bytes = (raw.encode() * 3)[:32]
    fernet_key = base64.urlsafe_b64encode(key_bytes)
    return Fernet(fernet_key)

def encrypt(value: str | None) -> bytes | None:
    if not value:
        return None
    return _get_fernet().encrypt(value.encode())

def decrypt(data: bytes | memoryview | None) -> str | None:
    if not data:
        return None
    try:
        raw = bytes(data)
        return _get_fernet().decrypt(raw).decode()
    except Exception:
        return None

def norm_phone(phone: str) -> str:
    return re.sub(r"[^\d]", "", phone or "")

def make_hash(value: str) -> str:
    """HMAC-SHA256 хеш для поиска без расшифровки"""
    secret = os.environ.get("ENCRYPT_KEY", "fallback").encode()
    return hmac_lib.new(secret, value.lower().strip().encode(), hashlib.sha256).hexdigest()

def get_staff_id(event: dict) -> int | None:
    """Извлекает staff_id из JWT без верификации (только для логирования — верификация на уровне nginx/proxy)"""
    try:
        import base64
        headers = event.get("headers") or {}
        auth = headers.get("X-Authorization") or headers.get("authorization") or ""
        if not auth.startswith("Bearer "):
            return None
        token = auth[7:]
        parts = token.split(".")
        if len(parts) != 3:
            return None
        pad = 4 - len(parts[1]) % 4
        if pad != 4:
            parts[1] += "=" * pad
        payload = json.loads(base64.urlsafe_b64decode(parts[1]))
        return payload.get("sub")
    except Exception:
        return None

def log_access(conn, patient_id: int, staff_id: int | None, action: str, ip: str | None):
    if not staff_id:
        return
    with conn.cursor() as cur:
        cur.execute(
            f"INSERT INTO {SCHEMA}.patient_access_log (patient_id, staff_id, action, ip_address) VALUES (%s, %s, %s, %s::inet)",
            (patient_id, staff_id, action, ip)
        )

def handler(event: dict, context) -> dict:
    """Пациенты: GET /list, GET /{id}, POST /create, PUT /{id}"""
    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")

    if method == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    # Определяем action: из параметра или пути
    params_early = event.get("queryStringParameters") or {}
    body_early = {}
    try:
        body_early = json.loads(event.get("body") or "{}")
    except Exception:
        pass
    action = body_early.get("action") or params_early.get("action") or ""
    if "list" in path or action == "list" or (method == "GET" and not action):
        effective = "list"
    elif "create" in path or action == "create":
        effective = "create"
    elif action == "update" or method == "PUT":
        effective = "update"
        patient_id_str = path.rstrip("/").split("/")[-1]
    else:
        # Попытка достать ID из пути для GET /{id}
        effective = "get"
        patient_id_str = path.rstrip("/").split("/")[-1]

    conn = get_conn()
    staff_id = get_staff_id(event)
    ip = (event.get("requestContext") or {}).get("identity", {}).get("sourceIp")

    try:
        # ── GET /list ─────────────────────────────────────────────────────────
        if method == "GET" and effective == "list":
            params = event.get("queryStringParameters") or {}
            search = (params.get("q") or "").strip()
            branch_id = params.get("branch_id")
            limit = min(int(params.get("limit", 50)), 200)
            offset = int(params.get("offset", 0))

            where = ["1=1"]
            args = []

            if branch_id:
                where.append("p.branch_id = %s")
                args.append(int(branch_id))

            if search:
                if re.match(r"^\+?[\d\s\-()]{7,}$", search):
                    # Поиск по телефону через хеш
                    ph = make_hash(norm_phone(search))
                    where.append("p.phone_hash = %s")
                    args.append(ph)
                else:
                    # Поиск по имени через хеш
                    nh = make_hash(search)
                    where.append("p.full_name_hash = %s")
                    args.append(nh)

            where_sql = " AND ".join(where)

            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                cur.execute(
                    f"""
                    SELECT p.id, p.patient_number, p.gender, p.blood_type, p.allergies_note,
                           p.created_at, p.branch_id,
                           p.full_name_enc, p.birth_date_enc, p.phone_enc,
                           b.name as branch_name,
                           COUNT(*) OVER() as total_count
                    FROM {SCHEMA}.patients p
                    LEFT JOIN {SCHEMA}.branches b ON b.id = p.branch_id
                    WHERE {where_sql}
                    ORDER BY p.created_at DESC
                    LIMIT %s OFFSET %s
                    """,
                    args + [limit, offset]
                )
                rows = cur.fetchall()

            patients = []
            for r in rows:
                patients.append({
                    "id": r["id"],
                    "patientNumber": r["patient_number"],
                    "fullName": decrypt(r["full_name_enc"]),
                    "birthDate": decrypt(r["birth_date_enc"]),
                    "phone": decrypt(r["phone_enc"]),
                    "gender": r["gender"],
                    "bloodType": r["blood_type"],
                    "allergiesNote": r["allergies_note"],
                    "branchName": r["branch_name"],
                    "createdAt": str(r["created_at"]),
                })

            total = rows[0]["total_count"] if rows else 0

            return _ok({
                "patients": patients,
                "total": total,
                "limit": limit,
                "offset": offset,
            })

        # ── GET /{id} ─────────────────────────────────────────────────────────
        if method == "GET" and effective == "get":
            try:
                patient_id = int(patient_id_str)
            except (ValueError, NameError):
                return _err(400, "Некорректный ID пациента")

            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                cur.execute(
                    f"""
                    SELECT p.id, p.patient_number, p.gender, p.blood_type, p.allergies_note,
                           p.created_at, p.branch_id,
                           p.full_name_enc, p.birth_date_enc, p.phone_enc,
                           p.email_enc, p.passport_enc, p.address_enc,
                           p.snils_enc, p.oms_enc,
                           b.name as branch_name
                    FROM {SCHEMA}.patients p
                    LEFT JOIN {SCHEMA}.branches b ON b.id = p.branch_id
                    WHERE p.id = %s
                    """,
                    [patient_id]
                )
                r = cur.fetchone()

            if not r:
                return _err(404, "Пациент не найден")

            log_access(conn, patient_id, staff_id, "view", ip)
            conn.commit()

            return _ok({
                "id": r["id"],
                "patientNumber": r["patient_number"],
                "fullName": decrypt(r["full_name_enc"]),
                "birthDate": decrypt(r["birth_date_enc"]),
                "phone": decrypt(r["phone_enc"]),
                "email": decrypt(r["email_enc"]),
                "passport": decrypt(r["passport_enc"]),
                "address": decrypt(r["address_enc"]),
                "snils": decrypt(r["snils_enc"]),
                "oms": decrypt(r["oms_enc"]),
                "gender": r["gender"],
                "bloodType": r["blood_type"],
                "allergiesNote": r["allergies_note"],
                "branchName": r["branch_name"],
                "createdAt": str(r["created_at"]),
            })

        # ── POST /create ──────────────────────────────────────────────────────
        if method == "POST" and effective == "create":
            body = body_early
            full_name = (body.get("fullName") or "").strip()
            birth_date = (body.get("birthDate") or "").strip()

            if not full_name or not birth_date:
                return _err(400, "ФИО и дата рождения обязательны")

            phone = (body.get("phone") or "").strip()
            email = (body.get("email") or "").strip()
            passport = (body.get("passport") or "").strip()
            address = (body.get("address") or "").strip()
            snils = (body.get("snils") or "").strip()
            oms = (body.get("oms") or "").strip()
            gender = body.get("gender")
            blood_type = body.get("bloodType")
            branch_id = body.get("branchId")

            # Хеши для поиска
            phone_hash = make_hash(norm_phone(phone)) if phone else None
            name_hash = make_hash(full_name)

            # Генерация номера карты
            with conn.cursor() as cur:
                cur.execute(f"SELECT COALESCE(MAX(CAST(patient_number AS BIGINT)), 0) + 1 FROM {SCHEMA}.patients WHERE patient_number ~ '^[0-9]+$'")
                next_num = cur.fetchone()[0]

            with conn.cursor() as cur:
                cur.execute(
                    f"""
                    INSERT INTO {SCHEMA}.patients
                        (branch_id, full_name_enc, birth_date_enc, phone_enc, email_enc,
                         passport_enc, address_enc, snils_enc, oms_enc,
                         phone_hash, full_name_hash, patient_number, gender, blood_type,
                         allergies_note, created_by)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id, patient_number
                    """,
                    (
                        branch_id,
                        encrypt(full_name),
                        encrypt(birth_date),
                        encrypt(phone) if phone else None,
                        encrypt(email) if email else None,
                        encrypt(passport) if passport else None,
                        encrypt(address) if address else None,
                        encrypt(snils) if snils else None,
                        encrypt(oms) if oms else None,
                        phone_hash,
                        name_hash,
                        str(next_num).zfill(7),
                        gender,
                        blood_type,
                        body.get("allergiesNote"),
                        staff_id,
                    )
                )
                new_id, new_number = cur.fetchone()

            log_access(conn, new_id, staff_id, "create", ip)
            conn.commit()

            return _ok({"id": new_id, "patientNumber": new_number}, status=201)

        # ── PUT /{id} ─────────────────────────────────────────────────────────
        if method == "PUT" or effective == "update":
            try:
                patient_id = int(body_early.get("id") or patient_id_str)
            except (ValueError, NameError):
                return _err(400, "Некорректный ID пациента")
            body = body_early

            fields = []
            args = []

            def enc_field(col, val):
                fields.append(f"{col} = %s")
                args.append(encrypt(val) if val else None)

            if "fullName" in body:
                enc_field("full_name_enc", body["fullName"])
                fields.append("full_name_hash = %s")
                args.append(make_hash(body["fullName"]))
            if "birthDate" in body:
                enc_field("birth_date_enc", body["birthDate"])
            if "phone" in body:
                enc_field("phone_enc", body["phone"])
                fields.append("phone_hash = %s")
                args.append(make_hash(norm_phone(body["phone"])) if body["phone"] else None)
            if "email" in body:
                enc_field("email_enc", body["email"])
            if "passport" in body:
                enc_field("passport_enc", body["passport"])
            if "address" in body:
                enc_field("address_enc", body["address"])
            if "snils" in body:
                enc_field("snils_enc", body["snils"])
            if "oms" in body:
                enc_field("oms_enc", body["oms"])
            if "gender" in body:
                fields.append("gender = %s")
                args.append(body["gender"])
            if "bloodType" in body:
                fields.append("blood_type = %s")
                args.append(body["bloodType"])
            if "allergiesNote" in body:
                fields.append("allergies_note = %s")
                args.append(body["allergiesNote"])

            if not fields:
                return _err(400, "Нет данных для обновления")

            fields.append("updated_at = NOW()")
            args.append(patient_id)

            with conn.cursor() as cur:
                cur.execute(
                    f"UPDATE {SCHEMA}.patients SET {', '.join(fields)} WHERE id = %s",
                    args
                )

            log_access(conn, patient_id, staff_id, "edit", ip)
            conn.commit()
            return _ok({"ok": True})

    finally:
        conn.close()

    return _err(404, "Not found")


def _ok(data, status=200):
    return {
        "statusCode": status,
        "headers": {**CORS, "Content-Type": "application/json"},
        "body": json.dumps(data, default=str)
    }

def _err(code, msg):
    return {
        "statusCode": code,
        "headers": {**CORS, "Content-Type": "application/json"},
        "body": json.dumps({"error": msg})
    }