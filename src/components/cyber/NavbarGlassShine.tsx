"use client";

import React from "react";
import { motion } from "framer-motion";

interface NavbarGlassShineProps {
  isHovered: boolean;
}

export default function NavbarGlassShine({ isHovered }: NavbarGlassShineProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-b-[20px] z-0">
      {isHovered && (
        <motion.div
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: "200%", opacity: [0, 0.7, 0] }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-y-0 w-1/2"
          style={{
            background:
              "linear-gradient(105deg, transparent 20%, rgba(255, 255, 255, 0.03) 40%, rgba(0, 200, 255, 0.05) 50%, rgba(0, 255, 157, 0.03) 60%, transparent 80%)",
            transform: "skewX(-20deg)",
          }}
        />
      )}
    </div>
  );
}
