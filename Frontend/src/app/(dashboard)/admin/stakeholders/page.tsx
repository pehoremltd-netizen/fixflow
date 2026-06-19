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
import { Plus, Briefcase, Globe, Copy, ExternalLink, Trash2, Loader2 } from "lucide-react";

interface Stakeholder {
  id: string;
  name: string;
  contact: string;
  email: string;
  portal: string;
  status: "active" | "inactive";
}

const STORAGE_KEY = "fixflow-stakeholders";

function getItems(): Stakeholder[] {
  if (typeof window === "undefined") return [];
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
}
function setItems(data: Stakeholder[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function seed() {
  if (getItems().length === 0) {
    setItems([
      { id: "sh-1", name: "City Properties Inc.", contact: "Robert Johnson", email: "robert@cityprops.com", portal: "cityprops.fixflow.com", status: "active" },
      { id: "sh-2", name: "Green Valley Estates", contact: "Linda Green", email: "linda@greenvalley.com", portal: "greenvalley.fixflow.com", status: "active" },
      { id: "sh-3", name: "Metro Commercial REIT", contact: "David Kim", email: "david@metroreit.com", portal: "metroreit.fixflow.com", status: "active" },
      { id: "sh-4", name: "Summit Property Group", contact: "Sarah Connor", email: "sarah@summitpg.com", portal: "summit.fixflow.com", status: "inactive" },
    ]);
  }
}

export default function StakeholdersPage() {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => { seed(); setStakeholders(getItems()); setLoading(false); }, []);

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 2500); return () => clearTimeout(t); } }, [toast]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim() || !email.trim() || !subdomain.trim()) return;
    setSubmitting(true);
    const created: Stakeholder = {
      id: `sh-${Date.now()}`,
      name: name.trim(),
      contact: contact.trim(),
      email: email.trim(),
      portal: `${subdomain.trim().toLowerCase()}.fixflow.com`,
      status: "active",
    };
    const updated = [...stakeholders, created];
    setItems(updated);
    setStakeholders(updated);
    setName(""); setContact(""); setEmail(""); setSubdomain("");
    setOpen(false);
    setSubmitting(false);
    setToast("Stakeholder created");
  };

  const handleCopy = async (portal: string) => {
    try {
      await navigator.clipboard.writeText(`https://${portal}`);
      setCopiedId(portal);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const handleDelete = (id: string) => {
    const updated = stakeholders.filter((s) => s.id !== id);
    setItems(updated);
    setStakeholders(updated);
    setToast("Stakeholder removed");
  };

  const handleToggleStatus = (id: string) => {
    const updated = stakeholders.map((s) => s.id === id ? { ...s, status: s.status === "active" ? "inactive" as const : "active" as const } : s);
    setItems(updated);
    setStakeholders(updated);
  };

  return (
    <div className="space-y-6">
      {toast && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed top-4 right-4 z-50 bg-success/10 border border-success/30 text-success px-4 py-2 rounded-xl text-sm">
          {toast}
        </motion.div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stakeholder Management</h1>
          <p className="text-muted-foreground">Manage stakeholder portals and access</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="h-4 w-4" /> Add Stakeholder</Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-card text-foreground sm:max-w-md">
            <DialogHeader><DialogTitle className="text-foreground">Create Stakeholder Portal</DialogTitle></DialogHeader>
            <form className="space-y-4" onSubmit={handleCreate}>
              <div className="space-y-2">
                <Label className="text-secondary-foreground">Company Name</Label>
                <Input className="border-border bg-card-alt text-foreground" value={name} onChange={(e) => setName(e.target.value)} placeholder="Company name" required />
              </div>
              <div className="space-y-2">
                <Label className="text-secondary-foreground">Contact Person</Label>
                <Input className="border-border bg-card-alt text-foreground" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Full name" required />
              </div>
              <div className="space-y-2">
                <Label className="text-secondary-foreground">Email</Label>
                <Input className="border-border bg-card-alt text-foreground" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" required />
              </div>
              <div className="space-y-2">
                <Label className="text-secondary-foreground">Portal Subdomain</Label>
                <div className="flex items-center gap-2">
                  <Input className="border-border bg-card-alt text-foreground flex-1" value={subdomain} onChange={(e) => setSubdomain(e.target.value)} placeholder="companyname" required />
                  <span className="text-sm text-muted-foreground shrink-0">.fixflow.com</span>
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={submitting}>
                {submitting ? <span className="mr-2"><Loader2 className="h-4 w-4 animate-spin inline" /></span> : null}Create Portal
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : stakeholders.length === 0 ? (
        <p className="text-muted-foreground text-sm py-12 text-center">No stakeholders yet.</p>
      ) : (
        <div className="space-y-4">
          {stakeholders.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="border-border bg-input-bg transition-all duration-200 hover:-translate-y-0.5 [box-shadow:0_8px_24px_rgba(0,0,0,0.6),inset_0_0_0_1px_rgba(255,255,255,0.05)] hover:[box-shadow:0_12px_32px_rgba(0,0,0,0.7),inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Briefcase className="h-6 w-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground">{s.name}</h3>
                          <Badge variant={s.status === "active" ? "success" : "secondary"} className="text-[10px]">{s.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{s.contact}</p>
                        <p className="text-sm text-muted-foreground">{s.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-start">
                      <button onClick={() => handleToggleStatus(s.id)} className="px-3 py-1.5 rounded-md text-xs border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                        {s.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-md border border-border text-muted-foreground hover:text-red-400 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg bg-background/50 border border-border p-3">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-mono text-foreground">{s.portal}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground hover:text-foreground" onClick={() => handleCopy(s.portal)}>
                        <Copy className="h-3 w-3" /> {copiedId === s.portal ? "Copied!" : "Copy"}
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground hover:text-foreground" onClick={() => window.open(`https://${s.portal}`, "_blank")}>
                        <ExternalLink className="h-3 w-3" /> Open
                      </Button>
                    </div>
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
