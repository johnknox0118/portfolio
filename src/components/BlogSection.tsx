"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Clock, ExternalLink, X, Search, Share2 } from "lucide-react";

interface Article {
  id: string | number;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  tags: string[] | string;
  content: string;
}

interface BlogSectionProps {
  articles?: any[];
}

const DEFAULT_ARTICLES: Article[] = [
  {
    id: "art-1",
    title: "Zero-Trust Architecture in Modern Serverless & Next.js Environments",
    excerpt: "Exploring cryptographic JWT session validation, role-based database access, and perimeter defense in serverless Next.js edge environments.",
    category: "CYBERSECURITY",
    readTime: "6 min read",
    date: "July 2026",
    tags: ["Zero-Trust", "Next.js", "JWT", "PostgreSQL", "App Sec"],
    content: `
### Overview
Modern web applications face sophisticated threat vectors targeting session persistence, API endpoints, and database connection pools. In this research paper, we analyze the implementation of Zero-Trust principles within Next.js App Router applications deployed to serverless environments.

### Core Defense Mechanisms
1. **Cryptographic Cookie Validation**: Rather than checking for simple cookie existence, tokens must undergo full structural inspection and signature verification.
2. **Database Connection Hardening**: Utilizing transactional connection poolers (pgbouncer) alongside session-level migrations prevents connection starvation attacks.
3. **MIME-Type & Payload Boundaries**: Enforcing strict binary byte inspection on upload gateways mitigates stored XSS and remote code execution vulnerabilities.

### Conclusion
By decoupling session state from volatile server memory and enforcing strict validation at every API perimeter, serverless applications maintain resilient defense postures.
    `,
  },
  {
    id: "art-2",
    title: "Building High-Performance 60FPS Interactive HUD Systems in React 19",
    excerpt: "A deep dive into GPU-accelerated compositing, hardware transforms, and Framer Motion spring physics for zero-lag UI rendering.",
    category: "ENGINEERING",
    readTime: "8 min read",
    date: "June 2026",
    tags: ["React 19", "Performance", "CSS GPU", "Framer Motion"],
    content: `
### Introduction
Creating immersive, futuristic HUD interfaces requires careful management of browser rendering pipelines to prevent layout thrashing and maintain 60 FPS animation loops.

### Key Optimization Strategies
- **GPU Layer Compositing**: Utilizing \`translate3d\` and \`will-change: transform\` forces elements onto hardware layers.
- **Debounced Pointer Hooks**: Normalizing mouse coordinates to normalized device coordinates prevents excessive React state re-renders.
- **Reduced Motion Fallbacks**: Respecting \`prefers-reduced-motion\` ensures accessibility without sacrificing aesthetic impact for hardware-capable devices.

### Summary
Combining declarative React state with hardware-composited canvas particle fields yields liquid-smooth animations across low-end and high-end hardware.
    `,
  },
];

export default function BlogSection({ articles = [] }: BlogSectionProps) {
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [search, setSearch] = useState("");

  const displayArticles = articles.length > 0 ? articles : DEFAULT_ARTICLES;

  const filteredArticles = displayArticles.filter((art) => {
    const titleMatch = art.title?.toLowerCase().includes(search.toLowerCase());
    const categoryMatch = art.category?.toLowerCase().includes(search.toLowerCase());
    const tagMatch = Array.isArray(art.tags)
      ? art.tags.some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
      : typeof art.tags === "string" && art.tags.toLowerCase().includes(search.toLowerCase());
    return titleMatch || categoryMatch || tagMatch;
  });

  return (
    <section id="blog" className="space-y-8 scroll-mt-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="font-orbitron text-2xl md:text-3xl font-black text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-cyber-blue animate-pulse" />
          RESEARCH_LOGS // ENGINEERING ARTICLES
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-cyber-blue/40 to-transparent" />
      </div>

      {/* Search Input */}
      <div className="relative w-full max-w-sm">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search research papers & articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#040912] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-cyber-blue"
        />
      </div>

      {/* Article Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredArticles.map((art: any, idx: number) => {
          const tagArray = Array.isArray(art.tags)
            ? art.tags
            : typeof art.tags === "string"
            ? art.tags.split(",").map((t: string) => t.trim())
            : [];

          return (
            <motion.div
              key={art.id || idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="glass-card hud-box p-6 flex flex-col justify-between gap-4 relative group"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="cyber-tag border-cyber-blue/30 text-cyber-blue font-bold uppercase">
                    {art.category || "ENGINEERING"}
                  </span>
                  <span className="text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyber-green" /> {art.readTime || "5 min read"}
                  </span>
                </div>
                <h3 className="font-orbitron font-bold text-lg text-white group-hover:text-cyber-green transition-colors leading-snug">
                  {art.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">{art.excerpt}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tagArray.map((t: string) => (
                    <span key={t} className="cyber-tag text-[8px] border-white/10 text-gray-300">
                      #{t.replace(/^#/, "")}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex justify-between items-center text-xs font-mono">
                <span className="text-[10px] text-gray-500">{art.date || "2026"}</span>
                <button
                  onClick={() => setSelectedArticle(art)}
                  className="btn-cyber flex items-center gap-1.5 px-3 py-1.5 text-xs text-cyber-green cursor-pointer"
                >
                  READ ARTICLE <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Article Reading Drawer Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-3xl glass-card border-cyber-green/40 bg-[#07111F]/95 rounded-2xl p-6 md:p-8 shadow-[0_0_60px_rgba(0,255,157,0.2)] hud-box flex flex-col max-h-[85vh] overflow-y-auto relative"
            >
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs font-mono text-cyber-green">
                    <span className="cyber-tag border-cyber-green/40 text-cyber-green font-bold uppercase">
                      {selectedArticle.category || "RESEARCH"}
                    </span>
                    <span>{selectedArticle.readTime || "5 min read"}</span>
                    <span>• {selectedArticle.date || "2026"}</span>
                  </div>
                  <h2 className="font-orbitron font-black text-2xl md:text-3xl text-white">{selectedArticle.title}</h2>
                </div>

                <div className="bg-black/60 border border-white/10 rounded-xl p-5 font-sans text-sm text-gray-300 space-y-4 leading-relaxed whitespace-pre-wrap">
                  {selectedArticle.content}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10 font-mono text-xs">
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(selectedArticle.tags)
                      ? selectedArticle.tags
                      : typeof selectedArticle.tags === "string"
                      ? selectedArticle.tags.split(",")
                      : []
                    ).map((t: string) => (
                      <span key={t} className="cyber-tag text-[9px] border-white/10 text-gray-300">
                        #{t.trim().replace(/^#/, "")}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: selectedArticle.title, url: window.location.href });
                      } else {
                        alert("Article link copied to clipboard!");
                      }
                    }}
                    className="btn-cyber flex items-center gap-1.5 px-3 py-1.5 text-xs text-cyber-blue cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" /> SHARE
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
