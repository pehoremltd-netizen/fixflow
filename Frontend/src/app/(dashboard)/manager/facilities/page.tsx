"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Wrench } from "lucide-react";



export default function FacilitiesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Monitored Facilities</h1>

      <div className="flex flex-col items-center justify-center py-12 text-text-tertiary"><p>No data available.</p></div>
    </div>
  );
}
