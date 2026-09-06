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
        <div className="absolute top-[8%] left-[5%] w-[45vw] h-[45vw] rounded-full bg-[#00FF9D]/[0.05] blur-[40px]" />
        <div className="absolute top-[45%] right-[5%] w-[45vw] h-[45vw] rounded-full bg-[#00C8FF]/[0.05] blur-[40px]" />
        <div className="absolute bottom-[5%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-[#00FF9D]/[0.04] blur-[40px]" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-[-2] overflow-hidden">
      {/* Blob 1: Emerald Green (Hero / About) */}
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
        className="absolute top-[5%] left-[-5%] w-[45vw] h-[45vw] max-w-[650px] max-h-[650px] rounded-full bg-gradient-to-br from-[#00FF9D]/[0.06] to-[#00C8FF]/[0.04] blur-[80px] md:blur-[120px]"
      />

      {/* Blob 2: Electric Cyan / Blue (Projects / Skills) */}
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
        className="absolute top-[42%] right-[-5%] w-[48vw] h-[48vw] max-w-[700px] max-h-[700px] rounded-full bg-gradient-to-bl from-[#00C8FF]/[0.07] to-[#0070F3]/[0.04] blur-[85px] md:blur-[125px]"
      />

      {/* Blob 3: Deep Emerald / Cyan (Contact / Resume) */}
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
        className="absolute bottom-[2%] left-[10%] w-[42vw] h-[42vw] max-w-[600px] max-h-[600px] rounded-full bg-gradient-to-tr from-[#00FF9D]/[0.05] to-[#00C8FF]/[0.06] blur-[80px] md:blur-[115px]"
      />
    </div>
  );
}
