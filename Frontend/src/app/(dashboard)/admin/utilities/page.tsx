"use client";

import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Zap, Droplets, Flame, Trash2, Loader2 } from "lucide-react";
import { generateId } from "@/lib/id-gen";

interface UtilityRecord {
  id: string;
  type: string;
  provider: string;
  monthly_cost: number;
  meter_number: string;
  created_at: string;
}

const STORAGE_KEY = "fixflow-utilities-page";

function readRecords(): UtilityRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as UtilityRecord[];
  } catch {
    return [];
  }
}

function writeRecords(records: UtilityRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // silently fail
  }
}

const typeOptions = ["electricity", "water", "gas", "internet", "waste"];

const categoryIcons: Record<string, React.ReactNode> = {
  electricity: <Zap className="h-4 w-4" />,
  water: <Droplets className="h-4 w-4" />,
  gas: <Flame className="h-4 w-4" />,
};

const categoryColors: Record<string, string> = {
  electricity: "text-yellow-500",
  water: "text-info",
  gas: "text-warning",
  internet: "text-purple-500",
  waste: "text-success",
};

export default function UtilitiesPage() {
  const [records, setRecords] = useState<UtilityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [provider, setProvider] = useState("");
  const [monthlyCost, setMonthlyCost] = useState("");
  const [meterNumber, setMeterNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setRecords(readRecords());
    setLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !provider.trim()) return;
    setSubmitting(true);
    try {
      const monthlyCostValue = parseFloat(monthlyCost);
      if (isNaN(monthlyCostValue) || monthlyCostValue < 0) {
        alert("Monthly cost must be a valid non-negative number");
        setSubmitting(false);
        return;
      }
      const newRecord: UtilityRecord = {
        id: generateId("utility"),
        type,
        provider: provider.trim(),
        monthly_cost: monthlyCostValue,
        meter_number: meterNumber.trim(),
        created_at: new Date().toISOString().slice(0, 10),
      };
      const updated = [...readRecords(), newRecord];
      writeRecords(updated);
      setRecords(updated);
      setType(""); setProvider(""); setMonthlyCost(""); setMeterNumber("");
      setOpen(false);
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this utility record?")) return;
    try {
      const updated = readRecords().filter((r) => r.id !== id);
      writeRecords(updated);
      setRecords(updated);
    } catch {
      // silently fail
    }
  };

  const filtered = tab === "all" ? records : records.filter((r) => r.type === tab);
  const totalCost = records.reduce((sum, r) => sum + r.monthly_cost, 0);

  return (
    <div className="space-y-6 bg-input-bg min-h-screen p-6 text-foreground">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Utility Management</h1>
          <p className="text-gray-400">
            Track electricity, water, gas and other utility consumption
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" /> Add Record
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-input-bg border-border text-foreground">
            <DialogHeader>
              <DialogTitle>Add Utility Record</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label>Utility Type</Label>
                <Select value={type} onValueChange={setType} required>
                  <SelectTrigger className="border-border"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent className="bg-input-bg border-border text-foreground">
                    {typeOptions.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Provider</Label>
                <Input placeholder="Provider name" value={provider} onChange={(e) => setProvider(e.target.value)} required className="border-border" />
              </div>
              <div className="space-y-2">
                <Label>Monthly Cost ($)</Label>
                <Input type="number" step="0.01" placeholder="0.00" value={monthlyCost} onChange={(e) => setMonthlyCost(e.target.value)} className="border-border" />
              </div>
              <div className="space-y-2">
                <Label>Meter Number</Label>
                <Input placeholder="Meter #" value={meterNumber} onChange={(e) => setMeterNumber(e.target.value)} className="border-border" />
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={submitting}>
                {submitting ? "Adding..." : "Add Record"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-input-bg border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400">Total Monthly Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">${totalCost.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-input-bg border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{records.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="border-border">
          <TabsTrigger value="all">All ({records.length})</TabsTrigger>
          {typeOptions.map((t) => (
            <TabsTrigger key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)} ({records.filter((r) => r.type === t).length})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={tab}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              {tab === "all" ? "No utility records yet." : `No ${tab} records.`}
            </p>
          ) : (
            <Card className="bg-input-bg border-border">
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-sm text-gray-400">
                      <th className="text-left p-4 font-medium">Type</th>
                      <th className="text-left p-4 font-medium">Provider</th>
                      <th className="text-left p-4 font-medium">Meter #</th>
                      <th className="text-left p-4 font-medium">Monthly Cost</th>
                      <th className="text-left p-4 font-medium">Created</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r, i) => (
                      <motion.tr
                        key={r.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-border last:border-0 hover:bg-foreground/5 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {categoryIcons[r.type] && (
                              <span className={categoryColors[r.type]}>{categoryIcons[r.type]}</span>
                            )}
                            <span className="text-sm capitalize">{r.type}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm">{r.provider}</td>
                        <td className="p-4 text-sm font-mono">{r.meter_number}</td>
                        <td className="p-4 text-sm text-primary">${r.monthly_cost.toFixed(2)}</td>
                        <td className="p-4 text-sm text-gray-400">{r.created_at}</td>
                        <td className="p-4">
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
