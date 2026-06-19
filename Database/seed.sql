-- Seed data for FixFlow CMMS
-- Run this after migrations to populate demo data

-- Demo Organization
INSERT INTO organizations (id, name, slug, subdomain)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'FixFlow Demo Inc.', 'fixflow-demo', 'demo.fixflow.com');

-- Demo Sites
INSERT INTO sites (id, organization_id, name, address, city, state, latitude, longitude, attendance_radius)
VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Building A - Headquarters', '123 Main St', 'New York', 'NY', 40.7128, -74.0060, 100),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Building B - West Wing', '456 Oak Ave', 'New York', 'NY', 40.7138, -74.0160, 75),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Warehouse - Storage', '789 Industrial Blvd', 'Brooklyn', 'NY', 40.6782, -73.9442, 150);

-- Demo Assets
INSERT INTO assets (id, organization_id, site_id, name, category, model, serial_number, status)
VALUES
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'HVAC Unit - Main Building', 'HVAC', 'Trane XR18', 'TR-2024-001', 'active'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Backup Generator', 'Electrical', 'Kohler 60kW', 'KL-2023-045', 'active'),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Fire Alarm Panel', 'Fire Safety', 'Simplex 4100U', 'SP-2024-012', 'active');
