"use client";

import React, { useRef, useState, useEffect, ReactNode } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";

interface HeroScrollDepthProps {
  children: ReactNode;
  className?: string;
}

export default function HeroScrollDepth({
  children,
  className = "",
}: HeroScrollDepthProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Track scroll progress as hero moves from top of page towards exit
  // "start start" (0.0): Page at very top, Hero in full front focus
  // "end start" (1.0): Hero has fully scrolled past the top of the viewport
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // As user scrolls down (0.0 -> 0.85):
  // Hero smoothly recedes and scales back cleanly
  const targetY = useTransform(scrollYProgress, [0.0, 0.85], [0, -40]);
  const targetScale = useTransform(scrollYProgress, [0.0, 0.85], [1.0, 0.88]);
  const targetOpacity = useTransform(
    scrollYProgress,
    [0.0, 0.65, 0.9],
    [1.0, 0.7, 0.2]
  );

  const springConfig = { damping: 24, stiffness: 130, mass: 0.85 };
  const y = useSpring(targetY, springConfig);
  const scale = useSpring(targetScale, springConfig);
  const opacity = useSpring(targetOpacity, { damping: 20, stiffness: 160 });

  if (prefersReducedMotion) {
    return <div className={`relative w-full ${className}`}>{children}</div>;
  }

  return (
    <div
      ref={containerRef}
      className={`relative z-10 w-full ${className}`}
    >
      <motion.div
        style={{
          y,
          scale,
          opacity,
          willChange: "transform, opacity",
        }}
        className="w-full relative flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12"
      >
        {children}
      </motion.div>
    </div>
  );
}
