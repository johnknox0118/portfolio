"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Shield, Menu, X, ShieldAlert, Search, Terminal, Lock } from "lucide-react";
import NavLink from "./cyber/NavLink";
import { CTFAuditButton, SearchTrigger, TerminalTrigger, AdminButton } from "./cyber/NavButtons";
import NavbarGlassShine from "./cyber/NavbarGlassShine";
import { useScrollContext } from "./SmoothScrollProvider";

const CUBIC_EASE = [0.22, 1, 0.36, 1] as const;

interface NavbarProps {
  profile?: any;
  onCtfClick: () => void;
  onSearchClick: () => void;
  onTerminalClick: () => void;
  ctfBadgeUnlocked?: boolean;
}

const NAV_LINKS = [
  { id: "about", label: "ABOUT" },
  { id: "qualifications", label: "QUALIFICATIONS" },
  { id: "skills", label: "SKILLS" },
  { id: "projects", label: "PROJECTS" },
  { id: "certifications", label: "CERTIFICATES" },
  { id: "contact", label: "CONTACT" },
];

export default function Navbar({
  profile = {},
  onCtfClick,
  onSearchClick,
  onTerminalClick,
  ctfBadgeUnlocked = false,
}: NavbarProps) {
  const [activeSection, setActiveSection] = useState<string>("top-portal");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isNavbarHovered, setIsNavbarHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const scrollContext = useScrollContext();

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Track scroll position for dynamic glass styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track active section via IntersectionObserver (syncs with page sections)
  useEffect(() => {
    const sectionIds = ["top-portal", ...NAV_LINKS.map((l) => l.id)];
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

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

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Handle smooth scroll navigation with header offset
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsMobileNavOpen(false);

    if (targetId === "top-portal" || targetId === "top") {
      if (scrollContext) {
        scrollContext.scrollTo(0, { duration: 1.0 });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    if (scrollContext) {
      scrollContext.scrollTo(`#${targetId}`, { offset: 0, duration: 1.0 });
    } else {
      const element = document.getElementById(targetId);
      if (element) {
        const computedStyle = window.getComputedStyle(element);
        const scrollMargin = parseFloat(computedStyle.scrollMarginTop) || 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - scrollMargin;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }
  };

  const nameParts = (profile.name || "JOHNKNOX KALLE").split(" ");
  const firstName = nameParts[0] || "JOHNKNOX";
  const lastName = nameParts.slice(1).join(" ") || "KALLE";

  // Staggered Entrance Variants
  const containerVariants: Variants = {
    hidden: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: CUBIC_EASE,
        staggerChildren: prefersReducedMotion ? 0 : 0.045,
        delayChildren: 0.08,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: CUBIC_EASE },
    },
  };

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      onMouseEnter={() => setIsNavbarHovered(true)}
      onMouseLeave={() => setIsNavbarHovered(false)}
      className={`fixed top-0 left-0 right-0 z-40 max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between rounded-b-[20px] transition-all duration-300 select-none ${
        isScrolled
          ? "bg-[#07111F]/85 backdrop-blur-lg border-b border-cyber-blue/15 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]"
          : "bg-[#07111F]/50 backdrop-blur-md border-b border-white/5"
      }`}
    >
      {/* Subtle Glass Reflection Sheen */}
      <NavbarGlassShine isHovered={isNavbarHovered} />

      {/* 1. BRAND LOGO WITH PHASED ENTRANCE & DESKTOP HOVER */}
      <motion.div variants={itemVariants} className="relative z-10">
        <a
          href="#top-portal"
          onClick={(e) => {
            e.preventDefault();
            if (scrollContext) {
              scrollContext.scrollTo(0, { duration: 1.0 });
            } else {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          onMouseEnter={() => setIsLogoHovered(true)}
          onMouseLeave={() => setIsLogoHovered(false)}
          className="flex items-center gap-2.5 cursor-pointer group outline-none focus-visible:ring-1 focus-visible:ring-cyber-green rounded-md p-1"
        >
          <motion.div
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    y: isLogoHovered ? -1.5 : 0,
                  }
            }
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
            className="flex items-center gap-2.5"
          >
            {/* Phased Shield Icon Entrance & Hover Glow */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.75, rotate: -15 }}
              animate={
                prefersReducedMotion
                  ? { opacity: 1, scale: 1, rotate: 0 }
                  : {
                      opacity: 1,
                      scale: isLogoHovered ? 1.08 : 1,
                      rotate: isLogoHovered ? 3 : 0,
                    }
              }
              transition={{
                duration: 0.5,
                ease: CUBIC_EASE,
              }}
              style={{
                filter: isLogoHovered
                  ? "drop-shadow(0 0 10px rgba(0, 255, 157, 0.7))"
                  : "drop-shadow(0 0 4px rgba(0, 255, 157, 0.3))",
              }}
              className="text-cyber-green transition-all duration-300"
            >
              <Shield className="w-6 h-6" />
            </motion.div>

            {/* Phased Text Reveal: First Name then Last Name */}
            <div className="flex flex-col text-left font-orbitron font-black text-xs sm:text-sm tracking-wider leading-tight">
              <motion.span
                initial={prefersReducedMotion ? false : { opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.18, ease: CUBIC_EASE }}
                className={`bg-gradient-to-r from-cyber-green to-cyber-blue bg-clip-text text-transparent transition-all duration-200 ${
                  isLogoHovered ? "brightness-125" : "brightness-100"
                }`}
              >
                {firstName}
              </motion.span>
              <motion.span
                initial={prefersReducedMotion ? false : { opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.26, ease: CUBIC_EASE }}
                className={`text-[10px] tracking-widest text-gray-300 transition-all duration-200 ${
                  isLogoHovered ? "text-white" : "text-gray-300"
                }`}
              >
                {lastName}
              </motion.span>
            </div>
          </motion.div>
        </a>
      </motion.div>

      {/* 2. CENTER NAVIGATION LINKS WITH EXPANDING UNDERLINE & ACTIVE SYNC */}
      <nav className="hidden md:flex items-center gap-5 lg:gap-7 relative z-10">
        {NAV_LINKS.map((link) => (
          <motion.div key={link.id} variants={itemVariants}>
            <NavLink
              href={`#${link.id}`}
              label={link.label}
              isActive={activeSection === link.id}
              onClick={(e) => handleNavClick(e, link.id)}
            />
          </motion.div>
        ))}
      </nav>

      {/* 3. RIGHT UTILITY BUTTONS (CTF, SEARCH, TERMINAL, ADMIN, MOBILE MENU) */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 relative z-10">
        <motion.div variants={itemVariants}>
          <CTFAuditButton onClick={onCtfClick} unlocked={ctfBadgeUnlocked} />
        </motion.div>

        <motion.div variants={itemVariants} className="hidden sm:block">
          <SearchTrigger onClick={onSearchClick} />
        </motion.div>

        <motion.div variants={itemVariants} className="hidden sm:block">
          <TerminalTrigger onClick={onTerminalClick} />
        </motion.div>

        <motion.div variants={itemVariants} className="hidden sm:block">
          <AdminButton />
        </motion.div>

        {/* Mobile Navigation Toggle Button */}
        <motion.button
          variants={itemVariants}
          onClick={() => setIsMobileNavOpen((prev) => !prev)}
          className="p-1.5 rounded-lg border border-white/10 hover:border-cyber-green/40 bg-black/40 text-gray-400 hover:text-cyber-green transition-all md:hidden outline-none focus-visible:ring-1 focus-visible:ring-cyber-green"
          aria-label="Toggle Mobile Navigation Menu"
          aria-expanded={isMobileNavOpen}
        >
          <motion.div
            animate={{ rotate: isMobileNavOpen ? 90 : 0 }}
            transition={{ duration: 0.25 }}
          >
            {isMobileNavOpen ? (
              <X className="w-5 h-5 text-cyber-green" />
            ) : (
              <Menu className="w-5 h-5 text-cyber-green" />
            )}
          </motion.div>
        </motion.button>
      </div>

      {/* 4. MOBILE NAVIGATION DRAWER */}
      <AnimatePresence>
        {isMobileNavOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: CUBIC_EASE }}
            className="md:hidden absolute top-full left-0 right-0 mt-2 mx-3 p-4 border border-white/10 flex flex-col gap-2.5 font-orbitron text-xs font-semibold tracking-wider text-gray-300 bg-[#07111F]/98 backdrop-blur-2xl rounded-2xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto"
          >
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest px-1 pb-1">
              PORTAL NAVIGATION
            </div>
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(e) => handleNavClick(e, link.id)}
                  className={`py-2.5 px-3 rounded-xl flex items-center justify-between transition-colors border ${
                    isActive
                      ? "text-cyber-green bg-cyber-green/10 border-cyber-green/30 font-bold shadow-[0_0_10px_rgba(0,255,157,0.15)]"
                      : "border-white/5 hover:text-cyber-green hover:bg-white/5"
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-cyber-green shadow-[0_0_8px_#00FF9D]" />
                  )}
                </a>
              );
            })}

            {/* Quick Actions Panel in Mobile Menu */}
            <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2 mt-1 font-mono">
              <button
                type="button"
                onClick={() => {
                  setIsMobileNavOpen(false);
                  onCtfClick();
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-cyber-green/10 border border-cyber-green/30 text-cyber-green text-[11px] font-bold cursor-pointer hover:bg-cyber-green/20 transition-colors"
              >
                <ShieldAlert className="w-4 h-4 text-cyber-green shrink-0" />
                <span>CTF AUDIT</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileNavOpen(false);
                  onSearchClick();
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-black/60 border border-white/10 text-gray-300 hover:text-white text-[11px] cursor-pointer hover:border-cyber-green/40 transition-colors"
              >
                <Search className="w-4 h-4 text-cyber-green shrink-0" />
                <span>SEARCH</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileNavOpen(false);
                  onTerminalClick();
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-black/60 border border-white/10 text-gray-300 hover:text-white text-[11px] cursor-pointer hover:border-cyber-green/40 transition-colors"
              >
                <Terminal className="w-4 h-4 text-cyber-green shrink-0" />
                <span>TERMINAL</span>
              </button>

              <a
                href="/admin/login"
                onClick={() => setIsMobileNavOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-cyber-blue/10 border border-cyber-blue/40 text-cyber-blue text-[11px] font-bold cursor-pointer hover:bg-cyber-blue/20 transition-colors"
              >
                <Lock className="w-4 h-4 shrink-0" />
                <span>ADMIN</span>
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
