"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Building2, Wrench, Clock, CheckCircle2, DollarSign } from "lucide-react";



export default function KPIPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Key Performance Indicators</h1>
      <p className="text-secondary-foreground">Track facility and maintenance KPIs</p>

      <div className="flex flex-col items-center justify-center py-12 text-text-tertiary"><p>No data available.</p></div>
    </div>
  );
}
