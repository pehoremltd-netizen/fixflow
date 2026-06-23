-- ============================================================
-- Migration 002: Performance Indexes
-- Description: Adds indexes on commonly queried columns
-- to optimize read performance at scale.
-- ============================================================

-- -----------------------------------------------------------
-- assets indexes
-- -----------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_assets_location     ON assets (location);
CREATE INDEX IF NOT EXISTS idx_assets_category     ON assets (category);
CREATE INDEX IF NOT EXISTS idx_assets_status       ON assets (status);
CREATE INDEX IF NOT EXISTS idx_assets_next_service ON assets (next_service_date)
    WHERE next_service_date IS NOT NULL;

-- -----------------------------------------------------------
-- work_orders indexes
-- -----------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_work_orders_asset_id   ON work_orders (asset_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status     ON work_orders (status);
CREATE INDEX IF NOT EXISTS idx_work_orders_due_date   ON work_orders (due_date);
CREATE INDEX IF NOT EXISTS idx_work_orders_priority   ON work_orders (priority);
CREATE INDEX IF NOT EXISTS idx_work_orders_assigned   ON work_orders (assigned_to);

-- -----------------------------------------------------------
-- inspections indexes
-- -----------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_inspections_asset_id       ON inspections (asset_id);
CREATE INDEX IF NOT EXISTS idx_inspections_performed_date ON inspections (performed_date);
CREATE INDEX IF NOT EXISTS idx_inspections_status         ON inspections (status);
CREATE INDEX IF NOT EXISTS idx_inspections_template_id    ON inspections (inspection_template_id);

-- -----------------------------------------------------------
-- inspection_templates indexes
-- -----------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_inspection_templates_category ON inspection_templates (category);

-- -----------------------------------------------------------
-- inspection_checklist_items indexes
-- -----------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_checklist_items_template_id ON inspection_checklist_items (inspection_template_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_order       ON inspection_checklist_items (inspection_template_id, item_order);

-- -----------------------------------------------------------
-- pm_schedules indexes
-- -----------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_pm_schedules_asset_id   ON pm_schedules (asset_id);
CREATE INDEX IF NOT EXISTS idx_pm_schedules_next_due   ON pm_schedules (next_due_date);
CREATE INDEX IF NOT EXISTS idx_pm_schedules_status     ON pm_schedules (status);
-- Composite: find active/overdue schedules due soon
CREATE INDEX IF NOT EXISTS idx_pm_schedules_due_status ON pm_schedules (next_due_date, status)
    WHERE status IN ('active', 'overdue');

-- -----------------------------------------------------------
-- fault_reports indexes
-- -----------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_fault_reports_status        ON fault_reports (status);
CREATE INDEX IF NOT EXISTS idx_fault_reports_priority      ON fault_reports (priority);
CREATE INDEX IF NOT EXISTS idx_fault_reports_reported_date ON fault_reports (reported_date);
CREATE INDEX IF NOT EXISTS idx_fault_reports_reported_by   ON fault_reports (reported_by);

-- -----------------------------------------------------------
-- contractors indexes
-- -----------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_contractors_specialty ON contractors (specialty);
CREATE INDEX IF NOT EXISTS idx_contractors_status    ON contractors (status);

-- -----------------------------------------------------------
-- staff_attendance indexes
-- -----------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_attendance_staff_id    ON staff_attendance (staff_id);
CREATE INDEX IF NOT EXISTS idx_attendance_created_at  ON staff_attendance (created_at);
-- Composite: find attendance for a staff member on a date range
CREATE INDEX IF NOT EXISTS idx_attendance_staff_date  ON staff_attendance (staff_id, clock_in_time);
