"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye } from "lucide-react";

const docs = [
  { name: "Tenant Handbook", date: "Jan 2026", size: "2.1 MB" },
  { name: "Building Rules & Regulations", date: "Jan 2026", size: "1.3 MB" },
  { name: "Parking Policy", date: "Feb 2026", size: "0.8 MB" },
  { name: "Waste Management Guidelines", date: "Mar 2026", size: "0.5 MB" },
  { name: "Emergency Procedures", date: "Jan 2026", size: "1.7 MB" },
];

export default function TenantDocumentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Important Documents</h1>
      <p className="text-secondary-foreground">Access building policies and guidelines</p>

      <Card className="border-border bg-input-bg">
        <CardContent className="p-0">
          {docs.map((doc, i) => (
            <div key={i} className="flex items-center justify-between p-4 border-b last:border-0">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{doc.date} · {doc.size}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1"><Eye className="h-3 w-3" /> View</Button>
                <Button variant="outline" size="sm" className="gap-1"><Download className="h-3 w-3" /> Download</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
