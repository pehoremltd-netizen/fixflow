import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("artisans")
    .select("*")
    .order("name", { ascending: true });
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ data });
});

router.get("/:id", async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("artisans")
    .select("*")
    .eq("id", req.params.id)
    .single();
  if (error) { res.status(404).json({ error: "Artisan not found" }); return; }
  res.json({ data });
});

router.post("/", async (req: Request, res: Response) => {
  const { data, error } = await supabase.from("artisans").insert(req.body).select().single();
  if (error) { res.status(400).json({ error: error.message }); return; }
  res.status(201).json({ data });
});

router.patch("/:id", async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("artisans")
    .update(req.body)
    .eq("id", req.params.id)
    .select()
    .single();
  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ data });
});

router.delete("/:id", async (req: Request, res: Response) => {
  const { error } = await supabase.from("artisans").delete().eq("id", req.params.id);
  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ message: "Deleted" });
});

export default router;
