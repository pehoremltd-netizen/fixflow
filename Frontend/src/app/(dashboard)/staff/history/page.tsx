"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, ClipboardCheck, Wrench } from "lucide-react";



export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Activity History</h1>
      <p className="text-secondary-foreground">Your complete work history</p>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
          <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="flex flex-col items-center justify-center py-12 text-text-tertiary"><p>No data available.</p></div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
