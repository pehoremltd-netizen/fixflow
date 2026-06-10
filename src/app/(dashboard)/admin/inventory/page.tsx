"use client";

import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Package, AlertTriangle, Search, ShoppingCart } from "lucide-react";

const inventory = [
  { id: 1, name: "Air Filters - 20x20x1", sku: "AF-2020", category: "HVAC", qty: 45, min: 20, unit: "pcs", price: 12.99 },
  { id: 2, name: "LED Bulbs - 60W Equivalent", sku: "LED-60W", category: "Electrical", qty: 120, min: 50, unit: "pcs", price: 5.99 },
  { id: 3, name: "PVC Pipe - 1 inch", sku: "PVC-1IN", category: "Plumbing", qty: 8, min: 20, unit: "ft", price: 2.49 },
  { id: 4, name: "Circuit Breaker - 20A", sku: "CB-20A", category: "Electrical", qty: 15, min: 10, unit: "pcs", price: 8.99 },
  { id: 5, name: "Motor Oil - 5W-30", sku: "MO-5W30", category: "Mechanical", qty: 3, min: 10, unit: "gal", price: 24.99 },
  { id: 6, name: "Fire Extinguisher - ABC", sku: "FE-ABC", category: "Fire Safety", qty: 22, min: 15, unit: "pcs", price: 45.99 },
];

export default function InventoryPage() {
  const [search, setSearch] = useState("");

  const filtered = inventory.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">
            Track spare parts and supplies
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Inventory Item</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label>Item Name</Label>
                <Input placeholder="Item name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SKU</Label>
                  <Input placeholder="SKU code" />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hvac">HVAC</SelectItem>
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="plumbing">Plumbing</SelectItem>
                      <SelectItem value="mechanical">Mechanical</SelectItem>
                      <SelectItem value="fire-safety">Fire Safety</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Min Quantity</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Input placeholder="pcs, ft, gal" />
                </div>
              </div>
              <div className="space-y-2">
                  <Label>Unit Price ($)</Label>
                  <Input type="number" step="0.01" placeholder="0.00" />
                </div>
              <Button type="submit" className="w-full">
                Add to Inventory
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-10 max-w-md" placeholder="Search inventory..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Items ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-sm text-muted-foreground">
                  <th className="text-left pb-3 font-medium">Item</th>
                  <th className="text-left pb-3 font-medium">SKU</th>
                  <th className="text-left pb-3 font-medium">Category</th>
                  <th className="text-left pb-3 font-medium">Qty</th>
                  <th className="text-left pb-3 font-medium">Min</th>
                  <th className="text-left pb-3 font-medium">Price</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b last:border-0 hover:bg-accent/50 transition-colors"
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {item.qty <= item.min ? (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        ) : (
                          <Package className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="font-medium text-sm">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-sm font-mono">{item.sku}</td>
                    <td className="py-3 text-sm">{item.category}</td>
                    <td className="py-3">
                      <span className={`font-medium ${item.qty <= item.min ? "text-destructive" : ""}`}>
                        {item.qty}
                      </span>
                    </td>
                    <td className="py-3 text-sm">{item.min}</td>
                    <td className="py-3 text-sm">${item.price.toFixed(2)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Reorder Alerts */}
      {inventory.filter((i) => i.qty <= i.min).length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Reorder Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {inventory.filter((i) => i.qty <= i.min).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5">
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Current: {item.qty} | Min: {item.min}</p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1">
                    <ShoppingCart className="h-3 w-3" /> Reorder
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
