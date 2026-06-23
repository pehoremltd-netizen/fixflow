import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

/* ═══════════════════════════════════════════════════════════
   SDCS HELPERS
   ═══════════════════════════════════════════════════════════ */

function sdcsCompute(body: any, prevBal: number, benchmarkLph: number, tankCapacity: number) {
  const idr = body.idr ?? 0;
  const fdr = body.fdr ?? 0;
  const dieselSupplied = body.diesel_supplied ?? body.dieselSupplied ?? 0;

  const dieselUsed = idr - fdr;
  const estimatedRunHours = benchmarkLph > 0 ? Math.round((dieselUsed / benchmarkLph) * 100) / 100 : 0;
  const previousBalance = prevBal;
  const currentBalance = Math.round((previousBalance + dieselSupplied - dieselUsed) * 100) / 100;
  const calculatedLph = estimatedRunHours > 0 ? Math.round((dieselUsed / estimatedRunHours) * 100) / 100 : benchmarkLph;
  const variance = Math.round((calculatedLph - benchmarkLph) * 100) / 100;

  return {
    dieselUsed, estimatedRunHours, previousBalance, currentBalance,
    calculatedLph, benchmarkLph, variance,
  };
}

async function getHistoricalAvgDieselUsed(generatorId: string, excludeDate: string): Promise<number> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { data } = await supabase
    .from("diesel_logs")
    .select("diesel_used")
    .eq("generator_id", generatorId)
    .neq("status", "Rejected")
    .lt("date", excludeDate)
    .gte("date", thirtyDaysAgo.toISOString().split("T")[0]);
  if (!data || data.length === 0) return 0;
  const sum = data.reduce((s, r) => s + (r.diesel_used || 0), 0);
  return sum / data.length;
}

async function getLatestBalance(generatorId: string): Promise<number> {
  const { data } = await supabase
    .from("diesel_logs")
    .select("current_balance")
    .eq("generator_id", generatorId)
    .neq("status", "Rejected")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.current_balance ?? 0;
}

function detectAnomalies(computed: ReturnType<typeof sdcsCompute>, benchmarkLph: number, tankCapacity: number, historicalAvg: number, maxDailyUsage: number): { flags: string[]; alerts: { type: string; severity: string; message: string }[] } {
  const flags: string[] = [];
  const alerts: { type: string; severity: string; message: string }[] = [];

  // 1. HIGH_CONSUMPTION: calculated_lph > benchmark_lph * 1.2
  if (computed.calculatedLph > benchmarkLph * 1.2) {
    flags.push("HIGH_CONSUMPTION");
    alerts.push({ type: "HIGH_CONSUMPTION", severity: "warning", message: `High consumption: ${computed.calculatedLph.toFixed(1)} L/h vs benchmark ${benchmarkLph.toFixed(1)} L/h` });
  }

  // 2. LOW_FUEL: current_balance < 20% tank capacity
  if (computed.currentBalance < tankCapacity * 0.2 && computed.currentBalance >= 0) {
    flags.push("LOW_FUEL");
    alerts.push({ type: "LOW_FUEL", severity: "critical", message: `Low fuel: ${computed.currentBalance.toFixed(1)}L remaining (${(computed.currentBalance / tankCapacity * 100).toFixed(0)}% of ${tankCapacity}L tank)` });
  }

  // 3. SUSPICIOUS_USAGE: deviation from historical average
  if (historicalAvg > 0) {
    const deviation = Math.abs(computed.dieselUsed - historicalAvg) / historicalAvg;
    if (deviation > 0.5) {
      flags.push("SUSPICIOUS_USAGE");
      alerts.push({ type: "SUSPICIOUS_USAGE", severity: "warning", message: `Unusual consumption: ${computed.dieselUsed.toFixed(1)}L vs 30-day avg ${historicalAvg.toFixed(1)}L (${(deviation * 100).toFixed(0)}% deviation)` });
    }
  }

  // 4. THEFT_SUSPECTED: diesel_used far exceeds max daily usage
  if (maxDailyUsage > 0 && computed.dieselUsed > maxDailyUsage * 1.5) {
    flags.push("THEFT_SUSPECTED");
    alerts.push({ type: "THEFT_SUSPECTED", severity: "critical", message: `Possible theft: ${computed.dieselUsed.toFixed(1)}L used exceeds max daily limit of ${maxDailyUsage.toFixed(1)}L` });
  }

  return { flags, alerts };
}

