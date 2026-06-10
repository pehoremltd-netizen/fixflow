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
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowRight,
  User,
  MapPin,
  Calendar,
  Trash2,
} from "lucide-react";
import {
  getFaultReports,
  addFaultReport,
  updateStatus,
  FaultReport,
  FaultStatus,
  FaultPriority,
} from "@/lib/faultReports";
import { formatDate, formatDateTime, cn } from "@/lib/utils";

const statusColors: Record<FaultStatus, string> = {
  REPORTED: "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30",
  ACKNOWLEDGED: "bg-[#E1B000]/10 text-[#E1B000] border-[#E1B000]/30",
  ASSIGNED: "bg-[#A855F7]/10 text-[#A855F7] border-[#A855F7]/30",
  RESOLVED: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30",
};

const priorityColors: Record<FaultPriority, string> = {
  critical: "text-[#EF4444]",
  high: "text-[#E1B000]",
  medium: "text-[#D4AF37]",
  low: "text-[#7A7A7A]",
};

const statusFlow: { from: FaultStatus; to: FaultStatus; action: string }[] = [
  { from: "REPORTED", to: "ACKNOWLEDGED", action: "Acknowledge" },
  { from: "ACKNOWLEDGED", to: "ASSIGNED", action: "Assign" },
  { from: "ASSIGNED", to: "RESOLVED", action: "Resolve" },
];

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

