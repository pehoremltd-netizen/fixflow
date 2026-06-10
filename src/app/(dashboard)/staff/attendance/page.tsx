"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  LogIn,
  LogOut,
  History,
  Calendar,
  AlertTriangle,
  Navigation,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getTodayAttendance,
  clockIn,
  clockOut,
  getAttendance,
  AttendanceRecord,
} from "@/lib/attendance";

export default function AttendancePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "checking" | "verified" | "denied">("idle");
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLocationName, setGpsLocationName] = useState("");
  const [manualLocation, setManualLocation] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [historyTab, setHistoryTab] = useState("week");
  const [history, setHistory] = useState<AttendanceRecord[]>([]);

  const staffId = "s1";
  const staffName = "Mike Chen";

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const records = getTodayAttendance();
    const myRecord = records.find((r) => r.staffId === staffId);
    if (myRecord) setTodayRecord(myRecord);
    setHistory(getAttendance().filter((r) => r.staffId === staffId));
    return () => clearInterval(timer);
  }, []);

  const requestGPS = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("GPS not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const handleClockIn = async () => {
    setIsLoading(true);
    setGpsStatus("checking");
    try {
      const coords = await requestGPS();
      setGpsCoords(coords);
      setGpsStatus("verified");
      setGpsLocationName(`Lat: ${coords.lat.toFixed(4)}, Lng: ${coords.lng.toFixed(4)}`);

      const record = clockIn(staffId, staffName, {
        lat: coords.lat,
        lng: coords.lng,
        name: "Current Location",
      });
      setTodayRecord(record);
      setHistory(getAttendance().filter((r) => r.staffId === staffId));
    } catch {
      setGpsStatus("denied");
      setShowManualInput(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualClockIn = () => {
    if (!manualLocation.trim()) return;
    const record = clockIn(staffId, staffName, {
      lat: 0,
      lng: 0,
      name: manualLocation,
    });
    setTodayRecord(record);
    setShowManualInput(false);
    setManualLocation("");
    setHistory(getAttendance().filter((r) => r.staffId === staffId));
  };

  const handleClockOut = async () => {
    setIsLoading(true);
    setGpsStatus("checking");
    try {
      const coords = await requestGPS();
      setGpsCoords(coords);
      setGpsStatus("verified");

      const record = clockOut(staffId, {
        lat: coords.lat,
        lng: coords.lng,
        name: "Current Location",
      });
      if (record) setTodayRecord(record);
      setHistory(getAttendance().filter((r) => r.staffId === staffId));
    } catch {
      setGpsStatus("denied");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isClockedIn = todayRecord?.clockIn && !todayRecord.clockOut;
  const isClockedOut = todayRecord?.clockIn && todayRecord.clockOut;

  const weekHistory = history.filter((r) => {
    const d = new Date(r.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo;
  });

  const displayHistory = historyTab === "week" ? weekHistory : history;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Attendance</h1>
        <p className="text-[#B8B8B8]">Clock in/out with GPS verification</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="border-[#222222] bg-[#161616]">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <p className="text-lg text-[#7A7A7A]">{formatDate(currentTime)}</p>
                <p className="text-5xl font-bold mt-2 font-mono text-white">
                  {currentTime.toLocaleTimeString()}
                </p>
              </div>

              {gpsCoords && gpsStatus === "verified" && (
                <div className="flex items-center justify-center mb-4">
                  <Badge variant="success" className="text-sm px-4 py-1.5 gap-2">
                    <MapPin className="h-4 w-4" />
                    GPS: {gpsCoords.lat.toFixed(4)}, {gpsCoords.lng.toFixed(4)}
                  </Badge>
                </div>
              )}

              {gpsStatus === "checking" && (
                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center gap-2 text-[#7A7A7A]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Getting GPS location...</span>
                  </div>
                </div>
              )}

              {gpsStatus === "denied" && !showManualInput && (
                <div className="flex items-center justify-center mb-4">
                  <Badge variant="destructive" className="text-sm px-4 py-1.5 gap-2">
                    <XCircle className="h-4 w-4" />
                    GPS access denied
                  </Badge>
                </div>
              )}

              <div className="flex justify-center mb-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={isClockedIn ? handleClockOut : handleClockIn}
                  disabled={isLoading || !!isClockedOut}
                  className={cn(
                    "relative flex flex-col items-center justify-center w-48 h-48 rounded-full border-4 transition-all",
                    isClockedIn
                      ? "border-[#EF4444] bg-[#EF4444]/10"
                      : isClockedOut
                      ? "border-[#7A7A7A] bg-[#7A7A7A]/10 cursor-not-allowed opacity-60"
                      : "border-[#22C55E] bg-[#22C55E]/10",
                    isLoading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="absolute inset-2 rounded-full bg-[#161616] flex flex-col items-center justify-center">
                    {isLoading ? (
                      <Loader2 className="h-8 w-8 text-[#D4AF37] animate-spin mb-1" />
                    ) : isClockedIn ? (
                      <>
                        <LogOut className="h-8 w-8 text-[#EF4444] mb-1" />
                        <span className="text-lg font-bold text-[#EF4444]">Clock Out</span>
                        <span className="text-xs text-[#7A7A7A]">Since {todayRecord?.clockIn}</span>
                      </>
                    ) : isClockedOut ? (
                      <>
                        <CheckCircle2 className="h-8 w-8 text-[#7A7A7A] mb-1" />
                        <span className="text-lg font-bold text-[#7A7A7A]">Completed</span>
                        <span className="text-xs text-[#7A7A7A]">{todayRecord?.hoursWorked}h worked</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="h-8 w-8 text-[#22C55E] mb-1" />
                        <span className="text-lg font-bold text-[#22C55E]">Clock In</span>
                        <span className="text-xs text-[#7A7A7A]">Tap to start shift</span>
                      </>
                    )}
                  </div>
                </motion.button>
              </div>

              {showManualInput && !isClockedIn && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 justify-center mb-4"
                >
                  <Input
                    placeholder="Enter your location manually..."
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    className="max-w-xs border-[#222222] bg-black text-white placeholder:text-[#7A7A7A]"
                  />
                  <Button onClick={handleManualClockIn} disabled={!manualLocation.trim()}>
                    <Navigation className="h-4 w-4 mr-1" /> Confirm
                  </Button>
                </motion.div>
              )}

              {isClockedOut && todayRecord && (
                <div className="text-center text-sm text-[#7A7A7A]">
                  <p>Clock In: {todayRecord.clockIn}</p>
                  <p>Clock Out: {todayRecord.clockOut}</p>
                  <p className="text-[#D4AF37] font-medium mt-1">Total: {todayRecord.hoursWorked} hours</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className={cn(
                  "text-center p-3 rounded-lg border",
                  gpsStatus === "verified" ? "border-[#22C55E]/30 bg-[#22C55E]/10" : "border-[#222222] bg-black"
                )}>
                  <MapPin className={cn("h-5 w-5 mx-auto mb-1", gpsStatus === "verified" ? "text-[#22C55E]" : "text-[#7A7A7A]")} />
                  <p className="text-xs font-medium text-white">GPS</p>
                  <p className="text-[10px] text-[#7A7A7A]">{gpsStatus === "verified" ? "Verified" : gpsStatus === "denied" ? "Denied" : "Pending"}</p>
                </div>
                <div className="text-center p-3 rounded-lg border border-[#222222] bg-black">
                  <Clock className="h-5 w-5 mx-auto mb-1 text-[#D4AF37]" />
                  <p className="text-xs font-medium text-white">Device</p>
                  <p className="text-[10px] text-[#7A7A7A]">Verified</p>
                </div>
                <div className="text-center p-3 rounded-lg border border-[#222222] bg-black">
                  <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-[#7A7A7A]" />
                  <p className="text-xs font-medium text-white">Status</p>
                  <p className="text-[10px] text-[#7A7A7A] capitalize">{todayRecord?.status || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-[#222222] bg-[#161616]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <History className="h-4 w-4 text-[#D4AF37]" />
                Attendance History
              </CardTitle>
              <CardDescription className="text-[#7A7A7A]">Your recent records</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="week" value={historyTab} onValueChange={setHistoryTab}>
                <TabsList className="bg-[#111111] mb-3">
                  <TabsTrigger value="week" className="text-xs">Week</TabsTrigger>
                  <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                </TabsList>
                <TabsContent value={historyTab}>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {displayHistory.length === 0 ? (
                      <p className="text-center text-sm text-[#7A7A7A] py-8">No records found</p>
                    ) : (
                      displayHistory.map((r) => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-[#222222] bg-black/50"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={cn(
                              "h-2 w-2 rounded-full flex-shrink-0",
                              r.status === "present" ? "bg-[#22C55E]" :
                              r.status === "late" ? "bg-[#E1B000]" : "bg-[#EF4444]"
                            )} />
                            <div className="min-w-0">
                              <p className="text-xs text-white">
                                {new Date(r.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                              </p>
                              <div className="flex items-center gap-1 text-[10px] text-[#7A7A7A]">
                                {r.clockIn ? <span>In: {r.clockIn}</span> : <span className="text-[#EF4444]">No clock in</span>}
                                {r.clockOut && <span>| Out: {r.clockOut}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            {r.hoursWorked && (
                              <p className="text-xs text-[#D4AF37] font-medium">{r.hoursWorked}h</p>
                            )}
                            <Badge className={cn(
                              "text-[10px] px-1.5 py-0 mt-0.5",
                              r.status === "present" ? "bg-[#22C55E]/10 text-[#22C55E]" :
                              r.status === "late" ? "bg-[#E1B000]/10 text-[#E1B000]" :
                              "bg-[#EF4444]/10 text-[#EF4444]"
                            )}>
                              {r.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="mt-6 border-[#222222] bg-[#161616]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Navigation className="h-4 w-4 text-[#D4AF37]" />
                Geofence Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#7A7A7A]">Site</span>
                  <span className="font-medium text-white">Building A</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#7A7A7A]">Latitude</span>
                  <span className="font-mono text-white">40.7128</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#7A7A7A]">Longitude</span>
                  <span className="font-mono text-white">-74.0060</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#7A7A7A]">Radius</span>
                  <span className="font-medium text-white">100 meters</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#7A7A7A]">Distance</span>
                  <span className={cn(
                    "font-medium",
                    gpsCoords ? "text-[#22C55E]" : "text-[#7A7A7A]"
                  )}>
                    {gpsCoords ? "Within zone" : "Pending GPS"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
