"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Wrench,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Target,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const metrics = [
  { label: "Work Order Completion", value: "94%", change: "+2.5%", trend: "up" },
  { label: "Avg. Response Time", value: "1.2h", change: "-15min", trend: "down" },
  { label: "Preventive vs Corrective", value: "65/35", change: "Optimal", trend: "up" },
  { label: "Asset Utilization", value: "87%", change: "+3%", trend: "up" },
  { label: "Staff Productivity", value: "92%", change: "+5%", trend: "up" },
  { label: "Budget Utilization", value: "$48.2K", change: "62%", trend: "neutral" },
];

const monthlyData = [
  { month: "Jan", workOrders: 45, inspections: 22, completed: 38, overdue: 7 },
  { month: "Feb", workOrders: 52, inspections: 28, completed: 44, overdue: 8 },
  { month: "Mar", workOrders: 48, inspections: 25, completed: 40, overdue: 5 },
  { month: "Apr", workOrders: 63, inspections: 30, completed: 55, overdue: 10 },
  { month: "May", workOrders: 58, inspections: 27, completed: 50, overdue: 6 },
  { month: "Jun", workOrders: 42, inspections: 20, completed: 36, overdue: 4 },
];

const complianceData = [
  { name: "Preventive", value: 40, color: "#D4AF37" },
  { name: "Corrective", value: 25, color: "#E05C5C" },
  { name: "Inspection", value: 20, color: "#4A9EFF" },
  { name: "Emergency", value: 15, color: "#F97316" },
];

const topPerformer = [
  { name: "Mike Chen", role: "HVAC Tech", completed: 48, rating: 98 },
  { name: "Sarah Lee", role: "Electrician", completed: 42, rating: 95 },
  { name: "Emma Wilson", role: "Fire Safety", completed: 38, rating: 93 },
  { name: "John Doe", role: "Plumber", completed: 35, rating: 90 },
];

