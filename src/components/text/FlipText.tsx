"use client";

import React, { useRef, useState, useEffect, ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import { useScrollContext } from "@/components/SmoothScrollProvider";

interface FlipTextProps {
  children?: ReactNode;
  text?: string;
  subtitle?: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "span" | "div";
  duration?: number;
  delay?: number;
}

const CUBIC_EASE = [0.22, 1, 0.36, 1] as const;

export default function FlipText({
  children,
  text,
  subtitle,
  className = "",
  as = "h2",
  duration = 0.65,
  delay = 0,
}: FlipTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.25 });
  const scrollContext = useScrollContext();
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motionQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionQuery.addEventListener("change", handler);
    return () => motionQuery.removeEventListener("change", handler);
  }, []);

  // Animation #62: Directional Scroll Reveal
  const direction = scrollContext?.directionRef.current ?? 1; // 1 = down, -1 = up
  const startY = direction >= 0 ? 24 : -24;
  const startRotateX = direction >= 0 ? 65 : -65;

  // Animation #65: Velocity Scaling
  const velMultiplier = scrollContext?.velocityMultiplierRef.current ?? 1.0;
  const clampedVel = Math.min(1.15, Math.max(1.0, velMultiplier));
  const effectiveDuration = Math.max(0.45, duration / clampedVel);

  const Tag = as;

  if (reducedMotion) {
    return (
      <Tag className={`font-orbitron font-black text-white tracking-wide ${className}`}>
        {children || (
          <>
            {text} {subtitle && <span className="text-gray-500 font-mono text-lg font-normal">{subtitle}</span>}
          </>
        )}
      </Tag>
    );
  }

  return (
    <div
      ref={ref}
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d",
      }}
      className="inline-block select-none"
    >
      <motion.div
        initial={{
          opacity: 0,
          y: startY,
          rotateX: startRotateX,
          transformOrigin: direction >= 0 ? "50% 100%" : "50% 0%",
        }}
        animate={
          isInView
            ? {
                opacity: 1,
                y: 0,
                rotateX: 0,
              }
            : {
                opacity: 0,
                y: startY,
                rotateX: startRotateX,
              }
        }
        transition={{
          duration: effectiveDuration,
          delay: delay,
          ease: CUBIC_EASE,
        }}
        style={{
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
        }}
      >
        <Tag className={`font-orbitron font-black text-white tracking-wide ${className}`}>
          {children || (
            <>
              {text}{" "}
              {subtitle && (
                <span className="text-gray-500 font-mono text-lg font-normal">
                  {subtitle}
                </span>
              )}
            </>
          )}
        </Tag>
      </motion.div>
    </div>
  );
}
