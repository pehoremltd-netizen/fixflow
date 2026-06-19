"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  FileText,
  Clock,
  DollarSign,
  Search,
  Trash2,
  Pencil,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface Contract {
  id: string;
  title: string;
  vendor: string;
  type: string;
  value: number;
  startDate: string;
  endDate: string;
  status: string;
  description: string;
}

const STORAGE_KEY = "fixflow-contracts";

const CONTRACT_TYPES = ["Maintenance", "Service", "Supply", "Security", "Cleaning", "IT"];

function readContracts(): Contract[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Contract[]) : [];
  } catch {
    return [];
  }
}

function writeContracts(contracts: Contract[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contracts));
  } catch {
    // silently fail
  }
}

function computeStatus(endDate: string): string {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end.getTime() - now.getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  if (days < 0) return "Expired";
  if (days <= 30) return "Expiring";
  return "Active";
}

function generateId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createSeedContracts(): Contract[] {
  const now = new Date();
  const day = (offset: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    return d.toISOString().split("T")[0];
  };
  return [
    {
      id: generateId(),
      title: "HVAC Maintenance Agreement",
      vendor: "CoolAir Pro Services",
      type: "Maintenance",
      value: 45000,
      startDate: day(-60),
      endDate: day(120),
      status: "Active",
      description: "Quarterly preventive maintenance for all office HVAC systems including filter replacements and coil cleaning.",
    },
    {
      id: generateId(),
      title: "Janitorial Service Contract",
      vendor: "CleanTech Solutions",
      type: "Service",
      value: 28500,
      startDate: day(-30),
      endDate: day(15),
      status: "Expiring",
      description: "Daily cleaning and sanitation services for the headquarters building.",
    },
    {
      id: generateId(),
      title: "Office Supply Agreement",
      vendor: "GlobalOffice Supplies",
      type: "Supply",
      value: 12000,
      startDate: day(-90),
      endDate: day(180),
      status: "Active",
      description: "Monthly office supply delivery including paper, toner, and stationery.",
    },
    {
      id: generateId(),
      title: "Security Patrol Service",
      vendor: "Shield Security Inc.",
      type: "Security",
      value: 36000,
      startDate: day(-300),
      endDate: day(-5),
      status: "Expired",
      description: "24/7 security patrol and monitoring for the warehouse facility.",
    },
    {
      id: generateId(),
      title: "Deep Cleaning Service",
      vendor: "Sparkle Clean Co.",
      type: "Cleaning",
      value: 15000,
      startDate: day(-20),
      endDate: day(20),
      status: "Expiring",
      description: "Bi-weekly deep cleaning including carpet shampooing and window washing.",
    },
    {
      id: generateId(),
      title: "IT Infrastructure Support",
      vendor: "TechGrid Solutions",
      type: "IT",
      value: 72000,
      startDate: day(-180),
      endDate: day(365),
      status: "Active",
      description: "Managed IT services including server maintenance, network monitoring, and help desk support.",
    },
  ];
}

function loadAllContracts(): Contract[] {
  const stored = readContracts();
  if (stored.length === 0) {
    const seed = createSeedContracts();
    writeContracts(seed);
    return seed;
  }
  return stored;
}

function statusVariant(status: string): "success" | "warning" | "destructive" | "outline" {
  switch (status) {
    case "Active":
      return "success";
    case "Expiring":
      return "warning";
    case "Expired":
      return "destructive";
    default:
      return "outline";
  }
}

