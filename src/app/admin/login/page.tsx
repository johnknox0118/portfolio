"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, User, Loader2, Key, Eye, EyeOff, Mail,
  ShieldAlert, Check, X, AlertTriangle, Lock, RefreshCw
} from "lucide-react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lockoutSeconds, setLockoutSeconds] = useState<number | null>(null);

  // Lost Credentials Modal State
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryKey, setRecoveryKey] = useState("");
  const [showRecoveryKey, setShowRecoveryKey] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState("");
  const [recoverySuccess, setRecoverySuccess] = useState("");

  const router = useRouter();

  // Load remembered credentials on mount
  useEffect(() => {
    try {
      const savedAgent = localStorage.getItem("cyber_agent_identifier");
      const wasRemembered = localStorage.getItem("cyber_remember_me") === "true";
      if (wasRemembered && savedAgent) {
        setUsername(savedAgent);
        setRememberMe(true);
      }
    } catch (e) {
      // Storage restriction fallback
    }
  }, []);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds === null || lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setError("");
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  // Main login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds && lockoutSeconds > 0) {
      return;
    }

    if (!username.trim() || !password) {
      setError("Agent Identifier and Cryptographic Key are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
          rememberMe,
        }),
      });

      const result = await res.json().catch(() => ({}));

      if (res.ok && result.success) {
        // Persist or clear remember-me preference
        try {
          if (rememberMe) {
            localStorage.setItem("cyber_agent_identifier", username.trim());
            localStorage.setItem("cyber_remember_me", "true");
          } else {
            localStorage.removeItem("cyber_agent_identifier");
            localStorage.removeItem("cyber_remember_me");
          }
        } catch (storageErr) {}

        // Redirection to authenticated dashboard
        router.push("/admin/dashboard");
      } else {
        if (result.locked && result.retryAfter) {
          setLockoutSeconds(result.retryAfter);
        }
        setError(result.error || "Authentication failed. Access denied.");
        setLoading(false);
      }
    } catch (err) {
      setError("Grid transmission failure: Secure authentication server unreachable.");
      setLoading(false);
    }
  };

  // Lost credentials recovery submission
  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError("");
    setRecoverySuccess("");

    if (!recoveryEmail.trim() || !recoveryKey.trim() || !newPassword) {
      setRecoveryError("All verification parameters are required.");
      return;
    }

    if (newPassword.length < 6) {
      setRecoveryError("Passcode must be at least 6 characters in length.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setRecoveryError("Passcodes do not match. Verify entry.");
      return;
    }

    setRecoveryLoading(true);

    try {
      const res = await fetch("/api/auth/lost-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: recoveryEmail.trim(),
          recoveryKey: recoveryKey.trim(),
          newPassword,
        }),
      });

      const result = await res.json().catch(() => ({}));

      if (res.ok && result.success) {
        setRecoverySuccess("CREDENTIALS RESTORED: Master cryptographic key has been reset successfully.");
        if (result.username) {
          setUsername(result.username);
        }
        setPassword(newPassword);

        // Auto close after 2 seconds
        setTimeout(() => {
          setShowRecoveryModal(false);
          setRecoverySuccess("");
          setRecoveryEmail("");
          setRecoveryKey("");
          setNewPassword("");
          setConfirmPassword("");
        }, 1800);
      } else {
        setRecoveryError(result.error || "Verification failed: Master recovery authorization rejected.");
      }
    } catch (err) {
      setRecoveryError("Network failure connecting to emergency identity verification grid.");
    } finally {
      setRecoveryLoading(false);
    }
  };

  // Compute password strength rating
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: "EMPTY", color: "bg-gray-700", text: "text-gray-500", pct: 0 };
    let score = 0;
    if (pwd.length >= 6) score += 25;
    if (pwd.length >= 10) score += 25;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 25;
    if (/[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score += 25;

    if (score <= 25) return { label: "WEAK", color: "bg-rose-500", text: "text-rose-400", pct: 25 };
    if (score <= 50) return { label: "MODERATE", color: "bg-amber-500", text: "text-amber-400", pct: 50 };
    if (score <= 75) return { label: "STRONG", color: "bg-cyber-blue", text: "text-cyber-blue", pct: 75 };
    return { label: "MIL-SPEC", color: "bg-cyber-green", text: "text-cyber-green", pct: 100 };
  };

  const strength = getPasswordStrength(newPassword);

  return (
    <div className="min-h-screen relative overflow-x-hidden flex items-center justify-center p-4 sm:p-6">
      {/* Background CRT scanlines */}
      <div className="scanlines pointer-events-none" />
      <div className="animated-bg pointer-events-none" />

      {/* Cyber Auroras */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[#00FF9D]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-[#00C8FF]/5 rounded-full blur-[150px] pointer-events-none" />

      {/* LOGIN CARD */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-card hud-box p-6 sm:p-8 space-y-6 relative border-cyber-green/20 shadow-[0_0_50px_rgba(0,255,157,0.08)]"
      >
        <div className="flex flex-col items-center justify-center text-center gap-2">
          <div className="p-3 bg-cyber-green/10 border border-cyber-green/30 rounded-xl mb-1 text-cyber-green shadow-[0_0_20px_rgba(0,255,157,0.25)]">
            <Shield className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="font-orbitron font-black text-xl sm:text-2xl text-white tracking-widest uppercase">
            SECURITY MATRIX LOGIN
          </h2>
          <span className="font-mono text-[9px] text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-ping" />
            RESTRICTED ACCESS AREA // LEVEL 4 AUTHORIZATION
          </span>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-5">
          {/* USERNAME */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block font-semibold">
              Agent Identifier
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                disabled={loading || (lockoutSeconds !== null && lockoutSeconds > 0)}
                className="w-full bg-[#040a12]/85 border border-white/15 rounded-lg pl-10 pr-4 py-3 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-cyber-green focus:shadow-[0_0_12px_rgba(0,255,157,0.2)] transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block font-semibold">
                Cryptographic Key
              </label>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                <Key className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter passcode"
                autoComplete="current-password"
                disabled={loading || (lockoutSeconds !== null && lockoutSeconds > 0)}
                className="w-full bg-[#040a12]/85 border border-white/15 rounded-lg pl-10 pr-10 py-3 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-cyber-green focus:shadow-[0_0_12px_rgba(0,255,157,0.2)] transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyber-green transition-colors cursor-pointer"
                title={showPassword ? "Hide passcode" : "Reveal passcode"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* ERROR / LOCKOUT BANNER */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-3 rounded-lg border font-mono text-[10px] font-bold leading-relaxed ${
                lockoutSeconds && lockoutSeconds > 0
                  ? "bg-rose-950/40 border-rose-500 text-rose-400"
                  : "bg-rose-950/20 border-rose-500/40 text-rose-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
              {lockoutSeconds && lockoutSeconds > 0 && (
                <div className="mt-1.5 flex items-center justify-between text-[9px] text-rose-300/80 pt-1 border-t border-rose-500/20">
                  <span>DEFENSE MATRIX ACTIVE</span>
                  <span className="font-orbitron font-bold">UNLOCK IN: {lockoutSeconds}s</span>
                </div>
              )}
            </motion.div>
          )}

          {/* REMEMBER ME & LOST CREDENTIALS CONTROLS */}
          <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 select-none pt-1">
            <label className="flex items-center gap-2 cursor-pointer group hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 accent-cyber-green bg-[#040a12] border border-white/20 rounded cursor-pointer transition-all"
              />
              <span className={rememberMe ? "text-cyber-green font-bold" : "group-hover:text-cyber-green"}>
                REMEMBER_ME {rememberMe && "(30D)"}
              </span>
            </label>

            <button
              type="button"
              onClick={() => setShowRecoveryModal(true)}
              className="text-gray-400 hover:text-cyber-green transition-colors cursor-pointer flex items-center gap-1 font-semibold hover:underline"
            >
              <Key className="w-3 h-3 text-cyber-green" />
              LOST_CREDENTIALS?
            </button>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading || (lockoutSeconds !== null && lockoutSeconds > 0)}
            className="w-full btn-cyber flex items-center justify-center gap-2 py-3.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,255,157,0.2)]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cyber-green" />
                <span>AUTHENTICATING AGENT...</span>
              </>
            ) : lockoutSeconds && lockoutSeconds > 0 ? (
              <>
                <Lock className="w-4 h-4 text-rose-400" />
                <span>LOCKED ({lockoutSeconds}s)</span>
              </>
            ) : (
              <>
                <span>INITIALIZE CONNECTION</span>
                <Shield className="w-4 h-4 text-cyber-green" />
              </>
            )}
          </button>
        </form>

        {/* SECURITY POSTURE STATUS HUD */}
        <div className="pt-4 border-t border-white/5 grid grid-cols-3 gap-1.5 text-center font-mono text-[8px] text-gray-500">
          <div className="bg-black/30 p-1.5 rounded border border-white/5">
            <span className="text-cyber-green font-bold block">TLS 1.3</span>
            <span>ENCRYPTED</span>
          </div>
          <div className="bg-black/30 p-1.5 rounded border border-white/5">
            <span className="text-cyber-blue font-bold block">RATE-SHIELD</span>
            <span>5-ATTEMPT CAP</span>
          </div>
          <div className="bg-black/30 p-1.5 rounded border border-white/5">
            <span className="text-cyber-green font-bold block">BCRYPT-HASH</span>
            <span>CONSTANT-TIME</span>
          </div>
        </div>
      </motion.div>

      {/* ================= EMERGENCY LOST CREDENTIALS RECOVERY MODAL ================= */}
      <AnimatePresence>
        {showRecoveryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg glass-card hud-box p-6 sm:p-8 space-y-6 relative border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.2)]"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                    <ShieldAlert className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-orbitron font-black text-base text-white tracking-wider uppercase">
                      EMERGENCY_RECOVERY // PROTOCOL
                    </h3>
                    <p className="font-mono text-[10px] text-gray-400 mt-0.5">
                      Identity authentication & master key password reset
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRecoveryModal(false)}
                  className="p-1 rounded text-gray-500 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status alerts */}
              {recoveryError && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/50 text-rose-300 font-mono text-[10px] font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{recoveryError}</span>
                </div>
              )}

              {recoverySuccess && (
                <div className="p-3 rounded-lg bg-cyber-green/15 border border-cyber-green/50 text-cyber-green font-mono text-[10px] font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,157,0.2)]">
                  <Check className="w-4 h-4 text-cyber-green shrink-0" />
                  <span>{recoverySuccess}</span>
                </div>
              )}

              {/* Recovery Form */}
              <form onSubmit={handleRecoverySubmit} className="space-y-4">
                {/* Master Email */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block font-semibold">
                    Master Administrative Email
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      placeholder="e.g. johnknox.kalle@gmail.com"
                      className="w-full bg-[#040a12] border border-white/15 rounded-lg pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-amber-400 transition-colors"
                      required
                    />
                  </div>
                  <span className="text-[9px] font-mono text-gray-500 block">
                    Must match registered contact email associated with the admin identity.
                  </span>
                </div>

                {/* Emergency Recovery Key */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block font-semibold">
                    Emergency Master Recovery Key
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                      <ShieldAlert className="w-4 h-4" />
                    </span>
                    <input
                      type={showRecoveryKey ? "text" : "password"}
                      value={recoveryKey}
                      onChange={(e) => setRecoveryKey(e.target.value)}
                      placeholder="Enter master recovery passkey"
                      className="w-full bg-[#040a12] border border-white/15 rounded-lg pl-10 pr-10 py-2.5 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-amber-400 transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRecoveryKey(!showRecoveryKey)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors cursor-pointer"
                      tabIndex={-1}
                    >
                      {showRecoveryKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[9px] font-mono text-gray-500 block">
                    Security Key set in environment configuration (Default: CYBER-SEC-RECOVERY-2026-GRID).
                  </span>
                </div>

                {/* New Password & Confirmation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block font-semibold">
                      New Passcode
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <Key className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 6 chars"
                        className="w-full bg-[#040a12] border border-white/15 rounded-lg pl-9 pr-9 py-2.5 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-cyber-green transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors cursor-pointer"
                        tabIndex={-1}
                      >
                        {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block font-semibold">
                      Confirm Passcode
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter passcode"
                        className="w-full bg-[#040a12] border border-white/15 rounded-lg pl-9 pr-4 py-2.5 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-cyber-green transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[9px] font-mono text-gray-400">
                      <span>CRYPTOGRAPHIC COMPLEXITY:</span>
                      <span className={`font-bold ${strength.text}`}>{strength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/5">
                      <div
                        className={`h-full ${strength.color} transition-all duration-300`}
                        style={{ width: `${strength.pct}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Modal Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowRecoveryModal(false)}
                    className="px-4 py-2 rounded-lg border border-white/15 text-xs font-mono text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={recoveryLoading}
                    className="px-5 py-2 rounded-lg bg-amber-500/20 border border-amber-500/60 hover:bg-amber-500/30 text-amber-300 font-mono text-xs font-bold flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all disabled:opacity-50"
                  >
                    {recoveryLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
                        <span>VERIFYING CIPHERS...</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                        <span>OVERRIDE & RESET PASSCODE</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
