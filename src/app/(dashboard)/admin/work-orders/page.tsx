"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Wrench,
  AlertTriangle,
  Brain,
  Trash2,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Calendar,
  ChevronRight,
  ListChecks,
  CheckCheck,
} from "lucide-react";
import { AIRecommendedWorkOrders } from "@/components/ai/ai-recommended-work-orders";
import { mockAIWorkOrderSuggestions } from "@/lib/ai-intelligence";
import {
  getWorkOrders,
  createWorkOrder,
  updateStatus,
  deleteWorkOrder,
  getNextStatus,
  WorkOrder,
  WorkOrderStatus,
  WorkOrderPriority,
  WorkOrderCategory,
  statusFlow,
} from "@/lib/workOrders";
import { cn } from "@/lib/utils";
import { getStaffList } from "@/lib/attendance";

const statusColors: Record<WorkOrderStatus, string> = {
  OPEN: "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30",
  ASSIGNED: "bg-[#A855F7]/10 text-[#A855F7] border-[#A855F7]/30",
  IN_PROGRESS: "bg-[#E1B000]/10 text-[#E1B000] border-[#E1B000]/30",
  COMPLETED: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30",
  VERIFIED: "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30",
};

const priorityColors: Record<WorkOrderPriority, string> = {
  critical: "text-[#EF4444]",
  high: "text-[#E1B000]",
  medium: "text-[#D4AF37]",
  low: "text-[#7A7A7A]",
};

