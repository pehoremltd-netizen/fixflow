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
import { Plus, ClipboardCheck, Eye, Download } from "lucide-react";

const templates = [
  { id: 1, name: "Electrical Inspection", items: 12, status: "active" },
  { id: 2, name: "Plumbing Inspection", items: 8, status: "active" },
  { id: 3, name: "HVAC Inspection", items: 15, status: "active" },
  { id: 4, name: "Fire Safety Inspection", items: 10, status: "active" },
  { id: 5, name: "Generator Inspection", items: 6, status: "active" },
  { id: 6, name: "General Facility Inspection", items: 20, status: "active" },
];

const recentInspections = [
  { id: "INS-001", type: "Electrical", site: "Building A", staff: "Sarah Staff", status: "submitted", date: "Jun 5, 2026" },
  { id: "INS-002", type: "Plumbing", site: "Building B", staff: "Mike Chen", status: "approved", date: "Jun 4, 2026" },
  { id: "INS-003", type: "Fire Safety", site: "West Wing", staff: "Emma Wilson", status: "submitted", date: "Jun 3, 2026" },
  { id: "INS-004", type: "HVAC", site: "Building A", staff: "John Doe", status: "reviewed", date: "Jun 2, 2026" },
];

export default function InspectionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inspection Management</h1>
          <p className="text-muted-foreground">
            Create templates and review submitted reports
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Inspection Template</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input placeholder="e.g., Electrical Inspection" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <textarea className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Description of the inspection type" />
              </div>
              <div className="space-y-2">
                <Label>Checklist Items (one per line)</Label>
                <textarea className="flex min-h-[120px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono" placeholder="Check breaker panel condition&#10;Verify wiring integrity&#10;Test emergency lighting&#10;Check GFCI outlets&#10;Inspect electrical panels" />
              </div>
              <Button type="submit" className="w-full">
                Create Template
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Inspection Templates</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template, i) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <ClipboardCheck className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="success">{template.status}</Badge>
                  </div>
                  <h3 className="font-semibold mb-1">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {template.items} checklist items
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Eye className="h-3 w-3" /> View
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Download className="h-3 w-3" /> Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Inspections */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Inspections</h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-sm text-muted-foreground">
                    <th className="text-left p-4 font-medium">ID</th>
                    <th className="text-left p-4 font-medium">Type</th>
                    <th className="text-left p-4 font-medium">Site</th>
                    <th className="text-left p-4 font-medium">Staff</th>
                    <th className="text-left p-4 font-medium">Date</th>
                    <th className="text-left p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInspections.map((ins, i) => (
                    <tr key={ins.id} className="border-b last:border-0 hover:bg-accent/50 transition-colors">
                      <td className="p-4 text-sm font-mono">{ins.id}</td>
                      <td className="p-4 text-sm">{ins.type}</td>
                      <td className="p-4 text-sm">{ins.site}</td>
                      <td className="p-4 text-sm">{ins.staff}</td>
                      <td className="p-4 text-sm text-muted-foreground">{ins.date}</td>
                      <td className="p-4">
                        <Badge variant={
                          ins.status === "approved" ? "success" :
                          ins.status === "submitted" ? "info" :
                          ins.status === "reviewed" ? "warning" : "default"
                        }>
                          {ins.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
