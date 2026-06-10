"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, ClipboardCheck, Clock, Wrench, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

const stats = [
  { label: "Team Members", value: "8", icon: Users, color: "text-[#D4AF37]", bg: "bg-[#D4AF37]/10" },
  { label: "Active Tasks", value: "15", icon: Wrench, color: "text-orange-600", bg: "bg-orange-100" },
  { label: "Today's Inspections", value: "6", icon: ClipboardCheck, color: "text-[#E1B000]", bg: "bg-[#E1B000]/10" },
  { label: "Attendance Today", value: "7/8", icon: Clock, color: "text-green-600", bg: "bg-green-100" },
];

const teamToday = [
  { name: "Mike Chen", task: "HVAC Maintenance - Bldg A", status: "in-progress", time: "2h remaining" },
  { name: "Sarah Lee", task: "Electrical Panel Inspection", status: "completed", time: "Done" },
  { name: "Emma Wilson", task: "Fire Safety Check - West Wing", status: "in-progress", time: "3h remaining" },
  { name: "John Doe", task: "Plumbing Repair - 2nd Floor", status: "pending", time: "Not started" },
  { name: "Tom Green", task: "Generator Maintenance", status: "pending", time: "Not started" },
];

export default function SupervisorDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Supervisor Dashboard</h1>
        <p className="text-muted-foreground">Team operations overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card>
                <CardContent className="p-6">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bg}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Team Today</CardTitle>
              <CardDescription>Current task status</CardDescription>
            </div>
            <Link href="/supervisor/team">
              <Button variant="ghost" size="sm" className="gap-1">View All <ArrowRight className="h-3 w-3" /></Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamToday.map((member) => (
                <div key={member.name} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.task}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      member.status === "completed" ? "success" :
                      member.status === "in-progress" ? "info" :
                      "warning"
                    } className="text-xs">
                      {member.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{member.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
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
