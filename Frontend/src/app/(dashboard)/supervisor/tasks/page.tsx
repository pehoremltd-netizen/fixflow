"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";



export default function TasksPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Task Management</h1>
      <p className="text-secondary-foreground">Assign and monitor team tasks</p>

      <Card className="border-border bg-input-bg">
        <CardHeader>
          <CardTitle className="text-foreground">Active Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-text-tertiary"><p>No data available.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}