const categoryLabels: Record<WorkOrderCategory, string> = {
  mechanical: "Mechanical",
  electrical: "Electrical",
  plumbing: "Plumbing",
  hvac: "HVAC",
  safety: "Safety",
  structural: "Structural",
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
        type === "success" && "bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]",
        type === "error" && "bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]",
        type === "info" && "bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]"
      )}
    >
      {type === "success" && <CheckCircle2 className="h-4 w-4" />}
      {type === "error" && <AlertTriangle className="h-4 w-4" />}
      {type === "info" && <Clock className="h-4 w-4" />}
      {message}
    </motion.div>
  );
}

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState("all");
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formCategory, setFormCategory] = useState<WorkOrderCategory>("hvac");
  const [formPriority, setFormPriority] = useState<WorkOrderPriority>("medium");
  const [formAssigned, setFormAssigned] = useState("");
  const [formDueDate, setFormDueDate] = useState("");

  const showToast = useCallback((message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
  }, []);

  const refreshData = useCallback(() => {
    setWorkOrders(getWorkOrders());
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const filtered = workOrders.filter((wo) => {
    const matchesSearch = wo.title.toLowerCase().includes(search.toLowerCase()) ||
      wo.location.toLowerCase().includes(search.toLowerCase()) ||
      wo.id.toLowerCase().includes(search.toLowerCase());
    const matchesTab = statusTab === "all" || wo.status === statusTab;
    return matchesSearch && matchesTab;
  });

  const handleCreate = () => {
    if (!formTitle.trim() || !formLocation.trim() || !formDueDate) {
      showToast("Please fill all required fields", "error");
      return;
    }
    createWorkOrder({
      title: formTitle,
      description: formDescription,
      location: formLocation,
      category: formCategory,
      priority: formPriority,
      assignedStaff: formAssigned || "Unassigned",
      dueDate: formDueDate,
    });
    refreshData();
    setCreateOpen(false);
    setFormTitle("");
    setFormDescription("");
    setFormLocation("");
    setFormCategory("hvac");
    setFormPriority("medium");
    setFormAssigned("");
    setFormDueDate("");
    showToast("Work order created successfully", "success");
  };

  const handleStatusUpdate = (id: string) => {
    const wo = workOrders.find((w) => w.id === id);
    if (!wo) return;
    const next = getNextStatus(wo.status);
    if (next) {
      updateStatus(id, next);
      refreshData();
      setSelectedWO(getWorkOrders().find((w) => w.id === id) || null);
      showToast(`Work order ${id} moved to ${next.replace("_", " ")}`, "success");
    }
  };

  const handleDelete = (id: string) => {
    deleteWorkOrder(id);
    refreshData();
    setDetailOpen(false);
    setSelectedWO(null);
    setDeleteConfirm(null);
    showToast(`Work order ${id} deleted`, "success");
  };

  const staffList = getStaffList();

  return (
    <div className="space-y-6 max-w-7xl">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Work Orders</h1>
          <p className="text-[#B8B8B8]">
            Create, assign, and track maintenance work orders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1.5 text-xs border-[#D4AF37]/30 text-[#D4AF37]">
            <Brain className="h-3.5 w-3.5 text-[#D4AF37]" />
            AI Suggestions Active
          </Badge>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Create Work Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg border-[#222222] bg-[#161616]">
              <DialogHeader>
                <DialogTitle className="text-white">Create Work Order</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
                <div className="space-y-2">
                  <Label className="text-[#B8B8B8]">Title *</Label>
                  <Input placeholder="Work order title" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="border-[#222222] bg-black text-white placeholder:text-[#7A7A7A]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#B8B8B8]">Description</Label>
                  <textarea className="flex min-h-[80px] w-full rounded-lg border border-[#222222] bg-black px-3 py-2 text-sm text-white placeholder:text-[#7A7A7A] resize-none" placeholder="Describe the work required..." value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#B8B8B8]">Location *</Label>
                  <Input placeholder="e.g. Building A - Floor 2" value={formLocation} onChange={(e) => setFormLocation(e.target.value)} className="border-[#222222] bg-black text-white placeholder:text-[#7A7A7A]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#B8B8B8]">Category</Label>
                    <Select value={formCategory} onValueChange={(v) => setFormCategory(v as WorkOrderCategory)}>
                      <SelectTrigger className="border-[#222222] bg-black text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="border-[#222222] bg-[#161616]">
                        {Object.entries(categoryLabels).map(([k, v]) => (
                          <SelectItem key={k} value={k} className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#B8B8B8]">Priority</Label>
                    <Select value={formPriority} onValueChange={(v) => setFormPriority(v as WorkOrderPriority)}>
                      <SelectTrigger className="border-[#222222] bg-black text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="border-[#222222] bg-[#161616]">
                        <SelectItem value="low" className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">Low</SelectItem>
                        <SelectItem value="medium" className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">Medium</SelectItem>
                        <SelectItem value="high" className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">High</SelectItem>
                        <SelectItem value="critical" className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#B8B8B8]">Assigned Staff</Label>
                    <Select value={formAssigned} onValueChange={setFormAssigned}>
                      <SelectTrigger className="border-[#222222] bg-black text-white"><SelectValue placeholder="Select staff" /></SelectTrigger>
                      <SelectContent className="border-[#222222] bg-[#161616]">
                        {staffList.map((s) => (
                          <SelectItem key={s.id} value={s.name} className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#B8B8B8]">Due Date *</Label>
                    <Input type="date" value={formDueDate} onChange={(e) => setFormDueDate(e.target.value)} className="border-[#222222] bg-black text-white" />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Create Work Order
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <AIRecommendedWorkOrders suggestions={mockAIWorkOrderSuggestions} />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A7A7A]" />
        <Input
          placeholder="Search by title, location, or ID..."
          className="pl-10 max-w-md border-[#222222] bg-[#161616] text-white placeholder:text-[#7A7A7A]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Tabs defaultValue="all" value={statusTab} onValueChange={setStatusTab}>
        <TabsList className="bg-[#111111]">
          <TabsTrigger value="all">All ({workOrders.length})</TabsTrigger>
          <TabsTrigger value="OPEN">Open</TabsTrigger>
          <TabsTrigger value="ASSIGNED">Assigned</TabsTrigger>
          <TabsTrigger value="IN_PROGRESS">In Progress</TabsTrigger>
          <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
          <TabsTrigger value="VERIFIED">Verified</TabsTrigger>
        </TabsList>

        <TabsContent value={statusTab}>
          <Card className="border-[#222222] bg-[#161616]">
            <CardHeader>
              <CardTitle className="text-white">
                {statusTab === "all" ? "All" : statusTab.replace("_", " ")} Work Orders ({filtered.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-[#7A7A7A]">
                  <Wrench className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-lg font-medium">No work orders found</p>
                  <p className="text-sm mt-1">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((wo, i) => (
                    <motion.div
                      key={wo.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      onClick={() => { setSelectedWO(wo); setDetailOpen(true); }}
                      className="flex items-center justify-between p-4 rounded-lg border border-[#222222] hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0",
                          wo.priority === "critical" ? "bg-[#EF4444]/10" :
                          wo.priority === "high" ? "bg-[#E1B000]/10" :
                          "bg-[#D4AF37]/10"
                        )}>
                          {wo.priority === "critical" ? (
                            <AlertTriangle className="h-5 w-5 text-[#EF4444]" />
                          ) : (
                            <Wrench className={cn("h-5 w-5", priorityColors[wo.priority])} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-[#7A7A7A]">{wo.id}</span>
                            <Badge variant="outline" className="text-[10px] border-[#222222] text-[#7A7A7A] px-1.5 py-0">
                              {categoryLabels[wo.category]}
                            </Badge>
                          </div>
                          <p className="font-medium text-white truncate">{wo.title}</p>
                          <div className="flex items-center gap-3 text-xs text-[#7A7A7A] mt-1">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{wo.location}</span>
                            <span className="flex items-center gap-1"><User className="h-3 w-3" />{wo.assignedStaff}</span>
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{wo.dueDate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge className={cn("text-xs border", statusColors[wo.status])}>
                          {wo.status.replace("_", " ")}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-[#7A7A7A]" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={detailOpen} onOpenChange={(open) => { setDetailOpen(open); if (!open) setDeleteConfirm(null); }}>
        <DialogContent className="max-w-2xl border-[#222222] bg-[#161616] max-h-[90vh] overflow-y-auto">
          {selectedWO && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between pr-6">
                  <div className="flex items-center gap-3">
                    <DialogTitle className="text-white text-xl">{selectedWO.title}</DialogTitle>
                    <Badge className={cn("text-xs border", statusColors[selectedWO.status])}>
                      {selectedWO.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-[#7A7A7A]">Work Order ID</span>
                      <p className="text-sm text-white font-mono">{selectedWO.id}</p>
                    </div>
                    <div>
                      <span className="text-xs text-[#7A7A7A]">Location</span>
                      <p className="text-sm text-white flex items-center gap-1"><MapPin className="h-3 w-3 text-[#D4AF37]" />{selectedWO.location}</p>
                    </div>
                    <div>
                      <span className="text-xs text-[#7A7A7A]">Category</span>
                      <p className="text-sm text-white">{categoryLabels[selectedWO.category]}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-[#7A7A7A]">Priority</span>
                      <p className={cn("text-sm font-medium capitalize", priorityColors[selectedWO.priority])}>{selectedWO.priority}</p>
                    </div>
                    <div>
                      <span className="text-xs text-[#7A7A7A]">Assigned Staff</span>
                      <p className="text-sm text-white flex items-center gap-1"><User className="h-3 w-3 text-[#D4AF37]" />{selectedWO.assignedStaff}</p>
                    </div>
                    <div>
                      <span className="text-xs text-[#7A7A7A]">Due Date</span>
                      <p className="text-sm text-white flex items-center gap-1"><Calendar className="h-3 w-3 text-[#D4AF37]" />{selectedWO.dueDate}</p>
                    </div>
                  </div>
                </div>

                {selectedWO.description && (
                  <div>
                    <span className="text-xs text-[#7A7A7A]">Description</span>
                    <p className="text-sm text-[#B8B8B8] mt-1">{selectedWO.description}</p>
                  </div>
                )}

                <div>
                  <span className="text-xs text-[#7A7A7A] flex items-center gap-1 mb-3"><ListChecks className="h-3 w-3" />Status History</span>
                  <div className="space-y-0">
                    {selectedWO.statusHistory.map((entry, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "h-3 w-3 rounded-full border-2 flex-shrink-0",
                            idx === selectedWO.statusHistory.length - 1
                              ? "bg-[#D4AF37] border-[#D4AF37]"
                              : "bg-[#161616] border-[#7A7A7A]"
                          )} />
                          {idx < selectedWO.statusHistory.length - 1 && (
                            <div className="w-0.5 flex-1 bg-[#222222] min-h-[24px]" />
                          )}
                        </div>
                        <div className={cn("pb-4", idx === selectedWO.statusHistory.length - 1 ? "pb-0" : "")}>
                          <p className={cn(
                            "text-sm font-medium",
                            idx === selectedWO.statusHistory.length - 1 ? "text-[#D4AF37]" : "text-white"
                          )}>
                            {entry.status.replace("_", " ")}
                          </p>
                          <p className="text-xs text-[#7A7A7A]">
                            {new Date(entry.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} by {entry.changedBy}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#222222]">
                  <div className="flex items-center gap-2">
                    {getNextStatus(selectedWO.status) && (
                      <Button onClick={() => handleStatusUpdate(selectedWO.id)} className="gap-2">
                        <ArrowRight className="h-4 w-4" />
                        Move to {getNextStatus(selectedWO.status)!.replace("_", " ")}
                      </Button>
                    )}
                    {selectedWO.status === "COMPLETED" && (
                      <Button onClick={() => handleStatusUpdate(selectedWO.id)} className="gap-2">
                        <CheckCheck className="h-4 w-4" />
                        Verify Completion
                      </Button>
                    )}
                  </div>
                  {deleteConfirm === selectedWO.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#EF4444]">Confirm delete?</span>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(selectedWO.id)}>Yes</Button>
                      <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)}>No</Button>
                    </div>
                  ) : (
                    <Button variant="ghost" size="sm" className="text-[#EF4444] hover:text-[#EF4444] hover:bg-[#EF4444]/10" onClick={() => setDeleteConfirm(selectedWO.id)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
