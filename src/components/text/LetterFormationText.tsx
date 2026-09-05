"use client";

import React, { useEffect, useState, useRef, useId } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface LetterFormationTextProps {
  text: string;
  className?: string;
  duration?: number;
}

const CUBIC_EASE = [0.22, 1, 0.36, 1] as const;

// Deterministic pseudorandom generator so server and client match without hydration mismatches
function getDeterministicOffset(index: number, total: number, isMobile: boolean) {
  const angle = (index / Math.max(total, 1)) * Math.PI * 2;
  const spread = isMobile ? 35 : 75;
  const depthSpread = isMobile ? 30 : 80;

  const x = Math.sin(angle * 1.7 + index) * spread;
  const y = Math.cos(angle * 2.3 + index) * spread * 0.8;
  const z = (Math.sin(angle * 3.1) * 0.5 + 0.5) * depthSpread;
  const rotX = Math.cos(angle * 1.5) * 45;
  const rotY = Math.sin(angle * 2.2) * 55;
  const rotZ = Math.sin(angle * 1.8) * 35;
  const scale = 0.6 + ((index * 7) % 5) * 0.08;

  return { x, y, z, rotX, rotY, rotZ, scale };
}

export default function LetterFormationText({
  text,
  className = "",
  duration = 1.1,
}: LetterFormationTextProps) {
  const [isFormed, setIsFormed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const componentId = useId();
  const containerRef = useRef<HTMLSpanElement>(null);

  // Local pointer interaction for desktop hover tilt (subtle ±2.2deg Y, ±1.5deg X)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 24, stiffness: 140 };

  const tiltX = useSpring(useTransform(mouseY, [-0.5, 0.5], [1.5, -1.5]), springConfig);
  const tiltY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-2.2, 2.2]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (isTouch || reducedMotion) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(Math.max(-0.5, Math.min(0.5, x)));
    mouseY.set(Math.max(-0.5, Math.min(0.5, y)));
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 768px)");
    const touchQuery = window.matchMedia("(pointer: coarse)");

    setReducedMotion(motionQuery.matches);
    setIsMobile(mobileQuery.matches);
    setIsTouch(touchQuery.matches || "ontouchstart" in window);

    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    const handleMobileChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    const handleTouchChange = (e: MediaQueryListEvent) => setIsTouch(e.matches);

    motionQuery.addEventListener("change", handleMotionChange);
    mobileQuery.addEventListener("change", handleMobileChange);
    touchQuery.addEventListener("change", handleTouchChange);

    // Form letters on mount after entrance animation completes
    const timer = setTimeout(() => {
      setIsFormed(true);
    }, (duration + 0.3) * 1000);

    return () => {
      clearTimeout(timer);
      motionQuery.removeEventListener("change", handleMotionChange);
      mobileQuery.removeEventListener("change", handleMobileChange);
      touchQuery.removeEventListener("change", handleTouchChange);
    };
  }, [duration]);

  // Reduced motion: Immediate static 3D typography without explosion or continuous movement
  if (reducedMotion) {
    const words = text.split(" ");
    return (
      <span
        aria-label={text}
        className={`relative inline-flex flex-wrap items-center gap-x-4 sm:gap-x-6 md:gap-x-8 py-1 select-text hero-3d-selectable ${className}`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {words.map((word, wordIdx) => (
          <span
            key={`w-${wordIdx}`}
            className="inline-flex items-center whitespace-nowrap"
            style={{ transformStyle: "preserve-3d" }}
          >
            {Array.from(word).map((char, charIdx) => (
              <span
                key={`rm-c-${charIdx}`}
                className="relative inline-block hero-3d-name-font px-[1px]"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* 3D Extrusion Side/Depth Layer */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 select-none pointer-events-none hero-3d-extrusion hero-3d-name-font"
                  style={{
                    transform: isMobile ? "translateZ(-2px)" : "translateZ(-6px)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {char}
                </span>

                {/* 3D Front Face (bright holographic glass-metal surface) */}
                <span
                  className="relative inline-block hero-3d-text-front hero-3d-name-font cursor-text"
                  style={{
                    transform: isMobile ? "translateZ(2px)" : "translateZ(6px)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {char}
                </span>
              </span>
            ))}
          </span>
        ))}

        {/* Static Anchoring Floor Shadow */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-3 sm:-bottom-4 md:-bottom-5 left-0 right-0 h-3 sm:h-4 md:h-5 rounded-full blur-sm md:blur-md opacity-25"
          style={{
            background:
              "radial-gradient(ellipse 65% 50% at 50% 50%, rgba(0, 180, 230, 0.12) 0%, rgba(0, 20, 40, 0.25) 50%, transparent 75%)",
          }}
        />
      </span>
    );
  }

  const words = text.split(" ");
  let globalCharIndex = 0;
  const totalChars = text.replace(/\s+/g, "").length;

  return (
    <motion.span
      ref={containerRef}
      aria-label={text}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: tiltX,
        rotateY: tiltY,
        transformPerspective: 1200,
        transformStyle: "preserve-3d",
      }}
      className={`relative inline-flex flex-wrap items-center gap-x-4 sm:gap-x-6 md:gap-x-8 py-1 select-text hero-3d-selectable ${className}`}
    >
      {/* Ambient Levitation Stage (gentle realistic 3D floating after letters lock into formation) */}
      <motion.span
        animate={
          isFormed
            ? {
                y: [0, -6.5, -2, -7.5, -1.2, 0],
                z: [0, 5, 1.5, 6, 2, 0],
                rotateX: [0, 2.0, -0.6, 1.6, -0.4, 0],
                rotateY: [0, -1.8, 0.6, -1.4, 0.4, 0],
                rotateZ: [0, 0.6, -0.3, 0.5, -0.2, 0],
              }
            : { y: 0, z: 0, rotateX: 0, rotateY: 0, rotateZ: 0 }
        }
        transition={
          isFormed
            ? {
                duration: 6.6,
                repeat: Infinity,
                ease: "easeInOut",
              }
            : undefined
        }
        style={{
          transformStyle: "preserve-3d",
        }}
        className="inline-flex flex-wrap items-center gap-x-4 sm:gap-x-6 md:gap-x-8"
      >
        {words.map((word, wordIdx) => (
          <span
            key={`w-${wordIdx}`}
            className="inline-flex items-center whitespace-nowrap"
            style={{ transformStyle: "preserve-3d" }}
          >
            {Array.from(word).map((char) => {
              const charIdx = globalCharIndex++;
              const offset = getDeterministicOffset(charIdx, totalChars, isMobile);

              return (
                <motion.span
                  key={`${componentId}-c-${charIdx}`}
                  initial={{
                    opacity: 0,
                    x: offset.x,
                    y: offset.y,
                    z: offset.z,
                    rotateX: offset.rotX,
                    rotateY: offset.rotY,
                    rotateZ: offset.rotZ,
                    scale: offset.scale,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    y: 0,
                    z: 0,
                    rotateX: 0,
                    rotateY: 0,
                    rotateZ: 0,
                    scale: 1,
                  }}
                  transition={{
                    duration: duration,
                    delay: 0.12 + charIdx * 0.035,
                    ease: CUBIC_EASE,
                  }}
                  style={{
                    transformStyle: "preserve-3d",
                    display: "inline-block",
                  }}
                  className="relative inline-block hero-3d-name-font px-[1px]"
                >
                  {/* 3D Extrusion Side/Depth Layer (rendered behind front face with progressive depth shadow) */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 select-none pointer-events-none hero-3d-extrusion hero-3d-name-font"
                    style={{
                      transform: isMobile ? "translateZ(-2px)" : "translateZ(-6px)",
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {char}
                  </span>

                  {/* 3D Front Face (bright holographic cyan-metallic surface with top catchlight) */}
                  <span
                    className="relative inline-block hero-3d-text-front hero-3d-name-font cursor-text"
                    style={{
                      transform: isMobile ? "translateZ(2px)" : "translateZ(6px)",
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {char}
                  </span>
                </motion.span>
              );
            })}
          </span>
        ))}
      </motion.span>

      {/* Floating Floor Shadow beneath 3D Name (syncs with levitation height & scale) */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-3 sm:-bottom-4 md:-bottom-5 left-0 right-0 h-3 sm:h-4 md:h-5 rounded-full blur-sm md:blur-md"
        style={{
          background:
            "radial-gradient(ellipse 65% 50% at 50% 50%, rgba(0, 180, 230, 0.12) 0%, rgba(0, 20, 40, 0.25) 50%, transparent 75%)",
        }}
        animate={
          isFormed
            ? {
                scaleX: [1, 0.91, 0.98, 0.89, 0.99, 1],
                opacity: [0.40, 0.20, 0.35, 0.16, 0.36, 0.40],
                y: [0, 2.5, 0.8, 3, 0.5, 0],
              }
            : { scaleX: 1, opacity: 0.25, y: 0 }
        }
        transition={{
          duration: 6.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.span>
  );
}
