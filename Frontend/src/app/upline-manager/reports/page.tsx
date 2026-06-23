"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getReports } from "@/lib/store/weeklyReport";
import type { OperationalReport } from "@/lib/store/weeklyReport";
import {
  FileBarChart,
  FileText,
  Calendar,
  ChevronDown,
  ChevronUp,
  ListTodo,
  Lightbulb,
  FileSpreadsheet,
  AlertTriangle,
} from "lucide-react";

function formatDate(d: string | undefined | null) {
  if (!d) return "Period not set";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "Period not set";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function UplineManagerReportsPage() {
  const [reports, setReports] = useState<OperationalReport[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setReports(getReports().filter((r) => r.status === "Final"));
  }, []);

  const sorted = [...reports].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Operational Reports</h1>
      <p className="text-secondary-foreground">
        Ajose's Weekly and Monthly reports — read-only view
      </p>

      {sorted.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="py-10 text-center text-text-tertiary">
            <FileBarChart className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No reports have been published yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sorted.map((report, i) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className={cn("border-border bg-card transition-all", expandedId === report.id && "ring-1 ring-primary/20")}>
                <CardHeader
                  className="pb-3 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-foreground text-sm truncate">{report.title}</CardTitle>
                        <div className="flex items-center gap-2 text-xs text-text-tertiary mt-0.5">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(report.periodStart)} — {formatDate(report.periodEnd)}</span>
                          <Badge variant="outline" className="text-[9px]">{report.periodType}</Badge>
                          <Badge className={cn(
                            "text-[9px]",
                            report.status === "Final"
                              ? "bg-success/10 text-success border-success/20"
                              : "bg-muted-foreground/10 text-text-tertiary border-border/20"
                          )}>
                            {report.status === "Final" ? "✓ Final" : "Draft"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {expandedId === report.id ? <ChevronUp className="h-4 w-4 text-text-tertiary" /> : <ChevronDown className="h-4 w-4 text-text-tertiary" />}
                  </div>
                </CardHeader>

                {expandedId === report.id && (
                  <CardContent className="pt-0 space-y-4">
                    {/* Stats snapshot */}
                    <div>
                      <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-2 flex items-center gap-1">
                        <ListTodo className="h-3 w-3" /> Period Snapshot
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        <StatItem label="Pending Tasks" value={report.stats.pendingTasksOpen} />
                        <StatItem label="Overdue Tasks" value={report.stats.pendingTasksOverdue} />
                        <StatItem label="PM Due" value={report.stats.pmDue} />
                        <StatItem label="PM Overdue" value={report.stats.pmOverdue} />
                        <StatItem label="Inspections Done" value={report.stats.inspectionsCompleted} />
                        <StatItem label="Inspection Issues" value={report.stats.inspectionsIssues} />
                        <StatItem label="Work Orders Opened" value={report.stats.workOrdersOpened} />
                        <StatItem label="Work Orders Closed" value={report.stats.workOrdersClosed} />
                        <StatItem label="New Fault Reports" value={report.stats.faultReportsNew} />
                      </div>
                    </div>

                    {/* Narrative */}
                    {report.urgentItems && (
                      <div>
                        <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-1 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-warning" /> Urgent Items
                        </h3>
                        <p className="text-sm text-foreground whitespace-pre-wrap bg-warning/5 p-3 rounded-lg border border-warning/10">{report.urgentItems}</p>
                      </div>
                    )}
                    {report.newIssues && (
                      <div>
                        <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Lightbulb className="h-3 w-3" /> New Issues
                        </h3>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{report.newIssues}</p>
                      </div>
                    )}
                    {report.nextPriorities && (
                      <div>
                        <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-1 flex items-center gap-1">
                          <ListTodo className="h-3 w-3" /> Next Priorities
                        </h3>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{report.nextPriorities}</p>
                      </div>
                    )}
                    {report.invoicesRetrieved && (
                      <div>
                        <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-1 flex items-center gap-1">
                          <FileSpreadsheet className="h-3 w-3" /> Vendor Notes
                        </h3>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{report.invoicesRetrieved}</p>
                      </div>
                    )}
                    {report.approvalsPending && (
                      <div>
                        <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-1">Approvals Pending</h3>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{report.approvalsPending}</p>
                      </div>
                    )}

                    <div className="text-xs text-text-tertiary border-t border-border pt-2">
                      Prepared by: {report.preparedBy} · {formatDate(report.createdAt)}
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card-alt rounded-lg p-2 border border-border">
      <p className="text-[10px] text-text-tertiary">{label}</p>
      <p className="text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}
