"use client";

import React, { useEffect, useState } from "react";
import { useScrollContext } from "./SmoothScrollProvider";

interface SectionItem {
  id: string;
  label: string;
}

const SECTIONS: SectionItem[] = [
  { id: "top-portal", label: "PORTAL" },
  { id: "about", label: "ABOUT" },
  { id: "qualifications", label: "QUALIFICATIONS" },
  { id: "skills", label: "SKILLS" },
  { id: "projects", label: "PROJECTS" },
  { id: "certifications", label: "CERTS" },
  { id: "resume", label: "DOSSIER" },
  { id: "contact", label: "CONTACT" },
];

export default function SectionProgress() {
  const [activeSection, setActiveSection] = useState<string>("top-portal");
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const scrollContext = useScrollContext();

  useEffect(() => {
    // Collect DOM elements that correspond to SECTIONS
    const sectionElements = SECTIONS.map((s) => ({
      id: s.id,
      element: document.getElementById(s.id),
    })).filter((s) => s.element !== null);

    if (sectionElements.length === 0) return;

    // Use IntersectionObserver with multiple threshold levels for responsive tracking
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-80px 0px -55% 0px",
        threshold: 0,
      }
    );

    sectionElements.forEach((s) => {
      if (s.element) observer.observe(s.element);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleClick = (id: string) => {
    if (id === "top-portal" || id === "top") {
      if (scrollContext) {
        scrollContext.scrollTo(0, { duration: 1.0 });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    if (scrollContext) {
      scrollContext.scrollTo(`#${id}`, { offset: 0, duration: 1.0 });
    } else {
      const el = document.getElementById(id);
      if (el) {
        const computedStyle = window.getComputedStyle(el);
        const scrollMargin = parseFloat(computedStyle.scrollMarginTop) || 80;
        const top = el.getBoundingClientRect().top + window.pageYOffset - scrollMargin;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }
  };

  return (
    <nav
      aria-label="Section Progress Navigation"
      className="fixed right-5 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-end gap-3.5 pointer-events-auto"
    >
      <div className="flex flex-col items-center gap-3.5 p-2 rounded-full bg-[#07111F]/60 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        {SECTIONS.map((sec) => {
          const isActive = activeSection === sec.id;
          const isHovered = hoveredSection === sec.id;

          return (
            <div
              key={sec.id}
              className="relative flex items-center justify-end group cursor-pointer"
              onMouseEnter={() => setHoveredSection(sec.id)}
              onMouseLeave={() => setHoveredSection(null)}
              onClick={() => handleClick(sec.id)}
            >
              {/* Tooltip Label displaying on hover */}
              <div
                className={`absolute right-7 pointer-events-none transition-all duration-300 font-mono text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-md bg-[#040a12]/95 border border-white/15 text-white shadow-[0_4px_16px_rgba(0,0,0,0.5)] whitespace-nowrap ${
                  isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
                }`}
              >
                <span className={isActive ? "text-cyber-green" : "text-gray-300"}>{sec.label}</span>
              </div>

              {/* Progress Dot */}
              <button
                type="button"
                aria-label={`Jump to ${sec.label}`}
                className={`relative rounded-full transition-all duration-300 flex items-center justify-center ${
                  isActive
                    ? "w-3 h-3 bg-cyber-green shadow-[0_0_12px_#00FF9D]"
                    : "w-2 h-2 bg-white/30 hover:bg-cyber-blue hover:scale-125"
                }`}
              >
                {isActive && (
                  <span className="absolute inset-0 rounded-full animate-ping opacity-60 bg-cyber-green pointer-events-none" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
