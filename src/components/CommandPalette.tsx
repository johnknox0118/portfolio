"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Code, Award, Folder, User, Terminal, ExternalLink, X, FileText } from "lucide-react";

interface CommandPaletteProps {
  data?: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ data, isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open trigger handled by parent state
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const projects = data?.projects || [];
  const skills = data?.skills || [];
  const certs = data?.certifications || [];
  const profile = data?.profile || {};

  // Build searchable items index
  const items = [
    { type: "section", title: "About & Profile", sectionId: "about", icon: User },
    { type: "section", title: "Qualifications & Education", sectionId: "qualifications", icon: Award },
    { type: "section", title: "Technical Skills", sectionId: "skills", icon: Code },
    { type: "section", title: "Engineering Projects", sectionId: "projects", icon: Folder },
    { type: "section", title: "Certifications", sectionId: "certifications", icon: Award },
    { type: "section", title: "Contact Gateway", sectionId: "contact", icon: Terminal },
    ...(profile.resumeUrl ? [{ type: "action", title: "Download Resume PDF", url: profile.resumeUrl, icon: FileText }] : []),
    ...(profile.github ? [{ type: "external", title: "GitHub Profile", url: profile.github, icon: ExternalLink }] : []),
    ...(profile.linkedin ? [{ type: "external", title: "LinkedIn Profile", url: profile.linkedin, icon: ExternalLink }] : []),
    ...projects.map((p: any) => ({ type: "project", title: p.title, description: p.description, sectionId: "projects", icon: Folder })),
    ...skills.map((s: any) => ({ type: "skill", title: s.name, description: `${s.category} • ${s.yearsOfExp} yrs exp`, sectionId: "skills", icon: Code })),
    ...certs.map((c: any) => ({ type: "cert", title: c.title, description: `${c.issuer} (${c.year})`, sectionId: "certifications", icon: Award })),
  ];

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 8);

  const handleSelect = (item: any) => {
    onClose();
    if (item.sectionId) {
      const elem = document.getElementById(item.sectionId);
      if (elem) elem.scrollIntoView({ behavior: "smooth" });
    } else if (item.url) {
      window.open(item.url, "_blank");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -20 }}
          className="w-full max-w-xl glass-card border-cyber-green/40 bg-[#07111F]/95 rounded-2xl p-4 shadow-[0_0_50px_rgba(0,255,157,0.2)] hud-box flex flex-col gap-4"
        >
          {/* Search Bar Input */}
          <div className="flex items-center gap-3 px-3 py-2 border-b border-white/10">
            <Search className="w-5 h-5 text-cyber-green shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Type to search projects, skills, certificates, pages... [ESC to close]"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm font-mono text-white placeholder-gray-500 focus:outline-none"
            />
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Results List */}
          <div className="space-y-1 max-h-80 overflow-y-auto pr-1 font-mono text-xs">
            {filteredItems.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-xs">
                No matching dossier records found for "{query}"
              </div>
            ) : (
              filteredItems.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(item)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-cyber-green/10 border border-transparent hover:border-cyber-green/30 text-left transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-4 h-4 text-cyber-blue group-hover:text-cyber-green transition-colors" />
                      <div>
                        <div className="text-white font-bold group-hover:text-cyber-green transition-colors">
                          {item.title}
                        </div>
                        {item.description && (
                          <div className="text-[10px] text-gray-400 line-clamp-1">{item.description}</div>
                        )}
                      </div>
                    </div>
                    <span className="cyber-tag text-[8px] uppercase border-cyber-blue/30 text-cyber-blue group-hover:border-cyber-green/40 group-hover:text-cyber-green">
                      {item.type}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Shortcut Info */}
          <div className="flex items-center justify-between px-3 pt-2 border-t border-white/10 text-[10px] text-gray-500 font-mono">
            <span>COMMAND_PALETTE // v2.0</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-300">ESC</kbd> to exit
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
