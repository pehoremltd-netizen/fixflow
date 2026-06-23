"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getReports } from "@/lib/store/weeklyReport";
import { getPMTasks } from "@/lib/store/pmSchedule";
import { getWorkOrders } from "@/lib/store/workOrders";
import { getFaultReports } from "@/lib/store/faultReports";
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  FileText,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import type { OperationalReport } from "@/lib/store/weeklyReport";
import type { PMTask } from "@/lib/store/pmSchedule";
import type { WorkOrder } from "@/lib/store/workOrders";
import type { FaultReport } from "@/lib/store/faultReports";

type FacilityStatus = "on_track" | "needs_attention" | "at_risk";

/* ─── Compute facility status from live data ─── */
function computeStatus(
  pmTasks: PMTask[],
  workOrders: WorkOrder[],
  faultReports: FaultReport[],
): { status: FacilityStatus; reasons: string[] } {
  const overduePM = pmTasks.filter((t) => t.status === "Overdue");
  const criticalWO = workOrders.filter(
    (wo) => wo.priority === "critical" && wo.status !== "COMPLETED" && wo.status !== "VERIFIED"
  );
  const unresolvedFaults = faultReports.filter((f) => f.status !== "RESOLVED");
  const highPriorityFaults = unresolvedFaults.filter((f) => f.priority === "critical" || f.priority === "high");

  const reasons: string[] = [];

  let status: FacilityStatus = "on_track";

  if (overduePM.length >= 3 || highPriorityFaults.length >= 2 || criticalWO.length >= 2) {
    status = "at_risk";
    if (overduePM.length >= 3) reasons.push(`${overduePM.length} PM items overdue`);
    if (highPriorityFaults.length >= 2) reasons.push(`${highPriorityFaults.length} critical/high faults unresolved`);
    if (criticalWO.length >= 2) reasons.push(`${criticalWO.length} critical work orders open`);
  } else if (overduePM.length > 0 || unresolvedFaults.length > 0 || criticalWO.length > 0) {
    status = "needs_attention";
    if (overduePM.length > 0) reasons.push(`${overduePM.length} PM item${overduePM.length > 1 ? "s" : ""} overdue`);
    if (unresolvedFaults.length > 0) reasons.push(`${unresolvedFaults.length} unresolved fault${unresolvedFaults.length > 1 ? "s" : ""}`);
    if (criticalWO.length > 0) reasons.push(`${criticalWO.length} critical work order${criticalWO.length > 1 ? "s" : ""} open`);
  } else {
    reasons.push("All systems on track");
  }

  return { status, reasons };
}

function getLatestReport(reports: OperationalReport[]): OperationalReport | null {
  const finalized = reports.filter((r) => r.status === "Final");
  if (finalized.length === 0) return null;
  return finalized.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];
}

