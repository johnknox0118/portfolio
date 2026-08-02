"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Code, Cpu, Shield, Cloud, Terminal, Layers, Activity } from "lucide-react";

interface SkillsVisualizationProps {
  skills?: any[];
}

export default function SkillsVisualization({ skills = [] }: SkillsVisualizationProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = ["all", "programming", "cybersecurity", "frontend", "backend", "cloud", "operating systems"];

  const filteredSkills = skills.filter(
    (s) => activeCategory === "all" || s.category?.toLowerCase() === activeCategory.toLowerCase()
  );

  return (
    <section id="skills" className="space-y-8 scroll-mt-24">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <h2 className="font-orbitron text-2xl md:text-3xl font-black text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-cyber-green animate-pulse" />
          TECHNICAL_STACK // SKILL MATRIX
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-cyber-green/40 to-transparent" />
      </div>

      {/* Category Filter Chips */}
      <div className="flex overflow-x-auto scrollbar-none pb-2 sm:pb-0 sm:flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`cyber-tag text-[10px] uppercase font-mono px-3.5 py-1.5 transition-all ${
              activeCategory === cat
                ? "border-cyber-green text-cyber-green bg-cyber-green/15 shadow-[0_0_12px_rgba(0,255,157,0.3)] font-bold"
                : "border-white/10 text-gray-400 hover:text-white hover:border-white/30"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Skills Grid with Circular Progress & Heatmap Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSkills.map((skill: any, idx: number) => {
          const progress = Math.min(Math.max(skill.progress || 80, 0), 100);
          const strokeDashoffset = 251.2 - (251.2 * progress) / 100;

          return (
            <motion.div
              key={skill.id || idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="glass-card hud-box p-5 flex items-center gap-5 relative group overflow-hidden"
            >
              {/* Circular Progress Ring */}
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 90 90">
                  <circle
                    cx="45"
                    cy="45"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-black/40"
                    fill="transparent"
                  />
                  <circle
                    cx="45"
                    cy="45"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-cyber-green transition-all duration-1000 ease-out"
                    fill="transparent"
                    strokeDasharray="251.2"
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute font-mono font-bold text-xs text-white">
                  {progress}%
                </span>
              </div>

              {/* Skill Details */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className="font-orbitron font-bold text-sm text-white group-hover:text-cyber-green transition-colors truncate">
                    {skill.name}
                  </h3>
                  <span className="cyber-tag text-[8px] uppercase border-cyber-blue/30 text-cyber-blue">
                    {skill.category}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                  <span>EXPERIENCE:</span>
                  <span className="text-cyber-green font-bold">{skill.yearsOfExp || 1}+ YRS</span>
                </div>
                <div className="h-1 w-full bg-black/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyber-blue to-cyber-green rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
