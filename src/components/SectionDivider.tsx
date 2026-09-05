"use client";

import { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";

interface SectionDividerProps {
  className?: string;
  color?: "green" | "blue" | "dual";
}

export default function SectionDivider({
  className = "",
  color = "dual",
}: SectionDividerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const gradientMap = {
    green: "from-cyber-green/60 via-cyber-green/20 to-transparent",
    blue: "from-cyber-blue/60 via-cyber-blue/20 to-transparent",
    dual: "from-cyber-green/70 via-cyber-blue/50 to-transparent",
  };

  return (
    <div ref={ref} className={`relative h-[2px] w-full overflow-hidden ${className}`}>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: "left" }}
        className={`h-full w-full bg-gradient-to-r ${gradientMap[color]}`}
      />
    </div>
  );
}
