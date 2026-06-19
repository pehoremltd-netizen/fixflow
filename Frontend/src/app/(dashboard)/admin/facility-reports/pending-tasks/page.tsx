"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical, ClipboardList } from "lucide-react";
import {
  type PendingTask,
  type PendingTaskStatus,
  loadPendingTasks,
  savePendingTasks,
  addPendingTask,
  updatePendingTask,
  deletePendingTask,
} from "@/lib/store/facility-reports";

const STATUS_BADGE: Record<PendingTaskStatus, string> = {
  Pending: "bg-warning/10 text-warning border-warning/20",
  "In Progress": "bg-info/10 text-info border-info/20",
  Completed: "bg-success/10 text-success border-success/20",
};

export default function PendingTasksPage() {
  const [tasks, setTasks] = useState<PendingTask[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTasks(loadPendingTasks());
    setLoading(false);
  }, []);

  function handleAdd() {
    const text = newTaskText.trim();
    if (!text) return;
    const created = addPendingTask(text);
    setTasks((prev) => [...prev, created]);
    setNewTaskText("");
  }

  function handleUpdate(id: string, updates: Partial<PendingTask>) {
    const updated = updatePendingTask(id, updates);
    if (updated) {
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    }
  }

  function handleDelete(id: string) {
    deletePendingTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pending Tasks</h1>
          <p className="text-text-tertiary text-sm mt-1">Manage facility pending tasks</p>
        </div>
        <Card className="border-border bg-card">
          <CardContent className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pending Tasks</h1>
        <p className="text-text-tertiary text-sm mt-1">Manage facility pending tasks</p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Add New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Enter task description..."
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
              className="flex-1"
            />
            <Button onClick={handleAdd} className="gap-1.5 shrink-0">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </div>
        </CardContent>
      </Card>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-text-tertiary">
          <ClipboardList className="h-12 w-12 mb-3 opacity-50" />
          <p className="text-sm font-medium">No pending tasks</p>
          <p className="text-xs mt-1">Add a task using the input above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task, idx) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <Card className="border-border bg-card overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-2 pt-1 shrink-0">
                      <GripVertical className="h-4 w-4 text-muted-foreground/40" />
                      <Badge
                        variant="outline"
                        className="h-8 w-8 rounded-full flex items-center justify-center p-0 text-sm font-bold"
                      >
                        {task.number}
                      </Badge>
                    </div>

                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        <div className="lg:col-span-2">
                          <Input
                            value={task.task}
                            onChange={(e) => handleUpdate(task.id, { task: e.target.value })}
                            className="text-sm font-medium"
                          />
                        </div>
                        <Select
                          value={task.status}
                          onValueChange={(v) => handleUpdate(task.id, { status: v as PendingTaskStatus })}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <Textarea
                            placeholder="Add notes..."
                            value={task.notes}
                            onChange={(e) => handleUpdate(task.id, { notes: e.target.value })}
                            className="min-h-[60px] text-sm"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 mt-0.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {tasks.length > 0 && (
        <div className="flex items-center justify-between text-xs text-text-tertiary border-t border-border pt-4">
          <span>{tasks.length} task{tasks.length !== 1 ? "s" : ""}</span>
          <span>
            {tasks.filter((t) => t.status === "Completed").length} completed
            {" / "}
            {tasks.filter((t) => t.status === "In Progress").length} in progress
            {" / "}
            {tasks.filter((t) => t.status === "Pending").length} pending
          </span>
        </div>
      )}
    </div>
  );
}
