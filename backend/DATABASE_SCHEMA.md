# FixFlow CMMS — Database Schema

> **Platform:** Supabase (PostgreSQL 15+)
> **Naming:** `snake_case` for columns, `snake_case` for constraints/indexes

---

## Tables

### 1. `assets`

Physical or logical assets tracked in the system.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, `gen_random_uuid()` | Unique identifier |
| `name` | `VARCHAR(255)` | NOT NULL | Asset name |
| `category` | `VARCHAR(100)` | NOT NULL | e.g. HVAC, Plumbing, Electrical |
| `location` | `VARCHAR(255)` | DEFAULT '' | Physical location |
| `serial_number` | `VARCHAR(255)` | DEFAULT '' | Manufacturer serial |
| `model` | `VARCHAR(255)` | DEFAULT '' | Model number/name |
| `manufacturer` | `VARCHAR(255)` | DEFAULT '' | Manufacturer name |
| `purchase_date` | `DATE` | | Date acquired |
| `warranty_expiry` | `DATE` | | Warranty end date |
| `condition_score` | `SMALLINT` | 0–100 | Health score |
| `last_service_date` | `DATE` | | Most recent service |
| `next_service_date` | `DATE` | | Upcoming service due |
| `status` | `VARCHAR(50)` | NOT NULL, CHECK: active/inactive/disposed/maintenance | Lifecycle status |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, `now()` | Row creation time |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, auto-updated | Last modification time |

**Indexes:** `location`, `category`, `status`, `next_service_date` (partial)

---

### 2. `work_orders`

Maintenance and repair work items.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, `gen_random_uuid()` | Unique identifier |
| `title` | `VARCHAR(255)` | NOT NULL | Short summary |
| `description` | `TEXT` | DEFAULT '' | Detailed description |
| `asset_id` | `UUID` | FK → `assets.id` ON DELETE SET NULL | Related asset |
| `location` | `VARCHAR(255)` | DEFAULT '' | Work location |
| `category` | `VARCHAR(100)` | NOT NULL, CHECK: mechanical/electrical/plumbing/hvac/safety/structural | Work type |
| `priority` | `VARCHAR(50)` | NOT NULL, CHECK: low/medium/high/critical | Urgency |
| `status` | `VARCHAR(50)` | NOT NULL, CHECK: open/assigned/in_progress/completed/verified | Lifecycle |
| `assigned_to` | `VARCHAR(255)` | DEFAULT '' | Staff assigned |
| `due_date` | `DATE` | | Target completion |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, `now()` | Created timestamp |
| `completed_at` | `TIMESTAMPTZ` | | Actual completion |

**Indexes:** `asset_id`, `status`, `due_date`, `priority`, `assigned_to`

---

### 3. `inspections`

Inspection records tied to templates and assets.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, `gen_random_uuid()` | Unique identifier |
| `inspection_template_id` | `UUID` | FK → `inspection_templates.id` ON DELETE SET NULL | Template used |
| `asset_id` | `UUID` | FK → `assets.id` ON DELETE SET NULL | Asset inspected |
| `performed_by` | `VARCHAR(255)` | NOT NULL DEFAULT '' | Inspector name/ID |
| `performed_date` | `DATE` | NOT NULL, DEFAULT CURRENT_DATE | Date of inspection |
| `status` | `VARCHAR(50)` | NOT NULL, CHECK: scheduled/in_progress/completed/failed | Progress |
| `score` | `SMALLINT` | 0–100 | Pass/fail score |
| `notes` | `TEXT` | DEFAULT '' | General remarks |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, `now()` | Row creation time |

**Indexes:** `asset_id`, `performed_date`, `status`, `inspection_template_id`

---

### 4. `inspection_templates`

Reusable inspection checklists.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, `gen_random_uuid()` | Unique identifier |
| `name` | `VARCHAR(255)` | NOT NULL | Template name |
| `description` | `TEXT` | DEFAULT '' | Purpose description |
| `category` | `VARCHAR(100)` | NOT NULL DEFAULT '' | e.g. Fire Safety, HVAC |
| `created_by` | `VARCHAR(255)` | DEFAULT '' | Creator name/ID |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, `now()` | Row creation time |

**Indexes:** `category`

---

### 5. `inspection_checklist_items`

Line items belonging to an inspection template.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, `gen_random_uuid()` | Unique identifier |
| `inspection_template_id` | `UUID` | NOT NULL, FK → `inspection_templates.id` ON DELETE CASCADE | Parent template |
| `item_text` | `TEXT` | NOT NULL | Checklist question/text |
| `item_order` | `INTEGER` | NOT NULL DEFAULT 0 | Display order |
| `required` | `BOOLEAN` | NOT NULL DEFAULT true | Must be completed |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, `now()` | Row creation time |

