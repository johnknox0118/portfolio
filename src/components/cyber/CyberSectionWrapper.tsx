"use client";

import { ReactNode, useRef } from "react";
import { motion, useInView, Variants } from "framer-motion";

interface CyberSectionWrapperProps {
  id?: string;
  children: ReactNode;
  className?: string;
  variant?: "default" | "fadeUp" | "scaleIn" | "blurIn" | "cinematic";
  showAmbientGlow?: boolean;
}

const CUBIC_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const variants: Record<string, Variants> = {
  cinematic: {
    hidden: {
      opacity: 0,
      y: 24,
      scale: 0.99,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: CUBIC_EASE,
      },
    },
  },
  blurIn: {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.99,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: CUBIC_EASE,
      },
    },
  },
  fadeUp: {
    hidden: {
      opacity: 0,
      y: 24,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.65,
        ease: CUBIC_EASE,
      },
    },
  },
  scaleIn: {
    hidden: {
      opacity: 0,
      scale: 0.96,
      y: 16,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.65,
        ease: CUBIC_EASE,
      },
    },
  },
  default: {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  },
};

export default function CyberSectionWrapper({
  id,
  children,
  className = "",
  variant = "cinematic",
  showAmbientGlow = true,
}: CyberSectionWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.08 });

  const selectedVariant = variants[variant] || variants.cinematic;

  return (
    <section id={id} ref={ref} className={`relative scroll-mt-20 ${className}`}>
      {/* Soft Ambient Background Glow */}
      {showAmbientGlow && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 0.35 } : { opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-radial from-cyber-blue/10 via-cyber-green/5 to-transparent blur-3xl -z-10"
        />
      )}

      {/* Clean Hardware-Accelerated Container */}
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={selectedVariant}
      >
        {children}
      </motion.div>
    </section>
  );
}
