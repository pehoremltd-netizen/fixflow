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
    .from("utility_records")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json({ data });
});

router.post("/", async (req: Request, res: Response) => {
  const { data, error } = await supabase.from("utility_records").insert(req.body).select().single();
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.status(201).json({ data });
});

router.delete("/:id", async (req: Request, res: Response) => {
  const { error } = await supabase.from("utility_records").delete().eq("id", req.params.id);
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.json({ message: "Deleted" });
});

export default router;
