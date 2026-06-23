-- ============================================================
-- Migration 006: Diesel Management & Generator Log System
-- ============================================================

-- -----------------------------------------------------------
-- 1. generators
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS generators (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    facility_id     UUID REFERENCES sites(id) ON DELETE SET NULL,
    tank_capacity   FLOAT NOT NULL DEFAULT 0,
    expected_lph    FLOAT NOT NULL DEFAULT 0,
    max_daily_usage FLOAT NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_generators_facility ON generators(facility_id);

-- -----------------------------------------------------------
-- 2. diesel_logs
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS diesel_logs (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date              DATE NOT NULL,
    facility_id       UUID REFERENCES sites(id) ON DELETE SET NULL,
    generator_id      UUID REFERENCES generators(id) ON DELETE SET NULL,
    operator_name     VARCHAR(255) NOT NULL DEFAULT '',

    time_on           TIME NOT NULL,
    time_off          TIME NOT NULL,
    run_hours         FLOAT NOT NULL DEFAULT 0,

    idr               FLOAT NOT NULL DEFAULT 0,
    fdr               FLOAT NOT NULL DEFAULT 0,
    diesel_used       FLOAT NOT NULL DEFAULT 0,

    diesel_supplied   FLOAT NOT NULL DEFAULT 0,
    supplier_name     VARCHAR(255) NOT NULL DEFAULT '',
    delivery_reference VARCHAR(255) NOT NULL DEFAULT '',

    previous_balance  FLOAT NOT NULL DEFAULT 0,
    current_balance   FLOAT NOT NULL DEFAULT 0,

    lph               FLOAT NOT NULL DEFAULT 0,
    expected_lph      FLOAT NOT NULL DEFAULT 0,
    variance          FLOAT NOT NULL DEFAULT 0,

    flags             TEXT[] NOT NULL DEFAULT '{}',
    status            VARCHAR(20) NOT NULL DEFAULT 'Draft'
                        CHECK (status IN ('Draft','Submitted','Approved','Rejected')),
    rejection_reason  TEXT NOT NULL DEFAULT '',
    remarks           TEXT NOT NULL DEFAULT '',

    approved_by       VARCHAR(255) NOT NULL DEFAULT '',
    approved_at       TIMESTAMPTZ,

    created_by        VARCHAR(255) NOT NULL DEFAULT '',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_diesel_logs_date ON diesel_logs(date);
CREATE INDEX IF NOT EXISTS idx_diesel_logs_generator ON diesel_logs(generator_id);
CREATE INDEX IF NOT EXISTS idx_diesel_logs_status ON diesel_logs(status);
CREATE INDEX IF NOT EXISTS idx_diesel_logs_facility ON diesel_logs(facility_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_diesel_logs_unique_day ON diesel_logs(generator_id, date)
    WHERE status != 'Rejected';

-- -----------------------------------------------------------
-- 3. diesel_audit_trail
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS diesel_audit_trail (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diesel_log_id   UUID REFERENCES diesel_logs(id) ON DELETE CASCADE,
    action          VARCHAR(50) NOT NULL,
    performed_by    VARCHAR(255) NOT NULL DEFAULT '',
    field_name      VARCHAR(100) NOT NULL DEFAULT '',
    old_value       TEXT NOT NULL DEFAULT '',
    new_value       TEXT NOT NULL DEFAULT '',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_diesel_audit_log ON diesel_audit_trail(diesel_log_id);

-- -----------------------------------------------------------
-- 4. diesel_alerts
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS diesel_alerts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diesel_log_id   UUID REFERENCES diesel_logs(id) ON DELETE CASCADE,
    alert_type      VARCHAR(50) NOT NULL,
    severity        VARCHAR(20) NOT NULL DEFAULT 'warning'
                      CHECK (severity IN ('info','warning','critical')),
    message         TEXT NOT NULL DEFAULT '',
    is_resolved     BOOLEAN NOT NULL DEFAULT false,
    resolved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_diesel_alerts_type ON diesel_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_diesel_alerts_resolved ON diesel_alerts(is_resolved);

-- -----------------------------------------------------------
-- Seed generators
-- -----------------------------------------------------------
INSERT INTO generators (name, facility_id, tank_capacity, expected_lph, max_daily_usage)
SELECT name, id, tank_cap, lph, max_usage
FROM (VALUES
    ('Generator 1 (Main)', (SELECT id FROM sites LIMIT 1), 1000, 25, 600),
    ('Generator 2 (Standby)', (SELECT id FROM sites LIMIT 1), 500, 20, 480),
    ('Generator 3 (Workshop)', (SELECT id FROM sites LIMIT 1), 300, 15, 360),
    ('Generator 4 (Admin Block)', (SELECT id FROM sites LIMIT 1), 200, 12, 288),
    ('Generator 5 (Quarters)', (SELECT id FROM sites LIMIT 1), 750, 22, 528)
) AS g(name, id, tank_cap, lph, max_usage)
WHERE EXISTS (SELECT 1 FROM sites LIMIT 1);
