"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Shield, Check, Cpu, Radio, Zap, X } from "lucide-react";

interface BootLoaderProps {
  style?: "cyber" | "matrix" | "minimal" | "disabled" | string;
  preview?: boolean;
  onClose?: () => void;
}

const CYBER_STEPS = [
  "INITIALIZING SYSTEM KERNEL v2.0...",
  "CONNECTING SUPABASE POSTGRESQL GRID...",
  "DECRYPTING IDENTITY DOSSIER...",
  "SYNCHRONIZING PROJECT REPOSITORIES...",
  "SCANNING THREAT MATRIX...",
  "INITIALIZING J.A.M.S. AI ASSISTANT...",
  "SYSTEM READY // ACCESS GRANTED",
];

const MATRIX_STEPS = [
  "DECRYPTING NEURAL STREAM [0x8FA4]...",
  "CONNECTING CIPHER NODE MATRIX...",
  "BYPASSING PERIMETER FIREWALLS...",
  "ALLOCATING SECURE BUFFER MEMORY...",
  "RUNNING REAL-TIME THREAT RADAR...",
  "MATRIX SYNCHRONIZATION COMPLETE",
];

export default function BootLoader({
  style = "cyber",
  preview = false,
  onClose,
}: BootLoaderProps) {
  const activeStyle = (style || "cyber").toLowerCase();
  const [visible, setVisible] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [matrixStream, setMatrixStream] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // If disabled and not in preview mode, don't run
  const isDisabled = (activeStyle === "disabled" || activeStyle === "off") && !preview;

  useEffect(() => {
    if (isDisabled) {
      setVisible(false);
      return;
    }

    if (!preview) {
      try {
        const hasBooted = typeof window !== "undefined" && window.sessionStorage?.getItem("cyber_boot_done");
        if (hasBooted) {
          setVisible(false);
          return;
        }
      } catch (e) {
        setVisible(false);
        return;
      }
    }

    setVisible(true);
    setCurrentStepIndex(0);
    setProgress(0);

    const steps = activeStyle === "matrix" ? MATRIX_STEPS : CYBER_STEPS;
    const stepDuration = activeStyle === "minimal" ? 220 : 380;
    const progressIncrement = activeStyle === "minimal" ? 7 : 4;
    const progressIntervalMs = activeStyle === "minimal" ? 60 : 100;

    // Step sequence timer
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        clearInterval(stepInterval);
        return prev;
      });
    }, stepDuration);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            if (!preview) {
              try {
                sessionStorage.setItem("cyber_boot_done", "true");
              } catch (e) {}
            }
            setVisible(false);
            if (onClose) onClose();
          }, 350);
          return 100;
        }
        return Math.min(100, prev + progressIncrement);
      });
    }, progressIntervalMs);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [activeStyle, preview, isDisabled, onClose]);

  // Matrix Rain Background Animation for matrix style
  useEffect(() => {
    if (activeStyle !== "matrix" || !visible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const characters = "01010101XYZABCDEF89#%*&";
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    const drawMatrix = () => {
      ctx.fillStyle = "rgba(4, 9, 18, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#00FF9D";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(drawMatrix, 40);
    return () => clearInterval(interval);
  }, [activeStyle, visible]);

  const handleDismiss = () => {
    if (!preview) {
      try {
        sessionStorage.setItem("cyber_boot_done", "true");
      } catch (e) {}
    }
    setVisible(false);
    if (onClose) onClose();
  };

  if (isDisabled) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35, ease: "easeInOut" } }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#040912] p-4 select-none"
          style={{ pointerEvents: visible ? "auto" : "none" }}
        >
          {/* Subtle Cyber Background */}
          {activeStyle === "matrix" ? (
            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-40" />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(0,255,157,0.08),transparent)] pointer-events-none" />
          )}
          <div className="absolute inset-0 scanlines pointer-events-none opacity-40" />

          {/* PREVIEW BANNER (IF IN PREVIEW MODE) */}
          {preview && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-cyber-green/15 border border-cyber-green/60 text-cyber-green px-4 py-1.5 rounded-full font-mono text-xs shadow-[0_0_20px_rgba(0,255,157,0.3)]">
              <span className="w-2 h-2 rounded-full bg-cyber-green animate-ping" />
              <span>PREVIEW MODE // STYLE: {activeStyle.toUpperCase()}</span>
              <button
                onClick={handleDismiss}
                className="ml-2 px-2 py-0.5 rounded bg-cyber-green/20 hover:bg-cyber-green/40 text-white cursor-pointer transition-all"
              >
                CLOSE [X]
              </button>
            </div>
          )}

          {/* ================= STYLE 1: CYBER DIAGNOSTICS (DEFAULT) ================= */}
          {(activeStyle === "cyber" || activeStyle === "default") && (
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
                    BOOT_SEQUENCE // KERNEL DIAGNOSTICS
                  </span>
                </div>
                <button
                  onClick={handleDismiss}
                  className="text-[10px] font-mono text-gray-400 hover:text-cyber-green transition-colors px-2 py-1 rounded border border-white/10 hover:border-cyber-green/40 cursor-pointer"
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
                {CYBER_STEPS.slice(0, currentStepIndex + 1).map((step, idx) => (
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
          )}

          {/* ================= STYLE 2: MATRIX CODE STREAM ================= */}
          {activeStyle === "matrix" && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-lg glass-card border-cyber-green/40 p-6 md:p-8 rounded-2xl relative hud-box shadow-[0_0_60px_rgba(0,255,157,0.25)] flex flex-col gap-5 bg-black/80"
            >
              <div className="flex items-center justify-between border-b border-cyber-green/30 pb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-cyber-green animate-bounce" />
                  <span className="font-orbitron font-black text-xs text-cyber-green tracking-widest uppercase">
                    NEURAL_MATRIX // DATA STREAM
                  </span>
                </div>
                <button
                  onClick={handleDismiss}
                  className="text-[10px] font-mono text-gray-400 hover:text-cyber-green transition-colors px-2 py-1 rounded border border-cyber-green/30 cursor-pointer"
                >
                  [ESC] SKIP
                </button>
              </div>

              {/* Matrix Hex Radar Center */}
              <div className="flex flex-col items-center justify-center py-3">
                <div className="font-mono text-2xl font-black text-cyber-green tracking-widest animate-pulse flex items-center gap-2">
                  <Radio className="w-6 h-6 animate-spin" />
                  <span>DECRYPTING BUFFER</span>
                </div>
                <span className="font-mono text-[11px] text-gray-400 mt-1">
                  CIPHER KEY: SHA256 // {progress > 80 ? "SUCCESS" : "RESOLVING..."}
                </span>
              </div>

              {/* Stream Logs */}
              <div className="bg-black/90 border border-cyber-green/30 rounded-xl p-3 font-mono text-xs space-y-1.5 h-32 overflow-hidden text-cyber-green/90">
                {MATRIX_STEPS.slice(0, currentStepIndex + 1).map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500">[{String(idx + 1).padStart(2, "0")}]</span>
                    <span className={idx === currentStepIndex ? "text-white font-bold animate-pulse" : "text-cyber-green/70"}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>

              {/* Matrix Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-[10px] text-cyber-green">
                  <span>BUFFER LOADED</span>
                  <span className="font-bold">{progress}%</span>
                </div>
                <div className="h-2 w-full bg-black rounded-full overflow-hidden border border-cyber-green/50 p-0.5">
                  <motion.div
                    className="h-full bg-cyber-green rounded-full shadow-[0_0_15px_#00FF9D]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= STYLE 3: MINIMAL BIOMETRIC SCANNER ================= */}
          {activeStyle === "minimal" && (
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-sm glass-card border-cyber-blue/40 p-6 rounded-2xl relative shadow-[0_0_40px_rgba(0,200,255,0.2)] flex flex-col items-center gap-4 bg-black/75 text-center"
            >
              <div className="relative w-20 h-20 flex items-center justify-center my-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyber-blue border-r-cyber-cyan"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-2 rounded-full border border-dashed border-cyber-green/60"
                />
                <Shield className="w-8 h-8 text-cyber-blue animate-pulse" />
              </div>

              <div>
                <h4 className="font-orbitron font-black text-sm text-white tracking-widest uppercase">
                  BIOMETRIC AUTHENTICATION
                </h4>
                <p className="font-mono text-[11px] text-gray-400 mt-1">
                  {progress < 100 ? "VERIFYING SECURITY CREDENTIALS..." : "CLEARANCE GRANTED // ENTRY PERMITTED"}
                </p>
              </div>

              <div className="w-full space-y-1">
                <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/10">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyber-blue to-cyber-green rounded-full shadow-[0_0_10px_#00C8FF]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between font-mono text-[9px] text-gray-500 pt-1">
                  <span>LEVEL 4 AUTHORIZATION</span>
                  <span className="text-cyber-blue font-bold">{progress}%</span>
                </div>
              </div>

              <button
                onClick={handleDismiss}
                className="text-[10px] font-mono text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                SKIP [ESC]
              </button>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
