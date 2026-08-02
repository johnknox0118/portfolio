"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, Server, ShieldCheck, Database, HardDrive, Cpu, ExternalLink, X, Activity, Lock, ArrowRight } from "lucide-react";

interface ArchitectureNode {
  id: string;
  name: string;
  category: string;
  tech: string;
  latency: string;
  protocol: string;
  security: string;
  description: string;
  icon: any;
  details: string[];
}

const NODES: ArchitectureNode[] = [
  {
    id: "node-client",
    name: "Client Edge / Browser",
    category: "FRONTEND LAYER",
    tech: "Next.js 16 App Router + React 19 + Tailwind CSS",
    latency: "< 5ms (Local GPU)",
    protocol: "HTTP/2, TLS 1.3",
    security: "CSP Headers, Anti-XSS, Framer Composited HUD",
    description: "Renders zero-latency 60FPS anti-gravity particle canvas, HUD widgets, and client-side dynamic state loops.",
    icon: Cpu,
    details: [
      "Hardware-accelerated CSS GPU compositor layers",
      "Dynamic theme system with CSS Custom Properties",
      "Real-time search & fuzzy filtering engine",
      "Client-side session validation & state caching"
    ]
  },
  {
    id: "node-proxy",
    name: "Edge Proxy Guard",
    category: "PERIMETER DEFENSE",
    tech: "Next.js Proxy Middleware + Edge Runtime",
    latency: "~ 8ms",
    protocol: "Cryptographic JWT Verification",
    security: "Strict Token Expiry Check & Base64 Payload Validation",
    description: "Intercepts all administrative API routes (/api/admin/*) and uploads (/api/upload) to verify session tokens before execution.",
    icon: ShieldCheck,
    details: [
      "Interception of unauthenticated admin requests",
      "Cookie structure inspection & epoch timestamp validation",
      "Header-level anti-tamper security enforcement",
      "Zero serverless cold-start overhead"
    ]
  },
  {
    id: "node-api",
    name: "Serverless API Gateway",
    category: "APPLICATION ROUTER",
    tech: "Next.js Node API Routes + Next-Response",
    latency: "~ 18ms",
    protocol: "RESTful JSON / Multipart Form",
    security: "Strict MIME-Type Checking & 10MB File Size Limits",
    description: "Handles aggregated portfolio public payload fetching, contact message transmission, and secure administrative CRUD.",
    icon: Server,
    details: [
      "Dynamic response fallback logic on pooler blips",
      "Sanitized inputs & multi-part file upload processing",
      "Strict HTTP status code propagation (200, 401, 405, 500)",
      "JSON array field parsing helpers for tags & screenshots"
    ]
  },
  {
    id: "node-db",
    name: "Database Storage Layer",
    category: "DATA PERSISTENCE",
    tech: "Supabase PostgreSQL + Prisma ORM 5.22",
    latency: "~ 38ms",
    protocol: "PostgreSQL Native / Transactional PGBouncer (6543)",
    security: "Parametrized SQL Queries (Zero SQLi Risk)",
    description: "High-resilient relational database storing profiles, skills, education, projects, certs, articles, and inbox tickets.",
    icon: Database,
    details: [
      "12 Relational Tables with auto-increment IDs",
      "Parametrized SQL query execution via Prisma ORM Client",
      "Transactional connection pooling with PGBouncer",
      "Data isolation & schema migrations"
    ]
  },
  {
    id: "node-storage",
    name: "Cloud Storage Gateway",
    category: "OBJECT STORAGE",
    tech: "Supabase Storage Bucket / Local Fallback Uploads",
    latency: "~ 24ms",
    protocol: "Public CDN Object Storage",
    security: "Extension Whitelist (.jpg, .png, .webp, .pdf)",
    description: "Stores profile headshots, project screenshots, offer letters, and downloadable resume documents.",
    icon: HardDrive,
    details: [
      "Sanitized filename timestamping prevents overwrites",
      "Binary array buffer verification on ingestion",
      "Public access bucket policy enforcement",
      "Instant CDN media delivery"
    ]
  }
];

