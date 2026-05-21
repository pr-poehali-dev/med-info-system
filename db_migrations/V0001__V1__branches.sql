
CREATE TABLE t_p69760893_med_info_system.branches (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    address     TEXT,
    phone       VARCHAR(50),
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
