"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ClipboardCheck,
  Plus,
  Camera,
  Upload,
  Signature,
  CheckCircle2,
  AlertTriangle,
  Star,
} from "lucide-react";

const inspectionTypes = [
  { id: "plumbing", label: "Plumbing Inspection", icon: "🔧" },
  { id: "electrical", label: "Electrical Inspection", icon: "⚡" },
  { id: "hvac", label: "HVAC Inspection", icon: "❄️" },
  { id: "generator", label: "Generator Inspection", icon: "⚙️" },
  { id: "fire-safety", label: "Fire Safety Inspection", icon: "🔥" },
  { id: "general", label: "General Facility Inspection", icon: "🏢" },
];

const checklistItems: Record<string, { label: string; conditions: string[] }[]> = {
  electrical: [
    { label: "Main panel condition", conditions: ["Good", "Fair", "Poor", "Critical"] },
    { label: "Wiring integrity", conditions: ["Good", "Fair", "Poor", "Critical"] },
    { label: "Emergency lighting", conditions: ["Good", "Fair", "Poor", "Critical"] },
    { label: "GFCI outlet testing", conditions: ["Good", "Fair", "Poor", "Critical"] },
    { label: "Circuit breaker labeling", conditions: ["Good", "Fair", "Poor", "Critical"] },
    { label: "Grounding system", conditions: ["Good", "Fair", "Poor", "Critical"] },
    { label: "Lightning protection", conditions: ["Good", "Fair", "Poor", "Critical"] },
    { label: "Electrical room cleanliness", conditions: ["Good", "Fair", "Poor", "Critical"] },
  ],
  plumbing: [
    { label: "Pipe condition", conditions: ["Good", "Fair", "Poor", "Critical"] },
    { label: "Fixture condition", conditions: ["Good", "Fair", "Poor", "Critical"] },
    { label: "Water pressure", conditions: ["Good", "Fair", "Poor", "Critical"] },
    { label: "Drainage flow", conditions: ["Good", "Fair", "Poor", "Critical"] },
    { label: "No leaks detected", conditions: ["Good", "Fair", "Poor", "Critical"] },
    { label: "Water heater operation", conditions: ["Good", "Fair", "Poor", "Critical"] },
    { label: "Toilet operation", conditions: ["Good", "Fair", "Poor", "Critical"] },
    { label: "Sink/faucet operation", conditions: ["Good", "Fair", "Poor", "Critical"] },
  ],
  hvac: [
    { label: "Thermostat operation", conditions: ["Good", "Fair", "Poor", "Critical"] },
    { label: "Filter condition", conditions: ["Good", "Fair", "Poor", "Critical"] },
    { label: "Condenser unit", conditions: ["Good", "Fair", "Poor", "Critical"] },
    { label: "Air handler", conditions: ["Good", "Fair", "Poor", "Critical"] },
    { label: "Refrigerant levels", conditions: ["Good", "Fair", "Poor", "Critical"] },
    { label: "Ductwork condition", conditions: ["Good", "Fair", "Poor", "Critical"] },
    { label: "Fan operation", conditions: ["Good", "Fair", "Poor", "Critical"] },
    { label: "Temperature differential", conditions: ["Good", "Fair", "Poor", "Critical"] },
  ],
};

function getDefaultChecklist(type: string) {
  return checklistItems[type] || checklistItems.general || [
    { label: "Overall condition", conditions: ["Good", "Fair", "Poor", "Critical"] },
  ];
}

