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
    .from("maintenance_requests")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json({ data });
});

router.get("/tenant/:tenantId", async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("maintenance_requests")
    .select("*")
    .eq("tenant_id", req.params.tenantId)
    .order("created_at", { ascending: false });
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json({ data });
});

router.post("/", async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("maintenance_requests")
    .insert(req.body)
    .select()
    .single();
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.status(201).json({ data });
});

router.patch("/:id", async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("maintenance_requests")
    .update(req.body)
    .eq("id", req.params.id)
    .select()
    .single();
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.json({ data });
});

export default router;
