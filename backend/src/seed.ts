import { supabase } from "./lib/supabase";
import { config } from "./config";
import { v4 as uuid } from "uuid";

const ORG_ID = uuid();
const NOW = new Date().toISOString();

const DEMO_USERS = [
  { email: "admin@fixflow.com", password: "Admin@2026!", full_name: "Alex Admin", role: "admin" },
  { email: "manager@fixflow.com", password: "Manager@2026!", full_name: "Maria Manager", role: "manager" },
  { email: "supervisor@fixflow.com", password: "Supervisor@2026!", full_name: "Sam Supervisor", role: "supervisor" },
  { email: "staff@fixflow.com", password: "Staff@2026!", full_name: "Sarah Staff", role: "staff" },
  { email: "stakeholder@fixflow.com", password: "Stake@2026!", full_name: "Will Stakeholder", role: "stakeholder" },
  { email: "tenant@fixflow.com", password: "Tenant@2026!", full_name: "Tom Tenant", role: "tenant" },
];

const RESOLVED_USERS: (typeof DEMO_USERS[number] & { id: string })[] = [];

async function restInsert(table: string, body: Record<string, unknown>) {
  const url = `${config.supabaseUrl}/rest/v1/${table}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": config.supabaseServiceKey,
      "Authorization": `Bearer ${config.supabaseServiceKey}`,
      "Prefer": "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${table}: ${res.status} ${text.slice(0, 200)}`);
  }
  return res.json();
}

