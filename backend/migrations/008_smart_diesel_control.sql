-- ============================================================
-- Migration 008: Smart Diesel Control System (SDCS)
-- ============================================================

-- -----------------------------------------------------------
-- 1. Add estimated_run_hours + audit_trail to diesel_logs
-- -----------------------------------------------------------
ALTER TABLE diesel_logs ADD COLUMN IF NOT EXISTS estimated_run_hours FLOAT NOT NULL DEFAULT 0;
ALTER TABLE diesel_logs ADD COLUMN IF NOT EXISTS audit_trail JSONB NOT NULL DEFAULT '[]'::jsonb;

-- -----------------------------------------------------------
-- 2. Add benchmark_lph alias to generators
-- -----------------------------------------------------------
ALTER TABLE generators ADD COLUMN IF NOT EXISTS benchmark_lph FLOAT NOT NULL DEFAULT 0;

-- Sync benchmark_lph with existing expected_lph values
UPDATE generators SET benchmark_lph = expected_lph WHERE benchmark_lph = 0 AND expected_lph > 0;

-- -----------------------------------------------------------
-- 3. Index for faster historical queries
-- -----------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_diesel_logs_generator_date ON diesel_logs(generator_id, date DESC);
