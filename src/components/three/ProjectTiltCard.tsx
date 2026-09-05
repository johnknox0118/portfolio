"use client";

import { ReactNode, useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface ProjectTiltCardProps {
  children: ReactNode;
  className?: string;
  magnetic?: boolean;
  spotlight?: boolean;
}

export default function ProjectTiltCard({
  children,
  className = "",
  magnetic = true,
  spotlight = true,
}: ProjectTiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const touchQuery = window.matchMedia("(pointer: coarse)");
    setReducedMotion(motionQuery.matches);
    setIsTouchDevice(touchQuery.matches);

    const handleMotion = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    const handleTouch = (e: MediaQueryListEvent) => setIsTouchDevice(e.matches);

    motionQuery.addEventListener("change", handleMotion);
    touchQuery.addEventListener("change", handleTouch);

    return () => {
      motionQuery.removeEventListener("change", handleMotion);
      touchQuery.removeEventListener("change", handleTouch);
    };
  }, []);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for subtle ±5 degree tilt (Animation #41)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), {
    stiffness: 220,
    damping: 24,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]), {
    stiffness: 220,
    damping: 24,
  });

  // Magnetic cursor follow springs (Animation #42: ±4px)
  const magX = useSpring(useTransform(x, [-0.5, 0.5], [-4, 4]), {
    stiffness: 260,
    damping: 22,
  });
  const magY = useSpring(useTransform(y, [-0.5, 0.5], [-4, 4]), {
    stiffness: 260,
    damping: 22,
  });

  const glareX = useTransform(x, [-0.5, 0.5], ["15%", "85%"]);
  const glareY = useTransform(y, [-0.5, 0.5], ["15%", "85%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || isTouchDevice || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);

    // Update CSS variables for Spotlight (Animation #43) & Image Parallax (Animation #48)
    ref.current.style.setProperty("--mouse-x", `${mouseX}px`);
    ref.current.style.setProperty("--mouse-y", `${mouseY}px`);
    const pX = -((mouseX / rect.width - 0.5) * 8);
    const pY = -((mouseY / rect.height - 0.5) * 8);
    ref.current.style.setProperty("--parallax-x", `${pX}px`);
    ref.current.style.setProperty("--parallax-y", `${pY}px`);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
    if (ref.current) {
      ref.current.style.setProperty("--parallax-x", "0px");
      ref.current.style.setProperty("--parallax-y", "0px");
    }
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: reducedMotion || isTouchDevice ? 0 : rotateX,
        rotateY: reducedMotion || isTouchDevice ? 0 : rotateY,
        x: magnetic && !reducedMotion && !isTouchDevice ? magX : 0,
        y: magnetic && !reducedMotion && !isTouchDevice ? magY : 0,
        transformPerspective: 1000,
        transformStyle: "preserve-3d",
      }}
      className={`relative rounded-2xl will-change-transform glass-shine focus-depth-item ${
        spotlight ? "card-spotlight" : ""
      } transition-all duration-300 ${
        isHovered
          ? "shadow-[0_22px_48px_rgba(0,0,0,0.55),0_0_25px_rgba(0,255,157,0.14)] -translate-y-2"
          : ""
      } ${className}`}
    >
      <div className="h-full w-full">{children}</div>

      {/* Soft Specular Radial Glare Reflection */}
      {!reducedMotion && !isTouchDevice && isHovered && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300 z-30"
          style={{
            background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255, 255, 255, 0.08), transparent 60%)`,
          }}
        />
      )}
    </motion.div>
  );
}
