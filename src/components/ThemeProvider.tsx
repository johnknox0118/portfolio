"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface ThemeColors {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  primaryRgb: string;
  secondaryRgb: string;
  accentRgb: string;
  backgroundRgb: string;
}

export const DEFAULT_THEME: ThemeColors = {
  primaryColor: "#00FF9D",
  secondaryColor: "#00C8FF",
  accentColor: "#00e5ff",
  backgroundColor: "#07111F",
  primaryRgb: "0, 255, 157",
  secondaryRgb: "0, 200, 255",
  accentRgb: "0, 229, 255",
  backgroundRgb: "7, 17, 31",
};

const ThemeContext = createContext<ThemeColors>(DEFAULT_THEME);

export function useTheme(): ThemeColors {
  return useContext(ThemeContext);
}

// Helper to convert hex strings (#RRGGBB or #RGB) to "R, G, B" string
export function hexToRgb(hex: string): string {
  if (!hex || typeof hex !== "string") return "0, 255, 157";
  let cleanHex = hex.trim().replace(/^#/, "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (cleanHex.length !== 6) return "0, 255, 157";

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) return "0, 255, 157";
  return `${r}, ${g}, ${b}`;
}

export function applyThemeToDocument(
  primary?: string,
  secondary?: string,
  accent?: string,
  background?: string
) {
  if (typeof document === "undefined") return;

  const validPrimary = primary || DEFAULT_THEME.primaryColor;
  const validSecondary = secondary || DEFAULT_THEME.secondaryColor;
  const validAccent = accent || DEFAULT_THEME.accentColor;
  const validBackground =
    background && background.startsWith("#")
      ? background
      : DEFAULT_THEME.backgroundColor;

  const primaryRgb = hexToRgb(validPrimary);
  const secondaryRgb = hexToRgb(validSecondary);
  const accentRgb = hexToRgb(validAccent);
  const backgroundRgb = hexToRgb(validBackground);

  const root = document.documentElement;

  root.style.setProperty("--cyber-primary", validPrimary);
  root.style.setProperty("--cyber-secondary", validSecondary);
  root.style.setProperty("--cyber-accent", validAccent);
  root.style.setProperty("--cyber-bg", validBackground);

  root.style.setProperty("--cyber-primary-rgb", primaryRgb);
  root.style.setProperty("--cyber-secondary-rgb", secondaryRgb);
  root.style.setProperty("--cyber-accent-rgb", accentRgb);
  root.style.setProperty("--cyber-bg-rgb", backgroundRgb);

  // Also directly set Tailwind v4 theme color tokens on root for maximum compatibility
  root.style.setProperty("--color-cyber-green", validPrimary);
  root.style.setProperty("--color-cyber-blue", validSecondary);
  root.style.setProperty("--color-cyber-cyan", validAccent);

  // Apply to body background
  if (document.body) {
    document.body.style.backgroundColor = validBackground;
  }
}

interface ThemeProviderProps {
  children: ReactNode;
  settings?: any;
}

export default function ThemeProvider({ children, settings }: ThemeProviderProps) {
  const getInitialTheme = (): ThemeColors => {
    const p = settings?.primaryColor || DEFAULT_THEME.primaryColor;
    const s = settings?.secondaryColor || DEFAULT_THEME.secondaryColor;
    const a = settings?.accentColor || DEFAULT_THEME.accentColor;
    const bg =
      settings?.theme && settings.theme.startsWith("#")
        ? settings.theme
        : settings?.backgroundColor || DEFAULT_THEME.backgroundColor;

    return {
      primaryColor: p,
      secondaryColor: s,
      accentColor: a,
      backgroundColor: bg,
      primaryRgb: hexToRgb(p),
      secondaryRgb: hexToRgb(s),
      accentRgb: hexToRgb(a),
      backgroundRgb: hexToRgb(bg),
    };
  };

  const [theme, setTheme] = useState<ThemeColors>(getInitialTheme);

  // Apply theme when settings prop updates
  useEffect(() => {
    if (settings) {
      const p = settings.primaryColor || DEFAULT_THEME.primaryColor;
      const s = settings.secondaryColor || DEFAULT_THEME.secondaryColor;
      const a = settings.accentColor || DEFAULT_THEME.accentColor;
      const bg =
        settings.theme && settings.theme.startsWith("#")
          ? settings.theme
          : settings.backgroundColor || DEFAULT_THEME.backgroundColor;

      const newTheme: ThemeColors = {
        primaryColor: p,
        secondaryColor: s,
        accentColor: a,
        backgroundColor: bg,
        primaryRgb: hexToRgb(p),
        secondaryRgb: hexToRgb(s),
        accentRgb: hexToRgb(a),
        backgroundRgb: hexToRgb(bg),
      };
      setTheme(newTheme);
      applyThemeToDocument(p, s, a, bg);
    }
  }, [settings?.primaryColor, settings?.secondaryColor, settings?.accentColor, settings?.theme]);

  // Initial mount application
  useEffect(() => {
    applyThemeToDocument(theme.primaryColor, theme.secondaryColor, theme.accentColor, theme.backgroundColor);
  }, [theme]);

  // Real-time synchronization with Admin updates across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "portfolio_custom_theme") {
        try {
          const parsed = JSON.parse(e.newValue || "{}");
          if (parsed.primaryColor || parsed.secondaryColor || parsed.theme) {
            const p = parsed.primaryColor || DEFAULT_THEME.primaryColor;
            const s = parsed.secondaryColor || DEFAULT_THEME.secondaryColor;
            const a = parsed.accentColor || DEFAULT_THEME.accentColor;
            const bg =
              parsed.theme && parsed.theme.startsWith("#")
                ? parsed.theme
                : parsed.backgroundColor || DEFAULT_THEME.backgroundColor;

            setTheme({
              primaryColor: p,
              secondaryColor: s,
              accentColor: a,
              backgroundColor: bg,
              primaryRgb: hexToRgb(p),
              secondaryRgb: hexToRgb(s),
              accentRgb: hexToRgb(a),
              backgroundRgb: hexToRgb(bg),
            });
            applyThemeToDocument(p, s, a, bg);
          }
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener("storage", handleStorage);

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      try {
        channel = new BroadcastChannel("portfolio_sync");
        channel.onmessage = (msg) => {
          if (msg.data?.type === "THEME_UPDATED" && msg.data?.theme) {
            const { primaryColor, secondaryColor, accentColor, theme: bgTheme, backgroundColor } = msg.data.theme;
            const p = primaryColor || DEFAULT_THEME.primaryColor;
            const s = secondaryColor || DEFAULT_THEME.secondaryColor;
            const a = accentColor || DEFAULT_THEME.accentColor;
            const bg =
              bgTheme && bgTheme.startsWith("#")
                ? bgTheme
                : backgroundColor || DEFAULT_THEME.backgroundColor;

            setTheme({
              primaryColor: p,
              secondaryColor: s,
              accentColor: a,
              backgroundColor: bg,
              primaryRgb: hexToRgb(p),
              secondaryRgb: hexToRgb(s),
              accentRgb: hexToRgb(a),
              backgroundRgb: hexToRgb(bg),
            });
            applyThemeToDocument(p, s, a, bg);
          }
        };
      } catch {
        // BroadcastChannel unavailable
      }
    }

    return () => {
      window.removeEventListener("storage", handleStorage);
      if (channel) channel.close();
    };
  }, []);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}
