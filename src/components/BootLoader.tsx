"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Shield, Check, Cpu } from "lucide-react";

const BOOT_STEPS = [
  "INITIALIZING SYSTEM KERNEL v2.0...",
  "CONNECTING SUPABASE POSTGRESQL GRID...",
  "DECRYPTING IDENTITY DOSSIER...",
  "SYNCHRONIZING PROJECT REPOSITORIES...",
  "SCANNING THREAT MATRIX...",
  "INITIALIZING J.A.M.S. AI ASSISTANT...",
  "SYSTEM READY // ACCESS GRANTED",
];

export default function BootLoader() {
  const [visible, setVisible] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check if boot sequence has already run in current browser session
    const hasBooted = sessionStorage.getItem("cyber_boot_done");
    if (hasBooted) {
      setVisible(false);
      return;
    }

    setVisible(true);

    // Step sequence timer
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < BOOT_STEPS.length - 1) {
          return prev + 1;
        }
        clearInterval(stepInterval);
        return prev;
      });
    }, 450);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            sessionStorage.setItem("cyber_boot_done", "true");
            setVisible(false);
          }, 400);
          return 100;
        }
        return prev + 4;
      });
    }, 110);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const skipBoot = () => {
    sessionStorage.setItem("cyber_boot_done", "true");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35, ease: "easeInOut" } }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#040912] p-4 select-none"
          style={{ pointerEvents: visible ? "auto" : "none" }}
        >
          {/* Subtle Cyber Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(0,255,157,0.08),transparent)] pointer-events-none" />
          <div className="absolute inset-0 scanlines pointer-events-none opacity-40" />

          {/* Center Boot Console Box */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg glass-card border-cyber-green/30 p-6 md:p-8 rounded-2xl relative hud-box shadow-[0_0_50px_rgba(0,255,157,0.15)] flex flex-col gap-6"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-cyber-green animate-pulse" />
                <span className="font-orbitron font-black text-xs text-white tracking-widest uppercase">
                  BOOT_SEQUENCE // v2.0
                </span>
              </div>
              <button
                onClick={skipBoot}
                className="text-[10px] font-mono text-gray-400 hover:text-cyber-green transition-colors px-2 py-1 rounded border border-white/10 hover:border-cyber-green/40"
              >
                [ESC] SKIP
              </button>
            </div>

            {/* Glowing Orbit Ring Icon */}
            <div className="flex justify-center py-2 relative">
              <div className="w-16 h-16 rounded-full border border-cyber-green/40 flex items-center justify-center relative shadow-[0_0_20px_rgba(0,255,157,0.2)]">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-t-2 border-cyber-green"
                />
                <Cpu className="w-8 h-8 text-cyber-green" />
              </div>
            </div>

            {/* Terminal Step Logs */}
            <div className="bg-black/60 border border-white/5 rounded-xl p-4 font-mono text-xs space-y-2 h-36 overflow-y-auto leading-relaxed text-gray-300">
              {BOOT_STEPS.slice(0, currentStepIndex + 1).map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {idx < currentStepIndex ? (
                    <Check className="w-3.5 h-3.5 text-cyber-green shrink-0" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-cyber-blue animate-ping shrink-0" />
                  )}
                  <span className={idx === currentStepIndex ? "text-cyber-green font-bold" : "text-gray-400"}>
                    {step}
                  </span>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-[10px] text-gray-400">
                <span>SYSTEM DECRYPTION</span>
                <span className="text-cyber-green font-bold">{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/10 p-0.5">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyber-blue via-cyber-green to-cyber-green rounded-full shadow-[0_0_10px_#00FF9D]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
