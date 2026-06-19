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
  HardHat,
  Star,
  Phone,
  Mail,
  Briefcase,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Award,
} from "lucide-react";
import {
  getContractors,
  addContractor,
  updateContractor,
  deleteContractor,
  Contractor,
  ContractorSpecialty,
  ContractorStatus,
} from "@/lib/store/contractors";
import { cn } from "@/lib/utils";

const specialtyLabels: Record<ContractorSpecialty, string> = {
  Electrical: "Electrical",
  Plumbing: "Plumbing",
  HVAC: "HVAC",
  Generator: "Generator",
  Structural: "Structural",
  Security: "Security",
  Cleaning: "Cleaning",
  Elevator: "Elevator",
  General: "General",
};

const specialties: ContractorSpecialty[] = [
  "Electrical", "Plumbing", "HVAC", "Generator",
  "Structural", "Security", "Cleaning", "Elevator", "General",
];

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
  const starClass = size === "lg" ? "h-5 w-5" : "h-3.5 w-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={`full-${i}`} className={`${starClass} fill-[#D4AF37] text-primary`} />
      ))}
      {hasHalf && (
        <div className="relative">
          <Star className={`${starClass} text-muted-foreground`} />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className={`${starClass} fill-[#D4AF37] text-primary`} />
          </div>
        </div>
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star key={`empty-${i}`} className={`${starClass} text-muted-foreground`} />
      ))}
      <span className="text-xs text-secondary-foreground ml-1">({rating})</span>
    </div>
  );
}

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

