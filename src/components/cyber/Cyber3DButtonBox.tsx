"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Cyber3DButtonBoxProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  variant?: "green" | "blue";
  download?: boolean | string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  floatDelay?: number;
  className?: string;
  target?: string;
  rel?: string;
}

const CUBIC_EASE = [0.22, 1, 0.36, 1] as const;

export default function Cyber3DButtonBox({
  href,
  label,
  icon,
  variant = "green",
  download,
  onClick,
  floatDelay = 0,
  className = "",
  target,
  rel,
}: Cyber3DButtonBoxProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motionQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionQuery.addEventListener("change", handleMotionChange);
    return () => motionQuery.removeEventListener("change", handleMotionChange);
  }, []);

  const isGreen = variant === "green";
  const glowShadow = isGreen
    ? "0 0 24px rgba(0, 255, 157, 0.45)"
    : "0 0 24px rgba(0, 200, 255, 0.45)";

  // Physical 3D chassis thickness shadow
  const extrusionShadow = isGreen
    ? "0 3px 0 #005a38, 0 5px 0 #003d25, 0 7px 0 #002616, 0 10px 18px rgba(0, 0, 0, 0.85)"
    : "0 3px 0 #004b7e, 0 5px 0 #00365c, 0 7px 0 #00223b, 0 10px 18px rgba(0, 0, 0, 0.85)";

  return (
    <div className={`relative inline-block z-30 pointer-events-auto ${className}`}>
      <div className="relative">
        <motion.a
          href={href}
          download={download}
          target={target}
          rel={rel}
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{
            scale: 1.025,
          }}
          whileTap={{
            scale: 0.975,
          }}
          transition={{ duration: 0.15, ease: CUBIC_EASE }}
          style={{
            boxShadow: `${extrusionShadow}, ${isHovered ? glowShadow : "none"}`,
          }}
          className={`relative flex items-center gap-3 px-6 py-3.5 rounded-xl font-orbitron text-xs font-bold tracking-widest uppercase transition-colors outline-none focus-visible:ring-2 select-none cursor-pointer pointer-events-auto overflow-hidden ${
            isGreen
              ? "bg-[#051815]/95 text-cyber-green border border-cyber-green/60 hover:border-cyber-green focus-visible:ring-cyber-green"
              : "bg-[#061729]/95 text-cyber-blue border border-cyber-blue/60 hover:border-cyber-blue focus-visible:ring-cyber-blue"
          }`}
        >
          {/* Synchronized Realistic 3s Diagonal Glass Shine Sweep (Top-Right to Bottom-Left) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-xl overflow-hidden z-20"
          >
            <div className="glass-shine-beam" />
          </div>

          {/* Top Specular Edge Highlight Catchlight */}
          <div
            aria-hidden="true"
            className="absolute top-0 left-2 right-2 h-[1px] pointer-events-none rounded-t-xl"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.45) 50%, transparent 100%)",
            }}
          />

          {/* Micro Corner HUD Brackets */}
          <span
            aria-hidden="true"
            className={`absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 pointer-events-none transition-colors ${
              isGreen ? "border-cyber-green" : "border-cyber-blue"
            }`}
          />
          <span
            aria-hidden="true"
            className={`absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 pointer-events-none transition-colors ${
              isGreen ? "border-cyber-green" : "border-cyber-blue"
            }`}
          />

          {/* Holographic Light Reflection Sweep on Hover */}
          {isHovered && (
            <motion.div
              aria-hidden="true"
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: "220%", opacity: [0, 0.75, 0] }}
              transition={{ duration: 0.8, ease: CUBIC_EASE }}
              className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden"
            >
              <div
                className="w-1/2 h-full"
                style={{
                  background:
                    "linear-gradient(105deg, transparent 20%, rgba(255, 255, 255, 0.25) 50%, transparent 80%)",
                  transform: "skewX(-25deg)",
                }}
              />
            </motion.div>
          )}

          {/* Glowing Icon with micro-scale response */}
          <motion.span
            animate={{
              scale: isHovered ? 1.12 : 1,
            }}
            transition={{ duration: 0.2 }}
            className={`relative z-10 pointer-events-none flex items-center justify-center ${
              isGreen ? "text-cyber-green" : "text-cyber-blue"
            }`}
          >
            {icon}
          </motion.span>

          {/* Button Text with high-contrast brightness */}
          <span
            className={`relative z-10 pointer-events-none font-black transition-colors ${
              isHovered ? "text-white" : isGreen ? "text-cyber-green" : "text-cyber-blue"
            }`}
          >
            {label}
          </span>

          {/* Subtle Status LED Dot */}
          <span
            aria-hidden="true"
            className={`relative z-10 pointer-events-none w-1.5 h-1.5 rounded-full animate-pulse ml-1 ${
              isGreen
                ? "bg-cyber-green shadow-[0_0_6px_#00FF9D]"
                : "bg-cyber-blue shadow-[0_0_6px_#00C8FF]"
            }`}
          />
        </motion.a>

        {/* Dynamic Floor Shadow beneath 3D Button Box (syncs with hover state) */}
        <motion.div
          aria-hidden="true"
          animate={{
            scaleX: isHovered ? 1.08 : 1.0,
            opacity: isHovered ? 0.55 : 0.35,
          }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none absolute -bottom-3 left-2 right-2 h-3.5 rounded-full blur-md"
          style={{
            background: isGreen
              ? "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(0, 255, 157, 0.25) 0%, rgba(0, 10, 25, 0.5) 60%, transparent 85%)"
              : "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(0, 200, 255, 0.25) 0%, rgba(0, 10, 25, 0.5) 60%, transparent 85%)",
          }}
        />
      </div>
    </div>
  );
}
