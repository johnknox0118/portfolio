"use client";

import { ReactNode, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import LuminousCardBorder from "./LuminousCardBorder";

interface NeonBorderCardProps {
  children: ReactNode;
  className?: string;
  tiltStrength?: number;
  glowColor?: "green" | "blue" | "purple";
  enableTilt?: boolean;
}

export default function NeonBorderCard({
  children,
  className = "",
  tiltStrength = 8,
  glowColor = "green",
  enableTilt = true,
}: NeonBorderCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [tiltStrength, -tiltStrength]), {
    stiffness: 160,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-tiltStrength, tiltStrength]), {
    stiffness: 160,
    damping: 20,
  });

  const glareX = useTransform(x, [-0.5, 0.5], ["10%", "90%"]);
  const glareY = useTransform(y, [-0.5, 0.5], ["10%", "90%"]);

  const colorMap = {
    green: {
      accent: "#00FF9D",
      glare: "rgba(0, 255, 157, 0.12)",
      shadow: "rgba(0, 255, 157, 0.25)",
    },
    blue: {
      accent: "#00C8FF",
      glare: "rgba(0, 200, 255, 0.12)",
      shadow: "rgba(0, 200, 255, 0.25)",
    },
    purple: {
      accent: "#A855F7",
      glare: "rgba(168, 85, 247, 0.12)",
      shadow: "rgba(168, 85, 247, 0.25)",
    },
  }[glowColor];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    if (reducedMotion || !enableTilt) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCursorPos(null);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: reducedMotion || !enableTilt ? 0 : rotateX,
        rotateY: reducedMotion || !enableTilt ? 0 : rotateY,
        transformPerspective: 1000,
        transformStyle: "preserve-3d",
      }}
      className={`relative group rounded-xl transition-shadow duration-300 ${className}`}
    >
      {/* Realtime Cursor-Tracking Green Luminous Border Spotlight */}
      <LuminousCardBorder
        cursorX={cursorPos?.x ?? null}
        cursorY={cursorPos?.y ?? null}
        isHovered={isHovered}
        borderRadius="rounded-xl"
        glowColor="#00FF9D"
      />

      {/* Holographic Glare Overlay */}
      {!reducedMotion && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
          style={{
            background: `radial-gradient(circle at ${glareX} ${glareY}, ${colorMap.glare}, transparent 65%)`,
          }}
        />
      )}

      {/* Card Content */}
      <div className="relative z-1 h-full">{children}</div>
    </motion.div>
  );
}
