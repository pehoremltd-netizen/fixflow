"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Phone, Mail, Wrench } from "lucide-react";



export default function TeamPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Team Roster</h1>
      <p className="text-secondary-foreground">Your assigned maintenance team</p>

      <div className="flex flex-col items-center justify-center py-12 text-text-tertiary"><p>No data available.</p></div>
    </div>
  );
}