const categoryData = [
  { category: "HVAC", scheduled: 28, emergency: 12 },
  { category: "Electrical", scheduled: 22, emergency: 8 },
  { category: "Plumbing", scheduled: 18, emergency: 10 },
  { category: "Fire Safety", scheduled: 15, emergency: 5 },
  { category: "Structural", scheduled: 10, emergency: 7 },
];

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up") return <TrendingUp className="h-3 w-3 text-green-500" />;
  if (trend === "down") return <TrendingDown className="h-3 w-3 text-red-500" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-[#222222] bg-[#161616] p-3 shadow-xl">
        <p className="text-sm font-medium text-white mb-2">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-sm flex items-center gap-2" style={{ color: entry.color }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.name}: <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#E1B000] bg-clip-text text-transparent">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground">Company-wide performance metrics and insights</p>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-[#222222] bg-[#161616] hover:border-[#D4AF37]/30 transition-all duration-300">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">
                    {metric.label}
                  </p>
                  <TrendIcon trend={metric.trend} />
                </div>
                <p className="text-lg font-bold text-white">{metric.value}</p>
                <Badge
                  variant={
                    metric.trend === "up" ? "success" :
                    metric.trend === "down" ? "warning" : "secondary"
                  }
                  className="text-[10px] px-1.5 py-0 mt-1"
                >
                  {metric.change}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-[#111111] border border-[#222222]">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">Overview</TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">Performance</TabsTrigger>
          <TabsTrigger value="assets" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">Assets</TabsTrigger>
          <TabsTrigger value="staff" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">Staff</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="border-[#222222] bg-[#161616] lg:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                  <Target className="h-4 w-4 text-[#D4AF37]" />
                  Maintenance Ratio
                </CardTitle>
                <CardDescription className="text-xs">Preventive vs Corrective</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={complianceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {complianceData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-2">
                  {complianceData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-muted-foreground">
                        {item.name}: <span className="text-white font-medium">{item.value}%</span>
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#222222] bg-[#161616] lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#D4AF37]" />
                  Monthly Performance Trends
                </CardTitle>
                <CardDescription className="text-xs">Work orders and inspections over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                      <XAxis dataKey="month" stroke="#7A7A7A" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#7A7A7A" tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: "11px", color: "#7A7A7A" }} />
                      <Line
                        type="monotone"
                        dataKey="workOrders"
                        stroke="#D4AF37"
                        strokeWidth={2}
                        dot={{ fill: "#D4AF37", strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 5, fill: "#D4AF37" }}
                        name="Work Orders"
                      />
                      <Line
                        type="monotone"
                        dataKey="inspections"
                        stroke="#4A9EFF"
                        strokeWidth={2}
                        dot={{ fill: "#4A9EFF", strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 5, fill: "#4A9EFF" }}
                        name="Inspections"
                      />
                      <Line
                        type="monotone"
                        dataKey="completed"
                        stroke="#22C55E"
                        strokeWidth={2}
                        dot={{ fill: "#22C55E", strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 5, fill: "#22C55E" }}
                        name="Completed"
                      />
                      <Line
                        type="monotone"
                        dataKey="overdue"
                        stroke="#E05C5C"
                        strokeWidth={2}
                        dot={{ fill: "#E05C5C", strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 5, fill: "#E05C5C" }}
                        name="Overdue"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-[#222222] bg-[#161616]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-[#D4AF37]" />
                Top Performing Staff
              </CardTitle>
              <CardDescription className="text-xs">Highest completion rates this quarter</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {topPerformer.map((p, i) => (
                  <div
                    key={p.name}
                    className="flex items-center gap-3 p-3 rounded-lg border border-[#222222] bg-black/20 hover:border-[#D4AF37]/30 transition-all duration-300"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/10 text-sm font-bold text-[#D4AF37]">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-white truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{p.role}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-green-500">{p.completed} tasks</span>
                        <span className="text-xs text-[#D4AF37]">{p.rating}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Avg. Resolution Time", value: "4.2 hours", icon: Clock, color: "text-[#D4AF37]" },
              { label: "First-Time Fix Rate", value: "87%", icon: CheckCircle2, color: "text-green-500" },
              { label: "Overdue Tasks", value: "12", icon: AlertTriangle, color: "text-red-500" },
              { label: "Cost per Work Order", value: "$245", icon: DollarSign, color: "text-[#E1B000]" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.label} className="border-[#222222] bg-[#161616]">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-black/30">
                      <Icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-lg font-bold text-white">{item.value}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="border-[#222222] bg-[#161616]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[#D4AF37]" />
                Work Orders by Category
              </CardTitle>
              <CardDescription className="text-xs">Scheduled vs emergency breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                    <XAxis dataKey="category" stroke="#7A7A7A" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#7A7A7A" tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: "11px", color: "#7A7A7A" }} />
                    <Bar dataKey="scheduled" fill="#D4AF37" radius={[4, 4, 0, 0]} name="Scheduled" />
                    <Bar dataKey="emergency" fill="#E1B000" radius={[4, 4, 0, 0]} name="Emergency" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Total Assets", value: "1,247", change: "+12 this month", icon: Wrench },
              { label: "Assets in Service", value: "1,182", change: "94.8% uptime", icon: CheckCircle2 },
              { label: "Assets Under Repair", value: "65", change: "5.2% of fleet", icon: AlertTriangle },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.label} className="border-[#222222] bg-[#161616]">
                  <CardContent className="p-4">
                    <div className="p-2 rounded-lg bg-black/30 w-fit mb-2">
                      <Icon className="h-5 w-5 text-[#D4AF37]" />
                    </div>
                    <p className="text-2xl font-bold text-white">{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-xs text-[#D4AF37] mt-1">{item.change}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <Card className="border-[#222222] bg-[#161616]">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-white">Asset Lifecycle Distribution</CardTitle>
              <CardDescription className="text-xs">Age and condition analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { age: "0-2 yrs", count: 420 },
                    { age: "2-5 yrs", count: 380 },
                    { age: "5-10 yrs", count: 295 },
                    { age: "10+ yrs", count: 152 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                    <XAxis dataKey="age" stroke="#7A7A7A" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#7A7A7A" tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#D4AF37" radius={[4, 4, 0, 0]} name="Assets" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: "Total Staff", value: "48", icon: Users, color: "text-[#D4AF37]" },
              { label: "On Duty", value: "36", icon: CheckCircle2, color: "text-green-500" },
              { label: "On Leave", value: "8", icon: Clock, color: "text-mustard" },
              { label: "Offline", value: "4", icon: AlertTriangle, color: "text-red-500" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.label} className="border-[#222222] bg-[#161616]">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-black/30">
                      <Icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-lg font-bold text-white">{item.value}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <Card className="border-[#222222] bg-[#161616]">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-white">Staff Performance by Department</CardTitle>
              <CardDescription className="text-xs">Productivity ratings across teams</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { dept: "HVAC", productivity: 94, attendance: 96 },
                    { dept: "Electrical", productivity: 91, attendance: 93 },
                    { dept: "Plumbing", productivity: 88, attendance: 95 },
                    { dept: "Fire Safety", productivity: 93, attendance: 97 },
                    { dept: "Structural", productivity: 85, attendance: 90 },
                  ]} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                    <XAxis dataKey="dept" stroke="#7A7A7A" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#7A7A7A" tick={{ fontSize: 11 }} domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: "11px", color: "#7A7A7A" }} />
                    <Bar dataKey="productivity" fill="#D4AF37" radius={[4, 4, 0, 0]} name="Productivity %" />
                    <Bar dataKey="attendance" fill="#E1B000" radius={[4, 4, 0, 0]} name="Attendance %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
