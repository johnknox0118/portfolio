"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Eye, Globe, Code, ExternalLink } from "lucide-react";
import Cyber3DCard from "@/components/cyber/Cyber3DCard";

export interface CardBounds {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface ProjectStackProps {
  projects: any[];
  onSelectProject: (project: any, bounds?: CardBounds | null) => void;
  ensureArray: (val: any) => any[];
}

const staggerContainerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06, // ~60ms internal card stagger (Animation #52)
      delayChildren: 0.05,
    },
  },
};

const staggerItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

function ProjectCardItem({
  project,
  pIdx,
  onSelectProject,
  ensureArray,
}: {
  project: any;
  pIdx: number;
  onSelectProject: (project: any, bounds?: CardBounds | null) => void;
  ensureArray: (val: any) => any[];
}) {
  const cardContainerRef = useRef<HTMLDivElement>(null);
  // Trigger stagger entrance once on scroll into view — never replay on hover
  const isInView = useInView(cardContainerRef, { once: true, amount: 0.15 });
  const tags = ensureArray(project.tags);

  const handleOpenModal = () => {
    let bounds: CardBounds | null = null;
    if (cardContainerRef.current) {
      const rect = cardContainerRef.current.getBoundingClientRect();
      bounds = {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      };
    }
    onSelectProject(project, bounds);
  };

  return (
    <div
      ref={cardContainerRef}
      className="project-card-container w-full h-full"
    >
      <Cyber3DCard glowColor="green" index={pIdx} depth={220} className="h-full">
        <div
          className={`group/project rounded-2xl h-full ${
            pIdx === 0 ? "md:animated-gradient-border" : ""
          }`}
        >
          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="glass-card hud-box glass-shine p-6 flex flex-col gap-4 h-full relative"
          >
            {/* 1. Stagger Item 1: Project Image with Smooth Glitch-Free Action Options */}
            <motion.div
              variants={staggerItemVariants}
              className="aspect-video w-full rounded-xl overflow-hidden border border-white/5 bg-black/40 relative"
            >
              {/* Smooth Hover Action Options Overlay */}
              <div className="absolute inset-0 bg-[#07111F]/85 opacity-0 group-hover/project:opacity-100 flex items-center justify-center gap-3 transition-opacity duration-300 md:backdrop-blur-md z-30 p-3 flex-wrap pointer-events-none group-hover/project:pointer-events-auto">
                <button
                  onClick={handleOpenModal}
                  className="btn-cyber flex items-center gap-1.5 px-3.5 py-2 border-cyber-green text-cyber-green text-xs font-bold cursor-pointer hover:bg-cyber-green hover:text-black transition-all hover:scale-105 shadow-[0_0_12px_rgba(0,255,157,0.35)]"
                >
                  <Eye className="w-4 h-4" /> VIEW SPEC
                </button>
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-cyber flex items-center gap-1.5 px-3.5 py-2 bg-cyber-green/20 border-cyber-green text-cyber-green text-xs font-bold shadow-[0_0_12px_rgba(0,255,157,0.35)] hover:bg-cyber-green hover:text-black transition-all hover:scale-105"
                  >
                    <Globe className="w-4 h-4" /> VIEW PROJECT
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-cyber btn-cyber-blue flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold hover:bg-cyber-blue hover:text-black transition-all hover:scale-105"
                  >
                    <ExternalLink className="w-4 h-4" /> SOURCE
                  </a>
                )}
              </div>

              {/* Parallax Image */}
              <img
                src={project.imageUrl || "/uploads/1784277682063_Screenshot_2026-07-17_141041.png"}
                alt={project.title}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes("Screenshot_2026-07-17_141041.png")) {
                    target.src = "/uploads/1784277682063_Screenshot_2026-07-17_141041.png";
                  }
                }}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover/project:scale-105 pointer-events-none"
              />

              <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded bg-[#07111F]/90 border border-cyber-blue/40 text-[9px] font-mono text-cyber-blue font-bold tracking-widest uppercase">
                {project.category}
              </div>
            </motion.div>

          {/* Card Content with Sequential Stagger */}
          <div className="space-y-2 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              {/* 2. Stagger Item 2: Badges row */}
              <motion.div
                variants={staggerItemVariants}
                className="flex justify-between items-start gap-2"
              >
                <span className="cyber-tag text-[8.5px] border-cyber-blue/30 text-cyber-blue font-bold uppercase">
                  {project.category || "SYSTEM"}
                </span>
                <span className="cyber-tag text-[9px] border-emerald-500/20 text-cyber-green font-bold">
                  {project.status?.toUpperCase() || "VERIFIED"}
                </span>
              </motion.div>

              {/* 3. Stagger Item 3: Title */}
              <motion.h3
                variants={staggerItemVariants}
                className="font-orbitron font-bold text-lg text-white group-hover:text-cyber-green transition-colors"
              >
                {project.title}
              </motion.h3>

              {/* 4. Stagger Item 4: Description */}
              <motion.p
                variants={staggerItemVariants}
                className="text-xs text-gray-400 leading-relaxed line-clamp-2"
              >
                {project.description}
              </motion.p>

              {/* 5. Stagger Item 5: Tags */}
              <motion.div
                variants={staggerItemVariants}
                className="flex flex-wrap gap-2 pt-1"
              >
                {tags.map((tag: string) => (
                  <span key={tag} className="cyber-tag text-[8.5px] border-white/10 text-gray-300">
                    {tag}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* 6. Stagger Item 6: Bottom Action Buttons */}
            <motion.div
              variants={staggerItemVariants}
              className="flex items-center justify-between pt-3 border-t border-white/5 font-mono text-xs mt-2"
            >
              <button
                onClick={handleOpenModal}
                className="inline-flex items-center gap-1.5 text-cyber-green hover:underline font-bold text-[11px] cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" /> SPEC DOSSIER
              </button>

              <div className="flex items-center gap-3">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-cyber-green hover:underline text-[11px]"
                  >
                    <Globe className="w-3 h-3" /> LIVE
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-cyber-blue hover:underline text-[11px]"
                  >
                    <Code className="w-3 h-3" /> CODE
                  </a>
                )}
              </div>
            </motion.div>
          </div>
          </motion.div>
        </div>
      </Cyber3DCard>
    </div>
  );
}

export default function ProjectStack({
  projects = [],
  onSelectProject,
  ensureArray,
}: ProjectStackProps) {
  if (!projects || projects.length === 0) return null;

  return (
    <div className="focus-depth-group grid grid-cols-1 md:grid-cols-2 gap-8">
      {projects.map((project: any, pIdx: number) => (
        <ProjectCardItem
          key={project.id || pIdx}
          project={project}
          pIdx={pIdx}
          onSelectProject={onSelectProject}
          ensureArray={ensureArray}
        />
      ))}
    </div>
  );
}
