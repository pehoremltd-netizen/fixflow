-- ============================================================
-- Migration 001: Core Tables
-- Description: Creates all core tables for FixFlow CMMS
-- Supabase-compatible PostgreSQL syntax
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------
-- 1. assets
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS assets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    category        VARCHAR(100) NOT NULL,
    location        VARCHAR(255) NOT NULL DEFAULT '',
    serial_number   VARCHAR(255) DEFAULT '',
    model           VARCHAR(255) DEFAULT '',
    manufacturer    VARCHAR(255) DEFAULT '',
    purchase_date   DATE,
    warranty_expiry DATE,
    condition_score SMALLINT CHECK (condition_score >= 0 AND condition_score <= 100),
    last_service_date DATE,
    next_service_date DATE,
    status          VARCHAR(50) NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'inactive', 'disposed', 'maintenance')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------
-- 2. work_orders
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS work_orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(255) NOT NULL,
    description     TEXT DEFAULT '',
    asset_id        UUID,
    location        VARCHAR(255) NOT NULL DEFAULT '',
    category        VARCHAR(100) NOT NULL DEFAULT 'mechanical'
                        CHECK (category IN ('mechanical', 'electrical', 'plumbing', 'hvac', 'safety', 'structural')),
    priority        VARCHAR(50) NOT NULL DEFAULT 'medium'
                        CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status          VARCHAR(50) NOT NULL DEFAULT 'open'
                        CHECK (status IN ('open', 'assigned', 'in_progress', 'completed', 'verified')),
    assigned_to     VARCHAR(255) DEFAULT '',
    due_date        DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at    TIMESTAMPTZ
);

-- -----------------------------------------------------------
-- 3. inspections
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS inspections (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_template_id  UUID,
    asset_id                UUID,
    performed_by            VARCHAR(255) NOT NULL DEFAULT '',
    performed_date          DATE NOT NULL DEFAULT CURRENT_DATE,
    status                  VARCHAR(50) NOT NULL DEFAULT 'scheduled'
                                CHECK (status IN ('scheduled', 'in_progress', 'completed', 'failed')),
    score                   SMALLINT CHECK (score >= 0 AND score <= 100),
    notes                   TEXT DEFAULT '',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------
-- 4. inspection_templates
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS inspection_templates (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    category    VARCHAR(100) NOT NULL DEFAULT '',
    created_by  VARCHAR(255) DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------
-- 5. inspection_checklist_items
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS inspection_checklist_items (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_template_id  UUID NOT NULL,
    item_text               TEXT NOT NULL,
    item_order              INTEGER NOT NULL DEFAULT 0,
    required                BOOLEAN NOT NULL DEFAULT true,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------
-- 6. pm_schedules (Preventive Maintenance)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS pm_schedules (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id            UUID,
    task_description    TEXT NOT NULL,
    frequency           VARCHAR(50) NOT NULL
                            CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'semi_annual', 'annual')),
    last_completed_date DATE,
    next_due_date       DATE,
    responsible_person  VARCHAR(255) DEFAULT '',
    status              VARCHAR(50) NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active', 'inactive', 'overdue', 'completed')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------
-- 7. fault_reports
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS fault_reports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_name      VARCHAR(255) NOT NULL,
    location        VARCHAR(255) NOT NULL DEFAULT '',
    description     TEXT NOT NULL DEFAULT '',
    reported_by     VARCHAR(255) NOT NULL DEFAULT '',
    reported_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
    priority        VARCHAR(50) NOT NULL DEFAULT 'medium'
                        CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status          VARCHAR(50) NOT NULL DEFAULT 'reported'
                        CHECK (status IN ('reported', 'acknowledged', 'assigned', 'resolved')),
    resolution_notes TEXT DEFAULT '',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------
-- 8. contractors
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS contractors (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    company         VARCHAR(255) DEFAULT '',
    specialty       VARCHAR(100) DEFAULT '',
    phone           VARCHAR(50) DEFAULT '',
    email           VARCHAR(255) DEFAULT '',
    license_number  VARCHAR(255) DEFAULT '',
    status          VARCHAR(50) NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'inactive', 'suspended')),
    rating          NUMERIC(2,1) CHECK (rating >= 0 AND rating <= 5),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------
-- 9. staff_attendance
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS staff_attendance (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id            VARCHAR(255) NOT NULL,
    clock_in_time       TIMESTAMPTZ NOT NULL,
    clock_in_location   VARCHAR(255) DEFAULT '',
    clock_out_time      TIMESTAMPTZ,
    clock_out_location  VARCHAR(255) DEFAULT '',
    hours_worked        NUMERIC(5,2) GENERATED ALWAYS AS (
                            CASE
                                WHEN clock_out_time IS NOT NULL
                                THEN EXTRACT(EPOCH FROM (clock_out_time - clock_in_time)) / 3600
                                ELSE NULL
                            END
                        ) STORED,
    status              VARCHAR(50) NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active', 'completed', 'absent')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------
-- Auto-update trigger for assets.updated_at
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_assets_updated_at ON assets;
CREATE TRIGGER trg_assets_updated_at
    BEFORE UPDATE ON assets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
