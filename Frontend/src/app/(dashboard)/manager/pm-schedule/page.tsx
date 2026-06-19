"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, CalendarClock, CheckCircle2, AlertTriangle, Clock, Calendar } from "lucide-react";
import { getPMTasks, markAsDone, PMTask } from "@/lib/store/pmSchedule";

const statusColor: Record<string, string> = {
  Overdue: "bg-destructive/10 text-destructive border-destructive/30",
  DueSoon: "bg-mustard/10 text-mustard border-mustard/30",
  Upcoming: "bg-info/10 text-info border-info/30",
  Completed: "bg-success/10 text-success border-success/30",
};

export default function ManagerPMSchedulePage() {
  const [tasks, setTasks] = useState<PMTask[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setTasks(getPMTasks());
  }, []);

  const filtered = tasks.filter(
    (t) =>
      t.task.toLowerCase().includes(search.toLowerCase()) ||
      t.asset.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleMarkDone = (id: string) => {
    markAsDone(id);
    setTasks(getPMTasks());
  };

  const counts = {
    Overdue: tasks.filter((t) => t.status === "Overdue").length,
    DueSoon: tasks.filter((t) => t.status === "DueSoon").length,
    Upcoming: tasks.filter((t) => t.status === "Upcoming").length,
    Completed: tasks.filter((t) => t.status === "Completed").length,
  };

  const summaryCards = [
    { label: "Overdue", value: counts.Overdue, icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "Due Soon", value: counts.DueSoon, icon: Clock, color: "text-mustard", bg: "bg-mustard/10" },
    { label: "Upcoming", value: counts.Upcoming, icon: Calendar, color: "text-info", bg: "bg-info/10" },
    { label: "Completed", value: counts.Completed, icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">PM Schedule</h1>
        <p className="text-secondary-foreground">Preventive maintenance schedule overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((item) => (
          <Card key={item.label} className="border-border bg-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.bg}`}>
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-10 border-border bg-card text-foreground placeholder:text-muted-foreground" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Tabs defaultValue="all">
        <TabsList className="border-border bg-card">
          <TabsTrigger value="all" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">All</TabsTrigger>
          <TabsTrigger value="overdue" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Overdue</TabsTrigger>
          <TabsTrigger value="due-soon" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Due Soon</TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Completed</TabsTrigger>
        </TabsList>

        {["all", "overdue", "due-soon", "completed"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <Card className="border-border bg-card">
              <CardContent className="p-0">
                {(() => {
                  const items = tab === "all" ? filtered : filtered.filter((t) => t.status.toLowerCase().replace(" ", "-") === tab);
                  if (items.length === 0) {
                    return <div className="p-8 text-center text-muted-foreground">No tasks found</div>;
                  }
                  return items.map((task, i) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-foreground/5 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <CalendarClock className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{task.task}</p>
                          <p className="text-xs text-muted-foreground">{task.asset} · {task.location} · {task.responsible}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <div className="text-right hidden md:block">
                          <p className="text-xs text-muted-foreground">{task.frequency}</p>
                          <p className="text-xs text-foreground">Due: {task.nextDue}</p>
                        </div>
                        <Badge variant="outline" className={`text-xs ${statusColor[task.status]}`}>
                          {task.status}
                        </Badge>
                        {task.status !== "Completed" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-success hover:bg-success/10"
                            onClick={() => handleMarkDone(task.id)}
                            title="Mark as done"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ));
                })()}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
