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
import { Plus, Briefcase, Globe, Copy, ExternalLink } from "lucide-react";

const stakeholders = [
  { id: 1, name: "City Properties Inc.", contact: "Robert Johnson", email: "robert@cityprops.com", portal: "cityprops.fixflow.com", status: "active" },
  { id: 2, name: "Green Valley Estates", contact: "Linda Green", email: "linda@greenvalley.com", portal: "greenvalley.fixflow.com", status: "active" },
  { id: 3, name: "Metro Commercial REIT", contact: "David Kim", email: "david@metroreit.com", portal: "metroreit.fixflow.com", status: "active" },
];

export default function StakeholdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stakeholder Management</h1>
          <p className="text-muted-foreground">
            Manage stakeholder portals and access
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Stakeholder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Stakeholder Portal</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input placeholder="Company name" />
              </div>
              <div className="space-y-2">
                <Label>Contact Person</Label>
                <Input placeholder="Full name" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="Email address" />
              </div>
              <div className="space-y-2">
                <Label>Portal Subdomain</Label>
                <div className="flex items-center gap-2">
                  <Input placeholder="companyname" className="flex-1" />
                  <span className="text-sm text-muted-foreground">.fixflow.com</span>
                </div>
              </div>
              <Button type="submit" className="w-full">
                Create Portal
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {stakeholders.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Briefcase className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{s.name}</h3>
                      <p className="text-sm text-muted-foreground">{s.contact}</p>
                      <p className="text-sm text-muted-foreground">{s.email}</p>
                    </div>
                  </div>
                  <Badge variant={s.status === "active" ? "success" : "secondary"}>{s.status}</Badge>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-lg bg-muted p-3">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-mono">{s.portal}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Copy className="h-3 w-3" /> Copy
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <ExternalLink className="h-3 w-3" /> Open
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
