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
  CheckCircle2, XCircle, Eye, EyeOff, TrendingUp, TrendingDown,
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
  const [genForm, setGenForm] = useState({ name: "", tank_capacity: 1000, expected_lph: 25, max_daily_usage: 600 });

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
    setForm({ date: new Date().toISOString().split("T")[0], time_on: "08:00", time_off: "17:00" });
    setShowForm(true);
  };

  const openEdit = (l: DieselLog) => {
    setEditing(l);
    setForm({
      date: l.date, generator_id: l.generator_id, operator_name: l.operator_name,
      time_on: l.time_on, time_off: l.time_off, idr: l.idr, fdr: l.fdr,
      diesel_supplied: l.diesel_supplied, supplier_name: l.supplier_name,
      delivery_reference: l.delivery_reference, remarks: l.remarks,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.date || !form.generator_id || !form.time_on || !form.time_off) return;
    if (editing) {
      await updateDieselLog(editing.id, form);
    } else {
      await createDieselLog({ ...form, facility_id: genMap.get(form.generator_id)?.facility_id });
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
    if (!confirm("Delete this log?")) return;
    await deleteDieselLog(id);
    await load();
  };

  /* ─── Computed display helpers ─── */
  const fmtNum = (n: number | undefined | null, d = 1) => n != null ? n.toFixed(d) : "—";
  const fmtFlag = (f: string) => ({
    HIGH_CONSUMPTION: { label: "High Consumption", color: "bg-warning/10 text-warning" },
    LOW_FUEL: { label: "Low Fuel", color: "bg-destructive/10 text-destructive" },
    THEFT_SUSPECTED: { label: "Theft Suspected", color: "bg-destructive/20 text-destructive" },
  }[f] || { label: f, color: "bg-muted-foreground/10 text-text-tertiary" });

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Fuel className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Diesel Management</h1>
          <p className="text-sm text-text-tertiary">Generator fuel tracking & consumption analytics</p>
        </div>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="dashboard" className="text-xs gap-1.5"><Gauge className="h-3.5 w-3.5" /> Dashboard</TabsTrigger>
          <TabsTrigger value="logs" className="text-xs gap-1.5 relative">
            All Logs
            {alerts.length > 0 && <span className="ml-1 bg-destructive text-destructive-foreground text-[9px] px-1.5 py-0.5 rounded-full">{alerts.length}</span>}
          </TabsTrigger>
        </TabsList>

        {/* ═══════════ DASHBOARD TAB ═══════════ */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Stats cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={<Fuel className="h-4 w-4" />} label="Diesel Used" value={`${fmtNum(stats?.total_diesel_used)}L`} subtitle={`${stats?.total_logs || 0} logs`} />
            <StatCard icon={<Clock className="h-4 w-4" />} label="Run Hours" value={fmtNum(stats?.total_run_hours)} subtitle="Total period" />
            <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Avg LPH" value={fmtNum(stats?.avg_lph)} subtitle="Fleet average" />
            <StatCard icon={<AlertTriangle className="h-4 w-4" />} label="Active Alerts" value={String(stats?.alerts_count || 0)} subtitle={stats?.alerts_count ? "Requires attention" : "All clear"} danger={stats?.alerts_count > 0} />
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
              <CardContent className="space-y-2">
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

          {/* Action bar + recent logs */}
          <div className="flex items-center gap-2">
            <Button onClick={openAdd} className="gap-1.5"><Plus className="h-4 w-4" /> New Diesel Log</Button>
            <div className="flex-1" />
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
          </div>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground text-sm">Recent Logs</CardTitle>
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
            <Button onClick={openAdd} className="gap-1.5"><Plus className="h-4 w-4" /> New Log</Button>
          </div>

          <Card className="border-border bg-card">
            <CardContent className="p-0">
              {loading ? <div className="text-center py-8 text-text-tertiary text-sm">Loading...</div> : filtered.length === 0 ? (
                <div className="text-center py-10 text-text-tertiary"><Fuel className="h-8 w-8 mx-auto mb-2 opacity-30" /><p className="text-xs">No logs found</p></div>
              ) : (
                <DieselLogTable logs={filtered} genMap={genMap} STATUS_COLORS={STATUS_COLORS}
                  onEdit={(l) => l.status !== "Approved" && openEdit(l)}
                  onApprove={(id) => setShowApproval(id)} onDelete={handleDelete} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── FORM DIALOG ─── */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-card border-input sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Fuel className="h-4 w-4 text-primary" />
              {editing ? "Edit Diesel Log" : "New Diesel Log"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Section 1: Basic Info */}
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
                      <option value="">{generators.length === 0 ? "No generators found..." : "Select..."}</option>
                      {generators.filter((g) => g.is_active).map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                    <button type="button" onClick={() => { setGenForm({ name: "", tank_capacity: 1000, expected_lph: 25, max_daily_usage: 600 }); setShowGenForm(true); }} className="h-9 w-9 rounded-md border border-border bg-card flex items-center justify-center text-text-tertiary hover:text-foreground hover:bg-accent shrink-0" title="Add generator">+</button>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-text-tertiary block mb-1">Operator *</label>
                  <Input value={form.operator_name || ""} onChange={(e) => setForm({ ...form, operator_name: e.target.value })} placeholder="Operator name" className="text-sm border-border bg-card text-foreground" />
                </div>
              </div>
            </div>

            {/* Section 2: Generator Operation */}
            <div className="border-t border-border pt-3">
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Operation</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-tertiary block mb-1">Time On *</label>
                  <Input type="time" value={form.time_on || ""} onChange={(e) => setForm({ ...form, time_on: e.target.value })} className="text-sm border-border bg-card text-foreground" />
                </div>
                <div>
                  <label className="text-xs text-text-tertiary block mb-1">Time Off *</label>
                  <Input type="time" value={form.time_off || ""} onChange={(e) => setForm({ ...form, time_off: e.target.value })} className="text-sm border-border bg-card text-foreground" />
                </div>
              </div>
            </div>

            {/* Section 3: Diesel Readings */}
            <div className="border-t border-border pt-3">
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Diesel Readings</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-tertiary block mb-1">IDR (Initial) * (L)</label>
                  <Input type="number" value={form.idr ?? ""} onChange={(e) => setForm({ ...form, idr: parseFloat(e.target.value) || 0 })} className="text-sm border-border bg-card text-foreground" />
                </div>
                <div>
                  <label className="text-xs text-text-tertiary block mb-1">FDR (Final) * (L)</label>
                  <Input type="number" value={form.fdr ?? ""} onChange={(e) => setForm({ ...form, fdr: parseFloat(e.target.value) || 0 })} className="text-sm border-border bg-card text-foreground" />
                </div>
              </div>
            </div>

            {/* Section 4: Supply */}
            <div className="border-t border-border pt-3">
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Supply (Optional)</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-tertiary block mb-1">Diesel Supplied (L)</label>
                  <Input type="number" value={form.diesel_supplied ?? ""} onChange={(e) => setForm({ ...form, diesel_supplied: parseFloat(e.target.value) || 0 })} className="text-sm border-border bg-card text-foreground" />
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

            {/* Section 6: Remarks */}
            <div className="border-t border-border pt-3">
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Remarks</p>
              <textarea value={form.remarks || ""} onChange={(e) => setForm({ ...form, remarks: e.target.value })} placeholder="Any notes..." className="w-full min-h-[60px] text-sm p-2 rounded border border-border bg-card text-foreground resize-none" />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={!form.date || !form.generator_id || !form.time_on || !form.time_off}>
                {editing ? "Update" : "Submit Log"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── APPROVAL DIALOG ─── */}
      <Dialog open={!!showApproval} onOpenChange={() => { setShowApproval(null); setRejectReason(""); }}>
        <DialogContent className="bg-card border-input sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">Review Log</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-text-tertiary">Approve or reject this diesel log.</p>
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
              <div><label className="text-xs text-text-tertiary block mb-1">Exp LPH</label><Input type="number" value={genForm.expected_lph} onChange={(e) => setGenForm({ ...genForm, expected_lph: parseFloat(e.target.value) || 0 })} className="text-sm border-border bg-card text-foreground" /></div>
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
            <th className="text-left py-3 px-4 font-medium">Operator</th>
            <th className="text-right py-3 px-4 font-medium">Run Hrs</th>
            <th className="text-right py-3 px-4 font-medium">Diesel (L)</th>
            <th className="text-right py-3 px-4 font-medium">LPH</th>
            <th className="text-right py-3 px-4 font-medium">Balance</th>
            <th className="text-left py-3 px-4 font-medium">Status</th>
            <th className="text-right py-3 px-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l, i) => (
            <tr key={l.id} className={cn("border-b border-card-alt hover:bg-card-alt transition-colors", i % 2 === 0 && "bg-card-alt/30")}>
              <td className="py-3 px-4 text-foreground whitespace-nowrap">{l.date}</td>
              <td className="py-3 px-4 text-foreground">{genMap.get(l.generator_id)?.name || l.generator_id.slice(0, 8)}</td>
              <td className="py-3 px-4 text-text-tertiary">{l.operator_name}</td>
              <td className="py-3 px-4 text-right text-foreground">{l.run_hours.toFixed(1)}</td>
              <td className="py-3 px-4 text-right text-foreground">{l.diesel_used.toFixed(1)}</td>
              <td className="py-3 px-4 text-right">
                <span className={cn(l.lph > l.expected_lph * 1.2 ? "text-destructive font-semibold" : "text-foreground")}>
                  {l.lph.toFixed(2)}
                </span>
              </td>
              <td className="py-3 px-4 text-right text-foreground">{l.current_balance.toFixed(1)}</td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-1 flex-wrap">
                  <Badge className={cn("text-[9px]", STATUS_COLORS[l.status])}>{l.status}</Badge>
                  {l.flags?.includes("HIGH_CONSUMPTION") && <Badge className="text-[9px] bg-warning/10 text-warning">!</Badge>}
                  {l.flags?.includes("THEFT_SUSPECTED") && <Badge className="text-[9px] bg-destructive/10 text-destructive">!!</Badge>}
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
                      <EyeOff className="h-3.5 w-3.5" />
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
