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

const portfolioStats = [
  { label: "Total Investment", value: "$12.5M", change: "+$850K", icon: DollarSign, color: "text-[#D4AF37]", bg: "bg-[#D4AF37]/10" },
  { label: "Portfolio Health", value: "92%", change: "+3%", icon: TrendingUp, color: "text-[#D4AF37]", bg: "bg-[#D4AF37]/10" },
  { label: "Facilities", value: "12", change: "Operational", icon: Building2, color: "text-[#E1B000]", bg: "bg-[#E1B000]/10" },
  { label: "ROI", value: "18.5%", change: "+2.1%", icon: Target, color: "text-[#E1B000]", bg: "bg-[#E1B000]/10" },
];

const projectMilestones = [
  { name: "Building A Renovation", progress: 85, deadline: "Q3 2026", status: "on-track", budget: "$4.2M" },
  { name: "West Wing Expansion", progress: 62, deadline: "Q1 2027", status: "on-track", budget: "$3.8M" },
  { name: "HVAC Upgrade Program", progress: 45, deadline: "Q4 2026", status: "at-risk", budget: "$1.5M" },
  { name: "Facility Automation", progress: 90, deadline: "Q3 2026", status: "on-track", budget: "$2.1M" },
  { name: "Parking Structure", progress: 20, deadline: "Q2 2027", status: "delayed", budget: "$900K" },
];

const kpiHighlights = [
  { label: "Energy Efficiency", value: "94%", change: "+5%", trend: "up" },
  { label: "SLA Compliance", value: "98%", change: "+1%", trend: "up" },
  { label: "Tenant Satisfaction", value: "87%", change: "+3%", trend: "up" },
  { label: "Maintenance Cost/SF", value: "$2.14", change: "-$0.18", trend: "down" },
];

const recentActivities = [
  { action: "Building A Renovation Phase 3 Approved", site: "Building A", date: "Jun 8, 2026", type: "milestone" },
  { action: "Quarterly Portfolio Review Completed", site: "All Facilities", date: "Jun 7, 2026", type: "review" },
  { action: "Energy Audit Report Published", site: "West Wing", date: "Jun 6, 2026", type: "report" },
  { action: "New HVAC Contractor Onboarded", site: "Building B", date: "Jun 5, 2026", type: "procurement" },
  { action: "Fire Safety Compliance Cert Renewed", site: "All Facilities", date: "Jun 4, 2026", type: "compliance" },
];

export default function StakeholderDashboard() {
  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Stakeholder Dashboard</h1>
          <p className="text-[#B8B8B8]">Portfolio performance and project oversight</p>
        </div>
        <div className="flex items-center gap-3">
          <AIIntelligenceBadge />
          <div className="flex items-center gap-2 text-sm text-[#7A7A7A]">
            <Activity className="h-4 w-4" />
            <span>Q3 2026</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {portfolioStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-[#222222] bg-[#161616] card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bg}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <Badge variant="success" className="text-xs">
                      {stat.change}
                    </Badge>
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="border-[#D4AF37]/20 bg-[#161616] gold-glow-subtle">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Brain className="h-5 w-5 text-[#D4AF37]" />
                  AI Portfolio Intelligence
                </CardTitle>
                <CardDescription className="text-[#B8B8B8]">
                  Predictive insights across all assets and investments
                </CardDescription>
              </div>
              <Badge variant="outline" className="gap-1.5 text-xs border-[#D4AF37]/30 text-[#D4AF37]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]" />
                </span>
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 lg:grid-cols-3 mb-4">
              {[
                { label: "Assets at Risk", value: "3", sub: "Requires attention", color: "text-[#EF4444]" },
                { label: "Upcoming Capex", value: "$1.2M", sub: "Next 90 days", color: "text-[#D4AF37]" },
                { label: "Projected Savings", value: "$340K", sub: "Annual optimization", color: "text-[#22C55E]" },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-[#222222] p-4">
                  <p className="text-sm text-[#7A7A7A]">{item.label}</p>
                  <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                  <p className="text-xs text-[#7A7A7A]">{item.sub}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-sm text-[#B8B8B8] p-3 rounded-lg border border-[#222222]">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[#E1B000]" />
                <span>2 projects flagged for review in Q3 portfolio assessment</span>
              </span>
              <Link href="/stakeholder/reports" className="text-[#D4AF37] hover:underline text-xs">
                View Report
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-[#222222] bg-[#161616]">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Project Milestones</CardTitle>
                <CardDescription className="text-[#B8B8B8]">Capital project tracking</CardDescription>
              </div>
              <Link href="/stakeholder/kpi" className="text-sm text-[#D4AF37] hover:underline">
                View All
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projectMilestones.map((project) => (
                  <div
                    key={project.name}
                    className="p-3 rounded-lg border border-[#222222] hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-white">{project.name}</p>
                      <Badge
                        variant={
                          project.status === "on-track"
                            ? "success"
                            : project.status === "at-risk"
                            ? "warning"
                            : "destructive"
                        }
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#7A7A7A] mb-2">
                      <span>Budget: {project.budget}</span>
                      <span>Deadline: {project.deadline}</span>
                    </div>
                    <div className="h-2 bg-[#222222] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#D4AF37] rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#7A7A7A] mt-1">{project.progress}% complete</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-[#222222] bg-[#161616]">
            <CardHeader>
              <CardTitle className="text-white">KPI Highlights</CardTitle>
              <CardDescription className="text-[#B8B8B8]">Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {kpiHighlights.map((kpi) => (
                  <div
                    key={kpi.label}
                    className="flex items-center justify-between p-3 rounded-lg border border-[#222222] hover:bg-white/5 transition-colors"
                  >
                    <div>
                      <p className="text-sm text-[#B8B8B8]">{kpi.label}</p>
                      <p className="text-lg font-bold text-white">{kpi.value}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={kpi.trend === "up" ? "success" : "info"} className="text-xs">
                        {kpi.change}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#222222] bg-[#161616] mt-6">
            <CardHeader>
              <CardTitle className="text-white">Recent Activities</CardTitle>
              <CardDescription className="text-[#B8B8B8]">Latest portfolio updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg border border-[#222222] hover:bg-white/5 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{activity.action}</p>
                      <p className="text-xs text-[#7A7A7A]">
                        {activity.site} · {activity.date}
                      </p>
                    </div>
                    <Badge
                      variant={
                        activity.type === "milestone"
                          ? "success"
                          : activity.type === "compliance"
                          ? "info"
                          : "default"
                      }
                      className="ml-3"
                    >
                      {activity.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-[#222222] bg-[#161616]">
          <CardHeader>
            <CardTitle className="text-white">Quick Access</CardTitle>
            <CardDescription className="text-[#B8B8B8]">Stakeholder resources and tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Reports", icon: BarChart3, href: "/stakeholder/reports" },
                { label: "KPIs", icon: Activity, href: "/stakeholder/kpi" },
                { label: "Documents", icon: FileText, href: "/stakeholder/documents" },
                { label: "Stakeholders", icon: Users, href: "/admin/stakeholders" },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex flex-col items-center justify-center gap-2 rounded-lg border border-[#222222] p-4 hover:bg-white/5 hover:border-[#D4AF37]/30 transition-all group"
                  >
                    <Icon className="h-6 w-6 text-[#7A7A7A] group-hover:text-[#D4AF37] transition-colors" />
                    <span className="text-sm font-medium text-white">{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
