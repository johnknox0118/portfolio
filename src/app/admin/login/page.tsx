"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, User, Loader2, Key } from "lucide-react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Credentials required.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const result = await res.json();
      
      if (result.success) {
        // Redirection to dashboard
        router.push("/admin/dashboard");
      } else {
        setError(result.error || "Authentication failed. Access denied.");
        setLoading(false);
      }
    } catch (err) {
      setError("Grid connection failure. Secure server unreachable.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden flex items-center justify-center p-6">
      {/* Background CRT scanlines */}
      <div className="scanlines"></div>
      <div className="animated-bg"></div>
      
      {/* Glow auroras */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[#00FF9D]/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-[#00C8FF]/5 rounded-full blur-[150px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md glass-card hud-box p-8 space-y-6 relative border-cyber-green/20"
      >
        <div className="flex flex-col items-center justify-center text-center gap-2">
          <div className="p-3 bg-cyber-green/5 border border-cyber-green/30 rounded-xl mb-2 text-cyber-green animate-pulse shadow-[0_0_15px_rgba(0,255,157,0.2)]">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="font-orbitron font-black text-xl text-white tracking-widest uppercase">
            SECURITY MATRIX LOGIN
          </h2>
          <span className="font-mono text-[9px] text-gray-500 uppercase tracking-widest">
            RESTRICTED ACCESS AREA // LEVEL 4 AUTHORIZATION
          </span>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Agent Identifier</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-[#040a12]/80 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-cyber-green focus:shadow-[0_0_10px_rgba(0,255,157,0.1)] transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Cryptographic Key</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                <Key className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter passcode"
                className="w-full bg-[#040a12]/80 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-cyber-green focus:shadow-[0_0_10px_rgba(0,255,157,0.1)] transition-all"
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-lg text-rose-500 font-mono text-[10px] font-bold text-center uppercase tracking-wide"
            >
              [!] SECURITY_ERROR: {error}
            </motion.div>
          )}

          <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" className="accent-cyber-green bg-[#040a12]" />
              REMEMBER_ME
            </label>
            <span className="hover:text-cyber-green cursor-pointer">LOST_CREDENTIALS?</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-cyber flex items-center justify-center gap-2 py-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cyber-green" /> Authenticating...
              </>
            ) : (
              <>
                INITIALIZE CONNECTION <Shield className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
