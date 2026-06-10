"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";

const tasks = [
  { id: "T-001", title: "HVAC Maintenance - Building A", assigned: "Mike Chen", priority: "high", status: "in-progress", due: "Today" },
  { id: "T-002", title: "Electrical Panel Inspection", assigned: "Sarah Lee", priority: "critical", status: "completed", due: "Yesterday" },
  { id: "T-003", title: "Fire Safety Check - West Wing", assigned: "Emma Wilson", priority: "high", status: "in-progress", due: "Today" },
  { id: "T-004", title: "Plumbing Repair - 2nd Floor", assigned: "John Doe", priority: "medium", status: "pending", due: "Tomorrow" },
  { id: "T-005", title: "Generator Maintenance", assigned: "Tom Green", priority: "low", status: "pending", due: "Jun 12" },
];

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Task Management</h1>
      <p className="text-muted-foreground">Assign and monitor team tasks</p>

      <Card>
        <CardHeader>
          <CardTitle>Active Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-start gap-3">
                  {task.status === "completed" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : task.priority === "critical" ? (
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  ) : (
                    <Clock className="h-5 w-5 text-[#D4AF37] mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">{task.id}</span>
                      <Badge variant="outline" className="text-xs">{task.priority}</Badge>
                    </div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">Assigned: {task.assigned} · Due: {task.due}</p>
                  </div>
                </div>
                <Badge variant={task.status === "completed" ? "success" : task.status === "in-progress" ? "info" : "warning"}>
                  {task.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
