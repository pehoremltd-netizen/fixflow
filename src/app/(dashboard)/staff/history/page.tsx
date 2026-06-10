"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, ClipboardCheck, Wrench } from "lucide-react";

const activities = [
  { type: "inspection", title: "Electrical Inspection - Building A", date: "Jun 5, 2026", status: "submitted" },
  { type: "work-order", title: "Filter Replacement - HVAC Unit 3", date: "Jun 4, 2026", status: "completed" },
  { type: "inspection", title: "Plumbing Inspection - Building B", date: "Jun 3, 2026", status: "approved" },
  { type: "attendance", title: "Clock In/Out - Building A", date: "Jun 8, 2026", status: "verified" },
  { type: "work-order", title: "Emergency Light Repair", date: "Jun 2, 2026", status: "completed" },
  { type: "inspection", title: "Fire Safety Check - West Wing", date: "Jun 1, 2026", status: "submitted" },
];

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Activity History</h1>
      <p className="text-muted-foreground">Your complete work history</p>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
          <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardContent className="p-0">
              {activities.map((activity, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border-b last:border-0 hover:bg-accent/50 transition-colors">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    activity.type === "inspection" ? "bg-[#E1B000]/10" :
                    activity.type === "work-order" ? "bg-[#D4AF37]/10" : "bg-green-500/10"
                  }`}>
                    {activity.type === "inspection" ? (
                      <ClipboardCheck className="h-5 w-5 text-[#E1B000]" />
                    ) : activity.type === "work-order" ? (
                      <Wrench className="h-5 w-5 text-[#D4AF37]" />
                    ) : (
                      <Clock className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.date}</p>
                  </div>
                  <Badge variant={
                    activity.status === "completed" || activity.status === "approved" || activity.status === "verified"
                      ? "success" : "info"
                  }>
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