export default function ContractorsPage() {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [search, setSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const [formName, setFormName] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formSpecialty, setFormSpecialty] = useState<ContractorSpecialty>("General");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formLicense, setFormLicense] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const showToast = useCallback((message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
  }, []);

  const refreshData = useCallback(() => {
    setContractors(getContractors());
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const filtered = contractors.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.specialty.toLowerCase().includes(search.toLowerCase());
    const matchesSpecialty = specialtyFilter === "all" || c.specialty === specialtyFilter;
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesSpecialty && matchesStatus;
  });

  const totalContractors = contractors.length;
  const activeCount = contractors.filter(c => c.status === "active").length;
  const specialtiesCovered = new Set(contractors.filter(c => c.status === "active").map(c => c.specialty)).size;
  const jobsThisMonth = contractors.filter(c => {
    if (c.lastJob === "N/A") return false;
    const d = new Date(c.lastJob);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const handleAdd = () => {
    if (!formName.trim() || !formCompany.trim() || !formPhone.trim() || !formEmail.trim()) {
      showToast("Please fill required fields (name, company, phone, email)", "error");
      return;
    }
    addContractor({
      name: formName,
      company: formCompany,
      specialty: formSpecialty,
      phone: formPhone,
      email: formEmail,
      licenseNo: formLicense,
      notes: formNotes,
    });
    refreshData();
    setCreateOpen(false);
    setFormName("");
    setFormCompany("");
    setFormSpecialty("General");
    setFormPhone("");
    setFormEmail("");
    setFormLicense("");
    setFormNotes("");
    showToast("Contractor added successfully", "success");
  };

  const handleDelete = (id: string) => {
    deleteContractor(id);
    refreshData();
    setDeleteConfirm(null);
    setDetailOpen(false);
    setSelectedContractor(null);
    showToast("Contractor removed", "success");
  };

  const handleToggleStatus = (contractor: Contractor) => {
    const newStatus = contractor.status === "active" ? "inactive" : "active";
    updateContractor(contractor.id, { status: newStatus });
    refreshData();
    if (selectedContractor?.id === contractor.id) {
      setSelectedContractor({ ...selectedContractor, status: newStatus });
    }
    showToast(`${contractor.name} ${newStatus === "active" ? "activated" : "deactivated"}`, "success");
  };

  const summaryCards = [
    { title: "Total Contractors", value: totalContractors, icon: Briefcase, color: "text-info" },
    { title: "Active", value: activeCount, icon: CheckCircle2, color: "text-success" },
    { title: "Specialties Covered", value: specialtiesCovered, icon: Award, color: "text-primary" },
    { title: "Jobs This Month", value: jobsThisMonth, icon: Clock, color: "text-mustard" },
  ];

  const lastFiveJobs = selectedContractor
    ? contractors
        .filter(c => c.id === selectedContractor.id)
        .map(c => ({
          job: c.lastJob,
          company: c.company,
        }))
    : [];

  return (
    <div className="space-y-6 max-w-7xl">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contractors</h1>
          <p className="text-secondary-foreground">Manage external service contractors</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Contractor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg border-border bg-card">
            <DialogHeader>
              <DialogTitle className="text-foreground">Add Contractor</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleAdd(); }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">Name *</Label>
                  <Input placeholder="Contact name" value={formName} onChange={(e) => setFormName(e.target.value)} className="border-border bg-background text-foreground placeholder:text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">Company *</Label>
                  <Input placeholder="Company name" value={formCompany} onChange={(e) => setFormCompany(e.target.value)} className="border-border bg-background text-foreground placeholder:text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-secondary-foreground">Specialty</Label>
                <Select value={formSpecialty} onValueChange={(v) => setFormSpecialty(v as ContractorSpecialty)}>
                  <SelectTrigger className="border-border bg-background text-foreground"><SelectValue /></SelectTrigger>
                  <SelectContent className="border-border bg-card">
                    {specialties.map((s) => (
                      <SelectItem key={s} value={s} className="text-foreground focus:text-primary focus:bg-primary/10">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">Phone *</Label>
                  <Input placeholder="Phone number" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} className="border-border bg-background text-foreground placeholder:text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">Email *</Label>
                  <Input placeholder="Email address" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className="border-border bg-background text-foreground placeholder:text-muted-foreground" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">License No</Label>
                  <Input placeholder="License number" value={formLicense} onChange={(e) => setFormLicense(e.target.value)} className="border-border bg-background text-foreground placeholder:text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-secondary-foreground">Notes</Label>
                <textarea className="flex min-h-[60px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none" placeholder="Additional notes..." value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />
              </div>
              <Button type="submit" className="w-full">Add Contractor</Button>
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
          <Input className="pl-10 max-w-md" placeholder="Search contractors..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
          <SelectTrigger className="w-40 border-border bg-card text-foreground"><SelectValue placeholder="Specialty" /></SelectTrigger>
          <SelectContent className="border-border bg-card">
            <SelectItem value="all" className="text-foreground focus:text-primary focus:bg-primary/10">All Specialties</SelectItem>
            {specialties.map((s) => (
              <SelectItem key={s} value={s} className="text-foreground focus:text-primary focus:bg-primary/10">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 border-border bg-card text-foreground"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent className="border-border bg-card">
            <SelectItem value="all" className="text-foreground focus:text-primary focus:bg-primary/10">All</SelectItem>
            <SelectItem value="active" className="text-foreground focus:text-primary focus:bg-primary/10">Active</SelectItem>
            <SelectItem value="inactive" className="text-foreground focus:text-primary focus:bg-primary/10">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-sm text-muted-foreground">
                <th className="text-left p-4 font-medium">Name</th>
                <th className="text-left p-4 font-medium">Company</th>
                <th className="text-left p-4 font-medium">Specialty</th>
                <th className="text-left p-4 font-medium">Phone</th>
                <th className="text-left p-4 font-medium">Rating</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((contractor, i) => (
                <motion.tr
                  key={contractor.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-border last:border-0 hover:bg-foreground/5 transition-colors cursor-pointer"
                  onClick={() => { setSelectedContractor(contractor); setDetailOpen(true); }}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <HardHat className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm text-foreground">{contractor.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-secondary-foreground">{contractor.company}</td>
                  <td className="p-4">
                    <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                      {contractor.specialty}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm text-secondary-foreground">{contractor.phone}</td>
                  <td className="p-4">
                    <StarRating rating={contractor.rating} />
                  </td>
                  <td className="p-4">
                    <Badge variant={contractor.status === "active" ? "success" : "secondary"}>
                      {contractor.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                      View
                    </Button>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    <HardHat className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No contractors found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-xl border-border bg-card">
          {selectedContractor && (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground flex items-center gap-2">
                  <HardHat className="h-5 w-5 text-primary" />
                  {selectedContractor.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Company</p>
                    <p className="text-sm text-foreground">{selectedContractor.company}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Specialty</p>
                    <Badge variant="outline" className="text-xs border-primary/30 text-primary">{selectedContractor.specialty}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Phone</p>
                    <p className="text-sm text-foreground flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-primary" />{selectedContractor.phone}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p>
                    <p className="text-sm text-foreground flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-primary" />{selectedContractor.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">License No</p>
                    <p className="text-sm text-foreground">{selectedContractor.licenseNo || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Rating</p>
                    <StarRating rating={selectedContractor.rating} size="lg" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
                    <Badge variant={selectedContractor.status === "active" ? "success" : "secondary"}>{selectedContractor.status}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Last Job</p>
                    <p className="text-sm text-foreground">{selectedContractor.lastJob !== "N/A" ? selectedContractor.lastJob : "No jobs yet"}</p>
                  </div>
                </div>

                {selectedContractor.notes && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Notes</p>
                    <p className="text-sm text-secondary-foreground bg-background rounded-lg p-3 border border-border">{selectedContractor.notes}</p>
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Last 5 Jobs</p>
                  <div className="bg-background rounded-lg p-3 border border-border">
                    {lastFiveJobs.length > 0 ? (
                      <div className="text-sm text-secondary-foreground">
                        <p>Last job: {selectedContractor.lastJob !== "N/A" ? selectedContractor.lastJob : "No jobs recorded"}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No job history</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <Button variant="outline" className="border-border text-foreground" onClick={() => handleToggleStatus(selectedContractor)}>
                    {selectedContractor.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                  {deleteConfirm === selectedContractor.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-destructive">Confirm delete?</span>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(selectedContractor.id)}>Yes</Button>
                      <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)} className="border-border">No</Button>
                    </div>
                  ) : (
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteConfirm(selectedContractor.id)}>
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
