"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
} from "framer-motion";
import LuminousCardBorder from "./LuminousCardBorder";

interface ProfileData {
  bio: string;
  careerObjective: string;
  location: string;
  email: string;
  phone: string;
}

interface AboutFloatingCard3DProps {
  profile: ProfileData;
  className?: string;
}

export default function AboutFloatingCard3D({
  profile,
  className = "",
}: AboutFloatingCard3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  // Check user motion and viewport preferences
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
  // 1. SCROLL-DRIVEN 3D DEPTH (FORWARD & BACKWARD)
  // ==========================================
  // Track viewport travel from entry at bottom to exit at top:
  // "start end" (0.0): card just touches bottom viewport
  // "end start" (1.0): card leaves through top viewport
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Backward-to-front-to-backward progression:
  // [0.00 -> 0.35]: Surges forward from deep background (z: -280 -> 0, scale: 0.68 -> 1.0)
  // [0.35 -> 0.65]: Anchors squarely in the foreground plane (z: 0, scale: 1.0) for optimal readability
  // [0.65 -> 1.00]: Recedes backward into deep space as scrolled past (z: 0 -> -280, scale: 1.0 -> 0.68)
  // Scrolling up (reverse) smoothly pulls it back forward and back again in real-time!
  const scrollZRaw = useTransform(
    scrollYProgress,
    [0.0, 0.35, 0.65, 1.0],
    [-280, 0, 0, -280]
  );
  const scrollScaleRaw = useTransform(
    scrollYProgress,
    [0.0, 0.35, 0.65, 1.0],
    [0.68, 1, 1, 0.68]
  );
  const scrollRotateXRaw = useTransform(
    scrollYProgress,
    [0.0, 0.35, 0.65, 1.0],
    [16, 0, 0, -16]
  );
  const scrollOpacityRaw = useTransform(
    scrollYProgress,
    [0.05, 0.32, 0.68, 0.95],
    [0.2, 1, 1, 0.2]
  );
  const scrollBlurRaw = useTransform(
    scrollYProgress,
    [0.0, 0.32, 0.68, 1.0],
    [8, 0, 0, 8]
  );

  // Hydraulic spring smoothing for natural physical inertia during scrolling
  const scrollSpring = { damping: 24, stiffness: 130, mass: 0.85 };
  const z = useSpring(scrollZRaw, scrollSpring);
  const scale = useSpring(scrollScaleRaw, scrollSpring);
  const rotateXScroll = useSpring(scrollRotateXRaw, scrollSpring);
  const opacity = useSpring(scrollOpacityRaw, { damping: 20, stiffness: 160 });
  const blurVal = useSpring(scrollBlurRaw, { damping: 20, stiffness: 160 });

  const filter = useTransform(blurVal, (v) =>
    v > 0.12 ? `blur(${v.toFixed(1)}px)` : "none"
  );

  // ==========================================
  // 2. INTERACTIVE CURSOR MOTION (3D TILT & GLARE)
  // ==========================================
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const cursorRotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [10, -10]),
    { stiffness: 170, damping: 22 }
  );
  const cursorRotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-10, 10]),
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
    if (prefersReducedMotion) return;
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

  // If reduced motion is requested, render clean accessible static card
  if (prefersReducedMotion) {
    return (
      <div className={`glass-card p-6 md:p-8 space-y-6 leading-relaxed text-gray-300 text-sm ${className}`}>
        <p>{profile.bio}</p>
        <div className="border-t border-white/5 pt-6 space-y-3 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between py-2 border-b border-white/5 gap-2">
            <span className="text-gray-400 font-bold shrink-0">OBJECTIVE:</span>
            <span className="text-white text-left max-w-xl leading-relaxed">{profile.careerObjective}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-white/5">
            <span className="text-gray-400 font-bold">LOCATION:</span>
            <span className="text-white">{profile.location}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-white/5">
            <span className="text-gray-400 font-bold">EMAIL:</span>
            <span className="text-cyber-blue font-bold">{profile.email}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-400 font-bold">PHONE:</span>
            <span className="text-white">{profile.phone}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full py-2 ${className}`}
      style={{
        perspective: isMobile ? undefined : 1200,
        transformStyle: isMobile ? "flat" : "preserve-3d",
      }}
    >
      {/* 1. Scroll-Driven 3D Depth Layer */}
      <motion.div
        style={{
          z: !isMobile ? z : 0,
          scale: !isMobile ? scale : 1,
          rotateX: !isMobile ? rotateXScroll : 0,
          opacity: !isMobile ? opacity : 1,
          filter: !isMobile ? filter : "none",
          transformStyle: isMobile ? "flat" : "preserve-3d",
          willChange: isMobile ? "auto" : "transform, opacity, filter",
        }}
        className="w-full relative"
      >
        {/* 2. Anti-Gravity Ambient Floating Layer */}
        <motion.div
          animate={
            !isMobile
              ? {
                  y: [-5, 5, -5],
                  rotateX: [-1, 1, -1],
                  rotateZ: [-0.6, 0.6, -0.6],
                }
              : {}
          }
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transformStyle: isMobile ? "flat" : "preserve-3d" }}
          className="relative w-full"
        >
          {/* Grounding Floor Glow Shadow - breathes with floating levitation on desktop */}
          {!isMobile && (
            <motion.div
              animate={{
                scale: [0.92, 1.05, 0.92],
                opacity: [0.35, 0.55, 0.35],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 w-[92%] h-10 blur-xl -z-10 rounded-full"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(0, 255, 157, 0.38) 0%, rgba(0, 200, 255, 0.18) 45%, transparent 72%)",
              }}
            />
          )}

          {/* 3. Interactive Cursor Motion & 3D Tilt Card Shell */}
          <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
              rotateX: !isMobile ? cursorRotateX : 0,
              rotateY: !isMobile ? cursorRotateY : 0,
              transformStyle: isMobile ? "flat" : "preserve-3d",
            }}
            className="group relative rounded-2xl glass-card p-6 md:p-8 space-y-6 leading-relaxed text-gray-300 text-sm border border-cyber-green/20 hover:border-cyber-green/45 shadow-[0_12px_40px_rgba(0,0,0,0.65)] hover:shadow-[0_20px_50px_rgba(0,255,157,0.18)] transition-colors duration-300"
          >
            {/* Holographic Cursor Sheen Glare */}
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 overflow-hidden"
              style={{
                background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(0, 255, 157, 0.16) 0%, rgba(0, 200, 255, 0.08) 35%, transparent 65%)`,
              }}
            />

            {/* Sci-Fi Corner HUD Brackets */}
            <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-2 border-l-2 border-cyber-green/60 pointer-events-none transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-2 border-r-2 border-cyber-green/60 pointer-events-none transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-2 border-l-2 border-cyber-green/60 pointer-events-none transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-2 border-r-2 border-cyber-green/60 pointer-events-none transition-transform duration-300 group-hover:scale-110" />

            {/* Realtime Cursor-Tracking Green Luminous Border Spotlight */}
            <LuminousCardBorder
              cursorX={cursorPos?.x ?? null}
              cursorY={cursorPos?.y ?? null}
              isHovered={isHovered}
              borderRadius="rounded-2xl"
              glowColor="#00FF9D"
            />

            {/* Internal 3D Stereoscopic Parallax Layers */}
            {/* Bio Paragraph (Floats forward at translateZ: 26px) */}
            <div
              className="relative z-10 transition-transform duration-200"
              style={{
                transform: "translateZ(26px)",
                transformStyle: "preserve-3d",
              }}
            >
              <p className="drop-shadow-sm leading-relaxed text-gray-200">
                {profile.bio}
              </p>
            </div>

            {/* Metadata Rows (Floats forward at translateZ: 34px) */}
            <div
              className="relative z-10 border-t border-white/10 pt-6 space-y-3 font-mono text-xs"
              style={{
                transform: "translateZ(34px)",
                transformStyle: "preserve-3d",
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between py-2 border-b border-white/5 gap-2 group/row hover:bg-white/[0.02] rounded px-2 -mx-2 transition-colors">
                <span className="text-gray-400 font-bold shrink-0 tracking-wider">
                  OBJECTIVE:
                </span>
                <span className="text-white text-left max-w-xl leading-relaxed">
                  {profile.careerObjective}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5 group/row hover:bg-white/[0.02] rounded px-2 -mx-2 transition-colors">
                <span className="text-gray-400 font-bold tracking-wider">
                  LOCATION:
                </span>
                <span className="text-white">{profile.location}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5 group/row hover:bg-white/[0.02] rounded px-2 -mx-2 transition-colors">
                <span className="text-gray-400 font-bold tracking-wider">
                  EMAIL:
                </span>
                <a
                  href={`mailto:${profile.email}`}
                  className="text-cyber-blue font-bold hover:underline hover:text-cyber-green transition-colors"
                >
                  {profile.email}
                </a>
              </div>
              <div className="flex justify-between py-2 group/row hover:bg-white/[0.02] rounded px-2 -mx-2 transition-colors">
                <span className="text-gray-400 font-bold tracking-wider">
                  PHONE:
                </span>
                <span className="text-white">{profile.phone}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
