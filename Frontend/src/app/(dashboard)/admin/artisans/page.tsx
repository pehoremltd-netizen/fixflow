"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { fetchArtisans, createArtisan, updateArtisan, deleteArtisan } from "@/lib/api/artisans";
import type { Artisan } from "@/types";
import { Users, Plus, Pencil, Trash2, Search, RefreshCw, Wrench, Phone, MapPin } from "lucide-react";

const TRADES = ["Plumber", "Electrician", "Carpenter", "Welder", "Mason", "Painter", "AC Technician", "Mechanic", "Generator Technician", "Other"];

export default function ArtisansPage() {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Artisan | null>(null);
  const [form, setForm] = useState({ name: "", trade: "", phone: "", email: "", site: "", bank_name: "", account_number: "", account_holder_name: "" });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setArtisans(await fetchArtisans());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", trade: "", phone: "", email: "", site: "", bank_name: "", account_number: "", account_holder_name: "" });
    setShowForm(true);
  };

  const openEdit = (a: Artisan) => {
    setEditing(a);
    setForm({ name: a.name, trade: a.trade, phone: a.phone, email: a.email, site: a.site, bank_name: a.bank_name, account_number: a.account_number, account_holder_name: a.account_holder_name });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (editing) {
      await updateArtisan(editing.id, form);
    } else {
      await createArtisan(form);
    }
    setShowForm(false);
    await load();
  };

  const handleToggleActive = async (a: Artisan) => {
    await updateArtisan(a.id, { is_active: !a.is_active });
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this artisan?")) return;
    await deleteArtisan(id);
    await load();
  };

  const filtered = artisans.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.trade.toLowerCase().includes(search.toLowerCase()) ||
    a.site.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Artisan Record</h1>
          <p className="text-sm text-text-tertiary">Manage artisans and technicians</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, trade, or site..." className="pl-9 text-sm border-border bg-card text-foreground" />
        </div>
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
        <Button onClick={openAdd} className="gap-1.5"><Plus className="h-4 w-4" /> Add Artisan</Button>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground text-sm flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            All Artisans ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-10 text-text-tertiary text-sm">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-text-tertiary"><Users className="h-8 w-8 mx-auto mb-2 opacity-30" /><p className="text-xs">No artisans found</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-text-tertiary text-xs uppercase">
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Trade</th>
                    <th className="text-left py-3 px-4 font-medium">Phone</th>
                    <th className="text-left py-3 px-4 font-medium">Email</th>
                    <th className="text-left py-3 px-4 font-medium">Site</th>
                    <th className="text-left py-3 px-4 font-medium">Bank</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a, i) => (
                    <tr key={a.id} className={cn("border-b border-card-alt hover:bg-card-alt transition-colors", i % 2 === 0 && "bg-card-alt/30")}>
                      <td className="py-3 px-4 font-medium text-foreground">{a.name}</td>
                      <td className="py-3 px-4 text-text-tertiary">{a.trade || "—"}</td>
                      <td className="py-3 px-4 text-text-tertiary">{a.phone || "—"}</td>
                      <td className="py-3 px-4 text-text-tertiary">{a.email || "—"}</td>
                      <td className="py-3 px-4 text-text-tertiary">{a.site || "—"}</td>
                      <td className="py-3 px-4 text-text-tertiary text-xs">{a.bank_name ? `${a.bank_name} (••${a.account_number?.slice(-4)})` : "—"}</td>
                      <td className="py-3 px-4">
                        <button onClick={() => handleToggleActive(a)}>
                          <Badge className={cn("text-[10px] cursor-pointer", a.is_active ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20")}>
                            {a.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-text-subtle hover:text-primary" onClick={() => openEdit(a)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-text-subtle hover:text-destructive" onClick={() => handleDelete(a.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-card border-input sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              {editing ? "Edit Artisan" : "Add Artisan"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-text-tertiary block mb-1">Name *</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="text-sm border-border bg-card text-foreground" />
            </div>
            <div>
              <label className="text-xs text-text-tertiary block mb-1">Trade</label>
              <select value={form.trade} onChange={(e) => setForm({ ...form, trade: e.target.value })} className="w-full h-9 rounded-md border border-border bg-card text-sm text-foreground px-3">
                <option value="">Select trade...</option>
                {TRADES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-tertiary block mb-1">Phone</label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" className="text-sm border-border bg-card text-foreground" />
            </div>
            <div>
              <label className="text-xs text-text-tertiary block mb-1">Email</label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email address" className="text-sm border-border bg-card text-foreground" />
            </div>
            <div>
              <label className="text-xs text-text-tertiary block mb-1">Site</label>
              <Input value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })} placeholder="Assigned site" className="text-sm border-border bg-card text-foreground" />
            </div>
            <div className="border-t border-border pt-3 mt-1">
              <p className="text-xs font-medium text-foreground mb-2">Bank Account Details</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-text-tertiary block mb-1">Bank Name</label>
                  <Input value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} placeholder="e.g. Access Bank" className="text-sm border-border bg-card text-foreground" />
                </div>
                <div>
                  <label className="text-xs text-text-tertiary block mb-1">Account Number</label>
                  <Input value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} placeholder="e.g. 0123456789" className="text-sm border-border bg-card text-foreground" />
                </div>
                <div>
                  <label className="text-xs text-text-tertiary block mb-1">Account Holder Name</label>
                  <Input value={form.account_holder_name} onChange={(e) => setForm({ ...form, account_holder_name: e.target.value })} placeholder="Name on account" className="text-sm border-border bg-card text-foreground" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={!form.name.trim()}>{editing ? "Update" : "Add"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
