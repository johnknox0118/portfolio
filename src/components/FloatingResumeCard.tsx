"use client";

import React, { useRef, useState, useEffect, ReactNode } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import LuminousCardBorder from "./cyber/LuminousCardBorder";

interface FloatingResumeCardProps {
  children: ReactNode;
  className?: string;
}

export default function FloatingResumeCard({
  children,
  className = "",
}: FloatingResumeCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [isHovered, setIsHovered] = useState(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobMq = window.matchMedia("(max-width: 768px)");
    setPrefersReducedMotion(mq.matches);
    setIsMobile(mobMq.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    const mobHandler = (e: MediaQueryListEvent) => setIsMobile(e.matches);

    mq.addEventListener("change", handler);
    mobMq.addEventListener("change", mobHandler);
    return () => {
      mq.removeEventListener("change", handler);
      mobMq.removeEventListener("change", mobHandler);
    };
  }, []);

  // ==========================================
  // SCROLL-DRIVEN 3D DEPTH (FORWARD & BACKWARD)
  // ==========================================
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // [0.00 -> 0.35]: Surges forward from deep background into foreground
  // [0.35 -> 0.65]: Anchors squarely in the foreground plane (z: 0, scale: 1.0) for optimal readability & interaction
  // [0.65 -> 1.00]: Recedes backward into 3D space as scrolled past
  // Scrolling up (reverse) smoothly pulls it back forward and back again in real time
  const scrollZRaw = useTransform(
    scrollYProgress,
    [0.0, 0.35, 0.65, 1.0],
    [-240, 0, 0, -240]
  );
  const scrollScaleRaw = useTransform(
    scrollYProgress,
    [0.0, 0.35, 0.65, 1.0],
    [0.76, 1.0, 1.0, 0.76]
  );
  const scrollRotateXRaw = useTransform(
    scrollYProgress,
    [0.0, 0.35, 0.65, 1.0],
    [14, 0, 0, -14]
  );
  const scrollOpacityRaw = useTransform(
    scrollYProgress,
    [0.05, 0.32, 0.68, 0.95],
    [0.3, 1.0, 1.0, 0.3]
  );
  const scrollBlurRaw = useTransform(
    scrollYProgress,
    [0.0, 0.32, 0.68, 1.0],
    [6, 0, 0, 6]
  );

  const springConfig = { damping: 24, stiffness: 130, mass: 0.85 };
  const z = useSpring(scrollZRaw, springConfig);
  const scale = useSpring(scrollScaleRaw, springConfig);
  const rotateX = useSpring(scrollRotateXRaw, springConfig);
  const opacity = useSpring(scrollOpacityRaw, { damping: 20, stiffness: 160 });
  const blurVal = useSpring(scrollBlurRaw, { damping: 20, stiffness: 160 });

  const filter = useTransform(blurVal, (v) =>
    v > 0.15 ? `blur(${v.toFixed(1)}px)` : "none"
  );

  // Dynamic floor shadow that expands and brightens when card is in foreground
  const shadowScale = useTransform(scale, [0.76, 1.0], [0.8, 1.05]);
  const shadowOpacity = useTransform(opacity, [0.3, 1.0], [0.2, 0.6]);

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

  if (prefersReducedMotion || isMobile) {
    return (
      <div className={`relative w-full py-4 z-20 pointer-events-auto ${className}`}>
        <div className="relative w-full pointer-events-auto z-20">
          <LuminousCardBorder
            cursorX={null}
            cursorY={null}
            isHovered={false}
            borderRadius="rounded-2xl"
            glowColor="#00FF9D"
          />
          <div className="relative z-10 w-full pointer-events-auto">
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full py-4 z-20 pointer-events-auto ${className}`}
      style={{ perspective: isMobile ? undefined : 1200 }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          z: !isMobile ? z : 0,
          scale: !isMobile ? scale : 1,
          rotateX: !isMobile ? rotateX : 0,
          opacity: !isMobile ? opacity : 1,
          filter: !isMobile ? filter : "none",
          transformStyle: isMobile ? "flat" : "preserve-3d",
        }}
        className="relative w-full pointer-events-auto z-20"
      >
        {/* Realtime Cursor-Tracking Green Luminous Border Spotlight */}
        <LuminousCardBorder
          cursorX={cursorPos?.x ?? null}
          cursorY={cursorPos?.y ?? null}
          isHovered={isHovered}
          borderRadius="rounded-2xl"
          glowColor="#00FF9D"
        />

        {/* Grounding Cyber Floor Glow Shadow on desktop */}
        {!isMobile && (
          <motion.div
            className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 w-[92%] h-12 blur-xl -z-10 rounded-full"
            style={{
              scale: shadowScale,
              opacity: shadowOpacity,
              background:
                "radial-gradient(ellipse at center, rgba(0, 255, 157, 0.45) 0%, rgba(0, 200, 255, 0.2) 45%, transparent 75%)",
            }}
          />
        )}

        <div className="relative z-10 w-full pointer-events-auto">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
