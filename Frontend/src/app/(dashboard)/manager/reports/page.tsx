"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Clock, CheckCircle2 } from "lucide-react";



export default function ManagerReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports</h1>
        <p className="text-secondary-foreground">Facility performance analytics</p>
      </div>

      <div className="flex flex-col items-center justify-center py-12 text-text-tertiary"><p>No data available.</p></div>
    </div>
  );
}
