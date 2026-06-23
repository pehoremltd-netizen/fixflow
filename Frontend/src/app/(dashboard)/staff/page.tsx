"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Clock, Wrench, CheckCircle2, AlertTriangle, ArrowRight, QrCode, MapPin } from "lucide-react";
import Link from "next/link";



export default function StaffDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Staff Dashboard</h1>
        <p className="text-secondary-foreground">Your daily maintenance tasks</p>
      </div>

      <div className="flex flex-col items-center justify-center py-12 text-text-tertiary"><p>No data available.</p></div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col items-center justify-center py-12 text-text-tertiary"><p>No data available.</p></div>

        {/* Quick Actions */}
        <div>
          <Card className="border-border bg-input-bg">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/staff/inspections">
                <Button variant="outline" className="w-full justify-start gap-3 h-12">
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="text-sm font-medium">New Inspection</p>
                    <p className="text-xs text-muted-foreground">Start a new report</p>
                  </div>
                </Button>
              </Link>
              <Link href="/staff/history">
                <Button variant="outline" className="w-full justify-start gap-3 h-12">
                  <Clock className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="text-sm font-medium">My History</p>
                    <p className="text-xs text-muted-foreground">Past activities</p>
                  </div>
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Current Status */}
          <Card className="mt-6 border-border bg-input-bg">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                    <CheckCircle2 className="h-8 w-8 text-success" />
                  </div>
                </div>
                <p className="font-semibold text-lg">Clocked In</p>
                <p className="text-sm text-muted-foreground">Since 7:55 AM</p>
                <p className="text-xs text-success mt-2">GPS Verified · Building A</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
