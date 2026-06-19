"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Star, TrendingUp } from "lucide-react";



export default function PerformancePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Staff Performance</h1>

      <Card className="border-border bg-input-bg">
        <CardHeader>
          <CardTitle className="text-foreground">Team Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-text-tertiary"><p>No data available.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}
