"use client";

import { useState, useEffect } from "react";

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default function Clock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) return null;

  return (
    <div className="flex items-center gap-2 shrink-0">
      <div className="flex flex-col items-center px-3 py-1 rounded-lg bg-background/5 border border-border/50">
        <span className="text-[13px] font-mono font-semibold text-foreground tabular-nums leading-tight">
          {formatTime(time)}
        </span>
        <span className="text-[9px] text-text-tertiary font-medium leading-tight">
          {formatDate(time)}
        </span>
      </div>
      <div className="h-6 w-px bg-border/50 hidden sm:block" />
    </div>
  );
}
