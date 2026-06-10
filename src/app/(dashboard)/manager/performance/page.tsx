"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Star, TrendingUp } from "lucide-react";

const teamPerformance = [
  { name: "Mike Chen", role: "HVAC Tech", tasks: 48, rating: 98, trend: "up" },
  { name: "Sarah Lee", role: "Electrician", tasks: 42, rating: 95, trend: "up" },
  { name: "Emma Wilson", role: "Fire Safety", tasks: 38, rating: 93, trend: "up" },
  { name: "John Doe", role: "Plumber", tasks: 35, rating: 90, trend: "down" },
];

export default function PerformancePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Staff Performance</h1>

      <Card>
        <CardHeader>
          <CardTitle>Team Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamPerformance.map((p) => (
              <div key={p.name} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-muted-foreground">{p.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="font-medium">{p.tasks}</p>
                    <p className="text-xs text-muted-foreground">Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{p.rating}%</p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                  <Badge variant={p.trend === "up" ? "success" : "destructive"}>
                    {p.trend === "up" ? "Improving" : "Declining"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
