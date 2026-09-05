"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface IAm3DTextProps {
  className?: string;
}

const CUBIC_EASE = [0.22, 1, 0.36, 1] as const;

export default function IAm3DText({ className = "" }: IAm3DTextProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  // Pointer tilt physics for desktop mouse
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 26, stiffness: 150 };

  const tiltX = useSpring(useTransform(mouseY, [-0.5, 0.5], [1.8, -1.8]), springConfig);
  const tiltY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-2.4, 2.4]), springConfig);

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

    return () => {
      motionQuery.removeEventListener("change", handleMotionChange);
      mobileQuery.removeEventListener("change", handleMobileChange);
      touchQuery.removeEventListener("change", handleTouchChange);
    };
  }, []);

  const text = "I am";
  const words = text.split(" ");

  if (reducedMotion) {
    return (
      <span
        aria-label="I am"
        className={`relative inline-flex items-center gap-x-2 py-0.5 select-text hero-3d-selectable ${className}`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {words.map((word, wIdx) => (
          <span key={`w-${wIdx}`} className="inline-flex items-center whitespace-nowrap" style={{ transformStyle: "preserve-3d" }}>
            {Array.from(word).map((char, cIdx) => (
              <span
                key={`c-${cIdx}`}
                className="relative inline-block hero-iam-3d-font px-[1px] text-xl sm:text-2xl md:text-3xl"
                style={{ transformStyle: "preserve-3d" }}
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 select-none pointer-events-none hero-iam-3d-extrusion hero-iam-3d-font"
                  style={{
                    transform: isMobile ? "translateZ(-1.5px)" : "translateZ(-3.5px)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {char}
                </span>
                <span
                  className="relative inline-block hero-iam-3d-front hero-iam-3d-font cursor-text"
                  style={{
                    transform: isMobile ? "translateZ(1.5px)" : "translateZ(3.5px)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {char}
                </span>
              </span>
            ))}
          </span>
        ))}
      </span>
    );
  }

  return (
    <motion.span
      ref={containerRef}
      aria-label="I am"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: tiltX,
        rotateY: tiltY,
        transformPerspective: 1000,
        transformStyle: "preserve-3d",
      }}
      className={`relative inline-flex items-center py-1 select-text hero-3d-selectable ${className}`}
    >
      {/* Harmonic Organic Floating (decoupled phase for real physical anti-gravity feel) */}
      <motion.span
        animate={{
          y: [0, -4.5, -1.2, -5.2, -0.8, 0],
          z: [0, 3, 1, 4, 1.5, 0],
          rotateX: [0, 1.4, -0.4, 1.1, -0.2, 0],
          rotateY: [0, -1.1, 0.4, -0.8, 0.2, 0],
          rotateZ: [0, 0.4, -0.2, 0.3, -0.1, 0],
        }}
        transition={{
          duration: 5.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          transformStyle: "preserve-3d",
        }}
        className="inline-flex items-center gap-x-2.5"
      >
        {words.map((word, wIdx) => (
          <span key={`w-${wIdx}`} className="inline-flex items-center whitespace-nowrap" style={{ transformStyle: "preserve-3d" }}>
            {Array.from(word).map((char, cIdx) => (
              <motion.span
                key={`c-${cIdx}`}
                initial={{ opacity: 0, y: -10, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.05 + cIdx * 0.04, ease: CUBIC_EASE }}
                className="relative inline-block hero-iam-3d-font px-[1px] text-xl sm:text-2xl md:text-3xl"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* 3D Extruded Depth Layer */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 select-none pointer-events-none hero-iam-3d-extrusion hero-iam-3d-font"
                  style={{
                    transform: isMobile ? "translateZ(-1.5px)" : "translateZ(-3.5px)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {char}
                </span>

                {/* 3D Front Metallic Face */}
                <span
                  className="relative inline-block hero-iam-3d-front hero-iam-3d-font cursor-text"
                  style={{
                    transform: isMobile ? "translateZ(1.5px)" : "translateZ(3.5px)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {char}
                </span>
              </motion.span>
            ))}
          </span>
        ))}
      </motion.span>

      {/* Floating Floor Shadow underneath "I am" that dynamically breathes with altitude */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-2 left-0 right-0 h-2.5 rounded-full blur-sm"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0, 255, 157, 0.22) 0%, rgba(0, 25, 15, 0.35) 50%, transparent 80%)",
        }}
        animate={{
          scaleX: [1, 0.92, 1],
          opacity: [0.38, 0.18, 0.38],
          y: [0, 2, 0],
        }}
        transition={{
          duration: 5.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.span>
  );
}