async function logAuditTrail(logId: string, action: string, performedBy: string, fieldName: string, oldVal: string, newVal: string) {
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

/* ═══════════════════════════════════════════════════════════
   ENDPOINTS
   ═══════════════════════════════════════════════════════════ */

/* ─── GET / — List diesel records ─── */
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

  const genUsage: Record<string, { name: string; totalUsed: number; count: number }> = {};
  logs?.forEach((l) => {
    if (l.generators?.name) {
      if (!genUsage[l.generator_id]) genUsage[l.generator_id] = { name: l.generators.name, totalUsed: 0, count: 0 };
      genUsage[l.generator_id].totalUsed += l.diesel_used || 0;
      genUsage[l.generator_id].count++;
    }
  });

  const genEfficiency = Object.entries(genUsage)
    .map(([id, g]) => ({ id, name: g.name, totalDiesel: Math.round(g.totalUsed * 100) / 100, avgPerLog: g.count > 0 ? Math.round((g.totalUsed / g.count) * 100) / 100 : 0 }))
    .sort((a, b) => a.avgPerLog - b.avgPerLog);

  const totalDieselUsed = logs?.reduce((s, l) => s + (l.diesel_used || 0), 0) || 0;
  const totalSupplied = logs?.reduce((s, l) => s + (l.diesel_supplied || 0), 0) || 0;
  const flaggedLogs = logs?.filter((l) => l.flags && l.flags.length > 0).length || 0;

  const stats = {
    total_diesel_used: totalDieselUsed,
    total_supplied,
    total_logs: logs?.length || 0,
    flagged_logs: flaggedLogs,
    gen_efficiency: genEfficiency,
    alerts_count: 0,
  };

  const { count: alertCount } = await supabase
    .from("diesel_alerts")
    .select("*", { count: "exact", head: true })
    .gte("created_at", since.toISOString())
    .eq("is_resolved", false);
  stats.alerts_count = alertCount || 0;

  res.json({ data: stats });
});

/* ─── GET /generators — List generators ─── */
router.get("/generators", async (req: Request, res: Response) => {
  let { data, error } = await supabase.from("generators").select("*, sites(name)").order("name");
  if (error) { res.status(500).json({ error: error.message }); return; }

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
  const body = { ...req.body };
  delete body.benchmark_lph;
  const { data, error } = await supabase.from("generators").insert(body).select().single();
  if (error) { res.status(400).json({ error: error.message }); return; }
  res.status(201).json({ data });
});

/* ─── PATCH /generators/:id ─── */
router.patch("/generators/:id", async (req: Request, res: Response) => {
  const body = { ...req.body };
  delete body.benchmark_lph;
  const { data, error } = await supabase.from("generators").update(body).eq("id", req.params.id).select().single();
  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ data });
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

