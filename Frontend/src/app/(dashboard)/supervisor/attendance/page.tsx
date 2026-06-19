"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Download,
  Calendar,
  Users,
  UserCheck,
  UserX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getAttendanceByDate,
  getAttendanceSummary,
  AttendanceRecord,
} from "@/lib/store/attendance";

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [dateInput, setDateInput] = useState(selectedDate);
  const [summary, setSummary] = useState({ total: 0, present: 0, late: 0, absent: 0 });

  const refreshData = useCallback(() => {
    const todayRecords = getAttendanceByDate(selectedDate);
    setRecords(todayRecords);

    const allSummaries = getAttendanceSummary();
    const filteredSummary = {
      total: todayRecords.length,
      present: todayRecords.filter((r) => r.status === "present").length,
      late: todayRecords.filter((r) => r.status === "late").length,
      absent: todayRecords.filter((r) => r.status === "absent").length,
    };
    setSummary(filteredSummary);
  }, [selectedDate]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setDateInput(date);
  };

  const handleExportCSV = () => {
    const headers = ["Staff Name", "Date", "Clock In", "Clock Out", "Hours Worked", "Location", "Status"];
    const rows = records.map((r) => [
      r.staffName,
      r.date,
      r.clockIn || "N/A",
      r.clockOut || "N/A",
      r.hoursWorked !== null ? r.hoursWorked.toString() : "N/A",
      r.clockInLocation?.name || "N/A",
      r.status,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance-${selectedDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const todayDate = new Date(selectedDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendance Tracking</h1>
          <p className="text-secondary-foreground">Monitor staff attendance and punctuality</p>
        </div>
        <Button onClick={handleExportCSV} className="gap-2" variant="outline">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Staff</p>
              <p className="text-xl font-bold text-foreground">{summary.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <UserCheck className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Present</p>
              <p className="text-xl font-bold text-success">{summary.present}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mustard/10">
              <Clock className="h-5 w-5 text-mustard" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Late</p>
              <p className="text-xl font-bold text-mustard">{summary.late}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <UserX className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Absent</p>
              <p className="text-xl font-bold text-destructive">{summary.absent}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
          <Input
            type="date"
            value={dateInput}
            onChange={(e) => handleDateChange(e.target.value)}
            className="pl-10 w-64 border-border bg-card text-foreground"
          />
        </div>
        <span className="text-sm text-muted-foreground">{todayDate}</span>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Attendance Records
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {records.length} staff on record for this date
          </CardDescription>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">No attendance records</p>
              <p className="text-sm mt-1">No data available for this date</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <div className="space-y-2">
                {records.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border transition-colors",
                      r.status === "present" ? "border-success/20 bg-success/5" :
                      r.status === "late" ? "border-mustard/20 bg-mustard/5" :
                      "border-destructive/20 bg-destructive/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        r.status === "present" ? "bg-success/10" :
                        r.status === "late" ? "bg-mustard/10" :
                        "bg-destructive/10"
                      )}>
                        {r.status === "present" ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : r.status === "late" ? (
                          <Clock className="h-5 w-5 text-mustard" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{r.staffName}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {r.clockIn ? (
                            <>
                              <span>In: {r.clockIn}</span>
                              {r.clockOut && <span>| Out: {r.clockOut}</span>}
                            </>
                          ) : (
                            <span className="text-destructive">Not clocked in</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {r.hoursWorked && (
                        <span className="text-sm text-primary font-medium">{r.hoursWorked}h</span>
                      )}
                      <Badge className={cn(
                        "text-xs",
                        r.status === "present" ? "bg-success/10 text-success border-success/30" :
                        r.status === "late" ? "bg-mustard/10 text-mustard border-mustard/30" :
                        "bg-destructive/10 text-destructive border-destructive/30"
                      )}>
                        {r.status === "present" ? "Present" : r.status === "late" ? "Late" : "Absent"}
                      </Badge>
                      {r.clockInLocation && (
                        <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
                          {r.clockInLocation.name}
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
