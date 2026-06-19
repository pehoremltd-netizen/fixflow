"use client";

import { useState, useMemo, useEffect } from "react";
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
  Plus,
  Trash2,
  Search,
  Loader2,
  FileText,
  Printer,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Package,
  Building2,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getRequisitions,
  createRequisition,
  updateRequisition,
  deleteRequisition,
  calcItemTotal,
  calcGrandTotal,
  type Requisition,
  type RequisitionItem,
  type RequisitionStatus,
} from "@/lib/store/requisitions";

const statusColors: Record<RequisitionStatus, string> = {
  Draft: "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/30",
  Submitted: "bg-info/10 text-info border-info/30",
  Approved: "bg-success/10 text-success border-success/30",
  Rejected: "bg-destructive/10 text-destructive border-destructive/30",
};

const statusIcons: Record<RequisitionStatus, typeof Clock> = {
  Draft: Clock,
  Submitted: Send,
  Approved: CheckCircle2,
  Rejected: XCircle,
};

export default function RequisitionsPage() {
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<Requisition | null>(null);

  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formSupplier, setFormSupplier] = useState("");
  const [formPurpose, setFormPurpose] = useState("");
  const [formItems, setFormItems] = useState<RequisitionItem[]>([]);

  useEffect(() => {
    setRequisitions(getRequisitions());
    setLoading(false);
  }, []);

  const refresh = () => {
    setRequisitions(getRequisitions());
  };

  const filtered = requisitions.filter(
    (r) =>
      r.refNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.supplier.toLowerCase().includes(search.toLowerCase()) ||
      r.purpose.toLowerCase().includes(search.toLowerCase())
  );

  const stats = useMemo(() => {
    const total = requisitions.length;
    const drafts = requisitions.filter((r) => r.status === "Draft").length;
    const submitted = requisitions.filter((r) => r.status === "Submitted").length;
    const approved = requisitions.filter((r) => r.status === "Approved").length;
    return { total, drafts, submitted, approved };
  }, [requisitions]);

  const addFormItem = () => {
    setFormItems([...formItems, { id: `new-${Date.now()}`, name: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeFormItem = (id: string) => {
    setFormItems(formItems.filter((item) => item.id !== id));
  };

  const updateFormItem = (id: string, field: keyof RequisitionItem, value: string | number) => {
    setFormItems(
      formItems.map((item) =>
        item.id === id ? { ...item, [field]: field === "name" ? value : Number(value) || 0 } : item
      )
    );
  };

  const formGrandTotal = useMemo(() => calcGrandTotal(formItems), [formItems]);

  const resetForm = () => {
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormSupplier("");
    setFormPurpose("");
    setFormItems([]);
  };

  const handleCreate = (status: RequisitionStatus) => {
    if (!formSupplier.trim() || !formPurpose.trim() || formItems.length === 0) return;
    createRequisition({
      date: formDate,
      supplier: formSupplier,
      purpose: formPurpose,
      status,
      items: formItems.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice) || 0,
        quantity: Number(item.quantity) || 1,
      })),
    });
    resetForm();
    setCreateOpen(false);
    refresh();
  };

  const handleStatusChange = (id: string, status: RequisitionStatus) => {
    updateRequisition(id, { status });
    refresh();
    setSelectedReq(getRequisitions().find((r) => r.id === id) || null);
  };

  const handleDelete = (id: string) => {
    deleteRequisition(id);
    refresh();
    setDetailOpen(false);
    setSelectedReq(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Materials Requisition</h1>
          <p className="text-secondary-foreground">Create and manage store requisitions with approval workflow</p>
        </div>
        <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New Requisition
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl border-border bg-card max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">New Materials Requisition</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">Date</Label>
                  <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="border-border bg-background text-foreground" />
                </div>
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">Supplier *</Label>
                  <Input placeholder="Supplier name" value={formSupplier} onChange={(e) => setFormSupplier(e.target.value)} className="border-border bg-background text-foreground placeholder:text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-secondary-foreground">Purpose / Notes *</Label>
                <textarea
                  placeholder="What are these materials for?"
                  value={formPurpose}
                  onChange={(e) => setFormPurpose(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-background/50 px-4 py-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Items</span>
                  <Button variant="ghost" size="sm" onClick={addFormItem} className="text-primary hover:text-primary hover:bg-primary/10">
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Item
                  </Button>
                </div>
                {formItems.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No items added yet. Click &quot;Add Item&quot; to start.
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {formItems.map((item, i) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-end gap-2"
                      >
                        <div className="flex-1 space-y-1">
                          <Label className="text-[10px] text-muted-foreground">Item</Label>
                          <Input
                            placeholder="Item name"
                            value={item.name}
                            onChange={(e) => updateFormItem(item.id, "name", e.target.value)}
                            className="border-border bg-background text-foreground placeholder:text-muted-foreground text-sm"
                          />
                        </div>
                        <div className="w-20 space-y-1">
                          <Label className="text-[10px] text-muted-foreground">Qty</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateFormItem(item.id, "quantity", e.target.value)}
                            className="border-border bg-background text-foreground text-sm text-center"
                          />
                        </div>
                        <div className="w-24 space-y-1">
                          <Label className="text-[10px] text-muted-foreground">Unit Price</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateFormItem(item.id, "unitPrice", e.target.value)}
                            className="border-border bg-background text-foreground text-sm text-right font-mono"
                          />
                        </div>
                        <div className="w-24 pt-5 text-right">
                          <span className="text-sm font-mono text-foreground">
                            ${calcItemTotal(item).toFixed(2)}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFormItem(item.id)}
                          className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0 mb-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between px-1">
                <span className="text-sm text-muted-foreground">{formItems.length} item{formItems.length !== 1 ? "s" : ""}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-secondary-foreground">Grand Total:</span>
                  <span className="text-xl font-bold text-primary font-mono">${formGrandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 border-border text-foreground hover:bg-foreground/5"
                  onClick={() => handleCreate("Draft")}
                  disabled={!formSupplier.trim() || !formPurpose.trim() || formItems.length === 0}
                >
                  <Clock className="h-4 w-4 mr-2" /> Save as Draft
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleCreate("Submitted")}
                  disabled={!formSupplier.trim() || !formPurpose.trim() || formItems.length === 0}
                >
                  <Send className="h-4 w-4 mr-2" /> Submit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs text-text-tertiary">Total Requisitions</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-muted-foreground">{stats.drafts}</p>
            <p className="text-xs text-text-tertiary">Draft</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-info">{stats.submitted}</p>
            <p className="text-xs text-text-tertiary">Submitted</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-success">{stats.approved}</p>
            <p className="text-xs text-text-tertiary">Approved</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by reference, supplier, or purpose..."
          className="pl-10 max-w-md border-border bg-card text-foreground placeholder:text-muted-foreground"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">All Requisitions ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">No requisitions found</p>
              <p className="text-sm mt-1">Click &quot;New Requisition&quot; to create one</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((req, i) => {
                const StatusIcon = statusIcons[req.status];
                const grandTotal = calcGrandTotal(req.items);
                return (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => { setSelectedReq(req); setDetailOpen(true); }}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-foreground/5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-primary font-medium">{req.refNumber}</span>
                          <Badge className={cn("text-[10px] px-1.5 py-0", statusColors[req.status])}>
                            <StatusIcon className="h-2.5 w-2.5 mr-1 inline" />
                            {req.status}
                          </Badge>
                        </div>
                        <p className="font-medium text-foreground truncate">{req.purpose}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{req.supplier}</span>
                          <span className="flex items-center gap-1"><Package className="h-3 w-3" />{req.items.length} items</span>
                          <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${grandTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground flex-shrink-0 text-right">
                      {req.date}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={(o) => { setDetailOpen(o); if (!o) setSelectedReq(null); }}>
        <DialogContent className="max-w-3xl border-border bg-card max-h-[90vh] overflow-y-auto print:max-w-full print:border-none print:bg-white print:shadow-none print:overflow-visible">
          {selectedReq && (
            <>
              <DialogHeader className="print:hidden">
                <DialogTitle className="text-foreground">Requisition Details</DialogTitle>
              </DialogHeader>

              {/* LETTERHEAD PREVIEW — Print-optimised with FixFlow branding */}
              <div id={`requisition-${selectedReq.id}`} className="print:bg-white print:text-black print:mx-0">
                {/* === LETTERHEAD HEADER === */}
                <div className="relative mb-8 print:mb-6">
                  {/* Top gold accent bar */}
                  <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-[#D4AF37] via-[#E1B000] to-[#D4AF37] mb-6 print:mb-5" />

                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#E1B000] shadow-lg print:shadow-none flex-shrink-0">
                        <Wrench className="h-7 w-7 text-black" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-foreground print:text-gray-900 tracking-tight">
                          Fix<span className="text-primary print:text-primary">Flow</span>
                        </h1>
                        <p className="text-[11px] text-muted-foreground print:text-muted-foreground uppercase tracking-[0.15em] font-medium">
                          Facility Management System
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="px-4 py-2 rounded-lg bg-primary/10 print:bg-gray-100 border border-primary/20 print:border-gray-300">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground print:text-muted-foreground">Requisition</p>
                        <p className="text-lg font-bold text-primary print:text-gray-900 font-mono tracking-tight">
                          {selectedReq.refNumber}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Decorative divider */}
                  <div className="mt-5 border-t border-border print:border-gray-300 relative">
                    <div className="absolute -top-px left-0 w-32 h-0.5 bg-primary print:bg-gray-400" />
                  </div>
                </div>

                {/* === INFO GRID === */}
                <div className="grid grid-cols-2 gap-6 mb-8 print:mb-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground print:text-muted-foreground font-medium mb-0.5">Supplier</p>
                      <p className="text-base font-semibold text-foreground print:text-gray-900">{selectedReq.supplier}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground print:text-muted-foreground font-medium mb-0.5">Date</p>
                      <p className="text-sm text-secondary-foreground print:text-gray-700">{selectedReq.date}</p>
                    </div>
                  </div>
                  <div className="space-y-3 text-right">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground print:text-muted-foreground font-medium mb-0.5">Status</p>
                      <Badge className={cn("text-[11px] px-3 py-0.5", statusColors[selectedReq.status])}>
                        {selectedReq.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* === PURPOSE / NOTES === */}
                {selectedReq.purpose && (
                  <div className="mb-8 print:mb-6 p-4 rounded-xl border border-border print:border-gray-300 bg-background/20 print:bg-gray-50">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground print:text-muted-foreground font-medium mb-1.5">
                      Purpose / Notes
                    </p>
                    <p className="text-sm text-foreground print:text-gray-800 leading-relaxed">{selectedReq.purpose}</p>
                  </div>
                )}

                {/* === ITEMS TABLE === */}
                <div className="mb-8 print:mb-6">
                  <div className="overflow-hidden rounded-xl border border-border print:border-gray-300">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-primary/10 print:bg-gray-100">
                          <th className="text-left py-3 px-4 font-semibold text-foreground print:text-gray-700 text-xs uppercase tracking-wider w-10">#</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground print:text-gray-700 text-xs uppercase tracking-wider">Item Description</th>
                          <th className="text-center py-3 px-4 font-semibold text-foreground print:text-gray-700 text-xs uppercase tracking-wider w-16">Qty</th>
                          <th className="text-right py-3 px-4 font-semibold text-foreground print:text-gray-700 text-xs uppercase tracking-wider w-28">Unit Price</th>
                          <th className="text-right py-3 px-4 font-semibold text-foreground print:text-gray-700 text-xs uppercase tracking-wider w-28">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedReq.items.map((item, idx) => (
                          <tr key={item.id} className={cn(
                            "border-t border-card-alt print:border-gray-200 transition-colors",
                            idx % 2 === 0 ? "bg-transparent" : "bg-white/[0.02] print:bg-gray-50/50"
                          )}>
                            <td className="py-2.5 px-4 text-muted-foreground print:text-muted-foreground text-xs">{String(idx + 1).padStart(2, "0")}</td>
                            <td className="py-2.5 px-4 text-foreground print:text-gray-900 font-medium">{item.name}</td>
                            <td className="py-2.5 px-4 text-center text-foreground print:text-gray-900">{item.quantity}</td>
                            <td className="py-2.5 px-4 text-right text-secondary-foreground print:text-gray-700 font-mono text-[13px]">
                              ${item.unitPrice.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-4 text-right text-foreground print:text-gray-900 font-mono font-semibold text-[13px]">
                              ${calcItemTotal(item).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Grand Total box */}
                  <div className="mt-4 flex justify-end">
                    <div className="w-72 rounded-xl border border-primary/30 print:border-gray-300 bg-primary/5 print:bg-gray-100 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-secondary-foreground print:text-gray-700 uppercase tracking-wider">
                          Grand Total
                        </span>
                        <span className="text-2xl font-bold text-primary print:text-gray-900 font-mono tracking-tight">
                          ${calcGrandTotal(selectedReq.items).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground print:text-muted-foreground mt-1 text-right">
                        {selectedReq.items.reduce((s, i) => s + i.quantity, 0)} units · {selectedReq.items.length} line items
                      </p>
                    </div>
                  </div>
                </div>

                {/* === SIGNATURE / APPROVAL STRIP === */}
                <div className="grid grid-cols-3 gap-6 mb-8 print:mb-6">
                  <div className="border-t border-border print:border-gray-300 pt-2">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground print:text-muted-foreground">Requested By</p>
                    <div className="h-8" />
                    <p className="text-xs text-text-subtle print:text-gray-400">Signature & Date</p>
                  </div>
                  <div className="border-t border-border print:border-gray-300 pt-2">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground print:text-muted-foreground">Approved By</p>
                    <div className="h-8" />
                    <p className="text-xs text-text-subtle print:text-gray-400">Signature & Date</p>
                  </div>
                  <div className="border-t border-border print:border-gray-300 pt-2">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground print:text-muted-foreground">Received By</p>
                    <div className="h-8" />
                    <p className="text-xs text-text-subtle print:text-gray-400">Signature & Date</p>
                  </div>
                </div>

                {/* === FOOTER === */}
                <div className="text-center pt-5 border-t border-border print:border-gray-300">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-primary print:bg-gray-300">
                      <Wrench className="h-3 w-3 text-black" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground print:text-muted-foreground">
                      Fix<span className="text-primary print:text-gray-600">Flow</span> CMMS
                    </span>
                  </div>
                  <p className="text-[10px] text-text-subtle print:text-gray-400">
                    Generated {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    &nbsp;·&nbsp; This is a system-generated document
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border print:hidden">
                <div className="flex items-center gap-2">
                  {selectedReq.status === "Draft" && (
                    <Button onClick={() => handleStatusChange(selectedReq.id, "Submitted")} className="gap-2">
                      <Send className="h-4 w-4" /> Submit
                    </Button>
                  )}
                  {selectedReq.status === "Submitted" && (
                    <>
                      <Button onClick={() => handleStatusChange(selectedReq.id, "Approved")} className="gap-2 bg-success hover:bg-success/90">
                        <CheckCircle2 className="h-4 w-4" /> Approve
                      </Button>
                      <Button onClick={() => handleStatusChange(selectedReq.id, "Rejected")} variant="destructive" className="gap-2">
                        <XCircle className="h-4 w-4" /> Reject
                      </Button>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="gap-2 border-border text-foreground hover:bg-foreground/5" onClick={handlePrint}>
                    <Printer className="h-4 w-4" /> Print / PDF
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(selectedReq.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
