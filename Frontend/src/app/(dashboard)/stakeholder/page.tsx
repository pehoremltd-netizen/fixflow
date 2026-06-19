"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  DollarSign,
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BarChart3,
  Activity,
  FileText,
  Brain,
  Target,
  Users,
} from "lucide-react";
import Link from "next/link";
import { AIIntelligenceBadge } from "@/components/ai/ai-intelligence-badge";



export default function StakeholderDashboard() {
  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stakeholder Dashboard</h1>
          <p className="text-secondary-foreground">Portfolio performance and project oversight</p>
        </div>
        <div className="flex items-center gap-3">
          <AIIntelligenceBadge />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4" />
            <span>Q3 2026</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-12 text-text-tertiary"><p>No data available.</p></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="border-primary/20 bg-input-bg gold-glow-subtle">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Brain className="h-5 w-5 text-primary" />
                  AI Portfolio Intelligence
                </CardTitle>
                <CardDescription className="text-secondary-foreground">
                  Predictive insights across all assets and investments
                </CardDescription>
              </div>
              <Badge variant="outline" className="gap-1.5 text-xs border-primary/30 text-primary">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-text-tertiary"><p>No data available.</p></div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col items-center justify-center py-12 text-text-tertiary"><p>No data available.</p></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-col items-center justify-center py-12 text-text-tertiary"><p>No data available.</p></div>

          <div className="flex flex-col items-center justify-center py-12 mt-6 text-text-tertiary"><p>No data available.</p></div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex flex-col items-center justify-center py-12 text-text-tertiary"><p>No data available.</p></div>
      </motion.div>
    </div>
  );
}
