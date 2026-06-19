import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";
import QRCode from "qrcode";

const router = Router();

// List all QR codes for an organization
router.get("/", async (req: Request, res: Response) => {
  const orgId = req.query.organization_id as string;
  if (!orgId) {
    res.status(400).json({ error: "organization_id is required" });
    return;
  }
  const { data, error } = await supabase
    .from("site_qr_codes")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json({ data });
});

// Get single QR code
router.get("/:id", async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("site_qr_codes")
    .select("*")
    .eq("id", req.params.id)
    .single();
  if (error) {
    res.status(404).json({ error: "QR code not found" });
    return;
  }
  res.json({ data });
});

// Create new QR code for a site
router.post("/", async (req: Request, res: Response) => {
  const { organization_id, site_id, site_name, location } = req.body;
  if (!organization_id || !site_id || !site_name) {
    res.status(400).json({ error: "organization_id, site_id, and site_name are required" });
    return;
  }

  const qrValue = `fixflow://clock?site=${encodeURIComponent(site_name)}&ts=${Date.now()}`;

  // Check if QR code already exists for this site
  const { data: existing } = await supabase
    .from("site_qr_codes")
    .select("id")
    .eq("site_id", site_id)
    .eq("organization_id", organization_id)
    .maybeSingle();

  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from("site_qr_codes")
      .update({ qr_value: qrValue, site_name, location, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.json({ data });
    return;
  }

  const { data, error } = await supabase
    .from("site_qr_codes")
    .insert({
      organization_id,
      site_id,
      site_name,
      location: location || "",
      qr_value: qrValue,
      is_active: true,
      scans_today: 0,
    })
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.status(201).json({ data });
});

// Toggle QR code active status
router.patch("/:id/toggle", async (req: Request, res: Response) => {
  const { data: qr, error: findError } = await supabase
    .from("site_qr_codes")
    .select("is_active")
    .eq("id", req.params.id)
    .single();

  if (findError || !qr) {
    res.status(404).json({ error: "QR code not found" });
    return;
  }

  const { data, error } = await supabase
    .from("site_qr_codes")
    .update({ is_active: !qr.is_active, updated_at: new Date().toISOString() })
    .eq("id", req.params.id)
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json({ data });
});

// Regenerate QR code
router.patch("/:id/regenerate", async (req: Request, res: Response) => {
  const { data: qr, error: findError } = await supabase
    .from("site_qr_codes")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (findError || !qr) {
    res.status(404).json({ error: "QR code not found" });
    return;
  }

  const newValue = `fixflow://clock?site=${encodeURIComponent(qr.site_name)}&ts=${Date.now()}`;

  const { data, error } = await supabase
    .from("site_qr_codes")
    .update({ qr_value: newValue, updated_at: new Date().toISOString() })
    .eq("id", req.params.id)
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json({ data });
});

// Delete QR code
router.delete("/:id", async (req: Request, res: Response) => {
  const { error } = await supabase
    .from("site_qr_codes")
    .delete()
    .eq("id", req.params.id);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json({ success: true });
});

// Increment scan count for a QR code
router.post("/:id/scan", async (req: Request, res: Response) => {
  const { data: qr, error: findError } = await supabase
    .from("site_qr_codes")
    .select("scans_today")
    .eq("id", req.params.id)
    .single();

  if (findError || !qr) {
    res.status(404).json({ error: "QR code not found" });
    return;
  }

  const { data, error } = await supabase
    .from("site_qr_codes")
    .update({ scans_today: (qr.scans_today || 0) + 1 })
    .eq("id", req.params.id)
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json({ data });
});

// Generate PNG image (existing endpoint)
router.post("/generate", async (req: Request, res: Response) => {
  const { value, filename } = req.body;
  if (!value) {
    res.status(400).json({ error: "value is required" });
    return;
  }

  try {
    const buf = await QRCode.toBuffer(value, { type: "png", width: 300, margin: 2 });
    const name = (filename || "qrcode").replace(/[^a-zA-Z0-9_-]/g, "-");
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", `attachment; filename="${name}.png"`);
    res.send(buf);
  } catch {
    res.status(500).json({ error: "Failed to generate QR code" });
  }
});

export default router;
