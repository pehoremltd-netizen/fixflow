"use client";

import { useState, useEffect, useMemo } from "react";
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
  Package,
  AlertTriangle,
  Search,
  ShoppingCart,
  Loader2,
  Eye,
  Trash2,
  Save,
  X,
  Building2,
  Truck,
  DollarSign,
  MapPin,
  Layers,
  ChevronDown,
} from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  min_quantity: number;
  unit: string;
  unit_price: number;
  supplier: string;
  location: string;
}

const STORAGE_KEY = "fixflow-inventory";

const CATEGORIES = [
  { value: "hvac", label: "HVAC" },
  { value: "electrical", label: "Electrical" },
  { value: "plumbing", label: "Plumbing" },
  { value: "mechanical", label: "Mechanical" },
  { value: "fire-safety", label: "Fire Safety" },
];



function getItems(): InventoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function setItems(items: InventoryItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}



function generateId(): string {
  return "inv-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
}

export default function InventoryPage() {
  const [items, setItemsState] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [addOpen, setAddOpen] = useState(false);
  const [aName, setAName] = useState("");
  const [aSku, setASku] = useState("");
  const [aCategory, setACategory] = useState("");
  const [aQuantity, setAQuantity] = useState("");
  const [aMinQty, setAMinQty] = useState("");
  const [aUnit, setAUnit] = useState("");
  const [aPrice, setAPrice] = useState("");
  const [aSupplier, setASupplier] = useState("");
  const [aLocation, setALocation] = useState("");
  const [addSubmitting, setAddSubmitting] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [eName, setEName] = useState("");
  const [eCategory, setECategory] = useState("");
  const [eQuantity, setEQuantity] = useState("");
  const [eMinQty, setEMinQty] = useState("");
  const [eUnit, setEUnit] = useState("");
  const [ePrice, setEPrice] = useState("");
  const [eSupplier, setESupplier] = useState("");
  const [eLocation, setELocation] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const [reorderLoading, setReorderLoading] = useState<string | null>(null);

  useEffect(() => {
    const data = getItems();
    setItemsState(data);
    setLoading(false);
  }, []);

  const lowStock = useMemo(
    () => items.filter((i) => i.quantity <= i.min_quantity),
    [items]
  );

  const categories = useMemo(
    () => [...new Set(items.map((i) => i.category))],
    [items]
  );

  const totalValue = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0),
    [items]
  );

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const matchSearch =
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.sku.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === "all" || i.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [items, search, categoryFilter]);

  function refresh(data?: InventoryItem[]) {
    const next = data ?? getItems();
    setItemsState(next);
  }

  function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!aName.trim() || !aSku.trim()) return;
    setAddSubmitting(true);
    try {
      const now = getItems();
      const newItem: InventoryItem = {
        id: generateId(),
        name: aName.trim(),
        sku: aSku.trim(),
        category: aCategory,
        quantity: parseInt(aQuantity) || 0,
        min_quantity: parseInt(aMinQty) || 0,
        unit: aUnit,
        unit_price: parseFloat(aPrice) || 0,
        supplier: aSupplier,
        location: aLocation,
      };
      const updated = [...now, newItem];
      setItems(updated);
      setAddOpen(false);
      refresh(updated);
      setAName(""); setASku(""); setACategory(""); setAQuantity(""); setAMinQty("");
      setAUnit(""); setAPrice(""); setASupplier(""); setALocation("");
    } catch {
    } finally {
      setAddSubmitting(false);
    }
  }

  function handleEditOpen(item: InventoryItem) {
    setSelectedItem(item);
    setEName(item.name);
    setECategory(item.category);
    setEQuantity(String(item.quantity));
    setEMinQty(String(item.min_quantity));
    setEUnit(item.unit);
    setEPrice(String(item.unit_price));
    setESupplier(item.supplier || "");
    setELocation(item.location || "");
    setEditOpen(true);
    setDetailOpen(false);
  }

  function handleEditSave() {
    if (!selectedItem) return;
    setEditSubmitting(true);
    try {
      const now = getItems();
      const updated = now.map((i) =>
        i.id === selectedItem.id
          ? {
              ...i,
              name: eName,
              category: eCategory,
              quantity: parseInt(eQuantity) || 0,
              min_quantity: parseInt(eMinQty) || 0,
              unit: eUnit,
              unit_price: parseFloat(ePrice) || 0,
              supplier: eSupplier,
              location: eLocation,
            }
          : i
      );
      setItems(updated);
      setEditOpen(false);
      setSelectedItem(null);
      refresh(updated);
    } catch {
    } finally {
      setEditSubmitting(false);
    }
  }

  function handleDelete() {
    if (!selectedItem) return;
    setDeleteSubmitting(true);
    try {
      const now = getItems();
      const updated = now.filter((i) => i.id !== selectedItem.id);
      setItems(updated);
      setDeleteOpen(false);
      setDetailOpen(false);
      setSelectedItem(null);
      refresh(updated);
    } catch {
    } finally {
      setDeleteSubmitting(false);
    }
  }

  function handleReorder(item: InventoryItem) {
    setReorderLoading(item.id);
    try {
      const now = getItems();
      const updated = now.map((i) =>
        i.id === item.id ? { ...i, quantity: i.min_quantity + 10 } : i
      );
      setItems(updated);
      refresh(updated);
    } catch {
    } finally {
      setReorderLoading(null);
    }
  }

  const categoryLabel = (val: string) =>
    CATEGORIES.find((c) => c.value === val)?.label ?? val;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-secondary-foreground text-sm">Track spare parts and supplies</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" /> Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-card max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">Add Inventory Item</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleAddSubmit}>
              <div className="space-y-2">
                <Label className="text-secondary-foreground">Item Name *</Label>
                <Input
                  placeholder="Item name"
                  value={aName}
                  onChange={(e) => setAName(e.target.value)}
                  required
                  className="border-border bg-background text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">SKU *</Label>
                  <Input
                    placeholder="SKU code"
                    value={aSku}
                    onChange={(e) => setASku(e.target.value)}
                    required
                    className="border-border bg-background text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">Category</Label>
                  <Select value={aCategory} onValueChange={setACategory}>
                    <SelectTrigger className="border-border bg-background text-foreground">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-card">
                      {CATEGORIES.map((c) => (
                        <SelectItem
                          key={c.value}
                          value={c.value}
                          className="text-foreground focus:text-primary focus:bg-primary/10"
                        >
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">Quantity</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={aQuantity}
                    onChange={(e) => setAQuantity(e.target.value)}
                    className="border-border bg-background text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">Min Quantity</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={aMinQty}
                    onChange={(e) => setAMinQty(e.target.value)}
                    className="border-border bg-background text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">Unit</Label>
                  <Input
                    placeholder="pcs, ft, gal"
                    value={aUnit}
                    onChange={(e) => setAUnit(e.target.value)}
                    className="border-border bg-background text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-secondary-foreground">Unit Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={aPrice}
                  onChange={(e) => setAPrice(e.target.value)}
                  className="border-border bg-background text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">Supplier</Label>
                  <Input
                    placeholder="Supplier name"
                    value={aSupplier}
                    onChange={(e) => setASupplier(e.target.value)}
                    className="border-border bg-background text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">Location</Label>
                  <Input
                    placeholder="Storage location"
                    value={aLocation}
                    onChange={(e) => setALocation(e.target.value)}
                    className="border-border bg-background text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={addSubmitting}
              >
                {addSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Adding...
                  </>
                ) : (
                  "Add to Inventory"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-secondary-foreground">Total Items</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{items.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-secondary-foreground">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{lowStock.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-secondary-foreground">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">${totalValue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-secondary-foreground">Categories</CardTitle>
            <Layers className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{categories.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10 border-border bg-card text-foreground placeholder:text-muted-foreground"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48 border-border bg-card text-foreground">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="border-border bg-card">
            <SelectItem value="all" className="text-foreground focus:text-primary focus:bg-primary/10">
              All Categories
            </SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem
                key={c.value}
                value={c.value}
                className="text-foreground focus:text-primary focus:bg-primary/10"
              >
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground mb-1">No inventory items found</p>
          <p className="text-sm text-muted-foreground mb-6">
            {search || categoryFilter !== "all"
              ? "Try adjusting your search or filter"
              : "Click Add Item to create the first entry"}
          </p>
          {!search && categoryFilter === "all" && (
            <Button
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="h-4 w-4" /> Add Item
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground text-sm font-medium">
                  {filtered.length} item{filtered.length !== 1 ? "s" : ""}
                  {categoryFilter !== "all" && (
                    <span className="text-muted-foreground font-normal">
                      {" "}in{" "}
                      <span className="text-primary">{categoryLabel(categoryFilter)}</span>
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                        <th className="text-left px-4 py-3 font-medium">Item</th>
                        <th className="text-left px-4 py-3 font-medium">SKU</th>
                        <th className="text-left px-4 py-3 font-medium">Category</th>
                        <th className="text-right px-4 py-3 font-medium">Qty</th>
                        <th className="text-right px-4 py-3 font-medium">Min</th>
                        <th className="text-right px-4 py-3 font-medium">Price</th>
                        <th className="text-right px-4 py-3 font-medium">Value</th>
                        <th className="text-right px-4 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence mode="popLayout">
                        {filtered.map((item, i) => (
                          <motion.tr
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: i * 0.02, duration: 0.2 }}
                            className="border-b border-card-alt last:border-0 hover:bg-foreground/[0.03] transition-colors"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                {item.quantity <= item.min_quantity ? (
                                  <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
                                ) : (
                                  <Package className="h-4 w-4 shrink-0 text-muted-foreground" />
                                )}
                                <span className="font-medium text-sm text-foreground">
                                  {item.name}
                                </span>
                                {item.quantity <= item.min_quantity && (
                                  <Badge
                                    variant="outline"
                                    className="border-destructive text-destructive text-[10px] px-1.5 py-0 h-5"
                                  >
                                    Low
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm font-mono text-secondary-foreground">
                              {item.sku}
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                variant="outline"
                                className="border-input text-secondary-foreground text-xs font-normal"
                              >
                                {categoryLabel(item.category)}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span
                                className={`font-mono text-sm ${
                                  item.quantity <= item.min_quantity
                                    ? "text-destructive"
                                    : "text-foreground"
                                }`}
                              >
                                {item.quantity}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-muted-foreground font-mono">
                              {item.min_quantity}
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-foreground font-mono">
                              ${item.unit_price.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-secondary-foreground font-mono">
                              ${(item.quantity * item.unit_price).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-foreground/10"
                                  onClick={() => {
                                    setSelectedItem(item);
                                    setDetailOpen(true);
                                  }}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                  onClick={() => handleEditOpen(item)}
                                >
                                  <Save className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.02, duration: 0.2 }}
                >
                  <Card
                    className="border-border bg-card cursor-pointer hover:border-input transition-colors"
                    onClick={() => {
                      setSelectedItem(item);
                      setDetailOpen(true);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          {item.quantity <= item.min_quantity ? (
                            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-destructive" />
                          ) : (
                            <Package className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                          </div>
                        </div>
                        {item.quantity <= item.min_quantity && (
                          <Badge
                            variant="outline"
                            className="border-destructive text-destructive text-[10px] px-1.5 h-5 shrink-0 ml-2"
                          >
                            Low
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs mt-3">
                        <div>
                          <span className="text-muted-foreground">Qty</span>
                          <p
                            className={`font-mono font-medium ${
                              item.quantity <= item.min_quantity
                                ? "text-destructive"
                                : "text-foreground"
                            }`}
                          >
                            {item.quantity}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Price</span>
                          <p className="font-mono text-foreground">${item.unit_price.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Category</span>
                          <p className="text-foreground truncate">{categoryLabel(item.category)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Low Stock Alerts */}
          {lowStock.length > 0 && (
            <Card className="border-destructive/50 bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive text-base">
                  <AlertTriangle className="h-5 w-5" />
                  Reorder Alerts ({lowStock.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lowStock.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-destructive/5"
                    >
                      <div className="min-w-0 mr-3">
                        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.sku} &middot; Current:{" "}
                          <span className="text-destructive font-mono">{item.quantity}</span>{" "}
                          | Min:{" "}
                          <span className="text-foreground font-mono">{item.min_quantity}</span>
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 border-border text-foreground hover:bg-foreground/10 shrink-0"
                        onClick={() => handleReorder(item)}
                        disabled={reorderLoading === item.id}
                      >
                        {reorderLoading === item.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <ShoppingCart className="h-3 w-3" />
                        )}
                        Reorder
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg border-border bg-card">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  {selectedItem.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">SKU</p>
                    <p className="text-sm text-foreground font-mono">{selectedItem.sku}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Category</p>
                    <p className="text-sm text-foreground flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-primary" />
                      {categoryLabel(selectedItem.category)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Quantity</p>
                    <p
                      className={`text-sm font-mono flex items-center gap-1.5 ${
                        selectedItem.quantity <= selectedItem.min_quantity
                          ? "text-destructive"
                          : "text-foreground"
                      }`}
                    >
                      {selectedItem.quantity <= selectedItem.min_quantity && (
                        <AlertTriangle className="h-3 w-3" />
                      )}
                      {selectedItem.quantity} {selectedItem.unit}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Min Quantity</p>
                    <p className="text-sm text-foreground font-mono">{selectedItem.min_quantity}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Unit Price</p>
                    <p className="text-sm text-foreground flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-primary" />$
                      {selectedItem.unit_price.toFixed(2)} / {selectedItem.unit}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Value</p>
                    <p className="text-sm text-primary font-mono">
                      ${(selectedItem.quantity * selectedItem.unit_price).toFixed(2)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Supplier</p>
                    <p className="text-sm text-foreground flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5 text-primary" />
                      {selectedItem.supplier || "\u2014"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Location</p>
                    <p className="text-sm text-foreground flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      {selectedItem.location || "\u2014"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                    onClick={() => {
                      setDeleteOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => handleEditOpen(selectedItem)}
                  >
                    <Save className="h-4 w-4" /> Edit
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg border-border bg-card max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Inventory Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-secondary-foreground">Item Name</Label>
              <Input
                value={eName}
                onChange={(e) => setEName(e.target.value)}
                className="border-border bg-background text-foreground"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-secondary-foreground">Category</Label>
                <Select value={eCategory} onValueChange={setECategory}>
                  <SelectTrigger className="border-border bg-background text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-card">
                    {CATEGORIES.map((c) => (
                      <SelectItem
                        key={c.value}
                        value={c.value}
                        className="text-foreground focus:text-primary focus:bg-primary/10"
                      >
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-secondary-foreground">Unit</Label>
                <Input
                  value={eUnit}
                  onChange={(e) => setEUnit(e.target.value)}
                  className="border-border bg-background text-foreground"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-secondary-foreground">Quantity</Label>
                <Input
                  type="number"
                  value={eQuantity}
                  onChange={(e) => setEQuantity(e.target.value)}
                  className="border-border bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-secondary-foreground">Min Qty</Label>
                <Input
                  type="number"
                  value={eMinQty}
                  onChange={(e) => setEMinQty(e.target.value)}
                  className="border-border bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-secondary-foreground">Unit Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={ePrice}
                  onChange={(e) => setEPrice(e.target.value)}
                  className="border-border bg-background text-foreground"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-secondary-foreground">Supplier</Label>
                <Input
                  value={eSupplier}
                  onChange={(e) => setESupplier(e.target.value)}
                  className="border-border bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-secondary-foreground">Location</Label>
                <Input
                  value={eLocation}
                  onChange={(e) => setELocation(e.target.value)}
                  className="border-border bg-background text-foreground"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => setEditOpen(false)}
                className="border-border text-foreground hover:bg-foreground/10"
              >
                Cancel
              </Button>
              <Button
                className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleEditSave}
                disabled={editSubmitting}
              >
                {editSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-destructive" />
              Delete Item
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-secondary-foreground">
            Are you sure you want to delete{" "}
            <span className="text-foreground font-medium">{selectedItem?.name}</span>? This action
            cannot be undone.
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              className="border-border text-foreground hover:bg-foreground/10"
            >
              Cancel
            </Button>
            <Button
              className="gap-1.5 bg-destructive text-foreground hover:bg-destructive"
              onClick={handleDelete}
              disabled={deleteSubmitting}
            >
              {deleteSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