function formatCurrency(val: number): string {
  return `$${val.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

interface FormState {
  title: string;
  vendor: string;
  type: string;
  value: string;
  startDate: string;
  endDate: string;
  description: string;
}

const EMPTY_FORM: FormState = {
  title: "",
  vendor: "",
  type: "",
  value: "",
  startDate: "",
  endDate: "",
  description: "",
};

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });

  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Contract | null>(null);
  const [editForm, setEditForm] = useState<FormState>({ ...EMPTY_FORM });

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Contract | null>(null);

  useEffect(() => {
    const all = loadAllContracts();
    setContracts(all.map((c) => ({ ...c, status: computeStatus(c.endDate) })));
    setLoading(false);
  }, []);

  const filteredContracts = useMemo(() => {
    let result = contracts;
    if (statusFilter !== "All") {
      result = result.filter((c) => c.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) => c.title.toLowerCase().includes(q) || c.vendor.toLowerCase().includes(q)
      );
    }
    return result;
  }, [contracts, search, statusFilter]);

  const totalCount = contracts.length;
  const activeCount = contracts.filter((c) => c.status === "Active").length;
  const totalValue = contracts.reduce((sum, c) => sum + c.value, 0);
  const expiringSoonCount = contracts.filter((c) => c.status === "Expiring").length;

  function refreshFromStorage() {
    const all = readContracts();
    setContracts(all.map((c) => ({ ...c, status: computeStatus(c.endDate) })));
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.vendor.trim()) return;
    const contract: Contract = {
      id: generateId(),
      title: form.title.trim(),
      vendor: form.vendor.trim(),
      type: form.type.trim(),
      value: parseFloat(form.value) || 0,
      startDate: form.startDate,
      endDate: form.endDate,
      description: form.description.trim(),
      status: computeStatus(form.endDate),
    };
    const all = readContracts();
    all.push(contract);
    writeContracts(all);
    refreshFromStorage();
    setForm({ ...EMPTY_FORM });
    setCreateOpen(false);
  }

  function openEdit(contract: Contract) {
    setEditTarget(contract);
    setEditForm({
      title: contract.title,
      vendor: contract.vendor,
      type: contract.type,
      value: String(contract.value),
      startDate: contract.startDate,
      endDate: contract.endDate,
      description: contract.description,
    });
    setEditOpen(true);
  }

  function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget || !editForm.title.trim() || !editForm.vendor.trim()) return;
    const all = readContracts();
    const idx = all.findIndex((c) => c.id === editTarget.id);
    if (idx === -1) return;
    all[idx] = {
      ...all[idx],
      title: editForm.title.trim(),
      vendor: editForm.vendor.trim(),
      type: editForm.type.trim(),
      value: parseFloat(editForm.value) || 0,
      startDate: editForm.startDate,
      endDate: editForm.endDate,
      description: editForm.description.trim(),
    };
    writeContracts(all);
    refreshFromStorage();
    setEditOpen(false);
    setEditTarget(null);
  }

  function openDelete(contract: Contract) {
    setDeleteTarget(contract);
    setDeleteOpen(true);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    const all = readContracts().filter((c) => c.id !== deleteTarget.id);
    writeContracts(all);
    refreshFromStorage();
    setDeleteOpen(false);
    setDeleteTarget(null);
  }

  function renderFormFields(
    f: FormState,
    setter: React.Dispatch<React.SetStateAction<FormState>>
  ) {
    const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setter((prev) => ({ ...prev, [field]: e.target.value }));
    return (
      <>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input placeholder="Contract title" value={f.title} onChange={set("title")} required />
        </div>
        <div className="space-y-2">
          <Label>Vendor</Label>
          <Input placeholder="Vendor name" value={f.vendor} onChange={set("vendor")} required />
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={f.type} onValueChange={(v) => setter((prev) => ({ ...prev, type: v }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {CONTRACT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input type="date" value={f.startDate} onChange={set("startDate")} />
          </div>
          <div className="space-y-2">
            <Label>End Date</Label>
            <Input type="date" value={f.endDate} onChange={set("endDate")} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Contract Value ($)</Label>
          <Input type="number" placeholder="0" value={f.value} onChange={set("value")} />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea placeholder="Contract description..." value={f.description} onChange={set("description")} />
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6 bg-input-bg text-foreground min-h-screen p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contract Management</h1>
          <p className="text-foreground/60">Manage vendor contracts and service agreements</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New Contract
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-input-bg border-border text-foreground">
            <DialogHeader>
              <DialogTitle className="text-foreground">Create Contract</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleCreate}>
              {renderFormFields(form, setForm)}
              <Button type="submit" className="w-full">
                Create Contract
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-input-bg border-border">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-sm text-foreground/60">Total Contracts</span>
            <span className="text-2xl font-bold text-foreground">{totalCount}</span>
          </CardContent>
        </Card>
        <Card className="bg-input-bg border-border">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-sm text-foreground/60">Active</span>
            <span className="text-2xl font-bold text-green-400">{activeCount}</span>
          </CardContent>
        </Card>
        <Card className="bg-input-bg border-border">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-sm text-foreground/60">Total Value</span>
            <span className="text-2xl font-bold text-primary">{formatCurrency(totalValue)}</span>
          </CardContent>
        </Card>
        <Card className="bg-input-bg border-border">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-sm text-foreground/60">Expiring Soon</span>
            <span className="text-2xl font-bold text-primary">{expiringSoonCount}</span>
          </CardContent>
        </Card>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
          <Input
            placeholder="Search by title or vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-input-bg border-border text-foreground placeholder:text-foreground/40"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-input-bg border-border text-foreground">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-input-bg border-border text-foreground">
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Expiring">Expiring</SelectItem>
            <SelectItem value="Expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-foreground/40" />
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && contracts.length === 0 && (
        <div className="text-center py-12 text-foreground/40">No contracts yet. Create your first contract to get started.</div>
      )}

      {/* NO RESULTS */}
      {!loading && contracts.length > 0 && filteredContracts.length === 0 && (
        <div className="text-center py-12 text-foreground/40">No contracts match your search or filter criteria.</div>
      )}

      {/* DESKTOP TABLE */}
      {!loading && filteredContracts.length > 0 && (
        <div className="hidden md:block">
          <Card className="bg-input-bg border-border overflow-hidden">
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-sm text-foreground/60">
                    <th className="text-left p-4 font-medium">Contract</th>
                    <th className="text-left p-4 font-medium">Vendor</th>
                    <th className="text-left p-4 font-medium">Period</th>
                    <th className="text-left p-4 font-medium">Value</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContracts.map((c, i) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border last:border-0 hover:bg-foreground/[0.02] transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <div>
                            <span className="text-sm font-medium text-foreground">{c.title}</span>
                            <span className="text-xs text-foreground/40 ml-2">{c.type}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-foreground/80">{c.vendor}</td>
                      <td className="p-4 text-sm text-foreground/60">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-foreground/40" />
                          {new Date(c.startDate).toLocaleDateString()} -{" "}
                          {new Date(c.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-foreground">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-primary" />
                          {formatCurrency(c.value)}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={statusVariant(c.status)}>{c.status}</Badge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-foreground/60 hover:text-foreground hover:bg-foreground/10"
                            onClick={() => openEdit(c)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400/60 hover:text-red-400 hover:bg-red-400/10"
                            onClick={() => openDelete(c)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MOBILE CARDS */}
      {!loading && filteredContracts.length > 0 && (
        <div className="md:hidden space-y-3">
          {filteredContracts.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="bg-input-bg border-border">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{c.title}</p>
                        <p className="text-xs text-foreground/40">{c.type}</p>
                      </div>
                    </div>
                    <Badge variant={statusVariant(c.status)}>{c.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-xs text-foreground/40">Vendor</span>
                      <p className="text-foreground/80">{c.vendor}</p>
                    </div>
                    <div>
                      <span className="text-xs text-foreground/40">Value</span>
                      <p className="text-primary font-medium">{formatCurrency(c.value)}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-foreground/40">Period</span>
                      <p className="text-foreground/60">
                        {new Date(c.startDate).toLocaleDateString()} -{" "}
                        {new Date(c.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-border text-foreground hover:bg-foreground/10"
                      onClick={() => openEdit(c)}
                    >
                      <Pencil className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-red-400/30 text-red-400 hover:bg-red-400/10"
                      onClick={() => openDelete(c)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* EDIT DIALOG */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-input-bg border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Contract</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleEdit}>
            {renderFormFields(editForm, setEditForm)}
            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-input-bg border-border text-foreground max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" /> Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-foreground/60">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{deleteTarget?.title}</span>? This action
            cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              className="border-border text-foreground hover:bg-foreground/10"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-destructive hover:bg-red-600 text-foreground"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