**Indexes:** `inspection_template_id`, composite `(inspection_template_id, item_order)`

---

### 6. `pm_schedules`

Preventive maintenance schedules linked to assets.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, `gen_random_uuid()` | Unique identifier |
| `asset_id` | `UUID` | FK → `assets.id` ON DELETE SET NULL | Related asset |
| `task_description` | `TEXT` | NOT NULL | What to do |
| `frequency` | `VARCHAR(50)` | NOT NULL, CHECK: daily/weekly/monthly/quarterly/semi_annual/annual | Recurrence |
| `last_completed_date` | `DATE` | | Last done |
| `next_due_date` | `DATE` | | Next deadline |
| `responsible_person` | `VARCHAR(255)` | DEFAULT '' | Assigned staff |
| `status` | `VARCHAR(50)` | NOT NULL, CHECK: active/inactive/overdue/completed | Schedule state |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, `now()` | Row creation time |

**Indexes:** `asset_id`, `next_due_date`, `status`, composite `(next_due_date, status)` partial

---

### 7. `fault_reports`

Fault/issue reports raised by staff.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, `gen_random_uuid()` | Unique identifier |
| `asset_name` | `VARCHAR(255)` | NOT NULL | Name of faulty asset |
| `location` | `VARCHAR(255)` | NOT NULL DEFAULT '' | Where it is |
| `description` | `TEXT` | NOT NULL DEFAULT '' | Fault description |
| `reported_by` | `VARCHAR(255)` | NOT NULL DEFAULT '' | Reporter name |
| `reported_date` | `TIMESTAMPTZ` | NOT NULL, `now()` | When reported |
| `priority` | `VARCHAR(50)` | NOT NULL, CHECK: low/medium/high/critical | Urgency |
| `status` | `VARCHAR(50)` | NOT NULL, CHECK: reported/acknowledged/assigned/resolved | Lifecycle |
| `resolution_notes` | `TEXT` | DEFAULT '' | How it was resolved |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, `now()` | Row creation time |

**Indexes:** `status`, `priority`, `reported_date`, `reported_by`

---

### 8. `contractors`

External vendor/contractor directory.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, `gen_random_uuid()` | Unique identifier |
| `name` | `VARCHAR(255)` | NOT NULL | Contact name |
| `company` | `VARCHAR(255)` | DEFAULT '' | Company name |
| `specialty` | `VARCHAR(100)` | DEFAULT '' | e.g. Plumbing, Electrical |
| `phone` | `VARCHAR(50)` | DEFAULT '' | Phone number |
| `email` | `VARCHAR(255)` | DEFAULT '' | Email address |
| `license_number` | `VARCHAR(255)` | DEFAULT '' | Professional license |
| `status` | `VARCHAR(50)` | NOT NULL, CHECK: active/inactive/suspended | Engagement status |
| `rating` | `NUMERIC(2,1)` | 0.0–5.0 | Performance rating |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, `now()` | Row creation time |

**Indexes:** `specialty`, `status`

---

### 9. `staff_attendance`

Staff clock-in/clock-out records.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, `gen_random_uuid()` | Unique identifier |
| `staff_id` | `VARCHAR(255)` | NOT NULL | Staff identifier |
| `clock_in_time` | `TIMESTAMPTZ` | NOT NULL | Shift start |
| `clock_in_location` | `VARCHAR(255)` | DEFAULT '' | Geo/QR location |
| `clock_out_time` | `TIMESTAMPTZ` | | Shift end |
| `clock_out_location` | `VARCHAR(255)` | DEFAULT '' | Geo/QR location |
| `hours_worked` | `NUMERIC(5,2)` | GENERATED ALWAYS AS ... STORED | Computed duration |
| `status` | `VARCHAR(50)` | NOT NULL, CHECK: active/completed/absent | Attendance status |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, `now()` | Row creation time |

**Indexes:** `staff_id`, `created_at`, composite `(staff_id, clock_in_time)`

---

## Relationships Diagram

```
inspection_templates
    ↑ (FK: inspection_template_id)
inspection_checklist_items
    |
inspection_templates ──→ inspections ──→ assets
                                              ↑
work_orders ──────────────────────────────────┘
                                              ↑
pm_schedules ─────────────────────────────────┘
```

## Running Migrations

Execute in order via Supabase SQL Editor or `psql`:

```bash
psql $SUPABASE_DATABASE_URL -f backend/migrations/001_core_tables.sql
psql $SUPABASE_DATABASE_URL -f backend/migrations/002_indexes.sql
psql $SUPABASE_DATABASE_URL -f backend/migrations/003_relationships.sql
```
