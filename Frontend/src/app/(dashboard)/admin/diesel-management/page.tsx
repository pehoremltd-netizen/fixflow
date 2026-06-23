"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  fetchDieselLogs, fetchDieselStats, fetchGenerators, fetchAlerts,
  createDieselLog, updateDieselLog, approveDieselLog, rejectDieselLog,
  deleteDieselLog, resolveAlert, createGenerator,
} from "@/lib/api/diesel-management";
import type { DieselLog, Generator, DieselAlert } from "@/types";
import {
  Fuel, Clock, AlertTriangle, Gauge, Plus, Search, RefreshCw,
  CheckCircle2, XCircle, Eye, TrendingUp, TrendingDown,
  Droplets, BatteryWarning, Zap, Ban,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  Draft: "bg-muted-foreground/10 text-text-tertiary",
  Submitted: "bg-info/10 text-info border-info/20",
  Approved: "bg-success/10 text-success border-success/20",
  Rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const SEVERITY_COLORS: Record<string, string> = {
  info: "bg-info/10 text-info",
  warning: "bg-warning/10 text-warning",
  critical: "bg-destructive/10 text-destructive",
};

const FLAG_LABELS: Record<string, { label: string; color: string }> = {
  HIGH_CONSUMPTION: { label: "High Consumption", color: "bg-warning/10 text-warning" },
  LOW_FUEL: { label: "Low Fuel", color: "bg-destructive/10 text-destructive" },
  SUSPICIOUS_USAGE: { label: "Suspicious Usage", color: "bg-destructive/20 text-destructive" },
  THEFT_SUSPECTED: { label: "Theft Suspected", color: "bg-destructive/30 text-destructive" },
  MISSING_DATA: { label: "Missing Data", color: "bg-info/10 text-info" },
};

export default function DieselManagementPage() {
  const [logs, setLogs] = useState<DieselLog[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [generators, setGenerators] = useState<Generator[]>([]);
  const [alerts, setAlerts] = useState<DieselAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DieselLog | null>(null);
  const [form, setForm] = useState<any>({});
  const [showApproval, setShowApproval] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showGenForm, setShowGenForm] = useState(false);
  const [genForm, setGenForm] = useState({ name: "", tank_capacity: 1000, expected_lph: 25, benchmark_lph: 25, max_daily_usage: 600 });

  const load = async () => {
    setLoading(true);
    const [l, s, g, a] = await Promise.all([
      fetchDieselLogs(),
      fetchDieselStats(),
      fetchGenerators(),
      fetchAlerts(),
    ]);
    setLogs(l); setStats(s); setGenerators(g); setAlerts(a);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const genMap = useMemo(() => {
    const m = new Map<string, Generator>();
    generators.forEach((g) => m.set(g.id, g));
    return m;
  }, [generators]);

  const filtered = logs.filter((l) =>
    l.operator_name.toLowerCase().includes(search.toLowerCase()) ||
    (l.generators?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  /* ─── Form handlers ─── */
  const openAdd = () => {
    setEditing(null);
    const firstGen = generators.find((g) => g.is_active);
    setForm({ date: new Date().toISOString().split("T")[0], generator_id: firstGen?.id || "" });
    setShowForm(true);
  };

  const openEdit = (l: DieselLog) => {
    setEditing(l);
    setForm({
      date: l.date, generator_id: l.generator_id,
      idr: l.idr, fdr: l.fdr,
      diesel_supplied: l.diesel_supplied, supplier_name: l.supplier_name,
      delivery_reference: l.delivery_reference, remarks: l.remarks,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.date || !form.generator_id || form.idr === undefined || form.fdr === undefined) return;
    if (editing) {
      await updateDieselLog(editing.id, form);
    } else {
      const gen = genMap.get(form.generator_id);
      await createDieselLog({
        ...form,
        facility_id: gen?.facility_id,
        operator_name: form.operator_name || "Operator",
      });
    }
    setShowForm(false);
    await load();
  };

  const handleApprove = async (id: string) => {
    await approveDieselLog(id, "Supervisor");
    setShowApproval(null);
    await load();
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) return;
    await rejectDieselLog(id, rejectReason, "Supervisor");
    setShowApproval(null);
    setRejectReason("");
    await load();
  };

  const handleResolveAlert = async (id: string) => {
    await resolveAlert(id);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this draft?")) return;
    await deleteDieselLog(id);
    await load();
  };

  const fmtNum = (n: number | undefined | null, d = 1) => n != null ? n.toFixed(d) : "—";

  const flagsForLog = (l: DieselLog) => {
    return (l.flags || []).map((f) => FLAG_LABELS[f] || { label: f, color: "bg-muted-foreground/10 text-text-tertiary" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Fuel className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Smart Diesel Control</h1>
          <p className="text-sm text-text-tertiary">SDCS — intelligent fuel tracking & anomaly detection</p>
        </div>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="dashboard" className="text-xs gap-1.5"><Gauge className="h-3.5 w-3.5" /> Dashboard</TabsTrigger>
          <TabsTrigger value="logs" className="text-xs gap-1.5 relative">
            Records
            {alerts.length > 0 && <span className="ml-1 bg-destructive text-destructive-foreground text-[9px] px-1.5 py-0.5 rounded-full">{alerts.length}</span>}
          </TabsTrigger>
        </TabsList>

        {/* ═══════════ DASHBOARD TAB ═══════════ */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={<Droplets className="h-4 w-4" />} label="Diesel Used" value={`${fmtNum(stats?.total_diesel_used)}L`} subtitle={`${stats?.total_logs || 0} records`} />
            <StatCard icon={<Fuel className="h-4 w-4" />} label="Diesel Supplied" value={`${fmtNum(stats?.total_supplied)}L`} subtitle="Total delivered" />
            <StatCard icon={<Zap className="h-4 w-4" />} label="Flagged Records" value={String(stats?.flagged_logs || 0)} subtitle={stats?.flagged_logs ? "Requires review" : "All clear"} danger={stats?.flagged_logs > 0} />
            <StatCard icon={<AlertTriangle className="h-4 w-4" />} label="Active Alerts" value={String(stats?.alerts_count || 0)} subtitle={stats?.alerts_count ? "Needs attention" : "No issues"} danger={stats?.alerts_count > 0} />
          </div>

          {/* Alerts panel */}
          {alerts.length > 0 && (
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Active Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                {alerts.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card-alt">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Badge className={cn("text-[9px]", SEVERITY_COLORS[a.severity])}>{a.severity}</Badge>
                      <span className="text-sm text-foreground truncate">{a.message}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 shrink-0" onClick={() => handleResolveAlert(a.id)}>
                      <CheckCircle2 className="h-3 w-3" /> Resolve
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Generator Efficiency Ranking */}
          {stats?.gen_efficiency?.length > 0 && (
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Generator Efficiency Ranking
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-text-tertiary text-xs uppercase">
                        <th className="text-left py-3 px-4 font-medium">#</th>
                        <th className="text-left py-3 px-4 font-medium">Generator</th>
                        <th className="text-right py-3 px-4 font-medium">Total Diesel</th>
                        <th className="text-right py-3 px-4 font-medium">Avg / Record</th>
                        <th className="text-left py-3 px-4 font-medium">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.gen_efficiency.map((g: any, i: number) => (
                        <tr key={g.id} className="border-b border-card-alt hover:bg-card-alt transition-colors">
                          <td className="py-3 px-4 text-text-tertiary">{i + 1}</td>
                          <td className="py-3 px-4 text-foreground">{g.name}</td>
                          <td className="py-3 px-4 text-right text-foreground">{g.totalDiesel.toFixed(1)}L</td>
                          <td className="py-3 px-4 text-right text-foreground">{g.avgPerLog.toFixed(1)}L</td>
                          <td className="py-3 px-4">
                            {i === 0 ? <Badge className="text-[9px] bg-success/10 text-success">Most Efficient</Badge> :
                             i === stats.gen_efficiency.length - 1 ? <Badge className="text-[9px] bg-destructive/10 text-destructive">Highest Consumption</Badge> :
                             <Badge className="text-[9px] bg-muted-foreground/10 text-text-tertiary">—</Badge>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center gap-2">
            <Button onClick={openAdd} className="gap-1.5"><Plus className="h-4 w-4" /> New Reading</Button>
            <div className="flex-1" />
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
          </div>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground text-sm">Recent Records</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? <div className="text-center py-8 text-text-tertiary text-sm">Loading...</div> : (
                <DieselLogTable logs={filtered.slice(0, 10)} genMap={genMap} STATUS_COLORS={STATUS_COLORS}
                  onEdit={(l) => l.status !== "Approved" && openEdit(l)}
                  onApprove={(id) => setShowApproval(id)} onDelete={handleDelete} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════ ALL LOGS TAB ═══════════ */}
        <TabsContent value="logs" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search operator or generator..." className="pl-9 text-sm border-border bg-card text-foreground" />
            </div>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
            <Button onClick={openAdd} className="gap-1.5"><Plus className="h-4 w-4" /> New Reading</Button>
          </div>

          <Card className="border-border bg-card">
            <CardContent className="p-0">
              {loading ? <div className="text-center py-8 text-text-tertiary text-sm">Loading...</div> : filtered.length === 0 ? (
                <div className="text-center py-10 text-text-tertiary"><Fuel className="h-8 w-8 mx-auto mb-2 opacity-30" /><p className="text-xs">No records found</p></div>
              ) : (
                <DieselLogTable logs={filtered} genMap={genMap} STATUS_COLORS={STATUS_COLORS}
                  onEdit={(l) => l.status !== "Approved" && openEdit(l)}
                  onApprove={(id) => setShowApproval(id)} onDelete={handleDelete} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── SDCS FORM DIALOG (3-INPUT OPERATOR INTERFACE) ─── */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-card border-input sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Fuel className="h-4 w-4 text-primary" />
              {editing ? "Edit Diesel Record" : "New Diesel Reading"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Basic Info</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-tertiary block mb-1">Date *</label>
                  <Input type="date" value={form.date || ""} onChange={(e) => setForm({ ...form, date: e.target.value })} className="text-sm border-border bg-card text-foreground" />
                </div>
                <div>
                  <label className="text-xs text-text-tertiary block mb-1">Generator *</label>
                  <div className="flex gap-1">
                    <select value={form.generator_id || ""} onChange={(e) => setForm({ ...form, generator_id: e.target.value })} className="flex-1 h-9 rounded-md border border-border bg-card text-sm text-foreground px-3">
                      <option value="">{generators.length === 0 ? "No generators..." : "Select..."}</option>
                      {generators.filter((g) => g.is_active).map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                    <button type="button" onClick={() => { setGenForm({ name: "", tank_capacity: 1000, expected_lph: 25, benchmark_lph: 25, max_daily_usage: 600 }); setShowGenForm(true); }} className="h-9 w-9 rounded-md border border-border bg-card flex items-center justify-center text-text-tertiary hover:text-foreground hover:bg-accent shrink-0">+</button>
                  </div>
                </div>
              </div>
            </div>

            {/* SDCS: Only 3 operator inputs */}
            <div className="border-t border-border pt-3">
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">
                Fuel Readings
                <span className="ml-2 text-[9px] font-normal text-text-tertiary normal-case">(System calculates everything else)</span>
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-tertiary block mb-1">IDR (Initial) * <span className="text-text-tertiary">(L)</span></label>
                  <Input type="number" step="0.1" value={form.idr ?? ""} onChange={(e) => setForm({ ...form, idr: parseFloat(e.target.value) || 0 })} className="text-sm border-border bg-card text-foreground" placeholder="e.g. 850" />
                </div>
                <div>
                  <label className="text-xs text-text-tertiary block mb-1">FDR (Final) * <span className="text-text-tertiary">(L)</span></label>
                  <Input type="number" step="0.1" value={form.fdr ?? ""} onChange={(e) => setForm({ ...form, fdr: parseFloat(e.target.value) || 0 })} className="text-sm border-border bg-card text-foreground" placeholder="e.g. 620" />
                </div>
              </div>
              {form.idr !== undefined && form.fdr !== undefined && form.idr > 0 && form.fdr > 0 && (
                <div className="mt-2 text-xs text-text-tertiary flex items-center gap-2">
                  <Zap className="h-3 w-3" />
                  Diesel used: <span className="text-foreground font-medium">{(form.idr - form.fdr).toFixed(1)}L</span>
                </div>
              )}
            </div>

            <div className="border-t border-border pt-3">
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Supply (Optional)</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-tertiary block mb-1">Diesel Supplied (L)</label>
                  <Input type="number" step="0.1" value={form.diesel_supplied ?? ""} onChange={(e) => setForm({ ...form, diesel_supplied: parseFloat(e.target.value) || 0 })} className="text-sm border-border bg-card text-foreground" />
                </div>
                <div>
                  <label className="text-xs text-text-tertiary block mb-1">Supplier</label>
                  <Input value={form.supplier_name || ""} onChange={(e) => setForm({ ...form, supplier_name: e.target.value })} className="text-sm border-border bg-card text-foreground" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-text-tertiary block mb-1">Delivery Reference</label>
                  <Input value={form.delivery_reference || ""} onChange={(e) => setForm({ ...form, delivery_reference: e.target.value })} className="text-sm border-border bg-card text-foreground" />
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-3">
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Remarks</p>
              <textarea value={form.remarks || ""} onChange={(e) => setForm({ ...form, remarks: e.target.value })} placeholder="Any notes..." className="w-full min-h-[60px] text-sm p-2 rounded border border-border bg-card text-foreground resize-none" />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={!form.date || !form.generator_id || form.idr === undefined || form.fdr === undefined || form.idr < form.fdr}>
                {editing ? "Update" : "Submit Reading"}
              </Button>
            </div>
            {form.idr !== undefined && form.fdr !== undefined && form.idr < form.fdr && (
              <p className="text-xs text-destructive">IDR must be greater than or equal to FDR</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── APPROVAL DIALOG ─── */}
      <Dialog open={!!showApproval} onOpenChange={() => { setShowApproval(null); setRejectReason(""); }}>
        <DialogContent className="bg-card border-input sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">Review Diesel Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-text-tertiary">Approve or reject this diesel record.</p>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Rejection reason (required if rejecting)..."
              className="w-full min-h-[60px] text-sm p-2 rounded border border-border bg-card text-foreground resize-none" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => { setShowApproval(null); setRejectReason(""); }}>Cancel</Button>
              <Button variant="destructive" size="sm" onClick={() => showApproval && handleReject(showApproval)} disabled={!rejectReason.trim()}>
                <XCircle className="h-3.5 w-3.5" /> Reject
              </Button>
              <Button size="sm" onClick={() => showApproval && handleApprove(showApproval)}>
                <CheckCircle2 className="h-3.5 w-3.5" /> Approve
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── GENERATOR FORM DIALOG ─── */}
      <Dialog open={showGenForm} onOpenChange={setShowGenForm}>
        <DialogContent className="bg-card border-input sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2"><Fuel className="h-4 w-4 text-primary" /> Add Generator</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs text-text-tertiary block mb-1">Name *</label><Input value={genForm.name} onChange={(e) => setGenForm({ ...genForm, name: e.target.value })} className="text-sm border-border bg-card text-foreground" /></div>
            <div className="grid grid-cols-3 gap-2">
              <div><label className="text-xs text-text-tertiary block mb-1">Tank (L)</label><Input type="number" value={genForm.tank_capacity} onChange={(e) => setGenForm({ ...genForm, tank_capacity: parseFloat(e.target.value) || 0 })} className="text-sm border-border bg-card text-foreground" /></div>
              <div><label className="text-xs text-text-tertiary block mb-1">Benchmark LPH</label><Input type="number" value={genForm.benchmark_lph} onChange={(e) => setGenForm({ ...genForm, benchmark_lph: parseFloat(e.target.value) || 0, expected_lph: parseFloat(e.target.value) || 0 })} className="text-sm border-border bg-card text-foreground" /></div>
              <div><label className="text-xs text-text-tertiary block mb-1">Max/D L</label><Input type="number" value={genForm.max_daily_usage} onChange={(e) => setGenForm({ ...genForm, max_daily_usage: parseFloat(e.target.value) || 0 })} className="text-sm border-border bg-card text-foreground" /></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowGenForm(false)}>Cancel</Button>
              <Button size="sm" onClick={async () => {
                if (!genForm.name.trim()) return;
                await createGenerator(genForm);
                setShowGenForm(false);
                await load();
              }} disabled={!genForm.name.trim()}>Add</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Sub-components ─── */

function StatCard({ icon, label, value, subtitle, danger }: { icon: React.ReactNode; label: string; value: string; subtitle: string; danger?: boolean }) {
  return (
    <Card className={cn("border-border bg-card", danger && "border-destructive/30")}>
      <CardContent className="p-3 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-text-tertiary uppercase tracking-wider">{label}</p>
          <span className={cn(danger ? "text-destructive" : "text-text-tertiary")}>{icon}</span>
        </div>
        <p className={cn("text-lg font-bold text-foreground", danger && "text-destructive")}>{value}</p>
        <p className="text-[10px] text-text-tertiary truncate">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function DieselLogTable({ logs, genMap, STATUS_COLORS, onEdit, onApprove, onDelete }: {
  logs: DieselLog[]; genMap: Map<string, Generator>; STATUS_COLORS: Record<string, string>;
  onEdit: (l: DieselLog) => void; onApprove: (id: string) => void; onDelete: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-text-tertiary text-xs uppercase">
            <th className="text-left py-3 px-4 font-medium">Date</th>
            <th className="text-left py-3 px-4 font-medium">Generator</th>
            <th className="text-right py-3 px-4 font-medium">IDR</th>
            <th className="text-right py-3 px-4 font-medium">FDR</th>
            <th className="text-right py-3 px-4 font-medium">Used</th>
            <th className="text-right py-3 px-4 font-medium">Est. Hrs</th>
            <th className="text-right py-3 px-4 font-medium">Balance</th>
            <th className="text-left py-3 px-4 font-medium">Status</th>
            <th className="text-right py-3 px-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l, i) => {
            const logFlags = (l.flags || []).map((f) => FLAG_LABELS[f] || { label: f, color: "bg-muted-foreground/10 text-text-tertiary" });
            return (
              <tr key={l.id} className={cn("border-b border-card-alt hover:bg-card-alt transition-colors", i % 2 === 0 && "bg-card-alt/30")}>
                <td className="py-3 px-4 text-foreground whitespace-nowrap">{l.date}</td>
                <td className="py-3 px-4 text-foreground">{genMap.get(l.generator_id)?.name || l.generator_id.slice(0, 8)}</td>
                <td className="py-3 px-4 text-right text-foreground">{l.idr.toFixed(1)}</td>
                <td className="py-3 px-4 text-right text-foreground">{l.fdr.toFixed(1)}</td>
                <td className="py-3 px-4 text-right text-foreground font-medium">{l.diesel_used.toFixed(1)}</td>
                <td className="py-3 px-4 text-right text-text-tertiary">{l.estimated_run_hours?.toFixed(1) || "—"}</td>
                <td className="py-3 px-4 text-right text-foreground">{l.current_balance.toFixed(1)}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1 flex-wrap">
                    <Badge className={cn("text-[9px]", STATUS_COLORS[l.status])}>{l.status}</Badge>
                    {logFlags.slice(0, 2).map((f, idx) => (
                      <Badge key={idx} className={cn("text-[9px]", f.color)} title={f.label}>!</Badge>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {l.status === "Submitted" && (
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-text-subtle hover:text-primary" onClick={() => onApprove(l.id)} title="Review">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {l.status !== "Approved" && l.status !== "Rejected" && (
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-text-subtle hover:text-primary" onClick={() => onEdit(l)} title="Edit">
                        <TrendingUp className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {l.status === "Draft" && (
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-text-subtle hover:text-destructive" onClick={() => onDelete(l.id)} title="Delete">
                        <XCircle className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
