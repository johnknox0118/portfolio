"use client";

import React from "react";
import { motion } from "framer-motion";

interface LuminousCardBorderProps {
  cursorX: number | null;
  cursorY: number | null;
  isHovered: boolean;
  borderRadius?: string;
  glowColor?: string;
  haloColor?: string;
  borderWidth?: number;
  glowRadius?: number;
  enableGlassShine?: boolean;
}

/**
 * Universal Green Luminous Border Lighting & Realistic Glass Shine
 * 1. Non-Stop Luminous Green Baseline:
 *    - Continuous breathing green luminous border perimeter stroke.
 *    - Ambient green neon atmospheric halo radiating outward.
 *    - Non-stop 360° orbiting laser perimeter scan sweep.
 * 2. Reactive Cursor Intensification:
 *    - Dramatically increases luminosity along the specific side where the cursor moves.
 *    - Flares up a razor-sharp white-hot green laser beam + soft neon halo at (cursorX, cursorY).
 * 3. Continuous Realistic Glass Shine Reflection:
 *    - Sweeps diagonally from top-right to bottom-left every 3 seconds without stopping.
 *    - Smooth linear-gradient white streak with soft opacities and zero content overflow.
 * 4. Graceful Reduction:
 *    - When the cursor moves away, smoothly reduces back down to the baseline non-stop luminous green glow without ever turning dark.
 */
export default function LuminousCardBorder({
  cursorX,
  cursorY,
  isHovered,
  borderRadius = "rounded-2xl",
  glowColor = "#00FF9D",
  haloColor = "rgba(0, 255, 157, 0.75)",
  borderWidth = 1.5,
  glowRadius = 320,
  enableGlassShine = true,
}: LuminousCardBorderProps) {
  const active = isHovered && cursorX !== null && cursorY !== null;
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px), (pointer: coarse)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // On mobile/touch devices, use a lightweight, hardware-accelerated CSS luminous border
  // without 360° rotating conic-gradient masks or heavy blurs. This completely prevents
  // WebKit compositing layer explosions and memory crashes on iOS Safari across 25+ cards.
  if (isMobile) {
    return (
      <>
        {/* Mobile Non-Stop Green Luminous Border & Soft Outer Glow */}
        <div
          className={`pointer-events-none absolute -inset-[1px] ${borderRadius} z-20 border border-[#00FF9D]/60 shadow-[0_0_12px_rgba(0,255,157,0.30)]`}
        />

        {/* Mobile Synchronized Realistic Glass Shine Reflection */}
        {enableGlassShine && (
          <div
            className={`pointer-events-none absolute inset-0 ${borderRadius} overflow-hidden z-25`}
            style={{ transform: "translateZ(0)" }}
          >
            <div className="glass-shine-beam" />
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. NON-STOP GREEN LUMINOUS BASELINE - CONTINUOUS ORGANIC BREATHING GLOW   */}
      {/* ========================================================================= */}
      {/* 1A. Non-Stop Breathing Green Luminous Border Line */}
      <motion.div
        animate={{
          opacity: isHovered ? 0.75 : [0.35, 0.65, 0.35],
        }}
        transition={
          isHovered
            ? { duration: 0.3 }
            : { duration: 3.6, repeat: Infinity, ease: "easeInOut" }
        }
        className={`pointer-events-none absolute -inset-[1px] ${borderRadius} z-20 overflow-hidden`}
        style={{
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: `${borderWidth}px`,
          background:
            "linear-gradient(135deg, rgba(0, 255, 157, 0.55) 0%, rgba(0, 200, 255, 0.25) 50%, rgba(0, 255, 157, 0.55) 100%)",
        }}
      />

      {/* 1B. Non-Stop Luminous Perimeter Tracer Sweep (Continuous 360° Orbit) */}
      <div
        className={`pointer-events-none absolute -inset-[1px] ${borderRadius} z-21 overflow-hidden`}
        style={{
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: `${borderWidth}px`,
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 7.5, repeat: Infinity, ease: "linear" }}
          className="w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgba(0, 255, 157, 0.75) 45deg, rgba(0, 200, 255, 0.45) 80deg, transparent 125deg, transparent 180deg, rgba(0, 255, 157, 0.5) 225deg, transparent 270deg)",
          }}
        />
      </div>

      {/* 1C. Non-Stop Soft Green Radiant Atmospheric Halo */}
      <motion.div
        animate={{
          opacity: isHovered ? 0.7 : [0.22, 0.45, 0.22],
        }}
        transition={
          isHovered
            ? { duration: 0.3 }
            : { duration: 3.6, repeat: Infinity, ease: "easeInOut" }
        }
        className={`pointer-events-none absolute -inset-[2.5px] ${borderRadius} z-19 overflow-hidden blur-[4px]`}
        style={{
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: `${borderWidth + 1}px`,
          background:
            "linear-gradient(135deg, rgba(0, 255, 157, 0.65) 0%, rgba(0, 200, 255, 0.3) 50%, rgba(0, 255, 157, 0.65) 100%)",
        }}
      />

      {/* ========================================================================= */}
      {/* 2. REACTIVE CURSOR INTENSIFICATION - FLARES UP WHERE CURSOR MOVES         */}
      {/* ========================================================================= */}
      {/* 2A. Ultra-Luminous Laser Beam Spotlight on Cursor Side */}
      <div
        className={`pointer-events-none absolute -inset-[1px] ${borderRadius} z-30 overflow-hidden transition-opacity duration-400 ease-out`}
        style={{
          opacity: active ? 1 : 0,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: `${borderWidth + 0.5}px`,
        }}
      >
        <div
          className="w-full h-full"
          style={{
            background: active
              ? `radial-gradient(${glowRadius}px circle at ${cursorX}px ${cursorY}px, #FFFFFF 0%, ${glowColor} 20%, rgba(0, 255, 157, 0.85) 42%, rgba(0, 200, 255, 0.3) 65%, transparent 78%)`
              : "transparent",
          }}
        />
      </div>

      {/* 2B. High-Intensity Radiant Neon Flare on Cursor Side */}
      <div
        className={`pointer-events-none absolute -inset-[3px] ${borderRadius} z-25 overflow-hidden transition-opacity duration-400 ease-out blur-[6px]`}
        style={{
          opacity: active ? 0.95 : 0,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: `${borderWidth + 2}px`,
        }}
      >
        <div
          className="w-full h-full"
          style={{
            background: active
              ? `radial-gradient(${glowRadius * 0.9}px circle at ${cursorX}px ${cursorY}px, ${glowColor} 0%, ${haloColor} 38%, rgba(0, 200, 255, 0.3) 60%, transparent 75%)`
              : "transparent",
          }}
        />
      </div>

      {/* ========================================================================= */}
      {/* 3. SYNCHRONIZED REALISTIC GLASS SHINE REFLECTION (TOP-RIGHT TO BOTTOM-LEFT) */}
      {/* ========================================================================= */}
      {enableGlassShine && (
        <div
          className={`pointer-events-none absolute inset-0 ${borderRadius} overflow-hidden z-25`}
          style={{ transform: "translateZ(1px)" }}
        >
          <div className="glass-shine-beam" />
        </div>
      )}
    </>
  );
}
