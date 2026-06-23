import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

const ADMIN_ROLES = ["admin"];

function isAdmin(req: Request): boolean {
  return ADMIN_ROLES.includes(req.user?.role ?? "");
}

router.get("/", async (req: Request, res: Response) => {
  const orgId = req.query.organization_id as string;
  if (!orgId) {
    res.status(400).json({ error: "organization_id is required" });
    return;
  }
  const { data, error } = await supabase
    .from("profiles")
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
    .from("profiles")
    .select("*")
    .eq("id", req.params.id)
    .single();
  if (error) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  res.json({ data });
});

router.patch("/:id", async (req: Request, res: Response) => {
  if (!isAdmin(req)) {
    res.status(403).json({ error: "Only admins can update profiles" });
    return;
  }
  const allowedFields: Record<string, unknown> = {};
  if (req.body.role) allowedFields.role = req.body.role;
  if (req.body.full_name) allowedFields.full_name = req.body.full_name;
  if (req.body.is_active !== undefined) allowedFields.is_active = req.body.is_active;

  const { data, error } = await supabase
    .from("profiles")
    .update(allowedFields)
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
