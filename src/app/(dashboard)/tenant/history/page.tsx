"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Wrench, CheckCircle2 } from "lucide-react";

const history = [
  { id: "REQ-002", title: "Light fixture broken in hallway", status: "completed", date: "Jun 5, 2026", resolved: "Jun 6, 2026" },
  { id: "REQ-004", title: "Door handle loose - Unit 201", status: "completed", date: "Jun 3, 2026", resolved: "Jun 3, 2026" },
  { id: "REQ-005", title: "Smoke detector beeping", status: "completed", date: "Jun 1, 2026", resolved: "Jun 1, 2026" },
  { id: "REQ-006", title: "Toilet running - Unit 201", status: "completed", date: "May 28, 2026", resolved: "May 29, 2026" },
  { id: "REQ-007", title: "Window seal broken", status: "completed", date: "May 25, 2026", resolved: "May 27, 2026" },
];

export default function TenantHistoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Service History</h1>
      <p className="text-muted-foreground">Past maintenance requests and resolutions</p>

      <Card>
        <CardContent className="p-0">
          {history.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 border-b last:border-0">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Submitted: {item.date} · Resolved: {item.resolved}
                  </p>
                </div>
              </div>
              <Badge variant="success">Resolved</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