export default function FaultReportsPage() {
  const [reports, setReports] = useState<FaultReport[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<FaultReport | null>(null);
  const [resolveNotes, setResolveNotes] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const [formAsset, setFormAsset] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formReportedBy, setFormReportedBy] = useState("");
  const [formPriority, setFormPriority] = useState<FaultPriority>("medium");

  const showToast = useCallback((message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
  }, []);

  const refreshData = useCallback(() => {
    setReports(getFaultReports());
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const filtered = reports.filter((r) => {
    const matchesSearch = r.assetName.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase()) ||
      r.reportedBy.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || r.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalCount = reports.length;
  const openCount = reports.filter(r => r.status === "REPORTED" || r.status === "ACKNOWLEDGED").length;
  const inProgressCount = reports.filter(r => r.status === "ASSIGNED").length;
  const resolvedToday = reports.filter(r => {
    if (!r.resolvedAt) return false;
    const d = new Date(r.resolvedAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  const handleAdd = () => {
    if (!formAsset.trim() || !formLocation.trim() || !formDescription.trim() || !formReportedBy.trim()) {
      showToast("Please fill all required fields", "error");
      return;
    }
    addFaultReport({
      assetName: formAsset,
      location: formLocation,
      description: formDescription,
      reportedBy: formReportedBy,
      priority: formPriority,
    });
    refreshData();
    setCreateOpen(false);
    setFormAsset("");
    setFormLocation("");
    setFormDescription("");
    setFormReportedBy("");
    setFormPriority("medium");
    showToast("Fault report created", "success");
  };

  const handleStatusUpdate = (id: string, newStatus: FaultStatus) => {
    const notes = newStatus === "RESOLVED" ? resolveNotes : undefined;
    updateStatus(id, newStatus, notes);
    refreshData();
    const updated = getFaultReports().find(r => r.id === id);
    if (updated) setSelectedReport(updated);
    setResolveNotes("");
    showToast(`Report ${id} ${newStatus === "RESOLVED" ? "resolved" : "moved to " + newStatus}`, "success");
  };

  const summaryCards = [
    { title: "Total Reports", value: totalCount, icon: AlertTriangle, color: "text-[#3B82F6]" },
    { title: "Open", value: openCount, icon: Clock, color: "text-[#E1B000]" },
    { title: "In Progress", value: inProgressCount, icon: ArrowRight, color: "text-[#A855F7]" },
    { title: "Resolved Today", value: resolvedToday, icon: CheckCircle2, color: "text-[#22C55E]" },
  ];

  const nextAction = selectedReport ? statusFlow.find(s => s.from === selectedReport.status) : null;

  return (
    <div className="space-y-6 max-w-7xl">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Fault Reports</h1>
          <p className="text-[#B8B8B8]">Track and manage asset fault reports</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Report Fault
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg border-[#222222] bg-[#161616]">
            <DialogHeader>
              <DialogTitle className="text-white">Report a Fault</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleAdd(); }}>
              <div className="space-y-2">
                <Label className="text-[#B8B8B8]">Asset Name *</Label>
                <Input placeholder="Faulty asset" value={formAsset} onChange={(e) => setFormAsset(e.target.value)} className="border-[#222222] bg-black text-white placeholder:text-[#7A7A7A]" />
              </div>
              <div className="space-y-2">
                <Label className="text-[#B8B8B8]">Location *</Label>
                <Input placeholder="Where is the asset?" value={formLocation} onChange={(e) => setFormLocation(e.target.value)} className="border-[#222222] bg-black text-white placeholder:text-[#7A7A7A]" />
              </div>
              <div className="space-y-2">
                <Label className="text-[#B8B8B8]">Description *</Label>
                <textarea className="flex min-h-[80px] w-full rounded-lg border border-[#222222] bg-black px-3 py-2 text-sm text-white placeholder:text-[#7A7A7A] resize-none" placeholder="Describe the fault..." value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#B8B8B8]">Reported By *</Label>
                  <Input placeholder="Your name" value={formReportedBy} onChange={(e) => setFormReportedBy(e.target.value)} className="border-[#222222] bg-black text-white placeholder:text-[#7A7A7A]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#B8B8B8]">Priority</Label>
                  <Select value={formPriority} onValueChange={(v) => setFormPriority(v as FaultPriority)}>
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
              <Button type="submit" className="w-full">Submit Report</Button>
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
            <Card className="border-[#222222] bg-[#161616]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[#B8B8B8]">{card.title}</CardTitle>
                <card.icon className={cn("h-4 w-4", card.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{card.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A7A7A]" />
          <Input className="pl-10 max-w-md" placeholder="Search reports..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 border-[#222222] bg-[#161616] text-white"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent className="border-[#222222] bg-[#161616]">
            <SelectItem value="all" className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">All Status</SelectItem>
            <SelectItem value="REPORTED" className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">Reported</SelectItem>
            <SelectItem value="ACKNOWLEDGED" className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">Acknowledged</SelectItem>
            <SelectItem value="ASSIGNED" className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">Assigned</SelectItem>
            <SelectItem value="RESOLVED" className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-40 border-[#222222] bg-[#161616] text-white"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent className="border-[#222222] bg-[#161616]">
            <SelectItem value="all" className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">All Priorities</SelectItem>
            <SelectItem value="low" className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">Low</SelectItem>
            <SelectItem value="medium" className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">Medium</SelectItem>
            <SelectItem value="high" className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">High</SelectItem>
            <SelectItem value="critical" className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-[#222222] bg-[#161616]">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#222222] text-sm text-[#7A7A7A]">
                <th className="text-left p-4 font-medium">ID</th>
                <th className="text-left p-4 font-medium">Asset</th>
                <th className="text-left p-4 font-medium">Location</th>
                <th className="text-left p-4 font-medium">Reported By</th>
                <th className="text-left p-4 font-medium">Date</th>
                <th className="text-left p-4 font-medium">Priority</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((report, i) => (
                <motion.tr
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-[#222222] last:border-0 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => { setSelectedReport(report); setDetailOpen(true); }}
                >
                  <td className="p-4 text-sm font-mono text-[#D4AF37]">{report.id}</td>
                  <td className="p-4">
                    <span className="font-medium text-sm text-white">{report.assetName}</span>
                  </td>
                  <td className="p-4 text-sm text-[#B8B8B8]">{report.location}</td>
                  <td className="p-4 text-sm text-[#B8B8B8]">{report.reportedBy}</td>
                  <td className="p-4 text-sm text-[#B8B8B8]">{formatDate(report.reportedAt)}</td>
                  <td className="p-4">
                    <span className={cn("text-sm font-medium", priorityColors[report.priority])}>
                      {report.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className={cn("text-xs", statusColors[report.status])}>
                      {report.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Button variant="ghost" size="sm" className="text-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10">
                      View
                    </Button>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#7A7A7A]">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No fault reports found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl border-[#222222] bg-[#161616]">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  {selectedReport.id} — {selectedReport.assetName}
                  <Badge variant="outline" className={cn("text-xs", statusColors[selectedReport.status])}>
                    {selectedReport.status}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-[#7A7A7A] uppercase tracking-wider">Location</p>
                    <p className="text-sm text-white flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[#D4AF37]" />{selectedReport.location}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-[#7A7A7A] uppercase tracking-wider">Reported By</p>
                    <p className="text-sm text-white flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-[#D4AF37]" />{selectedReport.reportedBy}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-[#7A7A7A] uppercase tracking-wider">Date</p>
                    <p className="text-sm text-white flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-[#D4AF37]" />{formatDateTime(selectedReport.reportedAt)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-[#7A7A7A] uppercase tracking-wider">Priority</p>
                    <p className={cn("text-sm font-medium", priorityColors[selectedReport.priority])}>{selectedReport.priority}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-[#7A7A7A] uppercase tracking-wider">Description</p>
                  <p className="text-sm text-white bg-black rounded-lg p-3 border border-[#222222]">{selectedReport.description}</p>
                </div>

                {selectedReport.resolution && (
                  <div className="space-y-1">
                    <p className="text-xs text-[#7A7A7A] uppercase tracking-wider">Resolution</p>
                    <p className="text-sm text-[#22C55E] bg-black rounded-lg p-3 border border-[#222222]">{selectedReport.resolution}</p>
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-xs text-[#7A7A7A] uppercase tracking-wider">Status Timeline</p>
                  <div className="flex items-center gap-2 bg-black rounded-lg p-3 border border-[#222222]">
                    {(["REPORTED", "ACKNOWLEDGED", "ASSIGNED", "RESOLVED"] as FaultStatus[]).map((step, idx) => {
                      const statusOrder = ["REPORTED", "ACKNOWLEDGED", "ASSIGNED", "RESOLVED"];
                      const currentIdx = statusOrder.indexOf(selectedReport.status);
                      const stepIdx = statusOrder.indexOf(step);
                      const isActive = stepIdx <= currentIdx;
                      return (
                        <div key={step} className="flex items-center gap-2 flex-1">
                          <div className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium",
                            isActive ? "bg-[#D4AF37]/10 text-[#D4AF37]" : "text-[#7A7A7A] bg-[#111111]"
                          )}>
                            {isActive && <CheckCircle2 className="h-3 w-3" />}
                            {step}
                          </div>
                          {idx < 3 && <div className="flex-1 h-px bg-[#222222]" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {nextAction && (
                  <div className="flex items-center gap-3 pt-2">
                    {selectedReport.status === "ASSIGNED" ? (
                      <div className="flex-1 flex items-center gap-2">
                        <Input
                          placeholder="Resolution notes..."
                          value={resolveNotes}
                          onChange={(e) => setResolveNotes(e.target.value)}
                          className="flex-1 border-[#222222] bg-black text-white placeholder:text-[#7A7A7A]"
                        />
                        <Button onClick={() => handleStatusUpdate(selectedReport.id, "RESOLVED")} disabled={!resolveNotes.trim()} className="gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Resolve
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={() => handleStatusUpdate(selectedReport.id, nextAction.to)} className="gap-2">
                        <ArrowRight className="h-4 w-4" />
                        {nextAction.action}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
