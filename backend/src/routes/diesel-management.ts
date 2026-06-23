import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

/* ─── Helpers ─── */

function computeFields(body: any, prevBal: number, genExpectedLph: number) {
  const timeOn = body.time_on || body.timeOn;
  const timeOff = body.time_off || body.timeOff;
  const idr = body.idr ?? 0;
  const fdr = body.fdr ?? 0;
  const dieselSupplied = body.diesel_supplied ?? body.dieselSupplied ?? 0;
  const expectedLph = body.expected_lph ?? body.expectedLph ?? genExpectedLph;

  const runHours = calcRunHours(timeOn, timeOff);
  const dieselUsed = idr - fdr;
  const previousBalance = prevBal;
  const currentBalance = previousBalance + dieselSupplied - dieselUsed;
  const lph = runHours > 0 ? dieselUsed / runHours : 0;
  const variance = lph - expectedLph;

  return { runHours, dieselUsed, previousBalance, currentBalance, lph, expectedLph, variance };
}

function calcRunHours(on: string, off: string): number {
  if (!on || !off) return 0;
  const [oh, om] = on.split(":").map(Number);
  const [fh, fm] = off.split(":").map(Number);
  const onMin = oh * 60 + om;
  const offMin = fh * 60 + fm;
  return Math.max(0, (offMin - onMin) / 60);
}

function evaluateFlags(lph: number, expectedLph: number, currentBalance: number, tankCapacity: number, dieselUsed: number, maxDailyUsage: number): string[] {
  const flags: string[] = [];
  if (lph > expectedLph * 1.2) flags.push("HIGH_CONSUMPTION");
  if (currentBalance < tankCapacity * 0.2) flags.push("LOW_FUEL");
  if (dieselUsed > maxDailyUsage * 1.5) flags.push("THEFT_SUSPECTED");
  return flags;
}

async function logAudit(logId: string, action: string, performedBy: string, fieldName: string, oldVal: string, newVal: string) {
  await supabase.from("diesel_audit_trail").insert({
    diesel_log_id: logId,
    action,
    performed_by: performedBy,
    field_name: fieldName,
    old_value: oldVal,
    new_value: newVal,
  });
}

async function createAlert(logId: string, alertType: string, severity: string, message: string) {
  await supabase.from("diesel_alerts").insert({
    diesel_log_id: logId,
    alert_type: alertType,
    severity,
    message,
  });
}

/* ─── GET / — List logs ─── */
router.get("/", async (req: Request, res: Response) => {
  const { generator_id, facility_id, status, start_date, end_date, limit } = req.query as Record<string, string>;
  let query = supabase
    .from("diesel_logs")
    .select("*, generators(name, tank_capacity, expected_lph), sites(name)")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (generator_id) query = query.eq("generator_id", generator_id);
  if (facility_id) query = query.eq("facility_id", facility_id);
  if (status) query = query.eq("status", status);
  if (start_date) query = query.gte("date", start_date);
  if (end_date) query = query.lte("date", end_date);
  if (limit) query = query.limit(parseInt(limit, 10));

  const { data, error } = await query;
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ data });
});

/* ─── GET /stats — Dashboard aggregates ─── */
router.get("/stats", async (req: Request, res: Response) => {
  const { facility_id, period } = req.query as Record<string, string>;
  const days = period === "weekly" ? 7 : period === "monthly" ? 30 : 1;
  const since = new Date();
  since.setDate(since.getDate() - days);

  let base = supabase.from("diesel_logs").select("*", { count: "exact" }).gte("date", since.toISOString().split("T")[0]).neq("status", "Rejected");
  if (facility_id) base = base.eq("facility_id", facility_id);

  const { data: logs, error } = await base;
  if (error) { res.status(500).json({ error: error.message }); return; }

  const stats = {
    total_diesel_used: logs?.reduce((s, l) => s + (l.diesel_used || 0), 0) || 0,
    total_run_hours: logs?.reduce((s, l) => s + (l.run_hours || 0), 0) || 0,
    total_supplied: logs?.reduce((s, l) => s + (l.diesel_supplied || 0), 0) || 0,
    total_logs: logs?.length || 0,
    avg_lph: 0,
    alerts_count: 0,
  };
  if (stats.total_run_hours > 0) stats.avg_lph = stats.total_diesel_used / stats.total_run_hours;

  const { count: alertCount } = await supabase
    .from("diesel_alerts")
    .select("*", { count: "exact", head: true })
    .gte("created_at", since.toISOString())
    .eq("is_resolved", false);
  stats.alerts_count = alertCount || 0;

  res.json({ data: stats });
});

