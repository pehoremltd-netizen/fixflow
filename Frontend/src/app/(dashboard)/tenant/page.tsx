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



export default function TenantDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tenant Portal</h1>
        <p className="text-secondary-foreground">Submit and track maintenance requests</p>
      </div>

      <div className="flex flex-col items-center justify-center py-12 text-text-tertiary"><p>No data available.</p></div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-col items-center justify-center py-12 text-text-tertiary"><p>No data available.</p></div>
        </div>

        <div>
          <Card className="border-border bg-input-bg">
            <CardHeader>
              <CardTitle className="text-foreground">Submit Request</CardTitle>
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
