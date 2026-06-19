"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Eye, FolderOpen } from "lucide-react";

const documents = [
  { name: "Building A - Floor Plans", category: "blueprints", date: "Jan 2026", size: "5.2 MB" },
  { name: "HVAC System Schematics", category: "technical", date: "Mar 2026", size: "3.8 MB" },
  { name: "Fire Safety Compliance Cert", category: "compliance", date: "Feb 2026", size: "1.1 MB" },
  { name: "Maintenance SOP Manual", category: "procedures", date: "Dec 2025", size: "8.4 MB" },
  { name: "Annual Inspection Report", category: "reports", date: "Jan 2026", size: "2.3 MB" },
];

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Documents</h1>
      <p className="text-secondary-foreground">Access approved documents and reports</p>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="blueprints">Blueprints</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card className="border-border bg-input-bg">
            <CardContent className="p-0">
              {documents.map((doc, i) => (
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