/* ─── GET /inactive-detection — MISSING_DATA check ─── */
router.get("/inactive-detection", async (req: Request, res: Response) => {
  const { data: gens } = await supabase.from("generators").select("id, name").eq("is_active", true);
  if (!gens) { res.json({ data: [] }); return; }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split("T")[0];

  const missing: { generator_id: string; generator_name: string; date: string }[] = [];
  for (const gen of gens) {
    const { data: existing } = await supabase
      .from("diesel_logs")
      .select("id")
      .eq("generator_id", gen.id)
      .eq("date", dateStr)
      .maybeSingle();
    if (!existing) {
      missing.push({ generator_id: gen.id, generator_name: gen.name, date: dateStr });
    }
  }

  // Create alerts for missing generators
  for (const m of missing) {
    const { data: alertExists } = await supabase
      .from("diesel_alerts")
      .select("id")
      .eq("alert_type", "MISSING_DATA")
      .eq("message", `No diesel log for ${m.generator_name} on ${m.date}`)
      .eq("is_resolved", false)
      .maybeSingle();
    if (!alertExists) {
      await supabase.from("diesel_alerts").insert({
        alert_type: "MISSING_DATA",
        severity: "warning",
        message: `No diesel log for ${m.generator_name} on ${m.date}`,
        is_resolved: false,
      });
    }
  }

  res.json({ data: missing });
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

/* ─── POST / — Create diesel record (SDCS) ─── */
router.post("/", async (req: Request, res: Response) => {
  const b = req.body;

  // Validate required (only idr and fdr are truly required)
  if (!b.date || !b.generator_id || b.idr === undefined || b.fdr === undefined) {
    res.status(400).json({ error: "Missing required fields: date, generator_id, idr, fdr" });
    return;
  }

  // Validate IDR >= FDR
  const idr = Number(b.idr);
  const fdr = Number(b.fdr);
  if (idr < fdr) {
    res.status(400).json({ error: "IDR must be greater than or equal to FDR" });
    return;
  }

  // No negative values
  if (idr < 0 || fdr < 0) {
    res.status(400).json({ error: "Negative readings are not allowed" });
    return;
  }

  // Prevent duplicate entries per generator per day
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
  if (!gen) {
    res.status(404).json({ error: "Generator not found" });
    return;
  }

  const benchmarkLph = gen.expected_lph || 0;
  const tankCapacity = gen.tank_capacity || 1000;
  const maxDailyUsage = gen.max_daily_usage || 500;

  // Get previous balance
  const prevBal = await getLatestBalance(b.generator_id);

  // SDCS calculations
  const computed = sdcsCompute(b, prevBal, benchmarkLph, tankCapacity);

  // Historical average for anomaly detection
  const historicalAvg = await getHistoricalAvgDieselUsed(b.generator_id, b.date);

  // Anomaly detection
  const { flags, alerts: alertList } = detectAnomalies(computed, benchmarkLph, tankCapacity, historicalAvg, maxDailyUsage);

  const payload = {
    date: b.date,
    facility_id: b.facility_id || gen.facility_id || null,
    generator_id: b.generator_id,
    operator_name: b.operator_name || b.operatorName || "",
    idr,
    fdr,
    diesel_used: computed.dieselUsed,
    diesel_supplied: b.diesel_supplied ?? b.dieselSupplied ?? 0,
    supplier_name: b.supplier_name || b.supplierName || "",
    delivery_reference: b.delivery_reference || b.deliveryReference || "",
    previous_balance: computed.previousBalance,
    current_balance: computed.currentBalance,
    lph: computed.calculatedLph,
    expected_lph: benchmarkLph,
    variance: computed.variance,
    flags,
    status: "Submitted",
    remarks: b.remarks || "",
    created_by: b.created_by || "",
  };

  const { data, error } = await supabase.from("diesel_logs").insert(payload).select().single();
  if (error) { res.status(400).json({ error: error.message }); return; }

  // Create alerts
  for (const al of alertList) {
    await createAlert(data.id, al.type, al.severity, al.message);
  }

  // Audit log entry
  await supabase.from("diesel_audit_trail").insert({
    diesel_log_id: data.id,
    action: "CREATE",
    performed_by: payload.created_by || "system",
    field_name: "record",
    old_value: "",
    new_value: JSON.stringify(payload),
  });

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

  const { data: gen } = await supabase.from("generators").select("*").eq("id", existing.generator_id).single();
  const benchmarkLph = gen?.expected_lph || existing.expected_lph || 0;
  const tankCapacity = gen?.tank_capacity ?? 1000;
  const maxDailyUsage = gen?.max_daily_usage ?? 500;

  const merged = { ...existing, ...b };
  const computed = sdcsCompute(merged, existing.previous_balance, benchmarkLph, tankCapacity);

  // Re-detect anomalies
  const historicalAvg = await getHistoricalAvgDieselUsed(existing.generator_id, existing.date);
  const { flags, alerts: alertList } = detectAnomalies(computed, benchmarkLph, tankCapacity, historicalAvg, maxDailyUsage);

  // Track changes for audit
  const changes: Record<string, { old: any; new: any }> = {};
  const trackFields = ["idr", "fdr", "diesel_supplied", "supplier_name", "remarks"];
  const payload: any = {};

  for (const f of trackFields) {
    if (b[f] !== undefined) {
      payload[f] = b[f];
      if (existing[f] !== undefined && String(b[f]) !== String(existing[f])) {
        changes[f] = { old: existing[f], new: b[f] };
        await logAuditTrail(existing.id, "UPDATE", b.updated_by || "", f, String(existing[f]), String(b[f]));
      }
    }
  }

  payload.diesel_used = computed.dieselUsed;
  payload.current_balance = computed.currentBalance;
  payload.lph = computed.calculatedLph;
  payload.variance = computed.variance;
  payload.flags = flags;

  // Reactivate status if editing draft
  if (existing.status === "Draft") payload.status = "Submitted";

  const { data, error } = await supabase.from("diesel_logs").update(payload).eq("id", req.params.id).select().single();
  if (error) { res.status(400).json({ error: error.message }); return; }

  // Create alerts for new anomalies
  for (const al of alertList) {
    await createAlert(data.id, al.type, al.severity, al.message);
  }

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

  const approvedBy = req.body.approved_by || "";
  const payload: any = {
    status: "Approved",
    approved_by: approvedBy,
    approved_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("diesel_logs").update(payload).eq("id", req.params.id).select().single();
  if (error) { res.status(400).json({ error: error.message }); return; }

  await logAuditTrail(data.id, "APPROVE", approvedBy, "status", "Submitted", "Approved");
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

  const rejectedBy = req.body.approved_by || "";
  const payload: any = {
    status: "Rejected",
    rejection_reason: req.body.rejection_reason || req.body.rejectionReason || "",
  };

  const { data, error } = await supabase.from("diesel_logs").update(payload).eq("id", req.params.id).select().single();
  if (error) { res.status(400).json({ error: error.message }); return; }

  await logAuditTrail(data.id, "REJECT", rejectedBy, "status", "Submitted", "Rejected");
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

/* ─── GET /:id/audit — Audit trail ─── */
router.get("/:id/audit", async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("diesel_audit_trail")
    .select("*")
    .eq("diesel_log_id", req.params.id)
    .order("created_at", { ascending: false });
  if (error) { res.status(500).json({ error: error.message }); return; }

  res.json({ data: data || [] });
});

export default router;
