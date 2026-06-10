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
} from "@/lib/assets";
import { cn } from "@/lib/utils";

const conditionColors: Record<AssetCondition, string> = {
  Excellent: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30",
  Good: "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30",
  Fair: "bg-[#E1B000]/10 text-[#E1B000] border-[#E1B000]/30",
  Poor: "bg-[#A855F7]/10 text-[#A855F7] border-[#A855F7]/30",
  Critical: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30",
};

const conditionBg: Record<AssetCondition, string> = {
  Excellent: "bg-[#22C55E]",
  Good: "bg-[#3B82F6]",
  Fair: "bg-[#E1B000]",
  Poor: "bg-[#A855F7]",
  Critical: "bg-[#EF4444]",
};

const categories = ["HVAC", "Electrical", "Plumbing", "Mechanical", "Fire Safety", "Security"];

const locations = [
  "Building A - Roof", "Building A - Basement", "Building A - Mechanical Room",
  "Building A - Electrical Room", "Building A - Elevator 1", "Building A - Kitchen",
  "Building A - Server Room", "Building A - Boiler Room",
  "Building B - Roof", "Building B - Security Room", "Building B - Pump Room",
  "Building B - Boiler Room", "Building B - Exterior", "Building B - Freight Elevator",
  "Parking Lot A", "All Buildings",
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
    { title: "Total Assets", value: totalAssets, icon: Package, color: "text-[#3B82F6]" },
    { title: "Critical Condition", value: criticalCount, icon: AlertTriangle, color: "text-[#EF4444]" },
    { title: "Warranty Expiring", value: warrantyExpiring, icon: Shield, color: "text-[#E1B000]" },
    { title: "Due for Service", value: dueForService, icon: Activity, color: "text-[#D4AF37]" },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Asset Management</h1>
          <p className="text-[#B8B8B8]">Track and manage all facility assets</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1.5 text-xs border-[#D4AF37]/30 text-[#D4AF37]">
            <Brain className="h-3.5 w-3.5 text-[#D4AF37]" />
            AI Health Monitoring
          </Badge>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Add Asset
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl border-[#222222] bg-[#161616]">
              <DialogHeader>
                <DialogTitle className="text-white">Register New Asset</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleAdd(); }}>
                <div className="space-y-2">
                  <Label className="text-[#B8B8B8]">Asset Name *</Label>
                  <Input placeholder="Asset name" value={formName} onChange={(e) => setFormName(e.target.value)} className="border-[#222222] bg-black text-white placeholder:text-[#7A7A7A]" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#B8B8B8]">Category *</Label>
                    <Select value={formCategory} onValueChange={setFormCategory}>
                      <SelectTrigger className="border-[#222222] bg-black text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="border-[#222222] bg-[#161616]">
                        {categories.map((c) => (
                          <SelectItem key={c} value={c} className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#B8B8B8]">Location *</Label>
                    <Select value={formLocation} onValueChange={setFormLocation}>
                      <SelectTrigger className="border-[#222222] bg-black text-white"><SelectValue placeholder="Location" /></SelectTrigger>
                      <SelectContent className="border-[#222222] bg-[#161616]">
                        {locations.map((l) => (
                          <SelectItem key={l} value={l} className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#B8B8B8]">Condition</Label>
                    <Select value={formCondition} onValueChange={(v) => setFormCondition(v as AssetCondition)}>
                      <SelectTrigger className="border-[#222222] bg-black text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="border-[#222222] bg-[#161616]">
                        {(["Excellent", "Good", "Fair", "Poor", "Critical"] as AssetCondition[]).map((c) => (
                          <SelectItem key={c} value={c} className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#B8B8B8]">Serial Number *</Label>
                    <Input placeholder="Serial number" value={formSerialNo} onChange={(e) => setFormSerialNo(e.target.value)} className="border-[#222222] bg-black text-white placeholder:text-[#7A7A7A]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#B8B8B8]">Model *</Label>
                    <Input placeholder="Model number" value={formModel} onChange={(e) => setFormModel(e.target.value)} className="border-[#222222] bg-black text-white placeholder:text-[#7A7A7A]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#B8B8B8]">Manufacturer</Label>
                    <Input placeholder="Manufacturer" value={formManufacturer} onChange={(e) => setFormManufacturer(e.target.value)} className="border-[#222222] bg-black text-white placeholder:text-[#7A7A7A]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#B8B8B8]">Status</Label>
                    <Select value={formStatus} onValueChange={(v) => setFormStatus(v as AssetStatus)}>
                      <SelectTrigger className="border-[#222222] bg-black text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="border-[#222222] bg-[#161616]">
                        <SelectItem value="active" className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">Active</SelectItem>
                        <SelectItem value="maintenance" className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">Maintenance</SelectItem>
                        <SelectItem value="retired" className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">Retired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#B8B8B8]">Purchase Date *</Label>
                    <Input type="date" value={formPurchaseDate} onChange={(e) => setFormPurchaseDate(e.target.value)} className="border-[#222222] bg-black text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#B8B8B8]">Warranty Expiry</Label>
                    <Input type="date" value={formWarrantyExpiry} onChange={(e) => setFormWarrantyExpiry(e.target.value)} className="border-[#222222] bg-black text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#B8B8B8]">Last Service</Label>
                    <Input type="date" value={formLastService} onChange={(e) => setFormLastService(e.target.value)} className="border-[#222222] bg-black text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#B8B8B8]">Next Service</Label>
                    <Input type="date" value={formNextService} onChange={(e) => setFormNextService(e.target.value)} className="border-[#222222] bg-black text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#B8B8B8]">Notes</Label>
                  <textarea className="flex min-h-[60px] w-full rounded-lg border border-[#222222] bg-black px-3 py-2 text-sm text-white placeholder:text-[#7A7A7A] resize-none" placeholder="Additional notes..." value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />
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
          <Input className="pl-10 max-w-md" placeholder="Search assets..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-36 border-[#222222] bg-[#161616] text-white"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent className="border-[#222222] bg-[#161616]">
            <SelectItem value="all" className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">All Categories</SelectItem>
            {uniqueCategories.map((c) => (
              <SelectItem key={c} value={c} className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-44 border-[#222222] bg-[#161616] text-white"><SelectValue placeholder="Location" /></SelectTrigger>
          <SelectContent className="border-[#222222] bg-[#161616]">
            <SelectItem value="all" className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">All Locations</SelectItem>
            {uniqueLocations.map((l) => (
              <SelectItem key={l} value={l} className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={conditionFilter} onValueChange={setConditionFilter}>
          <SelectTrigger className="w-36 border-[#222222] bg-[#161616] text-white"><SelectValue placeholder="Condition" /></SelectTrigger>
          <SelectContent className="border-[#222222] bg-[#161616]">
            <SelectItem value="all" className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">All Conditions</SelectItem>
            {(["Excellent", "Good", "Fair", "Poor", "Critical"] as AssetCondition[]).map((c) => (
              <SelectItem key={c} value={c} className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-[#222222] bg-[#161616]">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#222222] text-sm text-[#7A7A7A]">
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
                  className="border-b border-[#222222] last:border-0 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => { setSelectedAsset(asset); setDetailOpen(true); setDetailTab("details"); }}
                >
                  <td className="p-4 text-sm font-mono text-[#D4AF37]">{asset.id}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Package className="h-4 w-4 text-[#D4AF37]" />
                        {asset.condition === "Critical" && (
                          <motion.div
                            className="absolute -top-1 -right-1"
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <AlertTriangle className="h-3 w-3 text-[#EF4444]" />
                          </motion.div>
                        )}
                      </div>
                      <span className="font-medium text-sm text-white">{asset.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-[#B8B8B8]">{asset.category}</td>
                  <td className="p-4 text-sm text-[#B8B8B8]">{asset.location}</td>
                  <td className="p-4">
                    <Badge variant="outline" className={cn("text-xs", conditionColors[asset.condition])}>
                      <span className={cn("h-1.5 w-1.5 rounded-full mr-1.5", conditionBg[asset.condition])} />
                      {asset.condition}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm text-[#B8B8B8]">{asset.lastService || "—"}</td>
                  <td className="p-4 text-sm text-white">{asset.nextService || "—"}</td>
                  <td className="p-4 text-sm text-[#B8B8B8]">{asset.warrantyExpiry || "—"}</td>
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="text-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10">
                      View
                    </Button>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-[#7A7A7A]">
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
        <DialogContent className="max-w-2xl border-[#222222] bg-[#161616]">
          {selectedAsset && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  {selectedAsset.id} — {selectedAsset.name}
                </DialogTitle>
              </DialogHeader>
              <Tabs value={detailTab} onValueChange={setDetailTab}>
                <TabsList className="bg-[#111111]">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="service">Service History</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-[#7A7A7A] uppercase tracking-wider">Category</p>
                      <p className="text-sm text-white flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-[#D4AF37]" />{selectedAsset.category}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-[#7A7A7A] uppercase tracking-wider">Location</p>
                      <p className="text-sm text-white flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[#D4AF37]" />{selectedAsset.location}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-[#7A7A7A] uppercase tracking-wider">Serial No</p>
                      <p className="text-sm text-white font-mono">{selectedAsset.serialNo}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-[#7A7A7A] uppercase tracking-wider">Model</p>
                      <p className="text-sm text-white">{selectedAsset.model}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-[#7A7A7A] uppercase tracking-wider">Manufacturer</p>
                      <p className="text-sm text-white">{selectedAsset.manufacturer || "—"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-[#7A7A7A] uppercase tracking-wider">Condition</p>
                      <Badge variant="outline" className={cn("text-xs", conditionColors[selectedAsset.condition])}>
                        <span className={cn("h-1.5 w-1.5 rounded-full mr-1.5", conditionBg[selectedAsset.condition])} />
                        {selectedAsset.condition}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-[#7A7A7A] uppercase tracking-wider">Purchase Date</p>
                      <p className="text-sm text-white">{selectedAsset.purchaseDate}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-[#7A7A7A] uppercase tracking-wider">Warranty Expiry</p>
                      <p className="text-sm text-white">{selectedAsset.warrantyExpiry || "—"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-[#7A7A7A] uppercase tracking-wider">Status</p>
                      <Badge variant={
                        selectedAsset.status === "active" ? "success" :
                        selectedAsset.status === "maintenance" ? "warning" : "secondary"
                      }>
                        {selectedAsset.status}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-[#7A7A7A] uppercase tracking-wider">Last Service</p>
                      <p className="text-sm text-white">{selectedAsset.lastService || "—"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-[#7A7A7A] uppercase tracking-wider">Next Service</p>
                      <p className="text-sm text-white">{selectedAsset.nextService || "—"}</p>
                    </div>
                  </div>
                  {selectedAsset.notes && (
                    <div className="space-y-1">
                      <p className="text-xs text-[#7A7A7A] uppercase tracking-wider">Notes</p>
                      <p className="text-sm text-[#B8B8B8] bg-black rounded-lg p-3 border border-[#222222]">{selectedAsset.notes}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="service" className="space-y-4">
                  <div className="bg-black rounded-lg p-4 border border-[#222222]">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#22C55E]/10 flex items-center justify-center">
                          <Wrench className="h-4 w-4 text-[#22C55E]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">Last Service</p>
                          <p className="text-xs text-[#7A7A7A]">{selectedAsset.lastService || "No service recorded"}</p>
                        </div>
                      </div>
                      <div className="border-t border-[#222222]" />
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-[#D4AF37]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">Next Service Due</p>
                          <p className="text-xs text-[#7A7A7A]">{selectedAsset.nextService || "Not scheduled"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                  <div className="bg-black rounded-lg p-4 border border-[#222222]">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-[#7A7A7A]" />
                      <div>
                        <p className="text-sm font-medium text-white">No documents uploaded</p>
                        <p className="text-xs text-[#7A7A7A]">Upload manuals, warranties, or inspection reports</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex items-center justify-between pt-2 border-t border-[#222222]">
                <div />
                {deleteConfirm === selectedAsset.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#EF4444]">Confirm delete?</span>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(selectedAsset.id)}>Yes</Button>
                    <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)} className="border-[#222222]">No</Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="sm" className="text-[#EF4444] hover:text-[#EF4444] hover:bg-[#EF4444]/10" onClick={() => setDeleteConfirm(selectedAsset.id)}>
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
