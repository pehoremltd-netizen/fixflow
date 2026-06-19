"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  Calendar,
  ListChecks,
} from "lucide-react";
import {
  getPMTasks,
  addPMTask,
  markAsDone,
  deletePMTask,
  PMTask,
  PMFrequency,
  PMStatus,
  calculateNextDue,
} from "@/lib/store/pmSchedule";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const statusColors: Record<PMStatus, string> = {
  Overdue: "bg-destructive/10 text-destructive border-destructive/30",
  DueSoon: "bg-mustard/10 text-mustard border-mustard/30",
  Upcoming: "bg-info/10 text-info border-info/30",
  Completed: "bg-success/10 text-success border-success/30",
};

const frequencyLabels: Record<PMFrequency, string> = {
  Daily: "Daily",
  Weekly: "Weekly",
  Monthly: "Monthly",
  Quarterly: "Quarterly",
  BiAnnual: "Bi-Annual",
  Annual: "Annual",
};

function Toast({ message, type, onClose }: { message: string; type: "success" | "error" | "info"; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={cn(
        "fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl text-sm font-medium",
        type === "success" && "bg-success/10 border-success/30 text-success",
        type === "error" && "bg-destructive/10 border-destructive/30 text-destructive",
        type === "info" && "bg-primary/10 border-primary/30 text-primary"
      )}
    >
      {type === "success" && <CheckCircle2 className="h-4 w-4" />}
      {type === "error" && <AlertTriangle className="h-4 w-4" />}
      {type === "info" && <Clock className="h-4 w-4" />}
      {message}
    </motion.div>
  );
}

