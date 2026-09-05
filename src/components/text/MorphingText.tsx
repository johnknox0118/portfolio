"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MorphingTextProps {
  phrases?: string[];
  duration?: number;
  pause?: number;
  className?: string;
  glowColor?: "cyan" | "green" | "blue";
}

const DEFAULT_PHRASES = [
  "CYBERSECURITY ENGINEER",
  "DEFENSIVE SYSTEMS ARCHITECT",
  "FULL-STACK SOFTWARE DEVELOPER",
  "CLOUD & API SECURITY SPECIALIST",
  "VULNERABILITY & THREAT RESEARCHER",
];

const CUBIC_EASE = [0.22, 1, 0.36, 1] as const;

export default function MorphingText({
  phrases = DEFAULT_PHRASES,
  duration = 0.8,
  pause = 1800,
  className = "",
  glowColor = "cyan",
}: MorphingTextProps) {
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const validPhrases = phrases.length > 0 ? phrases : DEFAULT_PHRASES;

  useEffect(() => {
    if (reducedMotion || validPhrases.length <= 1) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % validPhrases.length);
    }, pause + duration * 1000);

    return () => clearInterval(interval);
  }, [validPhrases.length, pause, duration, reducedMotion]);

  const currentPhrase = validPhrases[index % validPhrases.length];

  const glowClass = {
    cyan: "text-cyber-blue drop-shadow-[0_0_12px_rgba(0,200,255,0.4)]",
    green: "text-cyber-green drop-shadow-[0_0_12px_rgba(0,255,157,0.4)]",
    blue: "text-[#38bdf8] drop-shadow-[0_0_12px_rgba(56,189,248,0.4)]",
  }[glowColor];

  if (reducedMotion) {
    return (
      <div className={`font-mono text-sm md:text-lg font-semibold tracking-wider ${glowClass} ${className}`}>
        <span>{validPhrases[0]}</span>
      </div>
    );
  }

  // Split phrase into words and characters to allow organic character-level morphing
  const words = currentPhrase.split(" ");

  return (
    <div
      aria-live="polite"
      aria-label={currentPhrase}
      className={`relative inline-flex items-center h-8 md:h-10 overflow-visible select-none ${className}`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.022,
                delayChildren: 0.04,
              },
            },
            exit: {
              opacity: 0,
              transition: {
                staggerChildren: 0.012,
                staggerDirection: -1,
                duration: duration * 0.45,
                ease: CUBIC_EASE,
              },
            },
          }}
          className={`flex flex-wrap items-center gap-x-2 font-mono text-sm md:text-lg font-semibold tracking-wider ${glowClass}`}
        >
          {words.map((word, wIdx) => (
            <span key={`${index}-w-${wIdx}`} className="inline-flex whitespace-nowrap">
              {Array.from(word).map((char, cIdx) => (
                <motion.span
                  key={`${index}-w-${wIdx}-c-${cIdx}`}
                  variants={{
                    hidden: {
                      opacity: 0,
                      y: 14,
                      scale: 0.9,
                    },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        duration: duration * 0.75,
                        ease: CUBIC_EASE,
                      },
                    },
                    exit: {
                      opacity: 0,
                      y: -12,
                      scale: 0.92,
                      transition: {
                        duration: duration * 0.4,
                        ease: CUBIC_EASE,
                      },
                    },
                  }}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              ))}
            </span>
          ))}

          {/* Elegant Blinking Terminal Caret Accent */}
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
            className="w-2.5 h-4 sm:h-5 bg-cyber-blue inline-block ml-1.5 align-middle shadow-[0_0_10px_#00C8FF]"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
