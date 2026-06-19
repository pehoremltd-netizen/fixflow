"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, Clock, CheckCircle2, AlertTriangle } from "lucide-react";



export default function RequestsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Maintenance Requests</h1>
      <p className="text-secondary-foreground">Track your submitted requests</p>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="flex flex-col items-center justify-center py-12 text-text-tertiary"><p>No data available.</p></div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