/* ─── GET /generators — List generators (auto-seeds if empty) ─── */
router.get("/generators", async (req: Request, res: Response) => {
  let { data, error } = await supabase.from("generators").select("*, sites(name)").order("name");
  if (error) { res.status(500).json({ error: error.message }); return; }

  // Auto-seed defaults if table is empty
  if (!data || data.length === 0) {
    const { data: sites } = await supabase.from("sites").select("id").limit(1);
    const facilityId = sites?.[0]?.id || null;
    const defaults = [
      { name: "Generator 1 (Main)", facility_id: facilityId, tank_capacity: 1000, expected_lph: 25, max_daily_usage: 600 },
      { name: "Generator 2 (Standby)", facility_id: facilityId, tank_capacity: 500, expected_lph: 20, max_daily_usage: 480 },
      { name: "Generator 3 (Workshop)", facility_id: facilityId, tank_capacity: 300, expected_lph: 15, max_daily_usage: 360 },
      { name: "Generator 4 (Admin Block)", facility_id: facilityId, tank_capacity: 200, expected_lph: 12, max_daily_usage: 288 },
      { name: "Generator 5 (Quarters)", facility_id: facilityId, tank_capacity: 750, expected_lph: 22, max_daily_usage: 528 },
    ];
    const { data: seeded, error: seedErr } = await supabase.from("generators").insert(defaults).select();
    if (!seedErr && seeded) data = seeded;
  }

  res.json({ data });
});

/* ─── POST /generators — Create generator ─── */
router.post("/generators", async (req: Request, res: Response) => {
  const { data, error } = await supabase.from("generators").insert(req.body).select().single();
  if (error) { res.status(400).json({ error: error.message }); return; }
  res.status(201).json({ data });
});

/* ─── GET /alerts — List unresolved alerts ─── */
router.get("/alerts", async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("diesel_alerts")
    .select("*, diesel_logs(date, generator_id, operator_name)")
    .eq("is_resolved", false)
    .order("created_at", { ascending: false });
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ data });
});

/* ─── PATCH /generators/:id ─── */
router.patch("/generators/:id", async (req: Request, res: Response) => {
  const { data, error } = await supabase.from("generators").update(req.body).eq("id", req.params.id).select().single();
  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ data });
});

/* ─── PATCH /alerts/:id/resolve ─── */
router.patch("/alerts/:id/resolve", async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("diesel_alerts")
    .update({ is_resolved: true, resolved_at: new Date().toISOString() })
    .eq("id", req.params.id)
    .select()
    .single();
  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ data });
});

/* ─── GET /:id ─── */
router.get("/:id", async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("diesel_logs")
    .select("*, generators(name, tank_capacity, expected_lph), sites(name)")
    .eq("id", req.params.id)
    .single();
  if (error) { res.status(404).json({ error: "Log not found" }); return; }
  res.json({ data });
});

