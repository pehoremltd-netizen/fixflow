import { supabase } from "./lib/supabase";
import { config } from "./config";

async function fixAdmin() {
  const apiKey = config.supabaseServiceKey;
  const baseUrl = config.supabaseUrl;

  // Create admin auth user
  const createRes = await fetch(`${baseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": apiKey,
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      email: "admin@fixflow.com",
      password: "Admin@2026!",
      email_confirm: true,
      user_metadata: { full_name: "Alex Admin", role: "admin" },
    }),
  });
  const createData: any = await createRes.json();
  console.log("Create:", createRes.status, createData?.id || createData?.message?.slice(0, 100));

  if (!createData?.id) {
    console.error("Failed to create admin");
    return;
  }

  // Get org
  const { data: org } = await supabase.from("organizations").select("id").limit(1).single();
  if (!org) { console.error("No org"); return; }

  // Create profile
  const pRes = await fetch(`${baseUrl}/rest/v1/profiles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": apiKey,
      "Authorization": `Bearer ${apiKey}`,
      "Prefer": "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({
      id: createData.id,
      organization_id: org.id,
      email: "admin@fixflow.com",
      full_name: "Alex Admin",
      role: "admin",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }),
  });
  const pText = await pRes.text();
  console.log("Profile:", pRes.status, pText.slice(0, 200));

  console.log("\n✅ Admin created! Login: admin@fixflow.com / Admin@2026!");
}

fixAdmin().catch(console.error);
