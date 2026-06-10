"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QRCodeSVG } from "qrcode.react";
import { Plus, Download, RefreshCw, QrCode, Copy } from "lucide-react";

const qrCodes = [
  { id: 1, site: "Building A", type: "Clock In/Out", status: "active", scans: 342 },
  { id: 2, site: "Building B", type: "Shift A", status: "active", scans: 156 },
  { id: 3, site: "Warehouse", type: "Clock In/Out", status: "active", scans: 89 },
  { id: 4, site: "Building A", type: "Shift B", status: "inactive", scans: 203 },
];

export default function QRCodesPage() {
  const [showQR, setShowQR] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">QR Code Management</h1>
          <p className="text-muted-foreground">
            Generate and manage QR codes for attendance
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Generate QR Code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate QR Code</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label>Site</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select site" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="building-a">Building A</SelectItem>
                    <SelectItem value="building-b">Building B</SelectItem>
                    <SelectItem value="warehouse">Warehouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>QR Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clock-in-out">Clock In/Out</SelectItem>
                    <SelectItem value="shift-a">Shift A</SelectItem>
                    <SelectItem value="shift-b">Shift B</SelectItem>
                    <SelectItem value="general">General Attendance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-center p-6 bg-muted rounded-lg">
                <QRCodeSVG value={`fixflow://attendance/building-a/clock-in`} size={160} />
              </div>
              <Button type="submit" className="w-full gap-2">
                <Download className="h-4 w-4" /> Download QR Code
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {qrCodes.map((qr, i) => (
          <motion.div
            key={qr.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <QrCode className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{qr.site}</h3>
                      <p className="text-sm text-muted-foreground">{qr.type}</p>
                    </div>
                  </div>
                  <Badge variant={qr.status === "active" ? "success" : "secondary"}>
                    {qr.status}
                  </Badge>
                </div>

                <div className="flex justify-center p-4 bg-muted rounded-lg mb-4">
                  <QRCodeSVG value={`fixflow://attendance/${qr.site.toLowerCase().replace(/\s+/g, '-')}/${qr.type.toLowerCase().replace(/\s+/g, '-')}`} size={120} />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {qr.scans} scans
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Download className="h-3 w-3" /> Download
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      <RefreshCw className="h-3 w-3" /> Regenerate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
