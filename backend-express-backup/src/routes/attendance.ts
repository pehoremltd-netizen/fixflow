import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const orgId = req.query.organization_id as string;
  if (!orgId) {
    res.status(400).json({ error: "organization_id is required" });
    return;
  }
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("organization_id", orgId)
    .order("timestamp", { ascending: false });
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json({ data });
});

router.get("/staff/:userId", async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("user_id", req.params.userId)
    .order("timestamp", { ascending: false });
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json({ data });
});

router.post("/", async (req: Request, res: Response) => {
  const { data, error } = await supabase.from("attendance").insert(req.body).select().single();
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.status(201).json({ data });
});

// QR-based clock-in
router.post("/qr-clock-in", async (req: Request, res: Response) => {
  const { organization_id, user_id, site_id, site_name, qr_value, latitude, longitude, device_info } = req.body;

  if (!organization_id || !user_id || !site_id || !qr_value) {
    res.status(400).json({ error: "organization_id, user_id, site_id, and qr_value are required" });
    return;
  }

  // Verify QR code exists and is active
  const { data: qrCode, error: qrError } = await supabase
    .from("site_qr_codes")
    .select("*")
    .eq("site_id", site_id)
    .eq("organization_id", organization_id)
    .eq("is_active", true)
    .maybeSingle();

  if (qrError || !qrCode) {
    res.status(400).json({ error: "No active QR code found for this site" });
    return;
  }

  // Verify QR value matches
  const qrExpected = qrCode.qr_value.split("&ts=")[0]; // strip timestamp for comparison
  const qrGiven = qr_value.split("&ts=")[0];
  if (qrExpected !== qrGiven) {
    res.status(400).json({ error: "Invalid QR code" });
    return;
  }

  // Get site coordinates for distance check
  const { data: site } = await supabase
    .from("sites")
    .select("latitude, longitude, attendance_radius")
    .eq("id", site_id)
    .single();

  let verified = false;
  let distance = null;

  if (site && latitude != null && longitude != null) {
    distance = calculateDistance(
      latitude, longitude,
      site.latitude, site.longitude
    );
    verified = distance <= (site.attendance_radius || 100);
  }

  const { data, error } = await supabase
    .from("attendance")
    .insert({
      organization_id,
      user_id,
      site_id,
      type: "clock-in",
      timestamp: new Date().toISOString(),
      latitude: latitude || null,
      longitude: longitude || null,
      device_info: device_info || null,
      qr_code: qr_value,
      verified,
    })
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  // Increment scan count on QR code
  await supabase
    .from("site_qr_codes")
    .update({ scans_today: (qrCode.scans_today || 0) + 1 })
    .eq("id", qrCode.id);

  res.status(201).json({ data, distance, verified });
});

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default router;
