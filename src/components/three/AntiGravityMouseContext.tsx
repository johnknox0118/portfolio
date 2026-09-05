"use client";

import { createContext, useContext } from "react";
import { MotionValue, useMotionValue } from "framer-motion";

export interface AntiGravityMouseContextValue {
  /** Smoothed, normalized mouse position in the range [-0.5, 0.5] */
  smoothX: MotionValue<number>;
  smoothY: MotionValue<number>;
  reducedMotion: boolean;
}

export const AntiGravityMouseContext =
  createContext<AntiGravityMouseContextValue | null>(null);

/**
 * Reads the shared mouse-tracking values published by <AntiGravityCanvas>.
 * Safe to use outside of an AntiGravityCanvas too — falls back to static
 * zero values so nothing breaks if there's no provider above it.
 */
export function useAntiGravityMouse(): AntiGravityMouseContextValue {
  const ctx = useContext(AntiGravityMouseContext);

  // Fallback values (only used if this hook is called with no provider).
  const fallbackX = useMotionValue(0);
  const fallbackY = useMotionValue(0);

  if (ctx) return ctx;
  return { smoothX: fallbackX, smoothY: fallbackY, reducedMotion: false };
}
