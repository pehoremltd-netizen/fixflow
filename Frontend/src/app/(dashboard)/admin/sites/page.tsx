"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Plus, Building2, MapPin, Loader2,
  Search, Globe, CheckCircle2, XCircle, Eye, Trash2,
  AlertTriangle, ToggleLeft, ToggleRight,
} from "lucide-react";
import { stores, getOrganizationId } from "@/lib/store/offline-store";

interface Site {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  organization_id?: string;
  created_at?: string;
  updated_at?: string;
}

function formatCoords(lat: number, lng: number) {
  return `${lat >= 0 ? "N" : "S"} ${Math.abs(lat).toFixed(4)}, ${lng >= 0 ? "E" : "W"} ${Math.abs(lng).toFixed(4)}`;
}

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  // Add modal
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // Detail modal
  const [detailSite, setDetailSite] = useState<Site | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Search
  const [search, setSearch] = useState("");

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadSites = () => {
    try {
      const data = stores.sites.getAll() as Site[];
      setSites(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSites();
  }, []);

  const filtered = useMemo(() => {
    if (!search) return sites;
    const q = search.toLowerCase();
    return sites.filter((s) =>
      s.name.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
    );
  }, [sites, search]);

  const totalCount = sites.length;
  const activeCount = sites.filter((s) => s.is_active).length;
  const inactiveCount = sites.filter((s) => !s.is_active).length;

  const resetForm = () => {
    setName(""); setAddress(""); setCity(""); setState(""); setPostalCode("");
    setLatitude(""); setLongitude("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const orgId = getOrganizationId();
      stores.sites.create({
        name: name.trim(),
        address: `${address.trim()}, ${city.trim()}, ${state.trim()} ${postalCode.trim()}`,
        latitude: parseFloat(latitude) || 0,
        longitude: parseFloat(longitude) || 0,
        is_active: true,
        organization_id: orgId,
      });
      resetForm();
      setAddOpen(false);
      loadSites();
      showToast("Site registered successfully", "success");
    } catch {
      showToast("Failed to register site", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = (site: Site) => {
    stores.sites.update(site.id, { is_active: !site.is_active });
    loadSites();
    if (detailSite?.id === site.id) {
      setDetailSite({ ...site, is_active: !site.is_active });
    }
    showToast(`${site.name} ${site.is_active ? "deactivated" : "activated"}`, "success");
  };

  const handleDelete = (id: string) => {
    stores.sites.delete(id);
    loadSites();
    setDeleteConfirm(null);
    setDetailOpen(false);
    setDetailSite(null);
    showToast("Site deleted", "success");
  };

  return (
    <div className="space-y-6">
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl text-sm font-medium ${
            toast.type === "success" ? "bg-success/10 border-success/30 text-success" : "bg-[var(--color-destructive)]/10 border-[var(--color-destructive)]/30 text-destructive"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {toast.message}
        </motion.div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Sites & Facilities</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage all facilities, buildings, and locations
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
              <Plus className="h-4 w-4" /> Add Site
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg border-border bg-card text-foreground mx-4 sm:mx-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">Register New Facility</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">Site Name</Label>
                  <Input className="border-border bg-card-alt text-foreground" placeholder="Building name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">Status</Label>
                  <div className="flex h-10 items-center text-sm text-muted-foreground bg-card-alt rounded-lg border border-border px-3">
                    Active (auto)
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-secondary-foreground">Address</Label>
                <Input className="border-border bg-card-alt text-foreground" placeholder="Street address" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">City</Label>
                  <Input className="border-border bg-card-alt text-foreground" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">State</Label>
                  <Input className="border-border bg-card-alt text-foreground" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">Postal Code</Label>
                  <Input className="border-border bg-card-alt text-foreground" placeholder="ZIP" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-semibold mb-3 text-secondary-foreground">GPS Configuration</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-secondary-foreground">Latitude</Label>
                    <Input type="number" step="any" placeholder="40.7128" value={latitude} onChange={(e) => setLatitude(e.target.value)} className="border-border bg-card-alt text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-secondary-foreground">Longitude</Label>
                    <Input type="number" step="any" placeholder="-74.0060" value={longitude} onChange={(e) => setLongitude(e.target.value)} className="border-border bg-card-alt text-foreground" />
                  </div>
                </div>
                <div className="space-y-2 mt-3">
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={submitting}>
                {submitting ? "Registering..." : "Register Facility"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Total Sites", value: totalCount, icon: Building2, color: "var(--color-text-muted)" },
          { label: "Active", value: activeCount, icon: CheckCircle2, color: "var(--color-success)" },
          { label: "Inactive", value: inactiveCount, icon: XCircle, color: "var(--color-destructive)" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-xs">{s.label}</p>
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1 min-w-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sites..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-card-alt border border-border text-foreground text-sm placeholder:text-text-subtle outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      {/* SITES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Building2 size={48} className="mx-auto text-text-tertiary mb-4" />
            <p className="text-muted-foreground">{search ? "No sites match your search" : "No sites yet. Add one to get started."}</p>
          </div>
        ) : (
          filtered.map((site, i) => (
            <motion.div
              key={site.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border hover:border-input transition-all cursor-pointer overflow-hidden"
              onClick={() => { setDetailSite(site); setDetailOpen(true); }}
            >
              {/* Top accent bar */}
              <div className={`h-1 ${site.is_active ? "bg-success" : "bg-muted-foreground"}`} />

              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground text-sm truncate">{site.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">{site.address}</p>
                    </div>
                  </div>
                  <Badge variant={site.is_active ? "success" : "secondary"} className="shrink-0 text-[10px] px-2 py-0.5">
                    {site.is_active ? "active" : "inactive"}
                  </Badge>
                </div>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-primary" />
                    <span className="truncate">{formatCoords(site.latitude, site.longitude)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {detailOpen && detailSite && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60"
            onClick={() => setDetailOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-card rounded-2xl border border-border p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{detailSite.name}</h2>
                    <p className="text-muted-foreground text-sm">{detailSite.id}</p>
                  </div>
                </div>
                <button onClick={() => setDetailOpen(false)} className="h-8 w-8 rounded-lg bg-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><XCircle size={16} /></button>
              </div>

              <div className="space-y-4">
                <div className="bg-card-alt rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">Status</span>
                    <Badge variant={detailSite.is_active ? "success" : "secondary"}>
                      {detailSite.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Address</span>
                    <p className="text-foreground text-sm mt-0.5">{detailSite.address}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-muted-foreground text-xs">Latitude</span>
                      <p className="text-foreground text-sm mt-0.5">{detailSite.latitude.toFixed(4)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Longitude</span>
                      <p className="text-foreground text-sm mt-0.5">{detailSite.longitude.toFixed(4)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleToggleActive(detailSite)}
                    className={`flex-1 h-10 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      detailSite.is_active
                        ? "bg-[var(--color-destructive)]/10 text-destructive hover:bg-[var(--color-destructive)]/20"
                        : "bg-success/10 text-success hover:bg-success/20"
                    }`}
                  >
                    {detailSite.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    {detailSite.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => { setDeleteConfirm(detailSite.id); }}
                    className="flex-1 h-10 rounded-lg bg-[var(--color-destructive)]/10 text-destructive text-sm hover:bg-[var(--color-destructive)]/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRM */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-card rounded-2xl border border-border p-6 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <AlertTriangle size={32} className="mx-auto text-destructive mb-3" />
              <h3 className="text-foreground font-semibold mb-1">Delete Site?</h3>
              <p className="text-muted-foreground text-sm mb-5">This action cannot be undone. All data associated with this site will remain but the site will be removed.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 h-10 rounded-lg bg-border text-foreground text-sm hover:bg-accent transition-colors">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 h-10 rounded-lg bg-[var(--color-destructive)] text-foreground text-sm hover:bg-destructive/90 transition-colors">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
