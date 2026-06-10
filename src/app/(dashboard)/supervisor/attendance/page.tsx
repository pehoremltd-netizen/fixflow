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
} from "@/lib/attendance";

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
          <h1 className="text-3xl font-bold text-white">Attendance Tracking</h1>
          <p className="text-[#B8B8B8]">Monitor staff attendance and punctuality</p>
        </div>
        <Button onClick={handleExportCSV} className="gap-2" variant="outline">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-[#222222] bg-[#161616]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D4AF37]/10">
              <Users className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-xs text-[#7A7A7A]">Total Staff</p>
              <p className="text-xl font-bold text-white">{summary.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#222222] bg-[#161616]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#22C55E]/10">
              <UserCheck className="h-5 w-5 text-[#22C55E]" />
            </div>
            <div>
              <p className="text-xs text-[#7A7A7A]">Present</p>
              <p className="text-xl font-bold text-[#22C55E]">{summary.present}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#222222] bg-[#161616]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E1B000]/10">
              <Clock className="h-5 w-5 text-[#E1B000]" />
            </div>
            <div>
              <p className="text-xs text-[#7A7A7A]">Late</p>
              <p className="text-xl font-bold text-[#E1B000]">{summary.late}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#222222] bg-[#161616]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EF4444]/10">
              <UserX className="h-5 w-5 text-[#EF4444]" />
            </div>
            <div>
              <p className="text-xs text-[#7A7A7A]">Absent</p>
              <p className="text-xl font-bold text-[#EF4444]">{summary.absent}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#D4AF37]" />
          <Input
            type="date"
            value={dateInput}
            onChange={(e) => handleDateChange(e.target.value)}
            className="pl-10 w-64 border-[#222222] bg-[#161616] text-white"
          />
        </div>
        <span className="text-sm text-[#7A7A7A]">{todayDate}</span>
      </div>

      <Card className="border-[#222222] bg-[#161616]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-4 w-4 text-[#D4AF37]" />
            Attendance Records
          </CardTitle>
          <CardDescription className="text-[#7A7A7A]">
            {records.length} staff on record for this date
          </CardDescription>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-12 text-[#7A7A7A]">
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
                      r.status === "present" ? "border-[#22C55E]/20 bg-[#22C55E]/5" :
                      r.status === "late" ? "border-[#E1B000]/20 bg-[#E1B000]/5" :
                      "border-[#EF4444]/20 bg-[#EF4444]/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        r.status === "present" ? "bg-[#22C55E]/10" :
                        r.status === "late" ? "bg-[#E1B000]/10" :
                        "bg-[#EF4444]/10"
                      )}>
                        {r.status === "present" ? (
                          <CheckCircle2 className="h-5 w-5 text-[#22C55E]" />
                        ) : r.status === "late" ? (
                          <Clock className="h-5 w-5 text-[#E1B000]" />
                        ) : (
                          <XCircle className="h-5 w-5 text-[#EF4444]" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">{r.staffName}</p>
                        <div className="flex items-center gap-2 text-xs text-[#7A7A7A]">
                          {r.clockIn ? (
                            <>
                              <span>In: {r.clockIn}</span>
                              {r.clockOut && <span>| Out: {r.clockOut}</span>}
                            </>
                          ) : (
                            <span className="text-[#EF4444]">Not clocked in</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {r.hoursWorked && (
                        <span className="text-sm text-[#D4AF37] font-medium">{r.hoursWorked}h</span>
                      )}
                      <Badge className={cn(
                        "text-xs",
                        r.status === "present" ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30" :
                        r.status === "late" ? "bg-[#E1B000]/10 text-[#E1B000] border-[#E1B000]/30" :
                        "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30"
                      )}>
                        {r.status === "present" ? "Present" : r.status === "late" ? "Late" : "Absent"}
                      </Badge>
                      {r.clockInLocation && (
                        <Badge variant="outline" className="text-[10px] border-[#222222] text-[#7A7A7A]">
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
