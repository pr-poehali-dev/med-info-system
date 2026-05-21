
CREATE TABLE t_p69760893_med_info_system.specializations (
    id    SERIAL PRIMARY KEY,
    name  VARCHAR(200) NOT NULL UNIQUE
);

CREATE TABLE t_p69760893_med_info_system.rooms (
    id          SERIAL PRIMARY KEY,
    branch_id   INT REFERENCES t_p69760893_med_info_system.branches(id),
    number      VARCHAR(20) NOT NULL,
    name        VARCHAR(200),
    is_active   BOOLEAN DEFAULT true
);

CREATE TABLE t_p69760893_med_info_system.access_groups (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_p69760893_med_info_system.staff (
    id                  SERIAL PRIMARY KEY,
    access_group_id     INT REFERENCES t_p69760893_med_info_system.access_groups(id),
    branch_id           INT REFERENCES t_p69760893_med_info_system.branches(id),
    username            VARCHAR(100) NOT NULL UNIQUE,
    password_hash       TEXT NOT NULL,
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    middle_name         VARCHAR(100),
    phone               VARCHAR(50),
    email               VARCHAR(200),
    specialization_id   INT REFERENCES t_p69760893_med_info_system.specializations(id),
    position            VARCHAR(200),
    is_active           BOOLEAN DEFAULT true,
    phone_2fa           VARCHAR(50),
    last_login_at       TIMESTAMPTZ,
    failed_attempts     INT DEFAULT 0,
    locked_until        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_p69760893_med_info_system.auth_sessions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id    INT NOT NULL REFERENCES t_p69760893_med_info_system.staff(id),
    token_hash  TEXT NOT NULL UNIQUE,
    ip_address  INET,
    user_agent  TEXT,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_auth_sessions_staff ON t_p69760893_med_info_system.auth_sessions(staff_id);
CREATE INDEX idx_auth_sessions_expires ON t_p69760893_med_info_system.auth_sessions(expires_at);

CREATE TABLE t_p69760893_med_info_system.patients (
    id              SERIAL PRIMARY KEY,
    branch_id       INT REFERENCES t_p69760893_med_info_system.branches(id),
    full_name_enc   BYTEA NOT NULL,
    birth_date_enc  BYTEA NOT NULL,
    phone_enc       BYTEA,
    email_enc       BYTEA,
    passport_enc    BYTEA,
    address_enc     BYTEA,
    snils_enc       BYTEA,
    oms_enc         BYTEA,
    phone_hash      TEXT,
    full_name_hash  TEXT,
    patient_number  VARCHAR(50) UNIQUE,
    gender          CHAR(1) CHECK (gender IN ('M','F')),
    blood_type      VARCHAR(5),
    allergies_note  TEXT,
    created_by      INT REFERENCES t_p69760893_med_info_system.staff(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_patients_phone_hash ON t_p69760893_med_info_system.patients(phone_hash);
CREATE INDEX idx_patients_name_hash ON t_p69760893_med_info_system.patients(full_name_hash);
CREATE INDEX idx_patients_branch ON t_p69760893_med_info_system.patients(branch_id);

CREATE TABLE t_p69760893_med_info_system.patient_access_log (
    id          BIGSERIAL PRIMARY KEY,
    patient_id  INT NOT NULL REFERENCES t_p69760893_med_info_system.patients(id),
    staff_id    INT NOT NULL REFERENCES t_p69760893_med_info_system.staff(id),
    action      VARCHAR(50) NOT NULL,
    ip_address  INET,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_access_log_patient ON t_p69760893_med_info_system.patient_access_log(patient_id);
CREATE INDEX idx_access_log_staff ON t_p69760893_med_info_system.patient_access_log(staff_id);

CREATE TABLE t_p69760893_med_info_system.appointments (
    id              SERIAL PRIMARY KEY,
    branch_id       INT REFERENCES t_p69760893_med_info_system.branches(id),
    room_id         INT REFERENCES t_p69760893_med_info_system.rooms(id),
    doctor_id       INT NOT NULL REFERENCES t_p69760893_med_info_system.staff(id),
    patient_id      INT REFERENCES t_p69760893_med_info_system.patients(id),
    starts_at       TIMESTAMPTZ NOT NULL,
    ends_at         TIMESTAMPTZ NOT NULL,
    duration_min    INT NOT NULL,
    service_name    VARCHAR(300),
    service_code    VARCHAR(50),
    price           NUMERIC(12,2),
    status          VARCHAR(30) DEFAULT 'scheduled'
                    CHECK (status IN ('scheduled','in_progress','done','cancelled','no_show')),
    notes           TEXT,
    created_by      INT REFERENCES t_p69760893_med_info_system.staff(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointments_doctor_date ON t_p69760893_med_info_system.appointments(doctor_id, starts_at);
CREATE INDEX idx_appointments_patient ON t_p69760893_med_info_system.appointments(patient_id);
CREATE INDEX idx_appointments_branch_date ON t_p69760893_med_info_system.appointments(branch_id, starts_at);

CREATE TABLE t_p69760893_med_info_system.protocol_templates (
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(300) NOT NULL,
    template_type       VARCHAR(50) DEFAULT 'protocol',
    content             TEXT,
    specialization_id   INT REFERENCES t_p69760893_med_info_system.specializations(id),
    created_by          INT REFERENCES t_p69760893_med_info_system.staff(id),
    is_active           BOOLEAN DEFAULT true,
    uses_count          INT DEFAULT 0,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_p69760893_med_info_system.services (
    id                  SERIAL PRIMARY KEY,
    code                VARCHAR(50) UNIQUE,
    name                VARCHAR(300) NOT NULL,
    duration_min        INT NOT NULL DEFAULT 30,
    price               NUMERIC(12,2) NOT NULL,
    specialization_id   INT REFERENCES t_p69760893_med_info_system.specializations(id),
    branch_id           INT REFERENCES t_p69760893_med_info_system.branches(id),
    is_active           BOOLEAN DEFAULT true,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);
