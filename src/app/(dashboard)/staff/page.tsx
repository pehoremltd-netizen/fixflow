"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Clock, Wrench, CheckCircle2, AlertTriangle, ArrowRight, QrCode, MapPin } from "lucide-react";
import Link from "next/link";

const stats = [
  { label: "Today's Tasks", value: "4", icon: ClipboardCheck, color: "text-[#D4AF37]", bg: "bg-[#D4AF37]/10" },
  { label: "Completed", value: "12", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
  { label: "Pending", value: "3", icon: Clock, color: "text-orange-600", bg: "bg-orange-100" },
  { label: "Attendance", value: "Clocked In", icon: Clock, color: "text-[#E1B000]", bg: "bg-[#E1B000]/10" },
];

const todaysTasks = [
  { title: "Electrical Inspection - Bldg A", type: "Inspection", priority: "high", status: "pending", time: "9:00 AM" },
  { title: "HVAC Filter Replacement", type: "Work Order", priority: "medium", status: "in-progress", time: "10:30 AM" },
  { title: "Plumbing Check - Unit 201", type: "Work Order", priority: "low", status: "pending", time: "1:00 PM" },
  { title: "Fire Safety Inspection", type: "Inspection", priority: "high", status: "pending", time: "3:00 PM" },
];

export default function StaffDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Staff Dashboard</h1>
        <p className="text-muted-foreground">Your daily maintenance tasks</p>
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Tasks */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Today's Schedule</CardTitle>
                <CardDescription>Your tasks for today</CardDescription>
              </div>
              <Link href="/staff/work-orders">
                <Button variant="ghost" size="sm" className="gap-1">All Tasks <ArrowRight className="h-3 w-3" /></Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todaysTasks.map((task, i) => (
                  <motion.div
                    key={task.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        task.type === "Inspection" ? "bg-[#E1B000]/10" : "bg-[#D4AF37]/10"
                      }`}>
                        {task.type === "Inspection" ? (
                          <ClipboardCheck className="h-5 w-5 text-purple-600" />
                        ) : (
                          <Wrench className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{task.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{task.type}</span>
                          <span>·</span>
                          <span>{task.time}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={
                      task.status === "completed" ? "success" :
                      task.status === "in-progress" ? "info" : "warning"
                    }>
                      {task.status}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/staff/attendance">
                <Button variant="outline" className="w-full justify-start gap-3 h-12">
                  <QrCode className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Clock In/Out</p>
                    <p className="text-xs text-muted-foreground">Scan QR code</p>
                  </div>
                </Button>
              </Link>
              <Link href="/staff/inspections">
                <Button variant="outline" className="w-full justify-start gap-3 h-12">
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="text-sm font-medium">New Inspection</p>
                    <p className="text-xs text-muted-foreground">Start a new report</p>
                  </div>
                </Button>
              </Link>
              <Link href="/staff/attendance">
                <Button variant="outline" className="w-full justify-start gap-3 h-12">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="text-sm font-medium">GPS Status</p>
                    <p className="text-xs text-green-600">Within work zone</p>
                  </div>
                </Button>
              </Link>
              <Link href="/staff/history">
                <Button variant="outline" className="w-full justify-start gap-3 h-12">
                  <Clock className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="text-sm font-medium">My History</p>
                    <p className="text-xs text-muted-foreground">Past activities</p>
                  </div>
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Current Status */}
          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <p className="font-semibold text-lg">Clocked In</p>
                <p className="text-sm text-muted-foreground">Since 7:55 AM</p>
                <p className="text-xs text-green-600 mt-2">GPS Verified · Building A</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
