"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Wrench } from "lucide-react";

const facilities = [
  { name: "Building A - Headquarters", address: "123 Main St, New York, NY", status: "optimal", workOrders: 12, staff: 6 },
  { name: "Building B - West Wing", address: "456 Oak Ave, New York, NY", status: "good", workOrders: 8, staff: 3 },
  { name: "Warehouse - Storage", address: "789 Industrial Blvd, Brooklyn, NY", status: "attention", workOrders: 5, staff: 2 },
];

export default function FacilitiesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Monitored Facilities</h1>

      <div className="grid gap-6">
        {facilities.map((f) => (
          <Card key={f.name}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">{f.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {f.address}
                    </p>
                  </div>
                </div>
                <Badge variant={f.status === "optimal" ? "success" : f.status === "good" ? "info" : "warning"}>
                  {f.status}
                </Badge>
              </div>
              <div className="mt-4 flex gap-4">
                <div className="text-sm"><span className="font-medium">{f.workOrders}</span> Open WOs</div>
                <div className="text-sm"><span className="font-medium">{f.staff}</span> Staff</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
