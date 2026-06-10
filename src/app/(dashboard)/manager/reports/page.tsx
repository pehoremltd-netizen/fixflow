"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Clock, CheckCircle2 } from "lucide-react";

const metrics = [
  { label: "Avg Response Time", value: "1.2h", change: "-15m", icon: Clock, color: "text-[#D4AF37]" },
  { label: "Cost per WO", value: "$245", change: "-8%", icon: DollarSign, color: "text-green-500" },
  { label: "Completion Rate", value: "94%", change: "+3%", icon: CheckCircle2, color: "text-green-500" },
  { label: "Staff Efficiency", value: "92%", change: "+5%", icon: TrendingUp, color: "text-[#E1B000]" },
];

export default function ManagerReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Facility performance analytics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label}>
              <CardContent className="p-6">
                <Icon className={`h-8 w-8 ${m.color} mb-3`} />
                <p className="text-2xl font-bold">{m.value}</p>
                <p className="text-sm text-muted-foreground">{m.label}</p>
                <p className="text-xs text-green-600 mt-1">{m.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