export default function PMSchedulePage() {
  const [tasks, setTasks] = useState<PMTask[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [frequencyFilter, setFrequencyFilter] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const [formAsset, setFormAsset] = useState("");
  const [formTask, setFormTask] = useState("");
  const [formFrequency, setFormFrequency] = useState<PMFrequency>("Monthly");
  const [formLastDone, setFormLastDone] = useState("");
  const [formResponsible, setFormResponsible] = useState("");
  const [formLocation, setFormLocation] = useState("");

  const showToast = useCallback((message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
  }, []);

  const refreshData = useCallback(() => {
    setTasks(getPMTasks());
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const filtered = tasks.filter((t) => {
    const matchesSearch = t.asset.toLowerCase().includes(search.toLowerCase()) ||
      t.task.toLowerCase().includes(search.toLowerCase()) ||
      t.responsible.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesFrequency = frequencyFilter === "all" || t.frequency === frequencyFilter;
    return matchesSearch && matchesStatus && matchesFrequency;
  });

  const totalTasks = tasks.length;
  const overdueCount = tasks.filter(t => t.status === "Overdue").length;
  const dueThisWeek = tasks.filter(t => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(t.nextDue);
    due.setHours(0, 0, 0, 0);
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 7;
  }).length;
  const completedThisMonth = tasks.filter(t => {
    if (!t.lastDone) return false;
    const last = new Date(t.lastDone);
    const now = new Date();
    return last.getMonth() === now.getMonth() && last.getFullYear() === now.getFullYear();
  }).length;

  const handleAdd = () => {
    if (!formAsset.trim() || !formTask.trim() || !formLastDone || !formResponsible.trim() || !formLocation.trim()) {
      showToast("Please fill all required fields", "error");
      return;
    }
    addPMTask({
      asset: formAsset,
      task: formTask,
      frequency: formFrequency,
      lastDone: formLastDone,
      responsible: formResponsible,
      location: formLocation,
    });
    refreshData();
    setCreateOpen(false);
    setFormAsset("");
    setFormTask("");
    setFormFrequency("Monthly");
    setFormLastDone("");
    setFormResponsible("");
    setFormLocation("");
    showToast("PM task added successfully", "success");
  };

  const handleMarkDone = (id: string) => {
    markAsDone(id);
    refreshData();
    showToast("Task marked as completed", "success");
  };

  const handleDelete = (id: string) => {
    deletePMTask(id);
    refreshData();
    setDeleteConfirm(null);
    showToast("PM task deleted", "success");
  };

  const summaryCards = [
    { title: "Total Tasks", value: totalTasks, icon: ListChecks, color: "text-info" },
    { title: "Overdue", value: overdueCount, icon: AlertTriangle, color: "text-destructive" },
    { title: "Due This Week", value: dueThisWeek, icon: Calendar, color: "text-mustard" },
    { title: "Completed This Month", value: completedThisMonth, icon: CheckCircle2, color: "text-success" },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">PM Schedule</h1>
          <p className="text-secondary-foreground">Preventive maintenance task scheduling</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add PM Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg border-border bg-card">
            <DialogHeader>
              <DialogTitle className="text-foreground">Add PM Task</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleAdd(); }}>
              <div className="space-y-2">
                <Label className="text-secondary-foreground">Asset Name *</Label>
                <Input placeholder="Asset name" value={formAsset} onChange={(e) => setFormAsset(e.target.value)} className="border-border bg-background text-foreground placeholder:text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-secondary-foreground">Task *</Label>
                <Input placeholder="Task description" value={formTask} onChange={(e) => setFormTask(e.target.value)} className="border-border bg-background text-foreground placeholder:text-muted-foreground" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">Frequency</Label>
                  <Select value={formFrequency} onValueChange={(v) => setFormFrequency(v as PMFrequency)}>
                    <SelectTrigger className="border-border bg-background text-foreground"><SelectValue /></SelectTrigger>
                    <SelectContent className="border-border bg-card">
                      {Object.entries(frequencyLabels).map(([k, v]) => (
                        <SelectItem key={k} value={k} className="text-foreground focus:text-primary focus:bg-primary/10">{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">Last Done *</Label>
                  <Input type="date" value={formLastDone} onChange={(e) => setFormLastDone(e.target.value)} className="border-border bg-background text-foreground" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">Responsible *</Label>
                  <Input placeholder="Staff name" value={formResponsible} onChange={(e) => setFormResponsible(e.target.value)} className="border-border bg-background text-foreground placeholder:text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">Location *</Label>
                  <Input placeholder="Location" value={formLocation} onChange={(e) => setFormLocation(e.target.value)} className="border-border bg-background text-foreground placeholder:text-muted-foreground" />
                </div>
              </div>
              <Button type="submit" className="w-full">Add PM Task</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-secondary-foreground">{card.title}</CardTitle>
                <card.icon className={cn("h-4 w-4", card.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{card.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-10 max-w-md" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 border-border bg-card text-foreground"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent className="border-border bg-card">
            <SelectItem value="all" className="text-foreground focus:text-primary focus:bg-primary/10">All Status</SelectItem>
            <SelectItem value="Overdue" className="text-foreground focus:text-primary focus:bg-primary/10">Overdue</SelectItem>
            <SelectItem value="DueSoon" className="text-foreground focus:text-primary focus:bg-primary/10">Due Soon</SelectItem>
            <SelectItem value="Upcoming" className="text-foreground focus:text-primary focus:bg-primary/10">Upcoming</SelectItem>
          </SelectContent>
        </Select>
        <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
          <SelectTrigger className="w-40 border-border bg-card text-foreground"><SelectValue placeholder="Frequency" /></SelectTrigger>
          <SelectContent className="border-border bg-card">
            <SelectItem value="all" className="text-foreground focus:text-primary focus:bg-primary/10">All Frequencies</SelectItem>
            {Object.entries(frequencyLabels).map(([k, v]) => (
              <SelectItem key={k} value={k} className="text-foreground focus:text-primary focus:bg-primary/10">{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-sm text-muted-foreground">
                <th className="text-left p-4 font-medium">Asset</th>
                <th className="text-left p-4 font-medium">Task</th>
                <th className="text-left p-4 font-medium">Frequency</th>
                <th className="text-left p-4 font-medium">Last Done</th>
                <th className="text-left p-4 font-medium">Next Due</th>
                <th className="text-left p-4 font-medium">Responsible</th>
                <th className="text-left p-4 font-medium">Location</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((task, i) => (
                <motion.tr
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-border last:border-0 hover:bg-foreground/5 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm text-foreground">{task.asset}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-secondary-foreground">{task.task}</td>
                  <td className="p-4">
                    <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                      {frequencyLabels[task.frequency]}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm text-secondary-foreground">{task.lastDone ? formatDate(task.lastDone) : "—"}</td>
                  <td className="p-4 text-sm text-foreground font-medium">{formatDate(task.nextDue)}</td>
                  <td className="p-4 text-sm text-secondary-foreground">{task.responsible}</td>
                  <td className="p-4 text-sm text-secondary-foreground">{task.location}</td>
                  <td className="p-4">
                    <Badge variant="outline" className={cn("text-xs", statusColors[task.status])}>
                      {task.status === "DueSoon" ? "Due Soon" : task.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="text-success hover:text-success hover:bg-success/10" onClick={() => handleMarkDone(task.id)}>
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      {deleteConfirm === task.id ? (
                        <div className="flex items-center gap-1">
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(task.id)}>Yes</Button>
                          <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)} className="border-border">No</Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteConfirm(task.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground">
                    <CalendarClock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No PM tasks found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
