import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const userId = req.query.user_id as string;
  if (!userId) {
    res.status(400).json({ error: "user_id is required" });
    return;
  }
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json({ data });
});

router.patch("/:id/read", async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", req.params.id)
    .select()
    .single();
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.json({ data });
});

router.post("/read-all", async (req: Request, res: Response) => {
  const { user_id } = req.body;
  if (!user_id) {
    res.status(400).json({ error: "user_id is required" });
    return;
  }
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user_id)
    .eq("read", false);
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.json({ message: "All marked as read" });
});

export default router;