/* ─── POST / — Create log ─── */
router.post("/", async (req: Request, res: Response) => {
  const b = req.body;

  // Validate required
  if (!b.date || !b.generator_id || !b.time_on || !b.time_off || b.idr === undefined || b.fdr === undefined) {
    res.status(400).json({ error: "Missing required fields: date, generator_id, time_on, time_off, idr, fdr" });
    return;
  }

  // Validate IDR >= FDR
  if (b.idr < b.fdr) {
    res.status(400).json({ error: "IDR must be greater than or equal to FDR" });
    return;
  }

  // Check duplicate
  const { data: existing } = await supabase
    .from("diesel_logs")
    .select("id")
    .eq("generator_id", b.generator_id)
    .eq("date", b.date)
    .neq("status", "Rejected")
    .maybeSingle();
  if (existing) {
    res.status(409).json({ error: "A log already exists for this generator on this date" });
    return;
  }

  // Fetch generator config
  const { data: gen } = await supabase.from("generators").select("*").eq("id", b.generator_id).single();

  // Get previous balance
  const { data: prevLog } = await supabase
    .from("diesel_logs")
    .select("current_balance")
    .eq("generator_id", b.generator_id)
    .neq("status", "Rejected")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const prevBal = prevLog?.current_balance ?? 0;
  const expectedLph = gen?.expected_lph ?? 0;
  const tankCapacity = gen?.tank_capacity ?? 1000;
  const maxDailyUsage = gen?.max_daily_usage ?? 500;

  const computed = computeFields(b, prevBal, expectedLph);
  const flags = evaluateFlags(computed.lph, expectedLph, computed.currentBalance, tankCapacity, b.diesel_used ?? computed.dieselUsed, maxDailyUsage);

  const payload = {
    date: b.date,
    facility_id: b.facility_id || gen?.facility_id || null,
    generator_id: b.generator_id,
    operator_name: b.operator_name || b.operatorName || "",
    time_on: b.time_on || b.timeOn,
    time_off: b.time_off || b.timeOff,
    run_hours: computed.runHours,
    idr: b.idr,
    fdr: b.fdr,
    diesel_used: computed.dieselUsed,
    diesel_supplied: b.diesel_supplied ?? b.dieselSupplied ?? 0,
    supplier_name: b.supplier_name || b.supplierName || "",
    delivery_reference: b.delivery_reference || b.deliveryReference || "",
    previous_balance: computed.previousBalance,
    current_balance: computed.currentBalance,
    lph: computed.lph,
    expected_lph: computed.expectedLph,
    variance: computed.variance,
    flags,
    status: "Submitted",
    remarks: b.remarks || "",
    created_by: b.created_by || b.createdBy || "",
  };

  const { data, error } = await supabase.from("diesel_logs").insert(payload).select().single();
  if (error) { res.status(400).json({ error: error.message }); return; }

  // Create alerts
  for (const flag of flags) {
    const severity = flag === "THEFT_SUSPECTED" ? "critical" : flag === "LOW_FUEL" ? "warning" : "warning";
    await createAlert(data.id, flag, severity, `${flag.replace(/_/g, " ")} on ${b.date} for generator ${gen?.name || b.generator_id}`);
  }

  // Audit
  await logAudit(data.id, "CREATE", payload.created_by, "all", "", JSON.stringify(payload));

  res.status(201).json({ data });
});

