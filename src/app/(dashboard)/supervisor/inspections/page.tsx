"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ClipboardCheck } from "lucide-react";

const inspections = [
  { id: "INS-001", type: "Electrical", site: "Building A", staff: "Sarah Lee", status: "submitted", date: "Jun 5, 2026", score: 92 },
  { id: "INS-002", type: "Plumbing", site: "Building B", staff: "John Doe", status: "submitted", date: "Jun 4, 2026", score: 88 },
  { id: "INS-003", type: "Fire Safety", site: "West Wing", staff: "Emma Wilson", status: "reviewed", date: "Jun 3, 2026", score: 95 },
  { id: "INS-004", type: "HVAC", site: "Building A", staff: "Mike Chen", status: "draft", date: "Jun 2, 2026", score: null },
];

export default function SupervisorInspectionsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Inspection Reports</h1>
      <p className="text-muted-foreground">Review submitted inspection reports</p>

      <Card>
        <CardHeader>
          <CardTitle>Submitted Inspections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {inspections.map((ins) => (
              <div key={ins.id} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{ins.type}</span>
                      <span className="text-xs font-mono text-muted-foreground">{ins.id}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{ins.site} · {ins.staff} · {ins.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {ins.score && <span className="text-sm font-medium">{ins.score}%</span>}
                  <Badge variant={ins.status === "submitted" ? "info" : ins.status === "reviewed" ? "success" : "warning"}>
                    {ins.status}
                  </Badge>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Eye className="h-3 w-3" /> Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
