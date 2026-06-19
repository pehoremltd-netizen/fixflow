"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, ClipboardCheck, Clock, Wrench, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";



export default function SupervisorDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Supervisor Dashboard</h1>
        <p className="text-secondary-foreground">Team operations overview</p>
      </div>

      <div className="flex flex-col items-center justify-center py-12 text-text-tertiary"><p>No data available.</p></div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col items-center justify-center py-12 text-text-tertiary"><p>No data available.</p></div>

        <Card className="border-border bg-input-bg">
          <CardHeader>
            <CardTitle className="text-foreground">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Assign Tasks", href: "/supervisor/tasks", icon: ClipboardCheck },
                { label: "Team Roster", href: "/supervisor/team", icon: Users },
                { label: "Inspections", href: "/supervisor/inspections", icon: ClipboardCheck },
                { label: "Attendance", href: "/supervisor/attendance", icon: Clock },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.label} href={action.href}
                    className="flex flex-col items-center gap-2 rounded-lg border p-4 hover:bg-accent transition-all"
                  >
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs font-medium">{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
