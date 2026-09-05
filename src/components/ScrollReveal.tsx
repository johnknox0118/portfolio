"use client";

import React, { useEffect, useRef, ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useScrollContext } from "./SmoothScrollProvider";

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  distance?: number;
  delay?: number;
  duration?: number;
  scale?: number;
  once?: boolean;
}

export default function ScrollReveal({
  children,
  className = "",
  distance = 25,
  delay = 0,
  duration = 0.75,
  scale = 0.98,
  once = true,
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContext = useScrollContext();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Check for user reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      gsap.set(el, { opacity: 1, y: 0, scale: 1, clearProps: "all" });
      return;
    }

    // Initial state
    gsap.set(el, {
      opacity: 0,
      y: distance,
      scale: scale,
    });

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      onEnter: (self) => {
        // Animation #62: Directional Reveal (downward vs upward)
        // Animation #65: Velocity-Based duration scaling
        const mult = scrollContext?.velocityMultiplierRef.current || 1.0;
        const dir = self.direction || 1; // 1 = down, -1 = up
        const startY = dir > 0 ? distance : -distance;

        gsap.fromTo(
          el,
          {
            opacity: 0,
            y: startY,
            scale: scale,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: Math.max(0.4, duration / Math.min(1.25, mult)),
            delay: delay,
            ease: "power3.out",
            overwrite: "auto",
            clearProps: "transform,opacity",
          }
        );
      },
      onEnterBack: () => {
        if (!once) {
          const mult = scrollContext?.velocityMultiplierRef.current || 1.0;
          const startY = -distance;

          gsap.fromTo(
            el,
            {
              opacity: 0,
              y: startY,
              scale: scale,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: Math.max(0.4, duration / Math.min(1.25, mult)),
              delay: delay,
              ease: "power3.out",
              overwrite: "auto",
              clearProps: "transform,opacity",
            }
          );
        }
      },
      once: once,
    });

    return () => {
      trigger.kill();
    };
  }, [distance, delay, duration, scale, once, scrollContext]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
