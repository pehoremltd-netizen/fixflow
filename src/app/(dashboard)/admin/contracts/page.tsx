"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Plus, FileText, Clock, DollarSign } from "lucide-react";

const contracts = [
  { id: "CT-001", vendor: "ABC HVAC Services", type: "HVAC Maintenance", start: "Jan 1, 2026", end: "Dec 31, 2026", value: 48000, status: "active" },
  { id: "CT-002", vendor: "SecureTech Inc.", type: "Security Systems", start: "Mar 1, 2026", end: "Feb 28, 2027", value: 36000, status: "active" },
  { id: "CT-003", vendor: "CleanPro Facilities", type: "Janitorial Services", start: "Jan 1, 2026", end: "Jun 30, 2026", value: 24000, status: "active" },
  { id: "CT-004", vendor: "Elevate Elevators", type: "Elevator Maintenance", start: "Jan 1, 2025", end: "Dec 31, 2025", value: 18000, status: "expired" },
  { id: "CT-005", vendor: "GreenScape Landscaping", type: "Grounds Maintenance", start: "Apr 1, 2026", end: "Mar 31, 2027", value: 12000, status: "active" },
];

export default function ContractsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contract Management</h1>
          <p className="text-muted-foreground">
            Manage vendor contracts and service agreements
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New Contract
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Contract</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label>Vendor Name</Label>
                <Input placeholder="Vendor name" />
              </div>
              <div className="space-y-2">
                <Label>Service Type</Label>
                <Input placeholder="Type of service" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Contract Value ($)</Label>
                <Input type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>SLA Requirements</Label>
                <textarea className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="SLA details..." />
              </div>
              <Button type="submit" className="w-full">
                Create Contract
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b text-sm text-muted-foreground">
                <th className="text-left p-4 font-medium">Contract</th>
                <th className="text-left p-4 font-medium">Vendor</th>
                <th className="text-left p-4 font-medium">Period</th>
                <th className="text-left p-4 font-medium">Value</th>
                <th className="text-left p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((ct, i) => (
                <motion.tr
                  key={ct.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b last:border-0 hover:bg-accent/50 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="text-sm font-medium">{ct.type}</span>
                        <span className="text-xs text-muted-foreground ml-2 font-mono">{ct.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm">{ct.vendor}</td>
                  <td className="p-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {ct.start} - {ct.end}
                    </div>
                  </td>
                  <td className="p-4 text-sm">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      ${ct.value.toLocaleString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant={ct.status === "active" ? "success" : "destructive"}>
                      {ct.status}
                    </Badge>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
