"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface NavLinkProps {
  href: string;
  label: string;
  isActive?: boolean;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
}

export default function NavLink({
  href,
  label,
  isActive = false,
  onClick,
  className = "",
}: NavLinkProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Micro-magnetic hover effect for desktop fine pointers
  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (prefersReducedMotion || !linkRef.current) return;
    // Only on fine pointers (desktop mouse)
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const rect = linkRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = (e.clientX - centerX) / (rect.width / 2);
    const dy = (e.clientY - centerY) / (rect.height / 2);

    // Max 1.5px on X, 1px on Y - extremely subtle and stable
    setMagneticOffset({
      x: Math.max(-1.5, Math.min(1.5, dx * 1.5)),
      y: Math.max(-1.0, Math.min(1.0, dy * 1.0)),
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMagneticOffset({ x: 0, y: 0 });
  };

  const showUnderline = isActive || isHovered;

  return (
    <motion.a
      ref={linkRef}
      href={href}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={
        prefersReducedMotion
          ? undefined
          : {
              x: magneticOffset.x,
              y: isHovered ? -1 + magneticOffset.y : magneticOffset.y,
            }
      }
      transition={{
        type: "spring",
        stiffness: 380,
        damping: 24,
        mass: 0.2,
      }}
      className={`relative inline-flex flex-col items-center py-1 text-xs font-orbitron font-semibold tracking-wider transition-colors duration-200 outline-none focus-visible:ring-1 focus-visible:ring-cyber-green focus-visible:ring-offset-2 focus-visible:ring-offset-[#07111F] rounded-sm select-none ${
        isActive
          ? "text-white drop-shadow-[0_0_8px_rgba(0,255,157,0.45)] font-bold"
          : isHovered
          ? "text-white"
          : "text-gray-400 hover:text-gray-200"
      } ${className}`}
    >
      <span>{label}</span>

      {/* Expanding Gradient Underline */}
      <span className="relative w-full h-[2px] mt-1 overflow-hidden pointer-events-none">
        <motion.span
          initial={false}
          animate={{
            scaleX: showUnderline ? 1 : 0,
            opacity: showUnderline ? 1 : 0,
          }}
          transition={{
            duration: 0.28,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ originX: 0 }}
          className="absolute inset-0 rounded-full"
        >
          <span
            className="block w-full h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #00FF9D 0%, #00C8FF 100%)",
              boxShadow: "0 0 6px rgba(0, 200, 255, 0.45)",
            }}
          />
        </motion.span>
      </span>

      {/* Active Section Cyan Indicator Dot */}
      {isActive && (
        <motion.span
          layoutId="active-nav-dot"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
          className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-cyber-blue shadow-[0_0_6px_#00C8FF] pointer-events-none"
        />
      )}
    </motion.a>
  );
}
