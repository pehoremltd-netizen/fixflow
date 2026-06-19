"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Theme = "dark" | "light" | "ocean";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  themes: { value: Theme; label: string; description: string }[];
}

const STORAGE_KEY = "fixflow-theme";

const THEME_META: { value: Theme; label: string; description: string }[] = [
  { value: "dark", label: "Dark", description: "Premium dark theme with gold accents" },
  { value: "light", label: "Light", description: "Clean white theme for bright environments" },
  { value: "ocean", label: "Ocean", description: "Deep blue theme with cyan accents" },
];

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light" || stored === "ocean") return stored;
  } catch {}
  return "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = getStoredTheme();
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
    setMounted(true);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem(STORAGE_KEY, t); } catch {}
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEME_META }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
