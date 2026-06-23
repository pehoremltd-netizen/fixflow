import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

/* ─── Upline Manager Links ─── */

router.get("/links", async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("upline_manager_links")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ data });
});

router.get("/links/token/:token", async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("upline_manager_links")
    .select("*")
    .eq("token", req.params.token)
    .single();
  if (error || !data) { res.status(404).json({ error: "Link not found" }); return; }
  res.json({ data });
});

router.post("/links", async (req: Request, res: Response) => {
  const { data, error } = await supabase.from("upline_manager_links").insert(req.body).select().single();
  if (error) { res.status(400).json({ error: error.message }); return; }
  res.status(201).json({ data });
});

router.post("/links/batch", async (req: Request, res: Response) => {
  const links = req.body as any[];
  if (!Array.isArray(links) || links.length === 0) {
    res.status(400).json({ error: "links array is required" });
    return;
  }
  const { data, error } = await supabase.from("upline_manager_links").insert(links).select();
  if (error) { res.status(400).json({ error: error.message }); return; }
  res.status(201).json({ data });
});

router.patch("/links/:id", async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("upline_manager_links")
    .update(req.body)
    .eq("id", req.params.id)
    .select()
    .single();
  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ data });
});

router.delete("/links/:id", async (req: Request, res: Response) => {
  const { error } = await supabase.from("upline_manager_links").delete().eq("id", req.params.id);
  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ message: "Deleted" });
});

/* ─── Upline Manager Comments ─── */

router.get("/comments", async (req: Request, res: Response) => {
  const linkId = req.query.link_id as string;
  let query = supabase.from("upline_manager_comments").select("*");
  if (linkId) query = query.eq("upline_manager_link_id", linkId);
  const { data, error } = await query.order("created_at", { ascending: true });
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ data });
});

router.get("/comments/item", async (req: Request, res: Response) => {
  const { item_type, item_id, link_id } = req.query as Record<string, string>;
  let query = supabase.from("upline_manager_comments").select("*");
  if (item_type) query = query.eq("item_type", item_type);
  if (item_id) query = query.eq("item_id", item_id);
  if (link_id) query = query.eq("upline_manager_link_id", link_id);
  const { data, error } = await query.order("created_at", { ascending: true });
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ data });
});

router.post("/comments", async (req: Request, res: Response) => {
  const { data, error } = await supabase.from("upline_manager_comments").insert(req.body).select().single();
  if (error) { res.status(400).json({ error: error.message }); return; }
  res.status(201).json({ data });
});

router.post("/comments/batch", async (req: Request, res: Response) => {
  const comments = req.body as any[];
  if (!Array.isArray(comments) || comments.length === 0) {
    res.status(400).json({ error: "comments array is required" });
    return;
  }
  const { data, error } = await supabase.from("upline_manager_comments").insert(comments).select();
  if (error) { res.status(400).json({ error: error.message }); return; }
  res.status(201).json({ data });
});

router.patch("/comments/:id", async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("upline_manager_comments")
    .update(req.body)
    .eq("id", req.params.id)
    .select()
    .single();
  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ data });
});

router.patch("/comments/bulk-status", async (req: Request, res: Response) => {
  const { ids, status } = req.body as { ids: string[]; status: string };
  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ error: "ids array is required" });
    return;
  }
  const { data, error } = await supabase
    .from("upline_manager_comments")
    .update({ status })
    .in("id", ids)
    .select();
  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ data });
});

router.delete("/comments/:id", async (req: Request, res: Response) => {
  const { error } = await supabase.from("upline_manager_comments").delete().eq("id", req.params.id);
  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ message: "Deleted" });
});

/* ─── Viewer Feedback ─── */

router.get("/feedback", async (req: Request, res: Response) => {
  const linkId = req.query.link_id as string;
  let query = supabase.from("viewer_feedback").select("*");
  if (linkId) query = query.eq("upline_manager_link_id", linkId);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ data });
});

router.post("/feedback", async (req: Request, res: Response) => {
  const { data, error } = await supabase.from("viewer_feedback").insert(req.body).select().single();
  if (error) { res.status(400).json({ error: error.message }); return; }
  res.status(201).json({ data });
});

router.post("/feedback/batch", async (req: Request, res: Response) => {
  const items = req.body as any[];
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: "feedback array is required" });
    return;
  }
  const { data, error } = await supabase.from("viewer_feedback").insert(items).select();
  if (error) { res.status(400).json({ error: error.message }); return; }
  res.status(201).json({ data });
});

router.patch("/feedback/:id", async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("viewer_feedback")
    .update(req.body)
    .eq("id", req.params.id)
    .select()
    .single();
  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ data });
});

router.delete("/feedback/:id", async (req: Request, res: Response) => {
  const { error } = await supabase.from("viewer_feedback").delete().eq("id", req.params.id);
  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ message: "Deleted" });
});

export default router;
