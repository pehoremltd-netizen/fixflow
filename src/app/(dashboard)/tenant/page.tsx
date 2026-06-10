"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Home, Wrench, Clock, CheckCircle2, AlertTriangle, ArrowRight, FileText, MessageSquare } from "lucide-react";
import Link from "next/link";

const stats = [
  { label: "Open Requests", value: "2", icon: Wrench, color: "text-orange-600", bg: "bg-orange-100" },
  { label: "Resolved This Month", value: "5", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
  { label: "Avg. Response", value: "4.2h", icon: Clock, color: "text-[#D4AF37]", bg: "bg-[#D4AF37]/10" },
  { label: "Notifications", value: "3", icon: MessageSquare, color: "text-[#E1B000]", bg: "bg-[#E1B000]/10" },
];

const recentRequests = [
  { id: "REQ-001", title: "AC not cooling properly", status: "in-progress", date: "Jun 7, 2026", priority: "high" },
  { id: "REQ-002", title: "Light fixture broken in hallway", status: "completed", date: "Jun 5, 2026", priority: "medium" },
  { id: "REQ-003", title: "Water pressure low in bathroom", status: "submitted", date: "Jun 8, 2026", priority: "medium" },
];

export default function TenantDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tenant Portal</h1>
        <p className="text-muted-foreground">Submit and track maintenance requests</p>
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
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Requests</CardTitle>
                <CardDescription>Recent maintenance requests</CardDescription>
              </div>
              <Link href="/tenant/requests">
                <Button variant="ghost" size="sm" className="gap-1">View All <ArrowRight className="h-3 w-3" /></Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        req.priority === "high" ? "bg-[#E1B000]/10" : "bg-[#D4AF37]/10"
                      }`}>
                        {req.priority === "high" ? (
                          <AlertTriangle className="h-5 w-5 text-orange-600" />
                        ) : (
                          <Wrench className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground">{req.id}</span>
                        </div>
                        <p className="text-sm font-medium">{req.title}</p>
                        <p className="text-xs text-muted-foreground">{req.date}</p>
                      </div>
                    </div>
                    <Badge variant={req.status === "completed" ? "success" : req.status === "in-progress" ? "info" : "warning"}>
                      {req.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Submit Request</CardTitle>
              <CardDescription>Report a maintenance issue</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full gap-2">
                    <Plus className="h-4 w-4" /> New Request
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Submit Maintenance Request</DialogTitle>
                  </DialogHeader>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input placeholder="Brief description of the issue" />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="plumbing">Plumbing</SelectItem>
                          <SelectItem value="electrical">Electrical</SelectItem>
                          <SelectItem value="hvac">HVAC</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select>
                        <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <textarea className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Describe the issue in detail..." />
                    </div>
                    <Button type="submit" className="w-full">Submit Request</Button>
                  </form>
                </DialogContent>
              </Dialog>

              <div className="mt-6 space-y-3">
                <Link href="/tenant/history">
                  <Button variant="outline" className="w-full justify-start gap-3 h-12">
                    <Clock className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="text-sm font-medium">Service History</p>
                      <p className="text-xs text-muted-foreground">Past requests</p>
                    </div>
                  </Button>
                </Link>
                <Link href="/tenant/documents">
                  <Button variant="outline" className="w-full justify-start gap-3 h-12">
                    <FileText className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="text-sm font-medium">Documents</p>
                      <p className="text-xs text-muted-foreground">Important info</p>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
