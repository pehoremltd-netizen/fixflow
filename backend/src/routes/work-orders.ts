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
    .from("work_orders")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json({ data });
});

router.get("/:id", async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("work_orders")
    .select("*")
    .eq("id", req.params.id)
    .single();
  if (error) {
    res.status(404).json({ error: "Work order not found" });
    return;
  }
  res.json({ data });
});

router.post("/", async (req: Request, res: Response) => {
  const { data, error } = await supabase.from("work_orders").insert(req.body).select().single();
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.status(201).json({ data });
});

router.patch("/:id", async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("work_orders")
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

router.delete("/:id", async (req: Request, res: Response) => {
  const { error } = await supabase.from("work_orders").delete().eq("id", req.params.id);
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.json({ message: "Deleted" });
});

export default router;
