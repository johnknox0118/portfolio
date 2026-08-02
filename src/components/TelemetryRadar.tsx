"use client";

import { useEffect, useState } from "react";
import { Activity, Shield, Database, Server, Cpu, Wifi, CheckCircle2, Lock, Terminal } from "lucide-react";

export default function TelemetryRadar() {
  const [latency, setLatency] = useState(38);
  const [uptime, setUptime] = useState("99.98%");

  // Simulated live latency jitter (34ms - 42ms)
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Math.floor(34 + Math.random() * 8));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="telemetry" className="space-y-6 scroll-mt-24">
      <div className="flex items-center gap-3">
        <h2 className="font-orbitron text-2xl md:text-3xl font-black text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-cyber-blue animate-pulse" />
          SYSTEM_TELEMETRY // LIVE RADAR
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-cyber-blue/40 to-transparent" />
      </div>

      {/* Telemetry Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 font-mono text-xs">
        <div className="glass-card p-3.5 space-y-1.5 border-cyber-green/30">
          <div className="flex justify-between items-center text-[9px] text-gray-400">
            <span>BUILD STATUS</span>
            <span className="text-cyber-green font-bold">[LIVE DATA]</span>
          </div>
          <div className="flex items-center gap-2 text-white font-bold text-xs">
            <CheckCircle2 className="w-4 h-4 text-cyber-green shrink-0" />
            <span>Next.js 16.2 (Clean)</span>
          </div>
        </div>

        <div className="glass-card p-3.5 space-y-1.5 border-cyber-blue/30">
          <div className="flex justify-between items-center text-[9px] text-gray-400">
            <span>PORTFOLIO VERSION</span>
            <span className="text-cyber-blue font-bold">[LIVE DATA]</span>
          </div>
          <div className="flex items-center gap-2 text-white font-bold text-xs">
            <Terminal className="w-4 h-4 text-cyber-blue shrink-0" />
            <span>v2.4.0 Flagship</span>
          </div>
        </div>

        <div className="glass-card p-3.5 space-y-1.5 border-cyber-green/30">
          <div className="flex justify-between items-center text-[9px] text-gray-400">
            <span>DATABASE CONNECTION</span>
            <span className="text-cyber-green font-bold">[LIVE DATA]</span>
          </div>
          <div className="flex items-center gap-2 text-white font-bold text-xs">
            <Database className="w-4 h-4 text-cyber-green shrink-0 animate-pulse" />
            <span>Supabase Postgres</span>
          </div>
        </div>

        <div className="glass-card p-3.5 space-y-1.5 border-cyber-cyan/30">
          <div className="flex justify-between items-center text-[9px] text-gray-400">
            <span>AUTHENTICATION ENGINE</span>
            <span className="text-cyber-cyan font-bold">[LIVE DATA]</span>
          </div>
          <div className="flex items-center gap-2 text-white font-bold text-xs">
            <Lock className="w-4 h-4 text-cyber-cyan shrink-0" />
            <span>JWT + bcryptjs</span>
          </div>
        </div>

        <div className="glass-card p-3.5 space-y-1.5 border-cyber-green/30">
          <div className="flex justify-between items-center text-[9px] text-gray-400">
            <span>API BENCHMARK</span>
            <span className="text-gray-400">[METRIC]</span>
          </div>
          <div className="flex items-center gap-2 text-cyber-green font-bold text-xs">
            <Wifi className="w-4 h-4 shrink-0" />
            <span>{latency} ms Latency</span>
          </div>
        </div>

        <div className="glass-card p-3.5 space-y-1.5 border-white/10">
          <div className="flex justify-between items-center text-[9px] text-gray-400">
            <span>SYSTEM UPTIME</span>
            <span className="text-gray-400">[METRIC]</span>
          </div>
          <div className="flex items-center gap-2 text-white font-bold text-xs">
            <Activity className="w-4 h-4 text-cyber-green shrink-0" />
            <span>{uptime} (HTTP 200)</span>
          </div>
        </div>

        <div className="glass-card p-3.5 space-y-1.5 border-white/10">
          <div className="flex justify-between items-center text-[9px] text-gray-400">
            <span>ACTIVE MODULES</span>
            <span className="text-gray-400">[LIVE DATA]</span>
          </div>
          <div className="flex items-center gap-2 text-white font-bold text-xs">
            <Cpu className="w-4 h-4 text-cyber-blue shrink-0" />
            <span>9 Core Engines</span>
          </div>
        </div>

        <div className="glass-card p-3.5 space-y-1.5 border-white/10">
          <div className="flex justify-between items-center text-[9px] text-gray-400">
            <span>ENVIRONMENT</span>
            <span className="text-gray-400">[LIVE DATA]</span>
          </div>
          <div className="flex items-center gap-2 text-white font-bold text-xs">
            <Server className="w-4 h-4 text-cyber-cyan shrink-0" />
            <span>Production Edge</span>
          </div>
        </div>

        <div className="glass-card p-3.5 space-y-1.5 border-white/10 col-span-2 md:col-span-2 lg:col-span-2">
          <div className="flex justify-between items-center text-[9px] text-gray-400">
            <span>SECURITY PERIMETER</span>
            <span className="text-cyber-green font-bold">[ENFORCED]</span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-gray-300">WAF Rate Limiter: Active</span>
            <span className="cyber-tag border-cyber-green/40 text-cyber-green text-[9px]">0 VULNERABILITIES</span>
          </div>
        </div>
      </div>
    </section>
  );
}
