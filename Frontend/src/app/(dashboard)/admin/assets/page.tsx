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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  Brain,
  Calendar,
  Wrench,
  FileText,
  MapPin,
  Building2,
  Shield,
  Activity,
} from "lucide-react";
import {
  getAssets,
  addAsset,
  updateAsset,
  deleteAsset,
  Asset,
  AssetCondition,
  AssetStatus,
} from "@/lib/store/assets";
import { cn } from "@/lib/utils";

const conditionColors: Record<AssetCondition, string> = {
  Excellent: "bg-success/10 text-success border-success/30",
  Good: "bg-info/10 text-info border-info/30",
  Fair: "bg-mustard/10 text-mustard border-mustard/30",
  Poor: "bg-[var(--color-purple)]/10 text-[var(--color-purple)] border-[var(--color-purple)]/30",
  Critical: "bg-destructive/10 text-destructive border-destructive/30",
};

const conditionBg: Record<AssetCondition, string> = {
  Excellent: "bg-success",
  Good: "bg-info",
  Fair: "bg-mustard",
  Poor: "bg-[var(--color-purple)]",
  Critical: "bg-destructive",
};

const categories = ["HVAC", "Electrical", "Plumbing", "Mechanical", "Fire Safety", "Security"];



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

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [conditionFilter, setConditionFilter] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [detailTab, setDetailTab] = useState("details");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("HVAC");
  const [formLocation, setFormLocation] = useState("");
  const [formSerialNo, setFormSerialNo] = useState("");
  const [formModel, setFormModel] = useState("");
  const [formManufacturer, setFormManufacturer] = useState("");
  const [formPurchaseDate, setFormPurchaseDate] = useState("");
  const [formWarrantyExpiry, setFormWarrantyExpiry] = useState("");
  const [formCondition, setFormCondition] = useState<AssetCondition>("Good");
  const [formLastService, setFormLastService] = useState("");
  const [formNextService, setFormNextService] = useState("");
  const [formStatus, setFormStatus] = useState<AssetStatus>("active");
  const [formNotes, setFormNotes] = useState("");

  const showToast = useCallback((message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
  }, []);

  const refreshData = useCallback(() => {
    setAssets(getAssets());
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const filtered = assets.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase()) ||
      a.serialNo.toLowerCase().includes(search.toLowerCase()) ||
      a.model.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || a.category === categoryFilter;
    const matchesLocation = locationFilter === "all" || a.location === locationFilter;
    const matchesCondition = conditionFilter === "all" || a.condition === conditionFilter;
    return matchesSearch && matchesCategory && matchesLocation && matchesCondition;
  });

  const totalAssets = assets.length;
  const criticalCount = assets.filter(a => a.condition === "Critical").length;
  const warrantyExpiring = assets.filter(a => {
    const expiry = new Date(a.warrantyExpiry);
    const now = new Date();
    const diff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 30;
  }).length;
  const dueForService = assets.filter(a => {
    const next = new Date(a.nextService);
    const now = new Date();
    const diff = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 7;
  }).length;

  const handleAdd = () => {
    if (!formName.trim() || !formLocation.trim() || !formSerialNo.trim() || !formModel.trim() || !formPurchaseDate) {
      showToast("Please fill all required fields", "error");
      return;
    }
    addAsset({
      name: formName,
      category: formCategory,
      location: formLocation,
      serialNo: formSerialNo,
      model: formModel,
      manufacturer: formManufacturer,
      purchaseDate: formPurchaseDate,
      warrantyExpiry: formWarrantyExpiry,
      condition: formCondition,
      lastService: formLastService,
      nextService: formNextService,
      status: formStatus,
      notes: formNotes,
    });
    refreshData();
    setCreateOpen(false);
    setFormName(""); setFormCategory("HVAC"); setFormLocation(""); setFormSerialNo("");
    setFormModel(""); setFormManufacturer(""); setFormPurchaseDate(""); setFormWarrantyExpiry("");
    setFormCondition("Good"); setFormLastService(""); setFormNextService("");
    setFormStatus("active"); setFormNotes("");
    showToast("Asset added successfully", "success");
  };

  const handleDelete = (id: string) => {
    deleteAsset(id);
    refreshData();
    setDeleteConfirm(null);
    setDetailOpen(false);
    setSelectedAsset(null);
    showToast("Asset deleted", "success");
  };

  const uniqueLocations = [...new Set(assets.map(a => a.location))].sort();
  const uniqueCategories = [...new Set(assets.map(a => a.category))].sort();

  const summaryCards = [
    { title: "Total Assets", value: totalAssets, icon: Package, color: "text-info" },
    { title: "Critical Condition", value: criticalCount, icon: AlertTriangle, color: "text-destructive" },
    { title: "Warranty Expiring", value: warrantyExpiring, icon: Shield, color: "text-mustard" },
    { title: "Due for Service", value: dueForService, icon: Activity, color: "text-primary" },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Asset Management</h1>
          <p className="text-secondary-foreground">Track and manage all facility assets</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1.5 text-xs border-primary/30 text-primary">
            <Brain className="h-3.5 w-3.5 text-primary" />
            AI Health Monitoring
          </Badge>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Add Asset
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl border-border bg-card">
              <DialogHeader>
                <DialogTitle className="text-foreground">Register New Asset</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleAdd(); }}>
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">Asset Name *</Label>
                  <Input placeholder="Asset name" value={formName} onChange={(e) => setFormName(e.target.value)} className="border-border bg-background text-foreground placeholder:text-muted-foreground" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-secondary-foreground">Category *</Label>
                    <Select value={formCategory} onValueChange={setFormCategory}>
                      <SelectTrigger className="border-border bg-background text-foreground"><SelectValue /></SelectTrigger>
                      <SelectContent className="border-border bg-card">
                        {categories.map((c) => (
                          <SelectItem key={c} value={c} className="text-foreground focus:text-primary focus:bg-primary/10">{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-secondary-foreground">Location *</Label>
                    <Input placeholder="Location" value={formLocation} onChange={(e) => setFormLocation(e.target.value)} className="border-border bg-background text-foreground placeholder:text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-secondary-foreground">Condition</Label>
                    <Select value={formCondition} onValueChange={(v) => setFormCondition(v as AssetCondition)}>
                      <SelectTrigger className="border-border bg-background text-foreground"><SelectValue /></SelectTrigger>
                      <SelectContent className="border-border bg-card">
                        {(["Excellent", "Good", "Fair", "Poor", "Critical"] as AssetCondition[]).map((c) => (
                          <SelectItem key={c} value={c} className="text-foreground focus:text-primary focus:bg-primary/10">{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-secondary-foreground">Serial Number *</Label>
                    <Input placeholder="Serial number" value={formSerialNo} onChange={(e) => setFormSerialNo(e.target.value)} className="border-border bg-background text-foreground placeholder:text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-secondary-foreground">Model *</Label>
                    <Input placeholder="Model number" value={formModel} onChange={(e) => setFormModel(e.target.value)} className="border-border bg-background text-foreground placeholder:text-muted-foreground" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-secondary-foreground">Manufacturer</Label>
                    <Input placeholder="Manufacturer" value={formManufacturer} onChange={(e) => setFormManufacturer(e.target.value)} className="border-border bg-background text-foreground placeholder:text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-secondary-foreground">Status</Label>
                    <Select value={formStatus} onValueChange={(v) => setFormStatus(v as AssetStatus)}>
                      <SelectTrigger className="border-border bg-background text-foreground"><SelectValue /></SelectTrigger>
                      <SelectContent className="border-border bg-card">
                        <SelectItem value="active" className="text-foreground focus:text-primary focus:bg-primary/10">Active</SelectItem>
                        <SelectItem value="maintenance" className="text-foreground focus:text-primary focus:bg-primary/10">Maintenance</SelectItem>
                        <SelectItem value="retired" className="text-foreground focus:text-primary focus:bg-primary/10">Retired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-secondary-foreground">Purchase Date *</Label>
                    <Input type="date" value={formPurchaseDate} onChange={(e) => setFormPurchaseDate(e.target.value)} className="border-border bg-background text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-secondary-foreground">Warranty Expiry</Label>
                    <Input type="date" value={formWarrantyExpiry} onChange={(e) => setFormWarrantyExpiry(e.target.value)} className="border-border bg-background text-foreground" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-secondary-foreground">Last Service</Label>
                    <Input type="date" value={formLastService} onChange={(e) => setFormLastService(e.target.value)} className="border-border bg-background text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-secondary-foreground">Next Service</Label>
                    <Input type="date" value={formNextService} onChange={(e) => setFormNextService(e.target.value)} className="border-border bg-background text-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">Notes</Label>
                  <textarea className="flex min-h-[60px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none" placeholder="Additional notes..." value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />
                </div>
                <Button type="submit" className="w-full">Register Asset</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
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
          <Input className="pl-10 max-w-md" placeholder="Search assets..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-36 border-border bg-card text-foreground"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent className="border-border bg-card">
            <SelectItem value="all" className="text-foreground focus:text-primary focus:bg-primary/10">All Categories</SelectItem>
            {uniqueCategories.map((c) => (
              <SelectItem key={c} value={c} className="text-foreground focus:text-primary focus:bg-primary/10">{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-44 border-border bg-card text-foreground"><SelectValue placeholder="Location" /></SelectTrigger>
          <SelectContent className="border-border bg-card">
            <SelectItem value="all" className="text-foreground focus:text-primary focus:bg-primary/10">All Locations</SelectItem>
            {uniqueLocations.map((l) => (
              <SelectItem key={l} value={l} className="text-foreground focus:text-primary focus:bg-primary/10">{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={conditionFilter} onValueChange={setConditionFilter}>
          <SelectTrigger className="w-36 border-border bg-card text-foreground"><SelectValue placeholder="Condition" /></SelectTrigger>
          <SelectContent className="border-border bg-card">
            <SelectItem value="all" className="text-foreground focus:text-primary focus:bg-primary/10">All Conditions</SelectItem>
            {(["Excellent", "Good", "Fair", "Poor", "Critical"] as AssetCondition[]).map((c) => (
              <SelectItem key={c} value={c} className="text-foreground focus:text-primary focus:bg-primary/10">{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-sm text-muted-foreground">
                <th className="text-left p-4 font-medium">Asset ID</th>
                <th className="text-left p-4 font-medium">Name</th>
                <th className="text-left p-4 font-medium">Category</th>
                <th className="text-left p-4 font-medium">Location</th>
                <th className="text-left p-4 font-medium">Condition</th>
                <th className="text-left p-4 font-medium">Last Service</th>
                <th className="text-left p-4 font-medium">Next Service</th>
                <th className="text-left p-4 font-medium">Warranty Expiry</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((asset, i) => (
                <motion.tr
                  key={asset.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-border last:border-0 hover:bg-foreground/5 transition-colors cursor-pointer"
                  onClick={() => { setSelectedAsset(asset); setDetailOpen(true); setDetailTab("details"); }}
                >
                  <td className="p-4 text-sm font-mono text-primary">{asset.id}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Package className="h-4 w-4 text-primary" />
                        {asset.condition === "Critical" && (
                          <motion.div
                            className="absolute -top-1 -right-1"
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <AlertTriangle className="h-3 w-3 text-destructive" />
                          </motion.div>
                        )}
                      </div>
                      <span className="font-medium text-sm text-foreground">{asset.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-secondary-foreground">{asset.category}</td>
                  <td className="p-4 text-sm text-secondary-foreground">{asset.location}</td>
                  <td className="p-4">
                    <Badge variant="outline" className={cn("text-xs", conditionColors[asset.condition])}>
                      <span className={cn("h-1.5 w-1.5 rounded-full mr-1.5", conditionBg[asset.condition])} />
                      {asset.condition}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm text-secondary-foreground">{asset.lastService || "—"}</td>
                  <td className="p-4 text-sm text-foreground">{asset.nextService || "—"}</td>
                  <td className="p-4 text-sm text-secondary-foreground">{asset.warrantyExpiry || "—"}</td>
                  <td className="p-4">
                    <Button
                      variant="ghost" size="sm"
                      className="text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => { setSelectedAsset(asset); setDetailOpen(true); setDetailTab("details"); }}
                    >
                      View
                    </Button>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No assets found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl border-border bg-card">
          {selectedAsset && (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground flex items-center gap-2">
                  {selectedAsset.id} — {selectedAsset.name}
                </DialogTitle>
              </DialogHeader>
              <Tabs value={detailTab} onValueChange={setDetailTab}>
                <TabsList className="bg-secondary">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="service">Service History</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Category</p>
                      <p className="text-sm text-foreground flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-primary" />{selectedAsset.category}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Location</p>
                      <p className="text-sm text-foreground flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-primary" />{selectedAsset.location}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Serial No</p>
                      <p className="text-sm text-foreground font-mono">{selectedAsset.serialNo}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Model</p>
                      <p className="text-sm text-foreground">{selectedAsset.model}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Manufacturer</p>
                      <p className="text-sm text-foreground">{selectedAsset.manufacturer || "—"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Condition</p>
                      <Badge variant="outline" className={cn("text-xs", conditionColors[selectedAsset.condition])}>
                        <span className={cn("h-1.5 w-1.5 rounded-full mr-1.5", conditionBg[selectedAsset.condition])} />
                        {selectedAsset.condition}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Purchase Date</p>
                      <p className="text-sm text-foreground">{selectedAsset.purchaseDate}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Warranty Expiry</p>
                      <p className="text-sm text-foreground">{selectedAsset.warrantyExpiry || "—"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
                      <Badge variant={
                        selectedAsset.status === "active" ? "success" :
                        selectedAsset.status === "maintenance" ? "warning" : "secondary"
                      }>
                        {selectedAsset.status}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Last Service</p>
                      <p className="text-sm text-foreground">{selectedAsset.lastService || "—"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Next Service</p>
                      <p className="text-sm text-foreground">{selectedAsset.nextService || "—"}</p>
                    </div>
                  </div>
                  {selectedAsset.notes && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Notes</p>
                      <p className="text-sm text-secondary-foreground bg-background rounded-lg p-3 border border-border">{selectedAsset.notes}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="service" className="space-y-4">
                  <div className="bg-background rounded-lg p-4 border border-border">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                          <Wrench className="h-4 w-4 text-success" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Last Service</p>
                          <p className="text-xs text-muted-foreground">{selectedAsset.lastService || "No service recorded"}</p>
                        </div>
                      </div>
                      <div className="border-t border-border" />
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Next Service Due</p>
                          <p className="text-xs text-muted-foreground">{selectedAsset.nextService || "Not scheduled"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                  <div className="bg-background rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">No documents uploaded</p>
                        <p className="text-xs text-muted-foreground">Upload manuals, warranties, or inspection reports</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div />
                {deleteConfirm === selectedAsset.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-destructive">Confirm delete?</span>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(selectedAsset.id)}>Yes</Button>
                    <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)} className="border-border">No</Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteConfirm(selectedAsset.id)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