export default function UplineManagerOverview() {
  const [pmTasks, setPMTasks] = useState<PMTask[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [faultReports, setFaultReports] = useState<FaultReport[]>([]);
  const [reports, setReports] = useState<OperationalReport[]>([]);

  useEffect(() => {
    setPMTasks(getPMTasks());
    setWorkOrders(getWorkOrders());
    setFaultReports(getFaultReports());
    setReports(getReports());
  }, []);

  const { status, reasons } = computeStatus(pmTasks, workOrders, faultReports);
  const latestReport = getLatestReport(reports);

  const statusConfig = {
    on_track: {
      icon: CheckCircle2,
      label: "On Track",
      color: "bg-success/10 text-success border-success/30",
    },
    needs_attention: {
      icon: AlertTriangle,
      label: "Needs Attention",
      color: "bg-warning/10 text-warning border-warning/30",
    },
    at_risk: {
      icon: AlertCircle,
      label: "At Risk",
      color: "bg-destructive/10 text-destructive border-destructive/30",
    },
  };

  const StatusIcon = statusConfig[status].icon;

  // Items needing attention
  const attentionItems = [
    ...pmTasks
      .filter((t) => t.status === "Overdue")
      .map((t) => ({ type: "PM Task" as const, label: `${t.task} — ${t.asset}`, due: t.nextDue })),
    ...workOrders
      .filter((wo) => wo.priority === "critical" && wo.status !== "COMPLETED" && wo.status !== "VERIFIED")
      .map((wo) => ({ type: "Critical WO" as const, label: wo.title, due: wo.dueDate || wo.createdAt })),
    ...faultReports
      .filter((f) => f.status !== "RESOLVED" && (f.priority === "critical" || f.priority === "high"))
      .map((f) => ({ type: "Fault" as const, label: `${f.assetName} — ${f.description.slice(0, 60)}`, due: f.reportedAt })),
  ].sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());

  // Quick trend data
  const totalPM = pmTasks.length;
  const completedPM = pmTasks.filter((t) => t.status === "Completed").length;
  const pmCompliance = totalPM > 0 ? Math.round((completedPM / totalPM) * 100) : 100;

  const totalWO = workOrders.length;
  const openWO = workOrders.filter((wo) => wo.status !== "COMPLETED" && wo.status !== "VERIFIED").length;
  const closedWO = totalWO - openWO;

  const totalFaults = faultReports.length;
  const resolvedFaults = faultReports.filter((f) => f.status === "RESOLVED").length;

  return (
    <div className="space-y-6">
      {/* ─── FACILITY STATUS BANNER ─── */}
      <div className={cn("rounded-xl border p-5", statusConfig[status].color)}>
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-lg bg-background/20 flex items-center justify-center shrink-0">
            <StatusIcon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold">{statusConfig[status].label}</h2>
            <p className="text-sm mt-0.5 opacity-80">{reasons.join(" · ")}</p>
          </div>
        </div>
      </div>

      {/* ─── WHAT NEEDS ATTENTION ─── */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            What Needs Attention
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attentionItems.length === 0 ? (
            <p className="text-sm text-text-tertiary text-center py-4">
              Everything looks good — no items need attention right now.
            </p>
          ) : (
            <div className="space-y-2">
              {attentionItems.slice(0, 10).map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-card-alt">
                  <Badge className={cn(
                    "text-[9px] shrink-0",
                    item.type === "PM Task" && "bg-info/10 text-info border-info/20",
                    item.type === "Critical WO" && "bg-destructive/10 text-destructive border-destructive/20",
                    item.type === "Fault" && "bg-warning/10 text-warning border-warning/20",
                  )}>
                    {item.type}
                  </Badge>
                  <span className="text-sm text-foreground flex-1 min-w-0 truncate">{item.label}</span>
                  <span className="text-[10px] text-text-tertiary shrink-0">
                    {new Date(item.due).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── THIS PERIOD'S REPORT ─── */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Latest Report Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!latestReport ? (
            <p className="text-sm text-text-tertiary text-center py-4">No reports have been published yet.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">{latestReport.title}</p>
                <Badge variant="outline" className="text-[9px]">{latestReport.periodType}</Badge>
              </div>

              {latestReport.urgentItems && (
                <div>
                  <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-1">Urgent Items</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-3">{latestReport.urgentItems}</p>
                </div>
              )}

              {latestReport.newIssues && (
                <div>
                  <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-1">New Issues</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-2">{latestReport.newIssues}</p>
                </div>
              )}

              {latestReport.nextPriorities && (
                <div>
                  <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-1">Next Priorities</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-2">{latestReport.nextPriorities}</p>
                </div>
              )}

              <Link href="/upline-manager/reports" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-1 text-xs">
                  Open Full Report <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── QUICK TREND STRIP ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <TrendCard
          label="PM Compliance"
          value={`${pmCompliance}%`}
          trend={pmCompliance >= 80 ? "up" : pmCompliance >= 50 ? "flat" : "down"}
          subtitle={`${completedPM}/${totalPM} tasks`}
        />
        <TrendCard
          label="Inspection Pass Rate"
          value="92%"
          trend="flat"
          subtitle="1 zone flagged twice"
        />
        <TrendCard
          label="Work Orders"
          value={`${closedWO}/${totalWO}`}
          trend={openWO <= totalWO * 0.3 ? "up" : "down"}
          subtitle={`${openWO} open`}
        />
        <TrendCard
          label="Fault Resolution"
          value={totalFaults > 0 ? `${Math.round((resolvedFaults / totalFaults) * 100)}%` : "—"}
          trend={totalFaults > 0 && resolvedFaults / totalFaults >= 0.7 ? "up" : totalFaults > 0 ? "flat" : "flat"}
          subtitle={`${resolvedFaults}/${totalFaults} resolved`}
        />
      </div>
    </div>
  );
}

function TrendCard({ label, value, trend, subtitle }: {
  label: string;
  value: string;
  trend: "up" | "down" | "flat";
  subtitle: string;
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-text-tertiary";

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-3 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-text-tertiary uppercase tracking-wider">{label}</p>
          <TrendIcon className={cn("h-3 w-3", trendColor)} />
        </div>
        <p className="text-lg font-bold text-foreground">{value}</p>
        <p className="text-[10px] text-text-tertiary truncate">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
