"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye } from "lucide-react";

const reports = [
  { title: "Monthly Maintenance Report - May 2026", type: "PDF", date: "Jun 1, 2026", size: "2.4 MB" },
  { title: "Q1 2026 Facility Performance Summary", type: "PDF", date: "Apr 5, 2026", size: "3.1 MB" },
  { title: "Asset Utilization Report - H1 2026", type: "PDF", date: "Jun 15, 2026", size: "1.8 MB" },
  { title: "Annual Compliance Report - 2025", type: "PDF", date: "Jan 15, 2026", size: "4.2 MB" },
];

export default function StakeholderReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reports</h1>
      <p className="text-muted-foreground">Access facility performance reports</p>

      <Card>
        <CardContent className="p-0">
          {reports.map((report, i) => (
            <div key={i} className="flex items-center justify-between p-4 border-b last:border-0">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">{report.title}</p>
                  <p className="text-xs text-muted-foreground">{report.date} · {report.size}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1"><Eye className="h-3 w-3" /> View</Button>
                <Button variant="outline" size="sm" className="gap-1"><Download className="h-3 w-3" /> Download</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
