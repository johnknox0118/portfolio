"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useInView } from "framer-motion";
import { GitBranch, Calendar, CheckCircle2 } from "lucide-react";
import SectionDivider from "./SectionDivider";
import { FlipText } from "@/components/text/AnimatedTypography";
import Cyber3DCard from "@/components/cyber/Cyber3DCard";

interface TimelineSectionProps {
  education?: any[];
}

function TimelineItem({ item, idx, isLast }: { item: any; idx: number; isLast: boolean }) {
  const itemRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(itemRef, { once: true, amount: 0.25 });

  return (
    <div ref={itemRef} className="relative pl-8 md:pl-12 pb-10 group">
      {/* Animated Milestone Node */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -left-[14px] top-1.5 w-7 h-7 rounded-full bg-[#07111F] border-2 border-cyber-green flex items-center justify-center shadow-[0_0_15px_rgba(0,255,157,0.5)] z-20 group-hover:scale-115 transition-transform"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-cyber-green animate-pulse" />
      </motion.div>

      {/* Glass Milestone Card with 3D Scroll Depth, Floating & Cursor Tilt */}
      <Cyber3DCard glowColor="green" index={idx} depth={220} tiltStrength={7}>
        <div className="glass-card hud-box glass-shine p-6 space-y-3 relative hover:border-cyber-green/40 hover:shadow-[0_12px_32px_rgba(0,255,157,0.12)] transition-[border-color,box-shadow] duration-300">
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
      </Cyber3DCard>
    </div>
  );
}

export default function TimelineSection({ education = [] }: TimelineSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Progressive line drawing based on scroll progress through timeline
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 75%", "end 60%"],
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <section id="qualifications" className="space-y-8 scroll-mt-20">
      {/* Section Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <GitBranch className="w-6 h-6 text-cyber-blue animate-pulse" />
          <FlipText as="h2" text="ENGINEERING MILESTONES" subtitle="// QUALIFICATIONS" className="text-2xl md:text-3xl" />
        </div>
        <SectionDivider color="blue" />
      </div>

      {/* Progressive Vertical Animated Timeline */}
      <div ref={containerRef} className="relative pl-3 md:pl-4">
        {/* Background Track Line */}
        <div className="absolute left-[3px] md:left-[4px] top-3 bottom-6 w-[2px] bg-white/10" />

        {/* Dynamic Progressive Fill Line */}
        <motion.div
          style={{ scaleY }}
          className="absolute left-[3px] md:left-[4px] top-3 bottom-6 w-[2px] bg-gradient-to-b from-cyber-green via-cyber-blue to-emerald-400 origin-top shadow-[0_0_12px_#00FF9D]"
        />

        {/* Timeline Items */}
        <div className="space-y-2">
          {education.map((item: any, idx: number) => (
            <TimelineItem
              key={item.id || idx}
              item={item}
              idx={idx}
              isLast={idx === education.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
