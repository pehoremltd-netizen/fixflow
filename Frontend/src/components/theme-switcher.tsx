"use client";

import { useTheme, type Theme } from "@/lib/theme-provider";
import { Check, Sun, Moon, Droplets } from "lucide-react";

const THEME_PREVIEW: Record<Theme, { bg: string; card: string; accent: string; icon: React.ElementType }> = {
  dark: { bg: "#000000", card: "#161616", accent: "#D4AF37", icon: Moon },
  light: { bg: "#F3F4F6", card: "#FFFFFF", accent: "#D4AF37", icon: Sun },
  ocean: { bg: "#0F172A", card: "#1E293B", accent: "#06B6D4", icon: Droplets },
};

interface ThemeSwitcherProps {
  compact?: boolean;
}

export default function ThemeSwitcher({ compact }: ThemeSwitcherProps) {
  const { theme, setTheme, themes } = useTheme();

  if (compact) {
    return (
      <div className="flex gap-1">
        {themes.map((t) => {
          const Icon = THEME_PREVIEW[t.value].icon;
          const active = theme === t.value;
          return (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-text-muted hover:text-foreground"
              }`}
              title={t.label}
            >
              <Icon size={14} />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {themes.map((t) => {
        const prev = THEME_PREVIEW[t.value];
        const active = theme === t.value;
        const Icon = prev.icon;
        return (
          <button
            key={t.value}
            onClick={() => setTheme(t.value)}
            className={`relative rounded-xl border-2 p-4 text-left transition-all ${
              active ? "border-primary" : "border-border hover:border-primary/50"
            }`}
            style={{ background: prev.bg }}
          >
            {active && (
              <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                <Check size={12} className="text-primary-foreground" />
              </div>
            )}
            <div className="flex items-center gap-3 mb-3">
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center"
                style={{ background: prev.card, border: `1px solid ${prev.accent}20` }}
              >
                <Icon size={16} style={{ color: prev.accent }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>
                  {t.label}
                </p>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="h-2 rounded-full" style={{ width: "60%", background: prev.card }} />
              <div className="h-2 rounded-full" style={{ width: "40%", background: prev.card }} />
            </div>
            <div className="mt-3 flex gap-1.5">
              <div className="h-3 w-3 rounded-full" style={{ background: prev.accent }} />
              <div className="h-3 w-3 rounded-full" style={{ background: prev.card }} />
              <div className="h-3 w-3 rounded-full" style={{ background: prev.card }} />
            </div>
            <p className="text-xs mt-2" style={{ color: "var(--color-muted-foreground)" }}>
              {t.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
