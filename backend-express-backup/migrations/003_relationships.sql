-- ============================================================
-- Migration 003: Foreign Key Relationships
-- Description: Adds foreign key constraints to enforce
-- referential integrity between core tables.
-- ============================================================

-- -----------------------------------------------------------
-- work_orders → assets
-- -----------------------------------------------------------
ALTER TABLE work_orders DROP CONSTRAINT IF EXISTS fk_work_orders_asset;
ALTER TABLE work_orders
    ADD CONSTRAINT fk_work_orders_asset
    FOREIGN KEY (asset_id) REFERENCES assets(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- -----------------------------------------------------------
-- inspections → assets
-- -----------------------------------------------------------
ALTER TABLE inspections DROP CONSTRAINT IF EXISTS fk_inspections_asset;
ALTER TABLE inspections
    ADD CONSTRAINT fk_inspections_asset
    FOREIGN KEY (asset_id) REFERENCES assets(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- -----------------------------------------------------------
-- inspections → inspection_templates
-- -----------------------------------------------------------
ALTER TABLE inspections DROP CONSTRAINT IF EXISTS fk_inspections_template;
ALTER TABLE inspections
    ADD CONSTRAINT fk_inspections_template
    FOREIGN KEY (inspection_template_id) REFERENCES inspection_templates(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- -----------------------------------------------------------
-- inspection_checklist_items → inspection_templates
-- -----------------------------------------------------------
ALTER TABLE inspection_checklist_items DROP CONSTRAINT IF EXISTS fk_checklist_items_template;
ALTER TABLE inspection_checklist_items
    ADD CONSTRAINT fk_checklist_items_template
    FOREIGN KEY (inspection_template_id) REFERENCES inspection_templates(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- -----------------------------------------------------------
-- pm_schedules → assets
-- -----------------------------------------------------------
ALTER TABLE pm_schedules DROP CONSTRAINT IF EXISTS fk_pm_schedules_asset;
ALTER TABLE pm_schedules
    ADD CONSTRAINT fk_pm_schedules_asset
    FOREIGN KEY (asset_id) REFERENCES assets(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE;
