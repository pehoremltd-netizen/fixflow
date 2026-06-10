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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Home, Globe, Users, Copy, ExternalLink, Clock } from "lucide-react";

const tenants = [
  { id: 1, name: "Acme Corp", unit: "Suite 200", contact: "John Smith", email: "john@acme.com", portal: "acme.fixflow.com", status: "active", requests: 5 },
  { id: 2, name: "TechStart Inc.", unit: "Suite 150", contact: "Jane Doe", email: "jane@techstart.io", portal: "techstart.fixflow.com", status: "active", requests: 2 },
  { id: 3, name: "Global Law LLP", unit: "Floor 10", contact: "Mike Brown", email: "mike@globallaw.com", portal: "globallaw.fixflow.com", status: "active", requests: 8 },
  { id: 4, name: "Design Studio", unit: "Suite 50", contact: "Emma Davis", email: "emma@design.studio", portal: "designstudio.fixflow.com", status: "inactive", requests: 0 },
];

export default function TenantsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tenant Management</h1>
          <p className="text-muted-foreground">
            Manage tenant portals and maintenance requests
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Tenant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Tenant Portal</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input placeholder="Company" />
                </div>
                <div className="space-y-2">
                  <Label>Unit/Suite</Label>
                  <Input placeholder="Suite 100" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Contact Person</Label>
                <Input placeholder="Full name" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="Email" />
              </div>
              <div className="space-y-2">
                <Label>Portal Subdomain</Label>
                <div className="flex items-center gap-2">
                  <Input placeholder="tenantname" className="flex-1" />
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

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Tenants</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid gap-6">
            {tenants.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                          <Home className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{t.name}</h3>
                          <p className="text-sm text-muted-foreground">{t.unit}</p>
                          <p className="text-sm text-muted-foreground">{t.contact} · {t.email}</p>
                        </div>
                      </div>
                      <Badge variant={t.status === "active" ? "success" : "secondary"}>{t.status}</Badge>
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-lg bg-muted p-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-mono">{t.portal}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {t.requests} open requests
                        </div>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
