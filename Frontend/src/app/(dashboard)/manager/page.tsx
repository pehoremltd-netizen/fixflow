"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Wrench, ClipboardCheck, TrendingUp, Users, Clock, AlertTriangle, CheckCircle2, Brain } from "lucide-react";
import Link from "next/link";
import { AssetHealthCard } from "@/components/ai/asset-health-card";
import { PreventiveMaintenancePanel } from "@/components/ai/preventive-maintenance-panel";
import { AIIntelligenceBadge } from "@/components/ai/ai-intelligence-badge";
import { mockAssetHealthData, mockPreventiveSuggestions } from "@/lib/store/ai-intelligence";



export default function ManagerDashboard() {
  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manager Dashboard</h1>
          <p className="text-secondary-foreground">Strategic overview of facility operations</p>
        </div>
        <AIIntelligenceBadge />
      </div>

      <div className="flex flex-col items-center justify-center py-12 text-text-tertiary"><p>No data available.</p></div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="border-primary/20 bg-card gold-glow-subtle">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Brain className="h-5 w-5 text-primary" />
                  AI Asset Intelligence
                </CardTitle>
                <CardDescription className="text-secondary-foreground">Live health monitoring across all facilities</CardDescription>
              </div>
              <Badge variant="outline" className="gap-1.5 text-xs border-primary/30 text-primary">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
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
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-foreground">Facility Health Index</span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-foreground"><span className="h-2.5 w-2.5 rounded-full bg-primary" /> Healthy: {mockAssetHealthData.filter(a => a.status === "healthy").length}</span>
                  <span className="flex items-center gap-1 text-foreground"><span className="h-2.5 w-2.5 rounded-full bg-mustard" /> Warning: {mockAssetHealthData.filter(a => a.status === "warning").length}</span>
                  <span className="flex items-center gap-1 text-foreground"><span className="h-2.5 w-2.5 rounded-full bg-destructive" /> Critical: {mockAssetHealthData.filter(a => a.status === "critical").length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="flex flex-col items-center justify-center py-12 text-text-tertiary"><p>No data available.</p></div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col items-center justify-center py-12 text-text-tertiary"><p>No data available.</p></div>

        <PreventiveMaintenancePanel suggestions={mockPreventiveSuggestions.slice(0, 4)} />
      </div>
    </div>
  );
}
