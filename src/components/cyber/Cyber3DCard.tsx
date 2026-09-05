"use client";

import React, { useRef, useState, useEffect, ReactNode } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
} from "framer-motion";
import LuminousCardBorder from "./LuminousCardBorder";

export type CyberGlowColor = "green" | "blue" | "cyan" | "purple";

export interface Cyber3DCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: CyberGlowColor;
  index?: number;
  tiltStrength?: number;
  enableScrollDepth?: boolean;
  enableFloat?: boolean;
  enableTilt?: boolean;
  enableGlare?: boolean;
  depth?: number;
  scaleMin?: number;
  borderRadius?: string;
}

const COLOR_MAP: Record<
  CyberGlowColor,
  { accent: string; glow: string; glare: string }
> = {
  green: {
    accent: "#00FF9D",
    glow: "rgba(0, 255, 157, 0.35)",
    glare: "rgba(0, 255, 157, 0.14)",
  },
  blue: {
    accent: "#00C8FF",
    glow: "rgba(0, 200, 255, 0.35)",
    glare: "rgba(0, 200, 255, 0.14)",
  },
  cyan: {
    accent: "#00FFFF",
    glow: "rgba(0, 255, 255, 0.35)",
    glare: "rgba(0, 255, 255, 0.14)",
  },
  purple: {
    accent: "#A855F7",
    glow: "rgba(168, 85, 247, 0.35)",
    glare: "rgba(168, 85, 247, 0.14)",
  },
};

export default function Cyber3DCard({
  children,
  className = "",
  glowColor = "green",
  index = 0,
  tiltStrength = 8,
  enableScrollDepth = true,
  enableFloat = true,
  enableTilt = true,
  enableGlare = true,
  depth = 240,
  scaleMin = 0.72,
  borderRadius = "rounded-2xl",
}: Cyber3DCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const colorConfig = COLOR_MAP[glowColor] || COLOR_MAP.green;

  // ==========================================
  // 1. SCROLL-DRIVEN 3D DEPTH (FORWARD & BACKWARD)
  // ==========================================
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Stagger entry slightly for grids
  const staggerOffset = Math.min(0.06, (index % 4) * 0.015);
  const entryStart = 0.0 + staggerOffset;
  const entryEnd = Math.min(0.35 + staggerOffset, 0.45);
  const exitStart = 0.65;
  const exitEnd = 1.0;

  const scrollZRaw = useTransform(
    scrollYProgress,
    [entryStart, entryEnd, exitStart, exitEnd],
    [-depth, 0, 0, -depth]
  );
  const scrollScaleRaw = useTransform(
    scrollYProgress,
    [entryStart, entryEnd, exitStart, exitEnd],
    [scaleMin, 1, 1, scaleMin]
  );
  const scrollRotateXRaw = useTransform(
    scrollYProgress,
    [entryStart, entryEnd, exitStart, exitEnd],
    [14, 0, 0, -14]
  );
  const scrollOpacityRaw = useTransform(
    scrollYProgress,
    [entryStart, entryEnd - 0.05, exitStart + 0.05, exitEnd],
    [0.25, 1, 1, 0.25]
  );
  const scrollBlurRaw = useTransform(
    scrollYProgress,
    [entryStart, entryEnd, exitStart, exitEnd],
    [6, 0, 0, 6]
  );

  const springConfig = { damping: 24, stiffness: 130, mass: 0.85 };
  const z = useSpring(scrollZRaw, springConfig);
  const scale = useSpring(scrollScaleRaw, springConfig);
  const rotateXScroll = useSpring(scrollRotateXRaw, springConfig);
  const opacity = useSpring(scrollOpacityRaw, { damping: 20, stiffness: 160 });
  const blurVal = useSpring(scrollBlurRaw, { damping: 20, stiffness: 160 });

  const filter = useTransform(blurVal, (v) =>
    v > 0.15 ? `blur(${v.toFixed(1)}px)` : "none"
  );

  // ==========================================
  // 2. INTERACTIVE CURSOR MOTION (3D TILT & GLARE)
  // ==========================================
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const cursorRotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [tiltStrength, -tiltStrength]),
    { stiffness: 170, damping: 22 }
  );
  const cursorRotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-tiltStrength, tiltStrength]),
    { stiffness: 170, damping: 22 }
  );

  const glareX = useTransform(mouseX, [-0.5, 0.5], ["15%", "85%"]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ["15%", "85%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    if (prefersReducedMotion || !enableTilt) return;
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(nx);
    mouseY.set(ny);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCursorPos(null);
    mouseX.set(0);
    mouseY.set(0);
  };

  // Organic phase offset for floating so grid cards don't bob identically
  const floatDuration = 5.5 + (index % 4) * 0.5;
  const floatDelay = (index % 5) * 0.25;

  if (prefersReducedMotion) {
    return <div className={`relative h-full ${className}`}>{children}</div>;
  }

  return (
    <div
      ref={containerRef}
      className={`relative h-full ${className}`}
      style={{
        perspective: 1200,
        transformStyle: "preserve-3d",
      }}
    >
      {/* 1. Scroll Depth Plane */}
      <motion.div
        style={{
          z: enableScrollDepth ? z : 0,
          scale: enableScrollDepth ? scale : 1,
          rotateX: enableScrollDepth ? rotateXScroll : 0,
          opacity: enableScrollDepth ? opacity : 1,
          filter: enableScrollDepth ? filter : "none",
          transformStyle: "preserve-3d",
          willChange: "transform, opacity, filter",
        }}
        className="w-full h-full relative"
      >
        {/* 2. Anti-Gravity Ambient Floating Layer */}
        <motion.div
          animate={
            enableFloat
              ? {
                  y: [-4, 4, -4],
                  rotateX: [-0.8, 0.8, -0.8],
                  rotateZ: [-0.4, 0.4, -0.4],
                }
              : {}
          }
          transition={{
            duration: floatDuration,
            delay: floatDelay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative w-full h-full"
        >
          {/* Grounding Floor Glow Shadow */}
          {enableFloat && (
            <motion.div
              animate={{
                scale: [0.92, 1.05, 0.92],
                opacity: [0.25, 0.45, 0.25],
              }}
              transition={{
                duration: floatDuration,
                delay: floatDelay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 w-[88%] h-8 blur-lg -z-10 rounded-full"
              style={{
                background: `radial-gradient(ellipse at center, ${colorConfig.glow} 0%, transparent 70%)`,
              }}
            />
          )}

          {/* 3. Interactive Cursor Motion & 3D Tilt Shell */}
          <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
              rotateX: enableTilt ? cursorRotateX : 0,
              rotateY: enableTilt ? cursorRotateY : 0,
              transformStyle: "preserve-3d",
            }}
            className="group/cyber3d relative w-full h-full"
          >
            {/* Realtime Cursor-Tracking Green Luminous Border Spotlight */}
            <LuminousCardBorder
              cursorX={cursorPos?.x ?? null}
              cursorY={cursorPos?.y ?? null}
              isHovered={isHovered}
              borderRadius={borderRadius}
              glowColor="#00FF9D"
            />

            {/* Holographic Glare Sheen */}
            {enableGlare && (
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover/cyber3d:opacity-100 transition-opacity duration-300 z-10 overflow-hidden"
                style={{
                  background: `radial-gradient(circle at ${glareX} ${glareY}, ${colorConfig.glare} 0%, transparent 60%)`,
                }}
              />
            )}

            {/* Inner Card Content */}
            <div className="relative z-20 w-full h-full" style={{ transformStyle: "preserve-3d" }}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
