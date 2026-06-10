"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Trash2,
  Download,
  Zap,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import {
  getUtilities,
  addUtility,
  deleteUtility,
  getUtilitySummary,
  getMonthlyTrend,
  UtilityRecord,
  UtilityCategory,
} from "@/lib/utilities";

const categoryColors: Record<string, string> = {
  Electricity: "#D4AF37",
  Diesel: "#F97316",
  Water: "#4A9EFF",
  Gas: "#22C55E",
  Waste: "#E05C5C",
};

const categories: UtilityCategory[] = ["Electricity", "Diesel", "Water", "Gas", "Waste"];
const sites = ["Lekki Site", "Victoria Island", "Ikeja GRA"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const units = ["kWh", "Litres", "m\u00B3", "kg"] as const;

const unitByCategory: Record<string, string> = {
  Electricity: "kWh",
  Diesel: "Litres",
  Water: "m\u00B3",
  Gas: "kg",
  Waste: "kg",
};

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

export default function UtilitiesPage() {
  const [records, setRecords] = useState<UtilityRecord[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [filterSite, setFilterSite] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");

  const [formSite, setFormSite] = useState("Lekki Site");
  const [formCategory, setFormCategory] = useState<UtilityCategory>("Electricity");
  const [formMonth, setFormMonth] = useState("");
  const [formYear, setFormYear] = useState(new Date().getFullYear().toString());
  const [formConsumption, setFormConsumption] = useState("");
  const [formUnit, setFormUnit] = useState("kWh");
  const [formCost, setFormCost] = useState("");
  const [formSupplier, setFormSupplier] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const [lineCategory, setLineCategory] = useState<UtilityCategory>("Electricity");

  const showToast = useCallback((message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
  }, []);

  const refreshData = useCallback(() => {
    setRecords(getUtilities());
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    setFormUnit(unitByCategory[formCategory] || "kWh");
  }, [formCategory]);

  const summary = getUtilitySummary();

  const filtered = records.filter((r) => {
    const matchesSite = filterSite === "all" || r.site === filterSite;
    const matchesCategory = filterCategory === "all" || r.category === filterCategory;
    const matchesMonth = filterMonth === "all" || r.month === filterMonth;
    return matchesSite && matchesCategory && matchesMonth;
  });

  const barData = months.slice(0, 6).map((month) => {
    const entry: Record<string, string | number> = { month };
    categories.forEach((cat) => {
      const trend = getMonthlyTrend(cat);
      const found = trend.find((t) => t.month === month);
      entry[cat] = found?.cost || 0;
    });
    return entry;
  });

  const lineData = getMonthlyTrend(lineCategory);

  const handleAdd = () => {
    if (!formSite || !formMonth || !formYear || !formConsumption || !formCost) {
      showToast("Please fill required fields", "error");
      return;
    }
    addUtility({
      site: formSite,
      category: formCategory,
      month: formMonth,
      year: parseInt(formYear),
      consumption: parseFloat(formConsumption),
      unit: formUnit as UtilityRecord["unit"],
      cost: parseFloat(formCost),
      supplier: formSupplier,
      notes: formNotes,
    });
    refreshData();
    setCreateOpen(false);
    setFormMonth("");
    setFormYear(new Date().getFullYear().toString());
    setFormConsumption("");
    setFormCost("");
    setFormSupplier("");
    setFormNotes("");
    showToast("Utility reading added successfully", "success");
  };

  const handleDelete = (id: string) => {
    deleteUtility(id);
    refreshData();
    setDeleteConfirm(null);
    showToast("Utility record deleted", "success");
  };

  const exportCSV = () => {
    const headers = ["Site", "Category", "Month", "Year", "Consumption", "Unit", "Cost (NGN)", "Supplier", "Notes"];
    const rows = filtered.map((r) => [
      r.site, r.category, r.month, r.year, r.consumption, r.unit, r.cost, r.supplier, r.notes,
    ]);
    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "utilities.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("CSV exported", "success");
  };

  const summaryCards = [
    { title: "Total Monthly Cost", value: `NGN ${summary.totalMonthlyCost.toLocaleString()}`, icon: Zap, color: "text-[#D4AF37]" },
    { title: "Electricity Cost", value: `NGN ${summary.electricityCost.toLocaleString()}`, icon: Zap, color: "text-[#D4AF37]" },
    { title: "Diesel Cost", value: `NGN ${summary.dieselCost.toLocaleString()}`, icon: Zap, color: "text-[#F97316]" },
    { title: "Water Cost", value: `NGN ${summary.waterCost.toLocaleString()}`, icon: Zap, color: "text-[#4A9EFF]" },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-[#161616] border border-[#222222] rounded-lg p-3 shadow-xl">
        <p className="text-white text-xs font-medium mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-xs" style={{ color: p.color }}>
            {p.name}: NGN {p.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  };

  const LineTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-[#161616] border border-[#222222] rounded-lg p-3 shadow-xl">
        <p className="text-white text-xs font-medium mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-xs" style={{ color: p.color }}>
            {p.name}: {p.value?.toLocaleString()} {unitByCategory[lineCategory]}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Utilities Tracker</h1>
          <p className="text-[#B8B8B8]">Monitor electricity, diesel, water, gas, and waste</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 border-[#222222] text-[#B8B8B8] hover:text-white" onClick={exportCSV}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Add Reading
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg border-[#222222] bg-[#161616]">
              <DialogHeader>
                <DialogTitle className="text-white">Add Utility Reading</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleAdd(); }}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#B8B8B8]">Site *</Label>
                    <Select value={formSite} onValueChange={setFormSite}>
                      <SelectTrigger className="border-[#222222] bg-black text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="border-[#222222] bg-[#161616]">
                        {sites.map((s) => (
                          <SelectItem key={s} value={s} className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#B8B8B8]">Category *</Label>
                    <Select value={formCategory} onValueChange={(v) => setFormCategory(v as UtilityCategory)}>
                      <SelectTrigger className="border-[#222222] bg-black text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="border-[#222222] bg-[#161616]">
                        {categories.map((c) => (
                          <SelectItem key={c} value={c} className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#B8B8B8]">Month *</Label>
                    <Select value={formMonth} onValueChange={setFormMonth}>
                      <SelectTrigger className="border-[#222222] bg-black text-white"><SelectValue placeholder="Select month" /></SelectTrigger>
                      <SelectContent className="border-[#222222] bg-[#161616]">
                        {months.map((m) => (
                          <SelectItem key={m} value={m} className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#B8B8B8]">Year *</Label>
                    <Input type="number" value={formYear} onChange={(e) => setFormYear(e.target.value)} className="border-[#222222] bg-black text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#B8B8B8]">Consumption *</Label>
                    <Input type="number" step="0.01" placeholder="0" value={formConsumption} onChange={(e) => setFormConsumption(e.target.value)} className="border-[#222222] bg-black text-white placeholder:text-[#7A7A7A]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#B8B8B8]">Unit</Label>
                    <Select value={formUnit} onValueChange={setFormUnit}>
                      <SelectTrigger className="border-[#222222] bg-black text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="border-[#222222] bg-[#161616]">
                        {units.map((u) => (
                          <SelectItem key={u} value={u} className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">{u}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#B8B8B8]">Cost (NGN) *</Label>
                    <Input type="number" step="0.01" placeholder="0" value={formCost} onChange={(e) => setFormCost(e.target.value)} className="border-[#222222] bg-black text-white placeholder:text-[#7A7A7A]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#B8B8B8]">Supplier</Label>
                    <Input placeholder="Supplier name" value={formSupplier} onChange={(e) => setFormSupplier(e.target.value)} className="border-[#222222] bg-black text-white placeholder:text-[#7A7A7A]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#B8B8B8]">Notes</Label>
                  <textarea className="flex min-h-[60px] w-full rounded-lg border border-[#222222] bg-black px-3 py-2 text-sm text-white placeholder:text-[#7A7A7A] resize-none" placeholder="Additional notes..." value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />
                </div>
                <Button type="submit" className="w-full">Add Reading</Button>
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

      <div className="grid grid-cols-2 gap-6">
        <Card className="border-[#222222] bg-[#161616]">
          <CardHeader>
            <CardTitle className="text-white text-sm">Monthly Cost Trend by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                <XAxis dataKey="month" tick={{ fill: "#7A7A7A", fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: "#7A7A7A", fontSize: 12 }} axisLine={false} tickFormatter={(v) => `NGN ${(v / 1000000).toFixed(1)}M`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "11px", color: "#B8B8B8" }} />
                <Bar dataKey="Electricity" name="Electricity" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Diesel" name="Diesel" fill="#F97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Water" name="Water" fill="#4A9EFF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Gas" name="Gas" fill="#22C55E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Waste" name="Waste" fill="#E05C5C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-[#222222] bg-[#161616]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white text-sm">Consumption Trend</CardTitle>
            <Select value={lineCategory} onValueChange={(v) => setLineCategory(v as UtilityCategory)}>
              <SelectTrigger className="w-36 border-[#222222] bg-black text-white text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-[#222222] bg-[#161616]">
                {categories.map((c) => (
                  <SelectItem key={c} value={c} className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10 text-xs">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                <XAxis dataKey="month" tick={{ fill: "#7A7A7A", fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: "#7A7A7A", fontSize: 12 }} axisLine={false} />
                <Tooltip content={<LineTooltip />} />
                <Line type="monotone" dataKey="consumption" stroke={lineCategory === "Electricity" ? "#D4AF37" : lineCategory === "Diesel" ? "#F97316" : lineCategory === "Water" ? "#4A9EFF" : lineCategory === "Gas" ? "#22C55E" : "#E05C5C"} strokeWidth={2} dot={{ fill: lineCategory === "Electricity" ? "#D4AF37" : lineCategory === "Diesel" ? "#F97316" : lineCategory === "Water" ? "#4A9EFF" : lineCategory === "Gas" ? "#22C55E" : "#E05C5C", r: 4 }} activeDot={{ r: 6 }} name="Consumption" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <Select value={filterSite} onValueChange={setFilterSite}>
          <SelectTrigger className="w-40 border-[#222222] bg-[#161616] text-white"><SelectValue placeholder="Site" /></SelectTrigger>
          <SelectContent className="border-[#222222] bg-[#161616]">
            <SelectItem value="all" className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">All Sites</SelectItem>
            {sites.map((s) => (
              <SelectItem key={s} value={s} className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40 border-[#222222] bg-[#161616] text-white"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent className="border-[#222222] bg-[#161616]">
            <SelectItem value="all" className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c} className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="w-40 border-[#222222] bg-[#161616] text-white"><SelectValue placeholder="Month" /></SelectTrigger>
          <SelectContent className="border-[#222222] bg-[#161616]">
            <SelectItem value="all" className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">All Months</SelectItem>
            {months.map((m) => (
              <SelectItem key={m} value={m} className="text-white focus:text-[#D4AF37] focus:bg-[#D4AF37]/10">{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-[#222222] bg-[#161616]">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#222222] text-sm text-[#7A7A7A]">
                <th className="text-left p-4 font-medium">Site</th>
                <th className="text-left p-4 font-medium">Category</th>
                <th className="text-left p-4 font-medium">Month</th>
                <th className="text-left p-4 font-medium">Consumption</th>
                <th className="text-left p-4 font-medium">Unit</th>
                <th className="text-left p-4 font-medium">Cost (NGN)</th>
                <th className="text-left p-4 font-medium">Supplier</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-[#222222] last:border-0 hover:bg-white/5 transition-colors"
                >
                  <td className="p-4 text-sm text-white">{r.site}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 text-sm" style={{ color: categoryColors[r.category] }}>
                      <span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: categoryColors[r.category] }} />
                      {r.category}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-[#B8B8B8]">{r.month} {r.year}</td>
                  <td className="p-4 text-sm text-white font-medium">{r.consumption.toLocaleString()}</td>
                  <td className="p-4 text-sm text-[#B8B8B8]">{r.unit}</td>
                  <td className="p-4 text-sm text-[#D4AF37] font-medium">NGN {r.cost.toLocaleString()}</td>
                  <td className="p-4 text-sm text-[#B8B8B8]">{r.supplier}</td>
                  <td className="p-4">
                    {deleteConfirm === r.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#EF4444]">Delete?</span>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(r.id)}>Yes</Button>
                        <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)} className="border-[#222222] h-7 text-xs">No</Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#EF4444] hover:text-[#EF4444] hover:bg-[#EF4444]/10 h-8 w-8 p-0"
                        onClick={() => setDeleteConfirm(r.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#7A7A7A]">
                    <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No utility records found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
