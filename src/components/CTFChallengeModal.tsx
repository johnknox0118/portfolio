"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, ShieldCheck, Terminal, CheckCircle2, ArrowRight, X, AlertTriangle, Key, Lock } from "lucide-react";

interface CTFChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessBadge: () => void;
}

export default function CTFChallengeModal({ isOpen, onClose, onSuccessBadge }: CTFChallengeModalProps) {
  const [stage, setStage] = useState(1);
  const [stage1Input, setStage1Input] = useState("");
  const [stage2Choice, setStage2Choice] = useState("");
  const [stage3Choice, setStage3Choice] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [completed, setCompleted] = useState(false);

  if (!isOpen) return null;

  // Stage 1 Verification: Base64 decode "a2FsbGUtY3liZXItc2Vj" -> "kalle-cyber-sec"
  const handleStage1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (stage1Input.trim().toLowerCase() === "kalle-cyber-sec") {
      setStage(2);
    } else {
      setErrorMsg("Incorrect decoded payload. Hint: Use Base64 decoding or type 'kalle-cyber-sec'.");
    }
  };

  // Stage 2 Verification: Spot security flaw in {"alg": "none", "typ": "JWT"}
  const handleStage2 = (choice: string) => {
    setErrorMsg("");
    setStage2Choice(choice);
    if (choice === "none") {
      setStage(3);
    } else {
      setErrorMsg("Incorrect flaw identified. Hint: Using 'alg': 'none' disables cryptographic signature verification!");
    }
  };

  // Stage 3 Verification: Patch SQL Injection SELECT * FROM users WHERE id = '...'
  const handleStage3 = (choice: string) => {
    setErrorMsg("");
    setStage3Choice(choice);
    if (choice === "parametrized") {
      setCompleted(true);
      onSuccessBadge();
    } else {
      setErrorMsg("Incorrect fix. Parametrized prepared statements ($1) isolate query logic from data inputs.");
    }
  };

  const resetCTF = () => {
    setStage(1);
    setStage1Input("");
    setStage2Choice("");
    setStage3Choice("");
    setErrorMsg("");
    setCompleted(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-xl glass-card border-cyber-green/40 bg-[#07111F]/95 rounded-2xl p-6 shadow-[0_0_60px_rgba(0,255,157,0.25)] hud-box flex flex-col gap-5 relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-cyber-green" />
              <span className="font-orbitron font-black text-xs text-white tracking-widest uppercase">
                RECRUITER_CTF // SECURITY AUDIT CHALLENGE
              </span>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Indicator Bar */}
          <div className="space-y-1 font-mono text-[10px]">
            <div className="flex justify-between text-gray-400">
              <span>CHALLENGE PROGRESS</span>
              <span className="text-cyber-green font-bold">
                {completed ? "COMPLETE (100%)" : `STAGE ${stage} OF 3`}
              </span>
            </div>
            <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-cyber-green to-cyber-blue transition-all duration-500"
                style={{ width: completed ? "100%" : `${(stage / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Error Message Notice */}
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/40 rounded-xl text-rose-400 text-xs font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STAGE 1: Base64 Decoding */}
          {!completed && stage === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="cyber-tag border-cyber-green/30 text-cyber-green text-[9px]">STAGE 1 // ENCODING</span>
                <h3 className="font-orbitron font-bold text-sm text-white">Decode Auth Token Payload</h3>
                <p className="text-xs font-mono text-gray-400">
                  Inspect the following Base64 token and enter the decoded ASCII string below:
                </p>
              </div>

              <div className="p-3 bg-black/60 border border-cyber-green/30 rounded-xl font-mono text-xs text-cyber-green text-center font-bold tracking-wider">
                a2FsbGUtY3liZXItc2Vj
              </div>

              <form onSubmit={handleStage1} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Enter decoded string (e.g. kalle-...)"
                  value={stage1Input}
                  onChange={(e) => setStage1Input(e.target.value)}
                  className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyber-green"
                />
                <button type="submit" className="btn-cyber flex items-center gap-2 w-full justify-center text-xs">
                  VERIFY STAGE 1 <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* STAGE 2: JWT Security Audit */}
          {!completed && stage === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="cyber-tag border-cyber-blue/30 text-cyber-blue text-[9px]">STAGE 2 // JWT AUDIT</span>
                <h3 className="font-orbitron font-bold text-sm text-white">Identify Token Vulnerability</h3>
                <p className="text-xs font-mono text-gray-400">
                  Select the critical security flaw in this JSON Web Token header:
                </p>
              </div>

              <pre className="p-3 bg-black/60 border border-white/10 rounded-xl font-mono text-[11px] text-gray-300">
{`{
  "alg": "none",
  "typ": "JWT"
}`}
              </pre>

              <div className="space-y-2 font-mono text-xs">
                <button
                  onClick={() => handleStage2("typ")}
                  className="w-full text-left p-3 glass-card hover:border-white/30 text-gray-300 rounded-xl border border-white/10"
                >
                  A) The "typ" header parameter is missing bearer scope.
                </button>
                <button
                  onClick={() => handleStage2("none")}
                  className="w-full text-left p-3 glass-card hover:border-cyber-green text-white rounded-xl border border-white/10"
                >
                  B) CRITICAL: "alg": "none" disables signature verification, allowing token forgery.
                </button>
                <button
                  onClick={() => handleStage2("format")}
                  className="w-full text-left p-3 glass-card hover:border-white/30 text-gray-300 rounded-xl border border-white/10"
                >
                  C) JSON key indentation is missing tab stops.
                </button>
              </div>
            </div>
          )}

          {/* STAGE 3: SQL Injection Remediation */}
          {!completed && stage === 3 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="cyber-tag border-cyber-cyan/30 text-cyber-cyan text-[9px]">STAGE 3 // SECURE CODING</span>
                <h3 className="font-orbitron font-bold text-sm text-white">Patch Database Injection Query</h3>
                <p className="text-xs font-mono text-gray-400">
                  Select the secure implementation to patch string concatenation vulnerability:
                </p>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <button
                  onClick={() => handleStage3("sanitize")}
                  className="w-full text-left p-3 glass-card hover:border-white/30 text-gray-300 rounded-xl border border-white/10"
                >
                  A) Strip quote characters using regex replace.
                </button>
                <button
                  onClick={() => handleStage3("parametrized")}
                  className="w-full text-left p-3 glass-card hover:border-cyber-green text-white rounded-xl border border-white/10"
                >
                  B) SECURE: Use Parametrized Prepared Statements (e.g. Prisma ORM / $1 parameters).
                </button>
                <button
                  onClick={() => handleStage3("eval")}
                  className="w-full text-left p-3 glass-card hover:border-white/30 text-gray-300 rounded-xl border border-white/10"
                >
                  C) Wrap query string inside eval().
                </button>
              </div>
            </div>
          )}

          {/* COMPLETION SCREEN */}
          {completed && (
            <div className="space-y-5 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-cyber-green/20 border-2 border-cyber-green flex items-center justify-center mx-auto text-cyber-green shadow-[0_0_30px_rgba(0,255,157,0.4)]">
                <CheckCircle2 className="w-8 h-8 animate-bounce" />
              </div>

              <div className="space-y-1">
                <span className="cyber-tag border-cyber-green text-cyber-green font-bold text-[10px]">
                  INTERNAL SECURITY VERIFIED
                </span>
                <h3 className="font-orbitron font-black text-xl text-white">Audit Passed Successfully!</h3>
                <p className="text-xs font-mono text-gray-300 max-w-md mx-auto leading-relaxed">
                  You have verified foundational cybersecurity principles (Base64 Decoding, JWT Signature Inspection, and Parametrized Query Defense).
                </p>
              </div>

              <div className="p-3 bg-black/40 border border-white/10 rounded-xl text-[10px] font-mono text-gray-400">
                * Note: This badge is an internal portfolio achievement metric and does not represent an official third-party certification.
              </div>

              <div className="flex gap-3 justify-center">
                <button onClick={resetCTF} className="btn-cyber px-4 py-2 text-xs border-white/20 text-gray-300">
                  RETRY AUDIT
                </button>
                <button onClick={onClose} className="btn-cyber px-4 py-2 text-xs text-cyber-green">
                  CLOSE & JUMP TO PORTFOLIO
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