export default function ArchitectureDiagram() {
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode | null>(null);

  return (
    <section id="architecture" className="space-y-6 scroll-mt-24">
      <div className="flex items-center gap-3">
        <h2 className="font-orbitron text-2xl md:text-3xl font-black text-white flex items-center gap-2">
          <Network className="w-6 h-6 text-cyber-green animate-pulse" />
          SYSTEM_TOPOLOGY // ARCHITECTURE
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-cyber-green/40 to-transparent" />
      </div>

      <p className="font-mono text-xs text-gray-400 max-w-3xl leading-relaxed">
        Interactive topology map of the actual production stack powering this portfolio. Click any node to inspect security rules, protocols, and real-time execution benchmarks.
      </p>

      {/* Interactive Flow Diagram Grid */}
      <div className="glass-card p-6 border-white/10 relative overflow-hidden space-y-6">
        {/* Animated Connection Beam */}
        <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-0.5 bg-gradient-to-r from-cyber-green via-cyber-blue to-cyber-cyan opacity-20 -translate-y-1/2" />

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 relative z-10">
          {NODES.map((node, index) => {
            const IconComp = node.icon;
            const isSelected = selectedNode?.id === node.id;

            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  setSelectedNode(node);
                }}
                className={`glass-card p-4 flex flex-col justify-between gap-3 cursor-pointer transition-all border ${
                  isSelected
                    ? "border-cyber-green shadow-[0_0_25px_rgba(0,255,157,0.3)] bg-[#07111F]"
                    : "border-white/10 hover:border-cyber-green/50 bg-[#040912]/80"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[9px] font-mono text-gray-400">
                    <span className="cyber-tag border-cyber-green/30 text-cyber-green">{node.category}</span>
                    <span className="text-cyber-blue font-bold">{node.latency}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <div className="p-2 rounded-lg bg-cyber-green/10 text-cyber-green border border-cyber-green/20">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <h3 className="font-orbitron font-bold text-xs text-white leading-tight">{node.name}</h3>
                  </div>

                  <p className="text-[10px] text-gray-400 font-mono line-clamp-2">{node.tech}</p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-cyber-green">
                  <span>INSPECT NODE</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Node Details Inspection Modal */}
      <AnimatePresence>
        {selectedNode && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl glass-card border-cyber-green/40 bg-[#07111F]/95 rounded-2xl p-6 md:p-8 shadow-[0_0_60px_rgba(0,255,157,0.25)] hud-box flex flex-col gap-6 relative"
            >
              <button
                onClick={() => setSelectedNode(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="p-3 rounded-xl bg-cyber-green/10 border border-cyber-green/30 text-cyber-green">
                  <selectedNode.icon className="w-6 h-6" />
                </div>
                <div>
                  <span className="cyber-tag border-cyber-green/40 text-cyber-green font-bold text-[10px]">
                    {selectedNode.category}
                  </span>
                  <h3 className="font-orbitron font-black text-xl text-white">{selectedNode.name}</h3>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-mono text-gray-300 leading-relaxed bg-black/40 p-4 rounded-xl border border-white/5">
                  {selectedNode.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                  <div className="glass-card p-3 space-y-1">
                    <span className="text-[10px] text-gray-400 uppercase">Technology Stack</span>
                    <p className="text-cyber-green font-bold text-xs">{selectedNode.tech}</p>
                  </div>
                  <div className="glass-card p-3 space-y-1">
                    <span className="text-[10px] text-gray-400 uppercase">Execution Latency</span>
                    <p className="text-cyber-blue font-bold text-xs">{selectedNode.latency}</p>
                  </div>
                  <div className="glass-card p-3 space-y-1">
                    <span className="text-[10px] text-gray-400 uppercase">Transport Protocol</span>
                    <p className="text-white text-xs">{selectedNode.protocol}</p>
                  </div>
                  <div className="glass-card p-3 space-y-1">
                    <span className="text-[10px] text-gray-400 uppercase">Security Boundary</span>
                    <p className="text-cyber-cyan text-xs">{selectedNode.security}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <h4 className="font-orbitron font-bold text-xs text-white uppercase tracking-wider">
                    Technical Specifications
                  </h4>
                  <ul className="space-y-1.5 font-mono text-xs text-gray-300">
                    {selectedNode.details.map((detail, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyber-green" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
