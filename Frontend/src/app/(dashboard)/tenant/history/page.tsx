"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Wrench, CheckCircle2 } from "lucide-react";



export default function TenantHistoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Service History</h1>
      <p className="text-secondary-foreground">Past maintenance requests and resolutions</p>

      <div className="flex flex-col items-center justify-center py-12 text-text-tertiary"><p>No data available.</p></div>
    </div>
  );
}
