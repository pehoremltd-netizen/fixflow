"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Home, Globe, Clock, Loader2, Search, Trash2, X, Check } from "lucide-react";
import { stores, getOrganizationId } from "@/lib/store/offline-store";

interface TenantRecord {
  id: string;
  company: string;
  unit: string;
  contact: string;
  email: string;
  phone: string;
  subdomain: string;
  is_active: boolean;
  organization_id: string;
}

const STORAGE_KEY = "fixflow-tenants";

function getTenants(): TenantRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveTenants(data: TenantRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<TenantRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [newTenant, setNewTenant] = useState({ company: "", unit: "", contact: "", email: "", phone: "", subdomain: "" });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    setTenants(getTenants());
    setLoading(false);
  }, []);

  const filtered = tenants.filter((t) =>
    t.company.toLowerCase().includes(search.toLowerCase()) ||
    t.contact.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenant.company.trim() || !newTenant.email.trim()) return;
    setSaving(true);
    const created: TenantRecord = {
      id: `t-${Date.now()}`,
      company: newTenant.company.trim(),
      unit: newTenant.unit.trim(),
      contact: newTenant.contact.trim(),
      email: newTenant.email.trim(),
      phone: newTenant.phone.trim(),
      subdomain: newTenant.subdomain.trim() || newTenant.company.toLowerCase().replace(/[^a-z0-9]/g, ""),
      is_active: true,
      organization_id: getOrganizationId(),
    };
    const updated = [...tenants, created];
    saveTenants(updated);
    setTenants(updated);
    setNewTenant({ company: "", unit: "", contact: "", email: "", phone: "", subdomain: "" });
    setOpen(false);
    setSaving(false);
  };

  const handleToggleStatus = (id: string) => {
    const updated = tenants.map((t) => t.id === id ? { ...t, is_active: !t.is_active } : t);
    saveTenants(updated);
    setTenants(updated);
  };

  const handleDelete = (id: string) => {
    const updated = tenants.filter((t) => t.id !== id);
    saveTenants(updated);
    setTenants(updated);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tenant Management</h1>
          <p className="text-secondary-foreground">Manage tenant portals and maintenance requests</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" /> Add Tenant
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-card text-foreground sm:max-w-md">
            <DialogHeader><DialogTitle className="text-foreground">Create Tenant Portal</DialogTitle></DialogHeader>
            <form className="space-y-4" onSubmit={handleCreate}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">Company Name</Label>
                  <Input className="border-border bg-card-alt text-foreground" value={newTenant.company} onChange={(e) => setNewTenant({ ...newTenant, company: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">Unit/Suite</Label>
                  <Input className="border-border bg-card-alt text-foreground" value={newTenant.unit} onChange={(e) => setNewTenant({ ...newTenant, unit: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-secondary-foreground">Contact Person</Label>
                <Input className="border-border bg-card-alt text-foreground" value={newTenant.contact} onChange={(e) => setNewTenant({ ...newTenant, contact: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-secondary-foreground">Email</Label>
                <Input className="border-border bg-card-alt text-foreground" type="email" value={newTenant.email} onChange={(e) => setNewTenant({ ...newTenant, email: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label className="text-secondary-foreground">Phone</Label>
                <Input className="border-border bg-card-alt text-foreground" value={newTenant.phone} onChange={(e) => setNewTenant({ ...newTenant, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-secondary-foreground">Portal Subdomain</Label>
                <div className="flex items-center gap-2">
                  <Input className="border-border bg-card-alt text-foreground flex-1" placeholder="company" value={newTenant.subdomain} onChange={(e) => setNewTenant({ ...newTenant, subdomain: e.target.value })} />
                  <span className="text-sm text-muted-foreground">.fixflow.app</span>
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Create Portal
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search tenants..." className="pl-10 border-border bg-input-bg text-foreground max-w-md" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No tenants found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="border-border bg-input-bg rounded-xl transition-all duration-200 hover:-translate-y-0.5 [box-shadow:0_8px_24px_rgba(0,0,0,0.6),inset_0_0_0_1px_rgba(255,255,255,0.05)] hover:[box-shadow:0_12px_32px_rgba(0,0,0,0.7),inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Home className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{t.company}</h3>
                        <p className="text-sm text-secondary-foreground">{t.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleToggleStatus(t.id)}>
                        <Badge variant={t.is_active ? "success" : "secondary"} className="text-xs">{t.is_active ? "Active" : "Inactive"}</Badge>
                      </button>
                      {deleteConfirm === t.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-md text-destructive hover:bg-destructive/10"><Check className="h-3.5 w-3.5" /></button>
                          <button onClick={() => setDeleteConfirm(null)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/10"><X className="h-3.5 w-3.5" /></button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(t.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></button>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg bg-card-alt p-3 border border-border">
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" />
                        <span className="text-sm text-secondary-foreground font-mono">{t.subdomain}.fixflow.app</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {t.unit || "N/A"}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{t.phone}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
