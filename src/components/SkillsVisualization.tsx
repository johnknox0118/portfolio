"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import dynamic from "next/dynamic";
import SectionDivider from "./SectionDivider";
import { FlipText } from "@/components/text/AnimatedTypography";
import Cyber3DCard from "@/components/cyber/Cyber3DCard";

// Lazy load 3D Skills Sphere client-side
const SkillsSphere3D = dynamic(() => import("./SkillsSphere3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[320px] flex items-center justify-center text-xs font-mono text-gray-500">
      INITIALIZING 3D KNOWLEDGE MATRIX...
    </div>
  ),
});

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
    <section id="skills" className="space-y-8 scroll-mt-20">
      {/* Section Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-cyber-green animate-pulse" />
          <FlipText as="h2" text="TECHNICAL MATRIX" subtitle="// SKILLS & CAPABILITIES" className="text-2xl md:text-3xl" />
        </div>
        <SectionDivider color="green" />
      </div>

      {/* 3D Interactive Skills Sphere */}
      <SkillsSphere3D skills={skills} />

      {/* Category Filter Chips */}
      <div className="flex overflow-x-auto scrollbar-none pb-2 sm:pb-0 sm:flex-wrap gap-2 pt-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`cyber-tag text-[10px] uppercase font-mono px-3.5 py-1.5 transition-all cursor-pointer ${
              activeCategory === cat
                ? "border-cyber-green text-cyber-green bg-cyber-green/15 shadow-[0_0_12px_rgba(0,255,157,0.3)] font-bold scale-105"
                : "border-white/10 text-gray-400 hover:text-white hover:border-white/30"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Skills Grid with Circular Progress & Focus Depth */}
      <div className="focus-depth-group grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSkills.map((skill: any, idx: number) => {
          const progress = Math.min(Math.max(skill.progress || 80, 0), 100);
          const strokeDashoffset = 251.2 - (251.2 * progress) / 100;

          return (
            <Cyber3DCard
              key={skill.id || idx}
              glowColor="green"
              index={idx}
              depth={190}
              tiltStrength={7}
              className="h-full"
            >
              <div className="glass-card hud-box glass-shine skill-card-hover focus-depth-item card-spotlight p-5 flex items-center gap-5 relative group overflow-hidden h-full cursor-pointer">
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
              </div>
            </Cyber3DCard>
          );
        })}
      </div>
    </section>
  );
}
