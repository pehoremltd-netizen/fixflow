"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Wrench, CheckCircle2, ArrowRight } from "lucide-react";
import { getWorkOrders, updateStatus, getNextStatus, WorkOrder } from "@/lib/store/workOrders";

const statusColor: Record<string, string> = {
  OPEN: "bg-mustard/10 text-mustard border-mustard/30",
  ASSIGNED: "bg-info/10 text-info border-info/30",
  IN_PROGRESS: "bg-primary/10 text-primary border-primary/30",
  COMPLETED: "bg-success/10 text-success border-success/30",
  VERIFIED: "bg-[var(--color-purple)]/10 text-[var(--color-purple)] border-[var(--color-purple)]/30",
};

const priorityColor: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive",
  high: "bg-mustard/10 text-mustard",
  medium: "bg-info/10 text-info",
  low: "bg-muted-foreground/10 text-muted-foreground",
};

export default function ManagerWorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");

  useEffect(() => {
    setWorkOrders(getWorkOrders());
  }, []);

  const filtered = workOrders.filter(
    (wo) =>
      wo.title.toLowerCase().includes(search.toLowerCase()) ||
      wo.id.toLowerCase().includes(search.toLowerCase()) ||
      wo.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdvanceStatus = (id: string) => {
    const wo = workOrders.find((w) => w.id === id);
    if (!wo) return;
    const next = getNextStatus(wo.status as any);
    if (next) {
      updateStatus(id, next as any, "Manager");
      setWorkOrders(getWorkOrders());
    }
  };

  const tabs = [
    { value: "all", label: "All", filter: (_: WorkOrder) => true },
    { value: "open", label: "Open", filter: (wo: WorkOrder) => wo.status === "OPEN" || wo.status === "ASSIGNED" },
    { value: "in-progress", label: "In Progress", filter: (wo: WorkOrder) => wo.status === "IN_PROGRESS" },
    { value: "completed", label: "Completed", filter: (wo: WorkOrder) => wo.status === "COMPLETED" || wo.status === "VERIFIED" },
  ];

  const displayed = filtered.filter(tabs.find((t) => t.value === tab)!.filter);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Work Orders</h1>
        <p className="text-secondary-foreground">Facility-wide work order management</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-10 border-border bg-card text-foreground placeholder:text-muted-foreground" placeholder="Search work orders..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="border-border bg-card">
          <TabsTrigger value="all" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">All</TabsTrigger>
          <TabsTrigger value="open" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Open</TabsTrigger>
          <TabsTrigger value="in-progress" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">In Progress</TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Completed</TabsTrigger>
        </TabsList>

        {tabs.map((t) => (
          <TabsContent key={t.value} value={t.value}>
            <Card className="border-border bg-card">
              <CardContent className="p-0">
                {displayed.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">No work orders found</div>
                ) : (
                  displayed.map((wo, i) => (
                    <motion.div
                      key={wo.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-foreground/5 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Wrench className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground">{wo.id}</span>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${priorityColor[wo.priority]}`}>
                              {wo.priority}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-foreground truncate">{wo.title}</p>
                          <p className="text-xs text-muted-foreground">{wo.location} · {wo.assignedStaff}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <div className="text-right hidden md:block">
                          <p className="text-xs text-muted-foreground">Due</p>
                          <p className="text-xs text-foreground">{wo.dueDate}</p>
                        </div>
                        <Badge variant="outline" className={`text-xs ${statusColor[wo.status]}`}>
                          {wo.status.replace("_", " ")}
                        </Badge>
                        {wo.status !== "VERIFIED" && wo.status !== "COMPLETED" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                            onClick={() => handleAdvanceStatus(wo.id)}
                            title={`Advance to ${getNextStatus(wo.status as any)}`}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        )}
                        {wo.status === "COMPLETED" && (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