export default function StaffInspectionsPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [inspectionActive, setInspectionActive] = useState(false);
  const [checklist, setChecklist] = useState<{ label: string; condition: string; notes: string }[]>([]);
  const [showCamera, setShowCamera] = useState(false);

  const startInspection = (type: string) => {
    setSelectedType(type);
    const items = getDefaultChecklist(type);
    setChecklist(items.map((item) => ({ label: item.label, condition: "Good", notes: "" })));
    setInspectionActive(true);
  };

  const updateCondition = (index: number, condition: string) => {
    setChecklist((prev) => prev.map((item, i) => (i === index ? { ...item, condition } : item)));
  };

  const getTypeLabel = (id: string) => inspectionTypes.find((t) => t.id === id)?.label || id;

  if (inspectionActive && selectedType) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{getTypeLabel(selectedType)}</h1>
            <p className="text-muted-foreground">Complete all checklist items</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setInspectionActive(false)}>Cancel</Button>
            <Button className="gap-2" onClick={() => setInspectionActive(false)}>
              <CheckCircle2 className="h-4 w-4" /> Submit Report
            </Button>
          </div>
        </div>

        {/* Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Inspection Checklist</CardTitle>
            <CardDescription>Evaluate each item's condition</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {checklist.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-lg border"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-medium text-sm">{i + 1}. {item.label}</span>
                    <div className="flex gap-1">
                      {["Good", "Fair", "Poor", "Critical"].map((condition) => (
                        <button
                          key={condition}
                          onClick={() => updateCondition(i, condition)}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                            item.condition === condition
                              ? condition === "Good"
                                ? "bg-green-100 text-green-700 ring-2 ring-green-500"
                                : condition === "Fair"
                                ? "bg-yellow-100 text-yellow-700 ring-2 ring-yellow-500"
                                : condition === "Poor"
                                ? "bg-orange-100 text-orange-700 ring-2 ring-orange-500"
                                : "bg-red-100 text-red-700 ring-2 ring-red-500"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {condition === "Good" ? "✓" : condition === "Fair" ? "~" : condition === "Poor" ? "!" : "✗"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Input
                    placeholder="Add notes..."
                    className="text-sm"
                    value={item.notes}
                    onChange={(e) => {
                      const newChecklist = [...checklist];
                      newChecklist[i] = { ...newChecklist[i], notes: e.target.value };
                      setChecklist(newChecklist);
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Photo & Video Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Media Documentation</CardTitle>
            <CardDescription>Attach photos and videos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center h-32 rounded-lg border-2 border-dashed hover:border-primary/50 cursor-pointer transition-colors bg-muted/50"
                >
                  <Camera className="h-6 w-6 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">Take Photo</span>
                </div>
              ))}
              <div className="flex flex-col items-center justify-center h-32 rounded-lg border-2 border-dashed hover:border-primary/50 cursor-pointer transition-colors bg-muted/50 col-span-3">
                <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground">Upload Video</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Signature & Recommendations */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Digital Signature</CardTitle>
              <CardDescription>Sign to certify this inspection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32 rounded-lg border-2 border-dashed bg-muted/50 cursor-pointer">
                <Signature className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground ml-2">Tap to sign</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>Any follow-up actions needed</CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                placeholder="Enter recommendations for any items that need attention..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Inspection Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="p-3 rounded-lg bg-green-100">
                <p className="text-2xl font-bold text-green-700">
                  {checklist.filter((c) => c.condition === "Good").length}
                </p>
                <p className="text-xs text-green-600">Good</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-100">
                <p className="text-2xl font-bold text-yellow-700">
                  {checklist.filter((c) => c.condition === "Fair").length}
                </p>
                <p className="text-xs text-yellow-600">Fair</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-100">
                <p className="text-2xl font-bold text-orange-700">
                  {checklist.filter((c) => c.condition === "Poor").length}
                </p>
                <p className="text-xs text-orange-600">Poor</p>
              </div>
              <div className="p-3 rounded-lg bg-red-100">
                <p className="text-2xl font-bold text-red-700">
                  {checklist.filter((c) => c.condition === "Critical").length}
                </p>
                <p className="text-xs text-red-600">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inspections</h1>
          <p className="text-muted-foreground">Complete inspection reports from your device</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {inspectionTypes.map((type, i) => (
          <motion.div
            key={type.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card
              className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
              onClick={() => startInspection(type.id)}
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">{type.icon}</div>
                <h3 className="font-semibold">{type.label}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {getDefaultChecklist(type.id).length} checklist items
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Previous Inspections */}
      <Card>
        <CardHeader>
          <CardTitle>My Recent Inspections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { type: "Electrical", site: "Building A", date: "Jun 5, 2026", status: "submitted", score: 92 },
              { type: "Plumbing", site: "Building B", date: "Jun 4, 2026", status: "approved", score: 88 },
              { type: "HVAC", site: "Building A", date: "Jun 2, 2026", status: "submitted", score: 95 },
            ].map((ins, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{ins.type} - {ins.site}</p>
                    <p className="text-xs text-muted-foreground">{ins.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-green-600">{ins.score}%</span>
                  <Badge variant={ins.status === "approved" ? "success" : "info"}>
                    {ins.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
