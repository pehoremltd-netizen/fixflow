import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) {
    res.status(400).json({ error: "Organization name is required" });
    return;
  }
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "org";
  const subdomain = slug;

  const { data, error } = await supabase
    .from("organizations")
    .insert({ name, slug, subdomain })
    .select()
    .single();
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.status(201).json({ data });
});

router.get("/", async (req: Request, res: Response) => {
  const { data, error } = await supabase.from("organizations").select("*").order("created_at", { ascending: false });
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json({ data });
});

router.get("/:id", async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", req.params.id)
    .single();
  if (error) {
    res.status(404).json({ error: "Organization not found" });
    return;
  }
  res.json({ data });
});

export default router;
