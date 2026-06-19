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
    .from("inspections")
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
  const { data: inspection, error } = await supabase
    .from("inspections")
    .select("*")
    .eq("id", req.params.id)
    .single();
  if (error) {
    res.status(404).json({ error: "Inspection not found" });
    return;
  }

  const { data: checklist } = await supabase
    .from("inspection_checklist_items")
    .select("*")
    .eq("inspection_id", req.params.id);

  res.json({ data: { ...inspection, checklist: checklist || [] } });
});

router.post("/", async (req: Request, res: Response) => {
  const { checklist, ...inspectionData } = req.body;
  const { data: inspection, error: inspError } = await supabase
    .from("inspections")
    .insert(inspectionData)
    .select()
    .single();
  if (inspError) {
    res.status(400).json({ error: inspError.message });
    return;
  }

  if (checklist && checklist.length > 0) {
    const items = checklist.map((item: { label: string; condition?: string; notes?: string }) => ({
      inspection_id: inspection.id,
      label: item.label,
      condition: item.condition || "good",
      notes: item.notes,
    }));
    await supabase.from("inspection_checklist_items").insert(items);
  }

  res.status(201).json({ data: inspection });
});

router.patch("/:id", async (req: Request, res: Response) => {
  const { checklist, ...updateData } = req.body;
  const { data: inspection, error: inspError } = await supabase
    .from("inspections")
    .update(updateData)
    .eq("id", req.params.id)
    .select()
    .single();
  if (inspError) {
    res.status(400).json({ error: inspError.message });
    return;
  }

  if (checklist) {
    await supabase.from("inspection_checklist_items").delete().eq("inspection_id", req.params.id);
    if (checklist.length > 0) {
      const items = checklist.map((item: { label: string; condition?: string; notes?: string }) => ({
        inspection_id: req.params.id,
        label: item.label,
        condition: item.condition || "good",
        notes: item.notes,
      }));
      await supabase.from("inspection_checklist_items").insert(items);
    }
  }

  res.json({ data: inspection });
});

router.delete("/:id", async (req: Request, res: Response) => {
  const { error } = await supabase.from("inspections").delete().eq("id", req.params.id);
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.json({ message: "Deleted" });
});

// --- Inspection Templates ---

router.get("/templates/list", async (req: Request, res: Response) => {
  const orgId = req.query.organization_id as string;
  if (!orgId) {
    res.status(400).json({ error: "organization_id is required" });
    return;
  }
  const { data, error } = await supabase
    .from("inspection_templates")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  const templatesWithCounts = await Promise.all(
    (data || []).map(async (template) => {
      const { count } = await supabase
        .from("inspection_template_items")
        .select("*", { count: "exact", head: true })
        .eq("template_id", template.id);
      return { ...template, items: count || 0 };
    })
  );

  res.json({ data: templatesWithCounts });
});

router.post("/templates", async (req: Request, res: Response) => {
  const { name, description, checklist, organization_id } = req.body;
  if (!name || !organization_id) {
    res.status(400).json({ error: "name and organization_id are required" });
    return;
  }

  const { data: template, error: tplError } = await supabase
    .from("inspection_templates")
    .insert({ organization_id, name, description })
    .select()
    .single();
  if (tplError) {
    res.status(400).json({ error: tplError.message });
    return;
  }

  if (checklist && checklist.length > 0) {
    const items = checklist.map((label: string, i: number) => ({
      template_id: template.id,
      label,
      order_index: i,
    }));
    const { error: itemsError } = await supabase
      .from("inspection_template_items")
      .insert(items);
    if (itemsError) {
      res.status(400).json({ error: itemsError.message });
      return;
    }
  }

  res.status(201).json({
    data: {
      ...template,
      items: checklist ? checklist.length : 0,
    },
  });
});

router.get("/templates/:id", async (req: Request, res: Response) => {
  const { data: template, error } = await supabase
    .from("inspection_templates")
    .select("*")
    .eq("id", req.params.id)
    .single();
  if (error) {
    res.status(404).json({ error: "Template not found" });
    return;
  }

  const { data: checklist } = await supabase
    .from("inspection_template_items")
    .select("*")
    .eq("template_id", req.params.id)
    .order("order_index", { ascending: true });

  res.json({ data: { ...template, checklist: checklist || [] } });
});

router.patch("/templates/:id", async (req: Request, res: Response) => {
  const { name, description, checklist } = req.body;
  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;

  if (Object.keys(updateData).length > 0) {
    const { error: tplError } = await supabase
      .from("inspection_templates")
      .update(updateData)
      .eq("id", req.params.id)
      .select()
      .single();
    if (tplError) {
      res.status(400).json({ error: tplError.message });
      return;
    }
  }

  if (checklist !== undefined) {
    await supabase.from("inspection_template_items").delete().eq("template_id", req.params.id);
    if (checklist.length > 0) {
      const items = checklist.map((label: string, i: number) => ({
        template_id: req.params.id,
        label,
        order_index: i,
      }));
      const { error: itemsError } = await supabase
        .from("inspection_template_items")
        .insert(items);
      if (itemsError) {
        res.status(400).json({ error: itemsError.message });
        return;
      }
    }
  }

  const { data: template } = await supabase
    .from("inspection_templates")
    .select("*")
    .eq("id", req.params.id)
    .single();

  const { data: checklistItems } = await supabase
    .from("inspection_template_items")
    .select("*")
    .eq("template_id", req.params.id);

  res.json({ data: { ...template, checklist: checklistItems || [] } });
});

router.delete("/templates/:id", async (req: Request, res: Response) => {
  const { error } = await supabase.from("inspection_templates").delete().eq("id", req.params.id);
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.json({ message: "Deleted" });
});

export default router;
