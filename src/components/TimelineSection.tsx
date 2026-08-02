"use client";

import { motion } from "framer-motion";
import { Award, BookOpen, Calendar, GraduationCap, GitBranch, ShieldCheck, CheckCircle2 } from "lucide-react";

interface TimelineSectionProps {
  education?: any[];
}

export default function TimelineSection({ education = [] }: TimelineSectionProps) {
  return (
    <section id="qualifications" className="space-y-8 scroll-mt-24">
      {/* Section Title */}
      <div className="flex items-center gap-3">
        <h2 className="font-orbitron text-2xl md:text-3xl font-black text-white flex items-center gap-2">
          <GitBranch className="w-6 h-6 text-cyber-blue animate-pulse" />
          ENGINEERING_MILESTONES // TIMELINE
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-cyber-blue/40 to-transparent" />
      </div>

      {/* Vertical Animated Timeline */}
      <div className="relative pl-6 md:pl-8 border-l border-white/10 space-y-8">
        {education.map((item: any, idx: number) => (
          <motion.div
            key={item.id || idx}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="relative group"
          >
            {/* Timeline Node Point Icon */}
            <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-6 h-6 rounded-full bg-[#07111F] border border-cyber-green flex items-center justify-center shadow-[0_0_12px_rgba(0,255,157,0.4)] group-hover:scale-125 transition-transform">
              <span className="w-2 h-2 rounded-full bg-cyber-green animate-ping" />
            </div>

            {/* Glass Milestone Card */}
            <div className="glass-card hud-box p-6 space-y-3 relative">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <span className="cyber-tag text-[9px] border-cyber-blue/30 text-cyber-blue uppercase font-bold tracking-wider">
                    {item.institution}
                  </span>
                  <h3 className="font-orbitron font-bold text-lg text-white group-hover:text-cyber-green transition-colors mt-1">
                    {item.degree}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-cyber-green bg-cyber-green/10 border border-cyber-green/30 px-3 py-1 rounded-full">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{item.duration}</span>
                </div>
              </div>

              {item.description && (
                <p className="text-xs text-gray-400 leading-relaxed font-sans">{item.description}</p>
              )}

              {item.grade && (
                <div className="pt-2 flex items-center gap-2 text-xs font-mono text-white">
                  <CheckCircle2 className="w-4 h-4 text-cyber-green" />
                  <span className="text-gray-400">GRADE / PERFORMANCE:</span>
                  <span className="text-cyber-green font-bold">{item.grade}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
