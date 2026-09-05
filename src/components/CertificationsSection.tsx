"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, ShieldCheck, Search, X, FileCheck } from "lucide-react";
import SectionDivider from "./SectionDivider";
import HorizontalGallery from "./HorizontalGallery";
import CardInteraction from "./CardInteraction";
import StickyCardSection, { StickyCardItem } from "./StickyCardSection";
import { FlipText } from "@/components/text/AnimatedTypography";
import Cyber3DCard from "@/components/cyber/Cyber3DCard";

interface CertificationsSectionProps {
  certifications?: any[];
}

export default function CertificationsSection({ certifications = [] }: CertificationsSectionProps) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedCert, setSelectedCert] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"stream" | "stack">("stream");

  const categories = ["all", ...Array.from(new Set(certifications.map((c) => c.category?.toLowerCase()).filter(Boolean)))];

  const filteredCerts = certifications.filter((cert) => {
    const matchesFilter = filter === "all" || cert.category?.toLowerCase() === filter.toLowerCase();
    const matchesSearch =
      cert.title?.toLowerCase().includes(search.toLowerCase()) ||
      cert.issuer?.toLowerCase().includes(search.toLowerCase()) ||
      cert.credentialId?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <section id="certifications" className="space-y-8 scroll-mt-20">
      {/* Section Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-cyber-green animate-pulse" />
          <FlipText as="h2" text="VERIFIED CREDENTIALS" subtitle="// CERTIFICATIONS" className="text-2xl md:text-3xl" />
        </div>
        <SectionDivider color="green" />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`cyber-tag text-[10px] uppercase font-mono px-3.5 py-1.5 transition-all cursor-pointer ${
                filter === cat
                  ? "border-cyber-green text-cyber-green bg-cyber-green/15 shadow-[0_0_12px_rgba(0,255,157,0.3)] font-bold scale-105"
                  : "border-white/10 text-gray-400 hover:text-white hover:border-white/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Controls: View Mode Toggle & Search Input */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          {/* View Mode Toggle: Stream vs Sticky Cards */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#040912] border border-white/10 shrink-0">
            <button
              onClick={() => setViewMode("stream")}
              className={`px-3 py-1.5 text-[9px] font-mono rounded-lg transition-all cursor-pointer ${
                viewMode === "stream"
                  ? "bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/40 font-bold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              STREAM (#56)
            </button>
            <button
              onClick={() => setViewMode("stack")}
              className={`px-3 py-1.5 text-[9px] font-mono rounded-lg transition-all cursor-pointer ${
                viewMode === "stack"
                  ? "bg-cyber-green/20 text-cyber-green border border-cyber-green/40 font-bold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              STICKY (#54)
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search credentials..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#040912] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-cyber-green"
            />
          </div>
        </div>
      </div>

      {/* Cards: Horizontal Scroll Gallery (#56) or Sticky Cards Stacking (#54) */}
      <div className="focus-depth-group w-full">
        {viewMode === "stream" ? (
          <HorizontalGallery itemCount={filteredCerts.length}>
            {filteredCerts.map((cert: any, idx: number) => (
              <div
                key={cert.id || idx}
                className="w-full min-w-[280px] sm:min-w-[320px] lg:w-[350px] flex-shrink-0 h-full"
              >
                <Cyber3DCard glowColor="green" index={idx} depth={200} className="h-full">
                  <div className="glass-card hud-box glass-shine p-6 flex flex-col justify-between gap-4 relative group overflow-hidden h-full hover:border-cyber-green/40 transition-[border-color,box-shadow] duration-300">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <span className="cyber-tag text-[8.5px] border-cyber-blue/30 text-cyber-blue font-bold uppercase">
                          {cert.category || "SECURITY"}
                        </span>
                        <span className="font-mono text-[10px] text-gray-400 font-bold">{cert.year}</span>
                      </div>
                      <h3 className="font-orbitron font-bold text-base text-white group-hover:text-cyber-green transition-colors leading-snug">
                        {cert.title}
                      </h3>
                      <p className="text-xs text-cyber-blue font-mono">{cert.issuer}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5 font-mono text-xs">
                      {cert.credentialId ? (
                        <span className="text-[10px] text-gray-500 truncate max-w-[150px]">
                          ID: {cert.credentialId}
                        </span>
                      ) : (
                        <span className="text-[10px] text-cyber-green">VERIFIED RECORD</span>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedCert(cert)}
                          className="btn-cyber px-2.5 py-1 text-[10px]"
                        >
                          INSPECT
                        </button>
                        {cert.verifyUrl && (
                          <a
                            href={cert.verifyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded border border-white/10 hover:border-cyber-green text-gray-400 hover:text-cyber-green transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </Cyber3DCard>
              </div>
            ))}
          </HorizontalGallery>
        ) : (
          <StickyCardSection className="max-w-3xl mx-auto">
            {filteredCerts.map((cert: any, idx: number) => (
              <StickyCardItem key={cert.id || idx} index={idx} topOffset={110} className="w-full">
                <Cyber3DCard glowColor="green" index={idx} depth={180} enableScrollDepth={false} className="w-full">
                  <div className="glass-card hud-box glass-shine p-6 md:p-8 flex flex-col justify-between gap-4 relative group overflow-hidden h-full hover:border-cyber-green/40 transition-[border-color,box-shadow] duration-300">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <span className="cyber-tag text-[8.5px] border-cyber-blue/30 text-cyber-blue font-bold uppercase">
                          {cert.category || "SECURITY"}
                        </span>
                        <span className="font-mono text-[10px] text-gray-400 font-bold">{cert.year}</span>
                      </div>
                      <h3 className="font-orbitron font-bold text-lg text-white group-hover:text-cyber-green transition-colors leading-snug">
                        {cert.title}
                      </h3>
                      <p className="text-xs text-cyber-blue font-mono">{cert.issuer}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5 font-mono text-xs">
                      {cert.credentialId ? (
                        <span className="text-[10px] text-gray-500 truncate max-w-[150px]">
                          ID: {cert.credentialId}
                        </span>
                      ) : (
                        <span className="text-[10px] text-cyber-green">VERIFIED RECORD</span>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedCert(cert)}
                          className="btn-cyber px-3 py-1.5 text-[10px]"
                        >
                          INSPECT
                        </button>
                        {cert.verifyUrl && (
                          <a
                            href={cert.verifyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded border border-white/10 hover:border-cyber-green text-gray-400 hover:text-cyber-green transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </Cyber3DCard>
              </StickyCardItem>
            ))}
          </StickyCardSection>
        )}
      </div>

      {/* Credential Inspection Modal */}
      <AnimatePresence>
        {selectedCert && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-lg glass-card border-cyber-green/40 bg-[#07111F]/95 rounded-2xl p-6 md:p-8 shadow-[0_0_50px_rgba(0,255,157,0.2)] hud-box flex flex-col gap-6 relative"
            >
              <button
                onClick={() => setSelectedCert(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyber-green font-mono text-xs font-bold uppercase">
                  <FileCheck className="w-5 h-5 text-cyber-green" />
                  CREDENTIAL VERIFICATION DOSSIER
                </div>
                <h2 className="font-orbitron font-black text-2xl text-white">{selectedCert.title}</h2>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="cyber-tag border-cyber-blue/40 text-cyber-blue font-bold">{selectedCert.issuer}</span>
                  <span className="text-gray-400">ISSUED: {selectedCert.year}</span>
                </div>
              </div>

              <div className="bg-black/60 border border-white/10 rounded-xl p-4 space-y-3 text-xs font-mono leading-relaxed text-gray-300">
                <div className="flex justify-between">
                  <span className="text-gray-500">CREDENTIAL ID:</span>
                  <span className="text-white font-bold">{selectedCert.credentialId || "VERIFIED_RECORD"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">CATEGORY:</span>
                  <span className="text-cyber-green font-bold uppercase">{selectedCert.category || "GENERAL"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">STATUS:</span>
                  <span className="text-cyber-green font-bold">ACTIVE // AUTHENTICATED</span>
                </div>
              </div>

              {selectedCert.verifyUrl && (
                <a
                  href={selectedCert.verifyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-cyber flex items-center justify-center gap-2 w-full py-3 bg-cyber-green/20 border-cyber-green text-cyber-green font-bold hover:bg-cyber-green hover:text-black transition-all"
                >
                  <ExternalLink className="w-4 h-4" /> LAUNCH OFFICIAL VERIFICATION PAGE
                </a>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
