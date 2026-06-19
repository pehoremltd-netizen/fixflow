"use client";

import { useEffect, useState } from "react";

export default function SWRegister() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const reg of regs) {
          reg.unregister();
        }
      });

      navigator.serviceWorker
        .register("/sw.js")
        .catch(() => {});
    }

    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (typeof window !== "undefined" && !navigator.onLine) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-primary text-primary-foreground text-[11px] font-semibold text-center py-1">
        You are offline — FixFlow is running in offline mode
      </div>
    );
  }

  return null;
}
