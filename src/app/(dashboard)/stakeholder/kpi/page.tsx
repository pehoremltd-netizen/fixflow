"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Building2, Wrench, Clock, CheckCircle2, DollarSign } from "lucide-react";

const kpis = [
  { label: "Facility Performance", value: "94%", change: "+2.3%", icon: Building2, color: "text-[#D4AF37]" },
  { label: "Preventive Maintenance", value: "87%", change: "+5%", icon: Wrench, color: "text-green-500" },
  { label: "Avg Resolution Time", value: "4.2h", change: "-0.8h", icon: Clock, color: "text-[#E1B000]" },
  { label: "First-Time Fix Rate", value: "92%", change: "+3%", icon: CheckCircle2, color: "text-green-500" },
  { label: "Cost per SQ FT", value: "$2.45", change: "-$0.15", icon: DollarSign, color: "text-orange-500" },
  { label: "Asset Utilization", value: "87%", change: "+4%", icon: TrendingUp, color: "text-[#D4AF37]" },
];

export default function KPIPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Key Performance Indicators</h1>
      <p className="text-muted-foreground">Track facility and maintenance KPIs</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <Icon className={`h-8 w-8 ${kpi.color}`} />
                  <Badge variant="success">{kpi.change}</Badge>
                </div>
                <p className="text-3xl font-bold">{kpi.value}</p>
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
