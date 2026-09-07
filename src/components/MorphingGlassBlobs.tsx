"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function MorphingGlassBlobs() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 768px)");
    setReducedMotion(mediaQuery.matches);
    setIsMobile(mobileQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    const mobHandler = (e: MediaQueryListEvent) => setIsMobile(e.matches);

    mediaQuery.addEventListener("change", handler);
    mobileQuery.addEventListener("change", mobHandler);
    return () => {
      mediaQuery.removeEventListener("change", handler);
      mobileQuery.removeEventListener("change", mobHandler);
    };
  }, []);

  if (reducedMotion || isMobile) {
    return (
      <div className="fixed inset-0 pointer-events-none z-[-2] overflow-hidden opacity-30">
        <div
          className="absolute top-[8%] left-[5%] w-[45vw] h-[45vw] rounded-full blur-[40px]"
          style={{ background: "rgba(var(--cyber-primary-rgb, 0, 255, 157), 0.06)" }}
        />
        <div
          className="absolute top-[45%] right-[5%] w-[45vw] h-[45vw] rounded-full blur-[40px]"
          style={{ background: "rgba(var(--cyber-secondary-rgb, 0, 200, 255), 0.06)" }}
        />
        <div
          className="absolute bottom-[5%] left-[10%] w-[40vw] h-[40vw] rounded-full blur-[40px]"
          style={{ background: "rgba(var(--cyber-primary-rgb, 0, 255, 157), 0.05)" }}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-[-2] overflow-hidden">
      {/* Blob 1: Dynamic Primary Color (Hero / About) */}
      <motion.div
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -30, 25, 0],
          scale: [1, 1.08, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background:
            "linear-gradient(135deg, rgba(var(--cyber-primary-rgb, 0, 255, 157), 0.07) 0%, rgba(var(--cyber-secondary-rgb, 0, 200, 255), 0.04) 100%)",
        }}
        className="absolute top-[5%] left-[-5%] w-[45vw] h-[45vw] max-w-[650px] max-h-[650px] rounded-full blur-[80px] md:blur-[120px]"
      />

      {/* Blob 2: Dynamic Secondary Color (Projects / Skills) */}
      <motion.div
        animate={{
          x: [0, -50, 30, 0],
          y: [0, 40, -35, 0],
          scale: [1, 0.94, 1.07, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        style={{
          background:
            "linear-gradient(225deg, rgba(var(--cyber-secondary-rgb, 0, 200, 255), 0.08) 0%, rgba(var(--cyber-accent-rgb, 0, 229, 255), 0.05) 100%)",
        }}
        className="absolute top-[42%] right-[-5%] w-[48vw] h-[48vw] max-w-[700px] max-h-[700px] rounded-full blur-[85px] md:blur-[125px]"
      />

      {/* Blob 3: Dynamic Accent Color (Contact / Resume) */}
      <motion.div
        animate={{
          x: [0, 35, -45, 0],
          y: [0, -25, 30, 0],
          scale: [1, 1.06, 0.95, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
        style={{
          background:
            "linear-gradient(45deg, rgba(var(--cyber-primary-rgb, 0, 255, 157), 0.06) 0%, rgba(var(--cyber-secondary-rgb, 0, 200, 255), 0.07) 100%)",
        }}
        className="absolute bottom-[2%] left-[10%] w-[42vw] h-[42vw] max-w-[600px] max-h-[600px] rounded-full blur-[80px] md:blur-[115px]"
      />
    </div>
  );
}
