"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Portfolio application error caught:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#040912] text-white p-6 text-center font-mono">
      <div className="w-16 h-16 border-2 border-rose-500/80 rounded-full flex items-center justify-center mb-6 text-rose-500 font-bold text-xl shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-pulse">
        <AlertTriangle className="w-8 h-8 text-rose-500" />
      </div>

      <h1 className="font-orbitron font-black text-xl md:text-2xl text-white mb-2 uppercase tracking-wider">
        SYSTEM PERIMETER RECOVERY
      </h1>

      <p className="text-xs text-gray-400 max-w-md leading-relaxed mb-6">
        An unexpected runtime anomaly was intercepted by the perimeter defense subsystem. The environment has been isolated to protect session stability.
      </p>

      <div className="text-[11px] text-gray-400 bg-black/60 px-4 py-2.5 rounded-xl border border-white/10 mb-6 max-w-md break-all font-mono">
        <span className="text-rose-400 font-bold">STATUS:</span> RUNTIME_RECOVERABLE // {error.message || "UNEXPECTED_CLIENT_EXCEPTION"}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="btn-cyber flex items-center gap-2 px-5 py-2.5 text-xs text-black bg-cyber-green border-cyber-green font-bold shadow-[0_0_15px_rgba(0,255,157,0.3)] hover:scale-105 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>REBOOT SUBSYSTEM</span>
        </button>

        <a
          href="/"
          className="btn-cyber flex items-center gap-2 px-5 py-2.5 text-xs font-mono text-gray-300 hover:text-white border-white/20 hover:border-white/50 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>RETURN HOME</span>
        </a>
      </div>
    </div>
  );
}
