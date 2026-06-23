"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

const chartColors = {
  compliance: "#22c55e",
  opened: "#f59e0b",
  closed: "#22c55e",
  grid: "rgba(255,255,255,0.05)",
  text: "rgba(255,255,255,0.4)",
};

const tooltipStyle = {
  background: "#1a1a2e",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
};

export default function Charts({
  pmComplianceData,
  woData,
  faultData,
}: {
  pmComplianceData: { period: string; Compliance: number }[];
  woData: { period: string; Opened: number; Closed: number }[];
  faultData: { period: string; "New Faults": number }[];
}) {
  return (
    <Tabs defaultValue="pm" className="space-y-4">
      <TabsList className="bg-card border border-border">
        <TabsTrigger value="pm" className="text-xs">PM Compliance</TabsTrigger>
        <TabsTrigger value="wo" className="text-xs">Work Orders</TabsTrigger>
        <TabsTrigger value="faults" className="text-xs">Fault Reports</TabsTrigger>
        <TabsTrigger value="budget" className="text-xs">Budget</TabsTrigger>
      </TabsList>

      <TabsContent value="pm">
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground text-sm">PM Compliance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            {pmComplianceData.length === 0 ? (
              <p className="text-sm text-text-tertiary text-center py-8">No report data available yet. Publish weekly reports to see trends.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pmComplianceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis dataKey="period" stroke={chartColors.text} tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} stroke={chartColors.text} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#fff" }} />
                    <Line type="monotone" dataKey="Compliance" stroke={chartColors.compliance} strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="wo">
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground text-sm">Work Orders Opened vs Closed</CardTitle>
          </CardHeader>
          <CardContent>
            {woData.length === 0 ? (
              <p className="text-sm text-text-tertiary text-center py-8">No report data available yet.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={woData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis dataKey="period" stroke={chartColors.text} tick={{ fontSize: 11 }} />
                    <YAxis stroke={chartColors.text} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#fff" }} />
                    <Legend />
                    <Bar dataKey="Opened" fill={chartColors.opened} radius={[2, 2, 0, 0]} />
                    <Bar dataKey="Closed" fill={chartColors.closed} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="faults">
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground text-sm">Fault Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {faultData.length === 0 ? (
              <p className="text-sm text-text-tertiary text-center py-8">No report data available yet.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={faultData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis dataKey="period" stroke={chartColors.text} tick={{ fontSize: 11 }} />
                    <YAxis stroke={chartColors.text} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#fff" }} />
                    <Bar dataKey="New Faults" fill="#ef4444" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="budget">
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground text-sm">Budget Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-tertiary text-center py-8">
              Budget trend data is available in the full Admin Budget module.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
