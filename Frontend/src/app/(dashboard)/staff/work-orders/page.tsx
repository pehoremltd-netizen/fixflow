"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, Search, CheckCircle2, Clock, AlertTriangle, ArrowRight } from "lucide-react";

const workOrders = [
  { id: "WO-001", title: "HVAC Maintenance - Building A", priority: "high", status: "in-progress", due: "Today", site: "Building A" },
  { id: "WO-003", title: "Plumbing Repair - 2nd Floor", priority: "medium", status: "pending", due: "Tomorrow", site: "Building A" },
  { id: "WO-005", title: "Generator Maintenance", priority: "low", status: "pending", due: "Jun 15", site: "Warehouse" },
  { id: "WO-007", title: "Lighting Repair - Parking Lot", priority: "medium", status: "completed", due: "Jun 5", site: "Building A" },
  { id: "WO-008", title: "AC Unit Check - Server Room", priority: "critical", status: "in-progress", due: "Today", site: "Building A" },
];

export default function StaffWorkOrdersPage() {
  const [search, setSearch] = useState("");

  const filtered = workOrders.filter(
    (wo) =>
      wo.title.toLowerCase().includes(search.toLowerCase()) ||
      wo.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Work Orders</h1>
        <p className="text-secondary-foreground">Assigned maintenance tasks</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-10 max-w-md" placeholder="Search work orders..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card className="border-border bg-input-bg">
            <CardContent className="p-0">
              {filtered.filter(wo => wo.status !== "completed").length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">No active work orders</div>
              ) : (
                filtered.filter(wo => wo.status !== "completed").map((wo, i) => (
                  <motion.div
                    key={wo.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-foreground/5 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        wo.priority === "critical" ? "bg-red-100" :
                        wo.priority === "high" ? "bg-mustard/10" : "bg-primary/10"
                      }`}>
                        {wo.priority === "critical" ? (
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        ) : (
                          <Wrench className={`h-5 w-5 ${wo.priority === "high" ? "text-mustard" : "text-info"}`} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground">{wo.id}</span>
                          <Badge variant="outline" className="text-xs">{wo.priority}</Badge>
                        </div>
                        <p className="font-medium">{wo.title}</p>
                        <p className="text-xs text-muted-foreground">{wo.site} · Due: {wo.due}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={wo.status === "in-progress" ? "info" : "warning"}>{wo.status}</Badge>
                      <Button variant="ghost" size="icon"><ArrowRight className="h-4 w-4" /></Button>
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