async function seed() {
  console.log("Seeding FixFlow database...\n");

  if (!config.supabaseServiceKey || config.supabaseServiceKey.includes("your-supabase-service")) {
    console.error("❌ SUPABASE_SERVICE_KEY is not set!");
    console.error("");
    console.error("To seed the database, you need the service_role key:");
    console.error("  1. Go to https://supabase.com/dashboard/project/efbwpejnxmdactmsqsng/settings/api");
    console.error("  2. Copy the 'service_role key' (NOT the anon/public key)");
    console.error("  3. Paste it into backend/.env as SUPABASE_SERVICE_KEY");
    console.error("");
    console.error("Then run: npm run seed (from backend/)");
    process.exit(1);
  }

  // 1. Create organization
  console.log("Creating organization...");
  try {
    await restInsert("organizations", {
      id: ORG_ID,
      name: "FixFlow HQ",
      slug: "fixflow-hq",
      subdomain: "fixflow",
      is_active: true,
      created_at: NOW,
      updated_at: NOW,
    });
    console.log("  Organization created");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("  Organization error:", msg);
    process.exit(1);
  }

  // 2. Create auth users
  for (const user of DEMO_USERS) {
    console.log(`  Creating user: ${user.email}...`);
    const { data: existing } = await supabase.auth.admin.listUsers();
    const found = existing?.users?.find(u => u.email === user.email);

    if (found) {
      console.log(`    Already exists (id: ${found.id})`);
      RESOLVED_USERS.push({ ...user, id: found.id });
      continue;
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { full_name: user.full_name, role: user.role },
    });

    if (authError) {
      console.error(`    Auth error: ${authError.message}`);
      continue;
    }
    if (authData?.user) {
      console.log(`    Auth user created: ${authData.user.id}`);
      RESOLVED_USERS.push({ ...user, id: authData.user.id });
    }
  }

  if (RESOLVED_USERS.length === 0) {
    console.error("❌ Failed to create any users. Cannot continue.");
    process.exit(1);
  }

  // 3. Create profiles (via REST API to bypass RLS)
  console.log("\nCreating profiles...");
  for (const user of RESOLVED_USERS) {
    try {
      await restInsert("profiles", {
        id: user.id,
        organization_id: ORG_ID,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_active: true,
        created_at: NOW,
        updated_at: NOW,
      });
      console.log(`  Profile created: ${user.email} (${user.role})`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  Profile error for ${user.email}:`, msg);
    }
  }

  // 4. Create sites
  console.log("\nCreating sites...");
  const siteIds = [uuid(), uuid(), uuid()];
  const sites = [
    { id: siteIds[0], name: "Building A - Main Office", address: "123 Business Ave", city: "New York", state: "NY", latitude: 40.7128, longitude: -74.006, attendance_radius: 100 },
    { id: siteIds[1], name: "Building B - Warehouse", address: "456 Industrial Blvd", city: "New York", state: "NY", latitude: 40.7589, longitude: -73.9851, attendance_radius: 150 },
    { id: siteIds[2], name: "Building C - Data Center", address: "789 Tech Park", city: "New York", state: "NY", latitude: 40.7484, longitude: -73.9967, attendance_radius: 50 },
  ];
  for (const site of sites) {
    try {
      await restInsert("sites", { ...site, organization_id: ORG_ID, is_active: true, created_at: NOW });
      console.log(`  Site created: ${site.name}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  Site error: ${msg}`);
    }
  }

  // 5. Create assets
  console.log("\nCreating assets...");
  const assets = [
    { name: "HVAC Unit #3", category: "hvac", model: "Carrier 48TC", serial_number: "SN-HVAC-001", manufacturer: "Carrier", site_id: siteIds[0] },
    { name: "Generator #1", category: "mechanical", model: "Cummins QSX15", serial_number: "SN-GEN-001", manufacturer: "Cummins", site_id: siteIds[0] },
    { name: "Elevator #2", category: "mechanical", model: "Otis Gen2", serial_number: "SN-ELEV-001", manufacturer: "Otis", site_id: siteIds[1] },
    { name: "Server Rack A", category: "electrical", model: "Dell PowerEdge R740", serial_number: "SN-SRV-001", manufacturer: "Dell", site_id: siteIds[2] },
    { name: "Fire Panel", category: "safety", model: "Notifier NFS-640", serial_number: "SN-FIRE-001", manufacturer: "Notifier", site_id: siteIds[0] },
  ];
  for (const asset of assets) {
    try {
      await restInsert("assets", {
        ...asset, id: uuid(), organization_id: ORG_ID, status: "active",
        purchase_date: "2024-01-15", warranty_expiry: "2027-01-15",
        created_at: NOW, updated_at: NOW,
      });
      console.log(`  Asset created: ${asset.name}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  Asset error: ${msg}`);
    }
  }

  // 6. Create work orders
  console.log("\nCreating work orders...");
  const staffId = RESOLVED_USERS[3]?.id || "";
  const adminId = RESOLVED_USERS[0]?.id || "";
  const workOrders = [
    { title: "HVAC Unit #3 Compressor Replacement", description: "Compressor making unusual noise", priority: "critical", status: "in-progress", type: "corrective", site_id: siteIds[0], assigned_to: staffId, created_by: adminId },
    { title: "Electrical Panel Inspection - Floor 2", description: "Routine inspection", priority: "high", status: "approved", type: "preventive", site_id: siteIds[0], assigned_to: staffId, created_by: adminId },
    { title: "Leaking Pipe Repair", description: "Water pipe under sink is leaking", priority: "high", status: "pending", type: "corrective", site_id: siteIds[0], assigned_to: staffId, created_by: adminId },
    { title: "Fire Safety Check - West Wing", description: "Quarterly fire safety inspection", priority: "high", status: "in-progress", type: "preventive", site_id: siteIds[1], assigned_to: staffId, created_by: adminId },
    { title: "Generator Preventive Maintenance", description: "Monthly generator maintenance", priority: "medium", status: "approved", type: "preventive", site_id: siteIds[0], assigned_to: staffId, created_by: adminId },
  ];
  for (const wo of workOrders) {
    try {
      await restInsert("work_orders", {
        ...wo, id: uuid(), organization_id: ORG_ID,
        due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
        created_at: NOW, updated_at: NOW,
      });
      console.log(`  Work order created: ${wo.title}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  WO error: ${msg}`);
    }
  }

  // 7. Create inspections
  console.log("\nCreating inspections...");
  for (const insp of [
    { title: "Monthly HVAC Inspection", type: "hvac", status: "submitted", site_id: siteIds[0] },
    { title: "Weekly Fire Safety Round", type: "safety", status: "draft", site_id: siteIds[0] },
    { title: "Building A - Roof Inspection", type: "structural", status: "submitted", site_id: siteIds[0] },
  ]) {
    try {
      await restInsert("inspections", {
        ...insp, id: uuid(), organization_id: ORG_ID, staff_id: staffId,
        submitted_at: NOW, created_at: NOW, updated_at: NOW,
      });
      console.log(`  Inspection created: ${insp.title}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  Inspection error: ${msg}`);
    }
  }

  // 8. Create inventory
  console.log("\nCreating inventory...");
  for (const item of [
    { name: "HVAC Filters 20x20", sku: "FLT-2020", category: "hvac", quantity: 50, min_quantity: 10, unit: "pcs", unit_price: 12.99, supplier: "FilterPro Inc" },
    { name: "LED Bulbs 60W", sku: "LED-60W", category: "electrical", quantity: 200, min_quantity: 50, unit: "pcs", unit_price: 3.49, supplier: "LightCo" },
    { name: "Copper Pipe 1/2in", sku: "PIP-CU-12", category: "plumbing", quantity: 30, min_quantity: 10, unit: "ft", unit_price: 1.99, supplier: "PipeMaster" },
    { name: "Fire Extinguisher ABC", sku: "FE-ABC-5", category: "safety", quantity: 15, min_quantity: 5, unit: "pcs", unit_price: 45.00, supplier: "SafetyFirst" },
  ]) {
    try {
      await restInsert("inventory_items", {
        ...item, id: uuid(), organization_id: ORG_ID, site_id: siteIds[0],
        location: "Main Storage A", created_at: NOW, updated_at: NOW,
      });
      console.log(`  Inventory: ${item.name}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  Inventory error: ${msg}`);
    }
  }

  // 9. Create contracts
  console.log("\nCreating contracts...");
  for (const contract of [
    { vendor_name: "HVAC Pro Services", service_type: "hvac", value: 50000, start_date: "2026-01-01", end_date: "2026-12-31", status: "active", sla: "24hr emergency response" },
    { vendor_name: "SafeGuard Security", service_type: "safety", value: 25000, start_date: "2026-01-01", end_date: "2026-12-31", status: "active", sla: "Monthly inspections" },
    { vendor_name: "Elevate Elevators", service_type: "mechanical", value: 35000, start_date: "2026-03-01", end_date: "2027-02-28", status: "active", sla: "Bi-weekly maintenance" },
  ]) {
    try {
      await restInsert("contracts", {
        ...contract, id: uuid(), organization_id: ORG_ID, notes: "", created_at: NOW,
      });
      console.log(`  Contract: ${contract.vendor_name}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  Contract error: ${msg}`);
    }
  }

  // 10. Create attendance records
  console.log("\nCreating attendance records...");
  const now = Date.now();
  for (const user of RESOLVED_USERS.slice(0, 4)) {
    for (const day of [1, 2, 3, 4, 5]) {
      const date = new Date(now - day * 86400000);
      const clockIn = new Date(date); clockIn.setHours(8, 0, 0, 0);
      const clockOut = new Date(date); clockOut.setHours(17, 0, 0, 0);
      try {
        await restInsert("attendance", {
          id: uuid(), organization_id: ORG_ID, user_id: user.id, site_id: siteIds[0],
          type: "clock-in", timestamp: clockIn.toISOString(),
          latitude: 40.7128, longitude: -74.006, verified: true, created_at: clockIn.toISOString(),
        });
        await restInsert("attendance", {
          id: uuid(), organization_id: ORG_ID, user_id: user.id, site_id: siteIds[0],
          type: "clock-out", timestamp: clockOut.toISOString(),
          latitude: 40.7128, longitude: -74.006, verified: true, created_at: clockOut.toISOString(),
        });
      } catch {
        // skip attendance errors
      }
    }
  }
  console.log("  Attendance records created");

  // 11. Create maintenance requests
  console.log("\nCreating maintenance requests...");
  const tenantId = RESOLVED_USERS[5]?.id || "";
  for (const req of [
    { title: "AC not cooling properly", description: "Living room AC blowing warm air", priority: "high", status: "in-progress", category: "hvac" },
    { title: "Kitchen sink leaking", description: "Water leaking from under sink", priority: "medium", status: "submitted", category: "plumbing" },
  ]) {
    try {
      await restInsert("maintenance_requests", {
        ...req, id: uuid(), organization_id: ORG_ID, tenant_id: tenantId,
        site_id: siteIds[0], created_at: NOW, updated_at: NOW,
      });
      console.log(`  Request: ${req.title}`);
    } catch {
      // skip
    }
  }

  console.log("\n✅ Seed complete!");
  console.log("\nDemo credentials:");
  RESOLVED_USERS.forEach(u => console.log(`  ${u.role.padEnd(14)} ${u.email.padEnd(30)} ${u.password}`));
  console.log("\n⚠️  If profiles failed, run supabase/fix-rls-recursion.sql in SQL Editor first.");
}

seed().catch(console.error);
