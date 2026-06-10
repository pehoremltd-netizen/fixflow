"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Wrench, ClipboardCheck, TrendingUp, Users, Clock, AlertTriangle, CheckCircle2, Brain } from "lucide-react";
import Link from "next/link";
import { AssetHealthCard } from "@/components/ai/asset-health-card";
import { PreventiveMaintenancePanel } from "@/components/ai/preventive-maintenance-panel";
import { AIIntelligenceBadge } from "@/components/ai/ai-intelligence-badge";
import { mockAssetHealthData, mockPreventiveSuggestions } from "@/lib/ai-intelligence";

const stats = [
  { label: "Facilities", value: "4", icon: Building2, color: "text-[#D4AF37]", bg: "bg-[#D4AF37]/10" },
  { label: "Open Work Orders", value: "18", icon: Wrench, color: "text-[#E1B000]", bg: "bg-[#E1B000]/10" },
  { label: "Completion Rate", value: "94%", icon: CheckCircle2, color: "text-[#D4AF37]", bg: "bg-[#D4AF37]/10" },
  { label: "Staff", value: "12", icon: Users, color: "text-[#D4AF37]", bg: "bg-[#D4AF37]/10" },
];

const facilityPerformance = [
  { name: "Building A - HQ", workOrders: 45, completed: 42, rating: 98, status: "optimal" },
  { name: "Building B - West Wing", workOrders: 28, completed: 24, rating: 86, status: "good" },
  { name: "Warehouse - Storage", workOrders: 15, completed: 12, rating: 80, status: "attention" },
  { name: "Office - Downtown", workOrders: 22, completed: 20, rating: 91, status: "optimal" },
];

export default function ManagerDashboard() {
  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Manager Dashboard</h1>
          <p className="text-[#B8B8B8]">Strategic overview of facility operations</p>
        </div>
        <AIIntelligenceBadge />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="border-[#222222] bg-[#161616] card-hover">
                <CardContent className="p-6">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bg}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-[#B8B8B8]">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="border-[#D4AF37]/20 bg-[#161616] gold-glow-subtle">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Brain className="h-5 w-5 text-[#D4AF37]" />
                  AI Asset Intelligence
                </CardTitle>
                <CardDescription className="text-[#B8B8B8]">Live health monitoring across all facilities</CardDescription>
              </div>
              <Badge variant="outline" className="gap-1.5 text-xs border-[#D4AF37]/30 text-[#D4AF37]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]" />
                </span>
                {mockAssetHealthData.filter(a => a.status !== "healthy").length} flags
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {mockAssetHealthData.slice(0, 6).map((asset, i) => (
                <AssetHealthCard key={asset.id} data={asset} index={i} />
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-[#222222]">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#B8B8B8]">Facility Health Index</span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-white"><span className="h-2.5 w-2.5 rounded-full bg-[#D4AF37]" /> Healthy: {mockAssetHealthData.filter(a => a.status === "healthy").length}</span>
                  <span className="flex items-center gap-1 text-white"><span className="h-2.5 w-2.5 rounded-full bg-[#E1B000]" /> Warning: {mockAssetHealthData.filter(a => a.status === "warning").length}</span>
                  <span className="flex items-center gap-1 text-white"><span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" /> Critical: {mockAssetHealthData.filter(a => a.status === "critical").length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Card className="border-[#222222] bg-[#161616]">
        <CardHeader>
          <CardTitle className="text-white">Facility Performance</CardTitle>
          <CardDescription className="text-[#B8B8B8]">Maintenance metrics by facility</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {facilityPerformance.map((f, i) => (
              <motion.div key={f.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-4 rounded-lg border border-[#222222] hover:bg-white/5 transition-colors">
                <div>
                  <p className="font-medium text-white">{f.name}</p>
                  <p className="text-sm text-[#7A7A7A]">{f.completed}/{f.workOrders} work orders completed</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{f.rating}%</p>
                    <p className="text-xs text-[#7A7A7A]">Performance</p>
                  </div>
                  <Badge variant={f.status === "optimal" ? "success" : f.status === "good" ? "info" : "warning"}>
                    {f.status}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-[#222222] bg-[#161616]">
          <CardHeader>
            <CardTitle className="text-white">Maintenance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Preventive Maintenance", value: "65%", color: "bg-[#D4AF37]" },
                { label: "Corrective Maintenance", value: "25%", color: "bg-[#E1B000]" },
                { label: "Emergency Repairs", value: "10%", color: "bg-[#EF4444]" },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white">{m.label}</span>
                    <span className="font-medium text-white">{m.value}</span>
                  </div>
                  <div className="h-2 bg-[#222222] rounded-full overflow-hidden">
                    <div className={`h-full ${m.color} rounded-full transition-all`} style={{ width: m.value }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <PreventiveMaintenancePanel suggestions={mockPreventiveSuggestions.slice(0, 4)} />
      </div>
    </div>
  );
}
