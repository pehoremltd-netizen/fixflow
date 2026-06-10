"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, Building2, MapPin, Users, Wrench } from "lucide-react";

const sites = [
  { id: 1, name: "Building A - Headquarters", address: "123 Main St", city: "New York", state: "NY", staff: 15, assets: 42, status: "active", lat: 40.7128, lng: -74.006, radius: 100 },
  { id: 2, name: "Building B - West Wing", address: "456 Oak Ave", city: "New York", state: "NY", staff: 8, assets: 23, status: "active", lat: 40.7138, lng: -74.016, radius: 75 },
  { id: 3, name: "Warehouse - Storage", address: "789 Industrial Blvd", city: "Brooklyn", state: "NY", staff: 5, assets: 67, status: "active", lat: 40.6782, lng: -73.9442, radius: 150 },
  { id: 4, name: "Office - Downtown", address: "321 Business Ave", city: "Manhattan", state: "NY", staff: 12, assets: 31, status: "inactive", lat: 40.7580, lng: -73.9855, radius: 100 },
];

export default function SitesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sites & Facilities</h1>
          <p className="text-muted-foreground">
            Manage all facilities, buildings, and locations
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Site
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Register New Facility</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Site Name</Label>
                  <Input placeholder="Building name" />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input placeholder="Street address" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input placeholder="City" />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input placeholder="State" />
                </div>
                <div className="space-y-2">
                  <Label>Postal Code</Label>
                  <Input placeholder="ZIP" />
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-3">GPS Configuration</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Latitude</Label>
                    <Input type="number" step="any" placeholder="40.7128" />
                  </div>
                  <div className="space-y-2">
                    <Label>Longitude</Label>
                    <Input type="number" step="any" placeholder="-74.0060" />
                  </div>
                  <div className="space-y-2">
                    <Label>Radius (meters)</Label>
                    <Input type="number" placeholder="100" />
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full">
                Register Facility
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {sites.map((site, i) => (
          <motion.div
            key={site.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{site.name}</h3>
                      <p className="text-sm text-muted-foreground">{site.address}</p>
                    </div>
                  </div>
                  <Badge variant={site.status === "active" ? "success" : "secondary"}>
                    {site.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <MapPin className="h-4 w-4" />
                  {site.city}, {site.state}
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="rounded-lg bg-muted p-2">
                    <Users className="h-4 w-4 mx-auto mb-1" />
                    <span className="text-sm font-medium">{site.staff}</span>
                    <p className="text-xs text-muted-foreground">Staff</p>
                  </div>
                  <div className="rounded-lg bg-muted p-2">
                    <Wrench className="h-4 w-4 mx-auto mb-1" />
                    <span className="text-sm font-medium">{site.assets}</span>
                    <p className="text-xs text-muted-foreground">Assets</p>
                  </div>
                  <div className="rounded-lg bg-muted p-2">
                    <MapPin className="h-4 w-4 mx-auto mb-1" />
                    <span className="text-sm font-medium">{site.radius}m</span>
                    <p className="text-xs text-muted-foreground">GPS Radius</p>
                  </div>
                </div>

                <div className="mt-4 text-xs text-muted-foreground">
                  GPS: {site.lat}, {site.lng}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