/* ─── PATCH /:id — Update (only if Draft or Submitted) ─── */
router.patch("/:id", async (req: Request, res: Response) => {
  const { data: existing } = await supabase.from("diesel_logs").select("*").eq("id", req.params.id).single();
  if (!existing) { res.status(404).json({ error: "Log not found" }); return; }
  if (existing.status === "Approved") {
    res.status(403).json({ error: "Approved logs cannot be edited" });
    return;
  }

  const b = req.body;

  // Re-validate IDR >= FDR
  const idr = b.idr ?? existing.idr;
  const fdr = b.fdr ?? existing.fdr;
  if (idr < fdr) {
    res.status(400).json({ error: "IDR must be greater than or equal to FDR" });
    return;
  }

  const gen = await supabase.from("generators").select("*").eq("id", existing.generator_id).single().then(r => r.data);
  const prevBal = existing.previous_balance;
  const expectedLph = gen?.expected_lph ?? existing.expected_lph;

  const merged = { ...existing, ...b };
  const computed = computeFields(merged, prevBal, expectedLph);
  const tankCapacity = gen?.tank_capacity ?? 1000;
  const maxDailyUsage = gen?.max_daily_usage ?? 500;
  const flags = evaluateFlags(computed.lph, expectedLph, computed.currentBalance, tankCapacity, computed.dieselUsed, maxDailyUsage);

  const payload: any = {};
  const trackFields = ["date", "time_on", "time_off", "idr", "fdr", "diesel_supplied", "supplier_name", "remarks"];
  for (const f of trackFields) {
    if (b[f] !== undefined) {
      payload[f] = b[f];
      if (existing[f] !== undefined && String(b[f]) !== String(existing[f])) {
        await logAudit(existing.id, "UPDATE", b.updated_by || "", f, String(existing[f]), String(b[f]));
      }
    }
  }

  payload.run_hours = computed.runHours;
  payload.diesel_used = computed.dieselUsed;
  payload.current_balance = computed.currentBalance;
  payload.lph = computed.lph;
  payload.variance = computed.variance;
  payload.flags = flags;

  // Reactivate status if editing
  if (existing.status === "Draft") payload.status = "Submitted";

  const { data, error } = await supabase.from("diesel_logs").update(payload).eq("id", req.params.id).select().single();
  if (error) { res.status(400).json({ error: error.message }); return; }

  res.json({ data });
});

/* ─── PATCH /:id/approve ─── */
router.patch("/:id/approve", async (req: Request, res: Response) => {
  const { data: existing } = await supabase.from("diesel_logs").select("*").eq("id", req.params.id).single();
  if (!existing) { res.status(404).json({ error: "Log not found" }); return; }
  if (existing.status !== "Submitted") {
    res.status(400).json({ error: "Only Submitted logs can be approved" });
    return;
  }

  const payload = {
    status: "Approved",
    approved_by: req.body.approved_by || "",
    approved_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from("diesel_logs").update(payload).eq("id", req.params.id).select().single();
  if (error) { res.status(400).json({ error: error.message }); return; }
  await logAudit(data.id, "APPROVE", payload.approved_by, "status", "Submitted", "Approved");

  res.json({ data });
});

/* ─── PATCH /:id/reject ─── */
router.patch("/:id/reject", async (req: Request, res: Response) => {
  const { data: existing } = await supabase.from("diesel_logs").select("*").eq("id", req.params.id).single();
  if (!existing) { res.status(404).json({ error: "Log not found" }); return; }
  if (existing.status !== "Submitted") {
    res.status(400).json({ error: "Only Submitted logs can be rejected" });
    return;
  }

  const payload = {
    status: "Rejected",
    rejection_reason: req.body.rejection_reason || req.body.rejectionReason || "",
  };
  const { data, error } = await supabase.from("diesel_logs").update(payload).eq("id", req.params.id).select().single();
  if (error) { res.status(400).json({ error: error.message }); return; }
  await logAudit(data.id, "REJECT", req.body.approved_by || "", "status", "Submitted", "Rejected");

  res.json({ data });
});

/* ─── DELETE /:id — Only if Draft ─── */
router.delete("/:id", async (req: Request, res: Response) => {
  const { data: existing } = await supabase.from("diesel_logs").select("status").eq("id", req.params.id).single();
  if (!existing) { res.status(404).json({ error: "Log not found" }); return; }
  if (existing.status !== "Draft") {
    res.status(403).json({ error: "Only Draft logs can be deleted" });
    return;
  }
  const { error } = await supabase.from("diesel_logs").delete().eq("id", req.params.id);
  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ message: "Deleted" });
});

/* ─── GET /:id/audit — Audit trail for a log ─── */
router.get("/:id/audit", async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("diesel_audit_trail")
    .select("*")
    .eq("diesel_log_id", req.params.id)
    .order("created_at", { ascending: false });
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ data });
});

export default router;
