"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Phone, Mail, Wrench } from "lucide-react";

const team = [
  { name: "Mike Chen", role: "HVAC Technician", email: "mike@fixflow.com", phone: "+1 (555) 123-4567", status: "on-site", skills: ["HVAC", "Refrigeration", "Controls"] },
  { name: "Sarah Lee", role: "Electrician", email: "sarah@fixflow.com", phone: "+1 (555) 234-5678", status: "on-site", skills: ["Electrical", "Panel Upgrades", "Lighting"] },
  { name: "Emma Wilson", role: "Fire Safety Specialist", email: "emma@fixflow.com", phone: "+1 (555) 345-6789", status: "available", skills: ["Fire Alarms", "Sprinklers", "Extinguishers"] },
  { name: "John Doe", role: "Plumber", email: "john@fixflow.com", phone: "+1 (555) 456-7890", status: "on-site", skills: ["Plumbing", "Drainage", "Water Heaters"] },
  { name: "Tom Green", role: "Generator Technician", email: "tom@fixflow.com", phone: "+1 (555) 567-8901", status: "offline", skills: ["Generators", "Power Systems", "Batteries"] },
];

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Team Roster</h1>
      <p className="text-muted-foreground">Your assigned maintenance team</p>

      <div className="grid gap-4">
        {team.map((member) => (
          <Card key={member.name}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                    {member.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {member.email}</span>
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {member.phone}</span>
                    </div>
                  </div>
                </div>
                <Badge variant={member.status === "on-site" ? "info" : member.status === "available" ? "success" : "secondary"}>
                  {member.status}
                </Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {member.skills.map((skill) => (
                  <span key={skill} className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
