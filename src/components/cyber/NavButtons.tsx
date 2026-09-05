"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Search, Terminal, Lock, Check } from "lucide-react";

interface CTFAuditButtonProps {
  onClick: () => void;
  unlocked?: boolean;
}

export function CTFAuditButton({ onClick, unlocked = false }: CTFAuditButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setScanComplete(false);
    // Complete scan after beam travels
    setTimeout(() => {
      setScanComplete(true);
    }, 450);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setScanComplete(false);
  };

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -1, scale: 1.02 }}
      whileTap={{ y: 0, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="relative overflow-hidden px-2.5 py-1.5 rounded-lg border border-cyber-blue/40 bg-black/40 text-cyber-blue hover:border-cyber-green/60 hover:text-cyber-green transition-colors flex items-center gap-1.5 text-xs font-mono cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-cyber-blue select-none"
      title="Launch CTF Security Audit Challenge"
    >
      {/* Scanning Highlight Beam on Hover */}
      {isHovered && (
        <motion.span
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-y-0 w-1/2 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(0, 255, 157, 0.4) 50%, rgba(0, 200, 255, 0.25) 75%, transparent 100%)",
          }}
        />
      )}

      {scanComplete && !unlocked ? (
        <Check className="w-3.5 h-3.5 text-cyber-green animate-in fade-in zoom-in duration-200" />
      ) : (
        <ShieldAlert className="w-3.5 h-3.5 text-cyber-blue transition-transform duration-200" />
      )}

      <span className="hidden lg:inline tracking-wider font-semibold">CTF AUDIT</span>

      {unlocked && (
        <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-ping ml-0.5" />
      )}
    </motion.button>
  );
}

interface SearchTriggerProps {
  onClick: () => void;
}

export function SearchTrigger({ onClick }: SearchTriggerProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -1, scale: 1.02 }}
      whileTap={{ y: 0, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`px-2.5 py-1.5 rounded-lg border bg-black/40 text-xs font-mono flex items-center gap-1.5 transition-all outline-none focus-visible:ring-1 focus-visible:ring-cyber-green cursor-pointer select-none ${
        isHovered
          ? "border-cyber-green/50 text-white shadow-[0_0_12px_rgba(0,255,157,0.2)]"
          : "border-white/10 text-gray-400"
      }`}
      title="Search Dossier (Ctrl + K)"
    >
      <motion.span
        animate={isHovered ? { x: 1 } : { x: 0 }}
        transition={{ duration: 0.2 }}
        className="inline-flex"
      >
        <Search className="w-3.5 h-3.5 text-cyber-green" />
      </motion.span>

      <span className="hidden sm:inline-flex items-center">
        <span>Search</span>
        {/* Terminal-style subtle blinking caret */}
        <span className="inline-block w-1.5 h-3 bg-cyber-green/80 ml-0.5 align-middle animate-pulse" />
      </span>

      <kbd className="hidden sm:inline px-1 py-0.5 rounded bg-white/10 text-[9px] text-gray-300 font-mono">
        Ctrl+K
      </kbd>
    </motion.button>
  );
}

interface TerminalTriggerProps {
  onClick: () => void;
}

export function TerminalTrigger({ onClick }: TerminalTriggerProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -1, scale: 1.03 }}
      whileTap={{ y: 0, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`p-1.5 rounded-lg border bg-black/40 transition-all outline-none focus-visible:ring-1 focus-visible:ring-cyber-green cursor-pointer select-none ${
        isHovered
          ? "border-cyber-green/60 text-cyber-green shadow-[0_0_12px_rgba(0,255,157,0.3)]"
          : "border-white/10 text-gray-400"
      }`}
      title="Open Hacker Console (~)"
    >
      <motion.span
        animate={isHovered ? { x: 1 } : { x: 0 }}
        transition={{ duration: 0.2 }}
        className="inline-flex"
      >
        <Terminal className="w-4 h-4 text-cyber-green" />
      </motion.span>
    </motion.button>
  );
}

export function AdminButton() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.a
      href="/admin/login"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -1, scale: 1.02 }}
      whileTap={{ y: 0, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="btn-cyber flex items-center gap-1.5 px-3.5 py-1.5 border-cyber-blue/50 text-cyber-blue text-xs hover:shadow-[0_0_15px_#00C8FF] outline-none focus-visible:ring-1 focus-visible:ring-cyber-blue select-none cursor-pointer"
      title="Admin Terminal Login"
    >
      <motion.span
        animate={isHovered ? { rotate: 15, y: -0.5 } : { rotate: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="inline-flex origin-bottom-left"
      >
        <Lock className="w-3.5 h-3.5" />
      </motion.span>
      <span className="hidden sm:inline font-semibold tracking-wider">ADMIN</span>
    </motion.a>
  );
}
