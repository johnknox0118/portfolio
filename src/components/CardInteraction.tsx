"use client";

import React, { ReactNode, useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface CardInteractionProps {
  children: ReactNode;
  className?: string;
  magnetic?: boolean;
  spotlight?: boolean;
  holo?: boolean;
  lift?: boolean;
  onClick?: () => void;
}

export default function CardInteraction({
  children,
  className = "",
  magnetic = true,
  spotlight = true,
  holo = false,
  lift = true,
  onClick,
}: CardInteractionProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

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

  // Magnetic motion spring values (Animation #42: ±4px subtle attraction)
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springConfig = { stiffness: 260, damping: 20 };
  const magX = useSpring(rawX, springConfig);
  const magY = useSpring(rawY, springConfig);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current || reducedMotion || isTouchDevice) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Animation #43: Update CSS variables for high-performance Spotlight
    cardRef.current.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--mouse-y", `${y}px`);

    // Animation #48: Parallax offset variables (-4px to +4px)
    const normX = (x / rect.width - 0.5) * 2;
    const normY = (y / rect.height - 0.5) * 2;
    cardRef.current.style.setProperty("--parallax-x", `${-normX * 5}px`);
    cardRef.current.style.setProperty("--parallax-y", `${-normY * 5}px`);

    // Animation #42: Magnetic cursor follow (max ±4px)
    if (magnetic) {
      rawX.set(normX * 4);
      rawY.set(normY * 4);
    }
  };

  const handlePointerEnter = () => {};

  const handlePointerLeave = () => {
    rawX.set(0);
    rawY.set(0);
    if (cardRef.current) {
      cardRef.current.style.setProperty("--parallax-x", "0px");
      cardRef.current.style.setProperty("--parallax-y", "0px");
    }
  };

  return (
    <motion.div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={onClick}
      style={{
        x: magnetic && !reducedMotion && !isTouchDevice ? magX : 0,
        y: magnetic && !reducedMotion && !isTouchDevice ? magY : 0,
      }}
      whileHover={lift && !reducedMotion ? { y: -6 } : undefined}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className={`relative rounded-2xl focus-depth-item ${
        spotlight ? "card-spotlight" : ""
      } ${holo ? "holo-glass" : ""} ${
        lift
          ? "transition-shadow duration-300 hover:shadow-[0_20px_45px_rgba(0,0,0,0.5),0_0_25px_rgba(0,255,157,0.12)]"
          : ""
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}
