"use client";

import { ReactNode, useEffect, useState, useRef } from "react";
import { motion, useTransform, useScroll, useSpring } from "framer-motion";
import { useAntiGravityMouse } from "./AntiGravityMouseContext";
import LuminousCardBorder from "../cyber/LuminousCardBorder";

interface AntiGravityFloatCardProps {
  children: ReactNode;
  className?: string;
  /** Max tilt in degrees. Defaults to a subtle 10deg. */
  tiltStrength?: number;
}

/**
 * Makes the hero photo card feel like it's levitating in the same
 * "anti-gravity" field as the page background:
 * 1. Bidirectional 3D scroll depth: Surges forward and glides backward on scroll.
 * 2. Mouse parallax tilt leaning toward the cursor.
 * 3. Continuous ambient floating levitation.
 */
export default function AntiGravityFloatCard({
  children,
  className = "",
  tiltStrength = 10,
}: AntiGravityFloatCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const { smoothX, smoothY, reducedMotion } = useAntiGravityMouse();
  const [floatEnabled, setFloatEnabled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const mobMq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mobMq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mobMq.addEventListener("change", handler);
    return () => mobMq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    setFloatEnabled(!reducedMotion && !isMobile);
  }, [reducedMotion, isMobile]);

  // ==========================================
  // 1. SCROLL-DRIVEN 3D DEPTH (FORWARD & BACKWARD)
  // ==========================================
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // As user scrolls down (0.0 -> 0.85):
  // Photo card smoothly recedes backward into 3D depth (-280px, scale 0.74, -15deg tilt, 6px blur)
  // When scrolling back up, card dynamically surges forward into crisp front focus
  const scrollZRaw = useTransform(scrollYProgress, [0.0, 0.85], [0, -280]);
  const scrollScaleRaw = useTransform(scrollYProgress, [0.0, 0.85], [1.0, 0.74]);
  const scrollRotateXRaw = useTransform(scrollYProgress, [0.0, 0.85], [0, -15]);
  const scrollOpacityRaw = useTransform(
    scrollYProgress,
    [0.0, 0.65, 0.95],
    [1.0, 0.75, 0.2]
  );
  const scrollBlurRaw = useTransform(scrollYProgress, [0.0, 0.85], [0, 6]);

  const springConfig = { damping: 24, stiffness: 130, mass: 0.85 };
  const scrollZ = useSpring(scrollZRaw, springConfig);
  const scrollScale = useSpring(scrollScaleRaw, springConfig);
  const scrollRotateX = useSpring(scrollRotateXRaw, springConfig);
  const scrollOpacity = useSpring(scrollOpacityRaw, { damping: 20, stiffness: 160 });
  const scrollBlur = useSpring(scrollBlurRaw, { damping: 20, stiffness: 160 });

  const filter = useTransform(scrollBlur, (v) =>
    v > 0.15 ? `blur(${v.toFixed(1)}px)` : "none"
  );

  const shadowScale = useTransform(scrollScale, [0.74, 1.0], [0.75, 1.05]);
  const shadowOpacity = useTransform(scrollOpacity, [0.2, 1.0], [0.15, 0.55]);

  // ==========================================
  // 2. MOUSE PARALLAX TILT
  // ==========================================
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-tiltStrength, tiltStrength]);
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [tiltStrength, -tiltStrength]);

  const translateZ = useTransform(
    [smoothX, smoothY],
    ([x, y]: number[]) => 20 - (Math.abs(x) + Math.abs(y)) * 24
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCursorPos(null);
  };

  if (reducedMotion) {
    return (
      <div ref={containerRef} className={`relative ${className}`}>
        <div ref={cardRef} className="relative">
          <LuminousCardBorder
            cursorX={null}
            cursorY={null}
            isHovered={false}
            borderRadius="rounded-[20px]"
            glowColor="#00FF9D"
          />
          {children}
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div ref={containerRef} className={`relative ${className}`}>
        {/* Anti-Gravity Ambient Floating Motion on Mobile */}
        <motion.div
          ref={cardRef}
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative"
        >
          <LuminousCardBorder
            cursorX={null}
            cursorY={null}
            isHovered={false}
            borderRadius="rounded-[20px]"
            glowColor="#00FF9D"
          />
          {children}
        </motion.div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`[perspective:1200px] relative ${className}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* 3D Scroll Depth Layer (surges forward / recedes backward on scroll) */}
      <motion.div
        style={{
          z: reducedMotion ? 0 : scrollZ,
          scale: reducedMotion ? 1 : scrollScale,
          rotateX: reducedMotion ? 0 : scrollRotateX,
          opacity: reducedMotion ? 1 : scrollOpacity,
          filter: reducedMotion ? "none" : filter,
          transformStyle: "preserve-3d",
        }}
        className="relative"
      >
        {/* Grounding Cyber Floor Glow Shadow */}
        <motion.div
          className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 w-[85%] h-10 blur-xl -z-10 rounded-full"
          style={{
            scale: shadowScale,
            opacity: shadowOpacity,
            background:
              "radial-gradient(ellipse at center, rgba(0, 255, 157, 0.45) 0%, rgba(0, 200, 255, 0.2) 45%, transparent 75%)",
          }}
        />

        {/* 3D Mouse Parallax & Ambient Levitation Layer */}
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX: reducedMotion ? 0 : rotateX,
            rotateY: reducedMotion ? 0 : rotateY,
            translateZ: reducedMotion ? 0 : translateZ,
            transformStyle: "preserve-3d",
          }}
          animate={
            floatEnabled
              ? { y: [0, -12, 0] }
              : { y: 0 }
          }
          transition={
            floatEnabled
              ? { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.3 }
          }
          className="will-change-transform relative"
        >
          {/* Realtime Cursor-Tracking Green Luminous Border Spotlight */}
          <LuminousCardBorder
            cursorX={cursorPos?.x ?? null}
            cursorY={cursorPos?.y ?? null}
            isHovered={isHovered}
            borderRadius="rounded-[20px]"
            glowColor="#00FF9D"
          />
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
