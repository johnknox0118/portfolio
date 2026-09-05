"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Activity, Shield } from "lucide-react";

const SECTORS = [
  { id: "top-portal", name: "SYS_CORE" },
  { id: "about", name: "ABOUT_DOSSIER" },
  { id: "qualifications", name: "ACADEMIC_LOG" },
  { id: "skills", name: "TECH_SPECS" },
  { id: "projects", name: "ENGINEERING_LOGS" },
  { id: "certifications", name: "CREDENTIALS" },
  { id: "blog", name: "RESEARCH_PAPERS" },
  { id: "contact", name: "SECURE_CHANNEL" },
];

export default function ScrollTelemetryBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 28, restDelta: 0.001 });
  const [scrollPercent, setScrollPercent] = useState(0);
  const [activeSector, setActiveSector] = useState("SYS_CORE");

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      setScrollPercent(Math.round(latest * 100));
    });

    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (let i = SECTORS.length - 1; i >= 0; i--) {
        const sector = SECTORS[i];
        const el = document.getElementById(sector.id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSector(sector.name);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrollYProgress]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none select-none">
      {/* Laser progress track */}
      <div className="w-full h-[2px] bg-black/40 relative">
        <motion.div
          style={{ scaleX, transformOrigin: "0%" }}
          className="h-full bg-gradient-to-r from-cyber-green via-cyber-blue to-[#00FF9D] shadow-[0_0_12px_#00FF9D]"
        />
      </div>

      {/* Floating HUD Telemetry Badge (Top Right Below Header) */}
      <div className="hidden lg:flex items-center gap-3 absolute top-3 right-8 bg-[#040912]/80 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1 text-[10px] font-mono text-gray-400">
        <div className="flex items-center gap-1.5 text-cyber-green">
          <Activity className="w-3 h-3 animate-pulse" />
          <span className="font-bold">GRID_SYNC</span>
        </div>
        <span className="text-white/20">|</span>
        <div>
          SECTOR: <span className="text-cyber-blue font-bold tracking-wider">{activeSector}</span>
        </div>
        <span className="text-white/20">|</span>
        <div className="text-right min-w-[50px]">
          BUFF: <span className="text-white font-bold">{scrollPercent}%</span>
        </div>
      </div>
    </div>
  );
}
