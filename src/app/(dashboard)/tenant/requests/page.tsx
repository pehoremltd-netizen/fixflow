"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

const requests = [
  { id: "REQ-001", title: "AC not cooling properly", category: "HVAC", status: "in-progress", date: "Jun 7, 2026", priority: "high" },
  { id: "REQ-002", title: "Light fixture broken in hallway", category: "Electrical", status: "completed", date: "Jun 5, 2026", priority: "medium" },
  { id: "REQ-003", title: "Water pressure low in bathroom", category: "Plumbing", status: "submitted", date: "Jun 8, 2026", priority: "medium" },
  { id: "REQ-004", title: "Door handle loose - Unit 201", category: "General", status: "completed", date: "Jun 3, 2026", priority: "low" },
  { id: "REQ-005", title: "Smoke detector beeping", category: "Fire Safety", status: "completed", date: "Jun 1, 2026", priority: "high" },
];

export default function RequestsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Maintenance Requests</h1>
      <p className="text-muted-foreground">Track your submitted requests</p>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardContent className="p-0">
              {requests.map((req, i) => (
                <div key={req.id} className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-accent/50">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      req.status === "completed" ? "bg-green-100" :
                      req.status === "in-progress" ? "bg-[#D4AF37]/10" : "bg-[#E1B000]/10"
                    }`}>
                      {req.status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : req.status === "in-progress" ? (
                        <Clock className="h-5 w-5 text-blue-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">{req.id}</span>
                        <Badge variant="outline" className="text-xs">{req.category}</Badge>
                      </div>
                      <p className="text-sm font-medium">{req.title}</p>
                      <p className="text-xs text-muted-foreground">{req.date}</p>
                    </div>
                  </div>
                  <Badge variant={req.status === "completed" ? "success" : req.status === "in-progress" ? "info" : "warning"}>
                    {req.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
