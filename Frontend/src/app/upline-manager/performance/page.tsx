"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { getPMTasks } from "@/lib/store/pmSchedule";
import { getWorkOrders } from "@/lib/store/workOrders";
import { getFaultReports } from "@/lib/store/faultReports";
import { getReports } from "@/lib/store/weeklyReport";
import type { PMTask } from "@/lib/store/pmSchedule";
import type { WorkOrder } from "@/lib/store/workOrders";
import type { FaultReport } from "@/lib/store/faultReports";
import type { OperationalReport } from "@/lib/store/weeklyReport";

const Charts = dynamic(() => import("./_charts"), {
  ssr: false,
  loading: () => (
    <Card className="border-border bg-card">
      <CardContent className="py-10 text-center text-text-tertiary">
        <p>Loading charts...</p>
      </CardContent>
    </Card>
  ),
});

export default function PerformanceTrendsPage() {
  const [mounted, setMounted] = useState(false);
  const [pmTasks, setPMTasks] = useState<PMTask[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [faultReports, setFaultReports] = useState<FaultReport[]>([]);
  const [reports, setReports] = useState<OperationalReport[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setPMTasks(getPMTasks());
      setWorkOrders(getWorkOrders());
      setFaultReports(getFaultReports());
      setReports(getReports());
    } catch (e) {
      setDataError("Failed to load data: " + (e instanceof Error ? e.message : String(e)));
    }
    setMounted(true);
  }, []);

  const finalReports = reports.filter((r) => r.status === "Final");

  const pmComplianceData = finalReports
    .slice(-12)
    .map((r) => {
      const pm = (r.stats?.pmDue || 0) + (r.stats?.pmOverdue || 0);
      return {
        period: (r.periodStart || "").slice(5, 10),
        Compliance: pm > 0 ? Math.round(((r.stats?.pmDue || 0) / (pm + (r.stats?.pmOverdue || 0))) * 100) : 100,
      };
    });

  const woData = finalReports.slice(-12).map((r) => ({
    period: (r.periodStart || "").slice(5, 10),
    Opened: r.stats?.workOrdersOpened || 0,
    Closed: r.stats?.workOrdersClosed || 0,
  }));

  const faultData = finalReports.slice(-12).map((r) => ({
    period: (r.periodStart || "").slice(5, 10),
    "New Faults": r.stats?.faultReportsNew || 0,
  }));

  const totalPM = pmTasks.length;
  const completedPM = pmTasks.filter((t) => t.status === "Completed").length;
  const pmCompliance = totalPM > 0 ? Math.round((completedPM / totalPM) * 100) : 100;

  const totalWO = workOrders.length;
  const closedWO = workOrders.filter((wo) => wo.status === "COMPLETED" || wo.status === "VERIFIED").length;

  const totalFaults = faultReports.length;
  const resolvedFaults = faultReports.filter((f) => f.status === "RESOLVED").length;

  if (!mounted) return null;

  if (dataError) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Performance Trends</h1>
        <Card className="border-border bg-card">
          <CardContent className="py-10 text-center text-destructive">
            <p>{dataError}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Performance Trends</h1>
      <p className="text-secondary-foreground">Key facility performance indicators over time</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SnapshotCard label="PM Compliance" value={`${pmCompliance}%`} color={pmCompliance >= 80 ? "text-success" : "text-warning"} />
        <SnapshotCard label="Work Orders Resolved" value={`${closedWO}/${totalWO}`} color="text-info" />
        <SnapshotCard label="Fault Resolution" value={totalFaults > 0 ? `${Math.round((resolvedFaults / totalFaults) * 100)}%` : "\u2014"} color={totalFaults > 0 && resolvedFaults / totalFaults >= 0.7 ? "text-success" : "text-warning"} />
        <SnapshotCard label="Reports Published" value={`${finalReports.length}`} color="text-primary" />
      </div>

      <Charts pmComplianceData={pmComplianceData} woData={woData} faultData={faultData} />
    </div>
  );
}

function SnapshotCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-3 space-y-1">
        <p className="text-[10px] text-text-tertiary uppercase tracking-wider">{label}</p>
        <p className={cn("text-lg font-bold", color)}>{value}</p>
      </CardContent>
    </Card>
  );
}
