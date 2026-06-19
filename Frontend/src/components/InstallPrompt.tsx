"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showCard, setShowCard] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [installAttempted, setInstallAttempted] = useState(false);

  const isStandalone =
    typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches;

  useEffect(() => {
    if (typeof window === "undefined" || isStandalone) {
      setInstalled(true);
      return;
    }

    const beforeInstallHandler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowCard(true);
    };

    window.addEventListener("beforeinstallprompt", beforeInstallHandler, { once: true });

    const installedHandler = () => {
      setInstalled(true);
      setShowCard(false);
    };
    window.addEventListener("appinstalled", installedHandler);

    let attempts = 0;
    const pollInterval = setInterval(() => {
      attempts++;
      if (deferredPrompt || installed || attempts > 6) {
        clearInterval(pollInterval);
        return;
      }
    }, 5000);

    const guideTimeout = setTimeout(() => {
      if (!deferredPrompt && !installed) {
        setShowCard(true);
      }
    }, 8000);

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstallHandler);
      window.removeEventListener("appinstalled", installedHandler);
      clearInterval(pollInterval);
      clearTimeout(guideTimeout);
    };
  }, [deferredPrompt, installed, isStandalone]);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    setInstallAttempted(true);
    try {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === "accepted") {
        setInstalled(true);
      }
    } catch {
    }
    setDeferredPrompt(null);
    setShowCard(false);
    setInstallAttempted(false);
  }, [deferredPrompt]);

  if (installed || isStandalone) return null;
  if (!showCard) return null;

  const isIOS =
    typeof navigator !== "undefined" &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-[340px]">
      <div className="bg-card rounded-xl border border-border p-4 shadow-lg">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Download className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-foreground text-sm font-semibold">Install FixFlow</p>
              <p className="text-text-secondary text-[11px]">Works offline on any device</p>
            </div>
          </div>
          <button
            onClick={() => setShowCard(false)}
            className="text-text-tertiary hover:text-foreground transition-colors bg-transparent border-none cursor-pointer p-0"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* Install button */}
        {deferredPrompt ? (
          <button
            onClick={handleInstall}
            disabled={installAttempted}
            className="w-full bg-primary text-primary-foreground font-bold text-sm py-2.5 rounded-lg border-none cursor-pointer hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Download className="h-4 w-4" strokeWidth={2.5} />
            {installAttempted ? "Installing..." : "Install App"}
          </button>
        ) : (
          <>
            {/* Guide */}
            <div className="space-y-2.5 mb-3 text-xs">
              {isIOS ? (
                <>
                  <p className="text-text-secondary">
                    1. Tap the <span className="text-foreground font-medium">Share</span> button
                  </p>
                  <p className="text-text-secondary">
                    2. Scroll and tap{" "}
                    <span className="text-foreground font-medium">Add to Home Screen</span>
                  </p>
                  <p className="text-text-secondary">
                    3. Tap <span className="text-foreground font-medium">Add</span>
                  </p>
                </>
              ) : (
                <>
                  <p className="text-text-secondary">
                    1. Open Chrome or Edge on your device
                  </p>
                  <p className="text-text-secondary">
                    2. Tap the <Smartphone className="inline h-3.5 w-3.5 text-primary -mt-0.5" strokeWidth={2} />{" "}
                    <span className="text-foreground font-medium">Install</span> icon in the address bar
                  </p>
                  <p className="text-text-secondary">
                    3. Or use the browser menu →{" "}
                    <span className="text-foreground font-medium">Install FixFlow</span>
                  </p>
                </>
              )}
            </div>
            <button
              onClick={() => setShowCard(false)}
              className="w-full bg-secondary text-secondary-foreground text-sm py-2 rounded-lg border-none cursor-pointer hover:bg-secondary/80 transition-all"
            >
              Got it
            </button>
          </>
        )}

        <p className="text-text-subtle text-[10px] text-center mt-2">
          Installed apps work fully offline
        </p>
      </div>
    </div>
  );
}
