"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, ShieldCheck, Terminal, Code, Award, Trophy, Flag, Flame, Cpu, 
  Globe, Activity, Settings, Database, BookOpen, Users, Gamepad2, 
  FileCode, Brain, Medal, Mail, Phone, MapPin, Menu, X, ExternalLink, 
  Lock, Download, Eye, Loader2, Check, ChevronUp, Camera, FileText,
  Box, ShieldAlert, Laptop, Server, Wifi, Unlock, Key, FileCheck, Layers, GitBranch,
  Search, Zap, Play, Pause, HelpCircle, AlertTriangle, Coffee, CodeXml, FileJson,
  Fingerprint, MessagesSquare, Crown, Volume2, VolumeX, Printer, Sparkles
} from "lucide-react";
import AntiGravityCanvas from "@/components/AntiGravityCanvas";
import BootLoader from "@/components/BootLoader";
import CommandPalette from "@/components/CommandPalette";
import TerminalModal from "@/components/TerminalModal";
import AIAssistantWidget from "@/components/AIAssistantWidget";
import SkillsVisualization from "@/components/SkillsVisualization";
import TimelineSection from "@/components/TimelineSection";
import CertificationsSection from "@/components/CertificationsSection";
import BlogSection from "@/components/BlogSection";
import CTFChallengeModal from "@/components/CTFChallengeModal";
import DossierExport from "@/components/DossierExport";


const IconMap: { [key: string]: any } = {
  Shield, ShieldCheck, Terminal, Code, Award, Trophy, Flag, Flame, Cpu, 
  Globe, Activity, Settings, Database, BookOpen, Users, Gamepad2, 
  FileCode, Brain, Medal, Mail, Phone, MapPin, Menu, X, ExternalLink, 
  Lock, Download, Eye, Loader2, Check, ChevronUp, Camera, FileText,
  Box, ShieldAlert, Laptop, Server, Wifi, Unlock, Key, FileCheck, Layers, GitBranch,
  Search, Zap, Play, Pause, HelpCircle, AlertTriangle, Coffee, CodeXml, FileJson,
  Fingerprint, MessagesSquare, Crown
};

// Helper to resolve Lucide Icon dynamically from local registry
const getIcon = (name: string) => {
  if (!name) return <Shield className="w-5 h-5" />;
  const query = name.trim().toLowerCase();
  
  // Custom aliases for non-standard inputs (like java)
  if (query === 'java') {
    return <Coffee className="w-5 h-5" />;
  }

  // Remove non-alphanumeric characters for flexible matching (e.g., file-code -> filecode)
  const sanitize = (str: string) => str.replace(/[^a-z0-9]/g, "");
  
  const cleanName = Object.keys(IconMap).find(
    (k) => sanitize(k.toLowerCase()) === sanitize(query)
  );
  const IconComponent = cleanName ? IconMap[cleanName] : null;
  if (IconComponent) {
    return <IconComponent className="w-5 h-5" />;
  }
  return <Shield className="w-5 h-5" />;
};

export default function PublicPortfolio() {
  // Helper to ensure safe array parsing for Prisma string/JSON fields
  const ensureArray = (val: any): any[] => {
    if (Array.isArray(val)) return val;
    if (!val) return [];
    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
        return [val];
      } catch {
        return [val];
      }
    }
    return [];
  };

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [certFilter, setCertFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [projectTab, setProjectTab] = useState("details");
  
  // Command Palette & Terminal & Mobile Nav States
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Smooth Scroll Click Handler with Fixed Header Offset
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsMobileNavOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 90;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // CTF Challenge Modal & Achievement Badge State
  const [ctfModalOpen, setCtfModalOpen] = useState(false);
  const [ctfBadgeUnlocked, setCtfBadgeUnlocked] = useState(false);

  // Keyboard shortcut listener for Ctrl+K / Cmd+K and `~` key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
      if (e.key === "`" || e.key === "~") {
        e.preventDefault();
        setIsTerminalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Content & Media Theft Protection Event Listeners
  useEffect(() => {
    // Disable right-click context menu across site
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }
      e.preventDefault();
    };

    // Disable dragging images/media out of browser
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    // Disable text copying (except inside form inputs & textareas)
    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }
      e.preventDefault();
    };

    // Block keyboard shortcuts: Ctrl+S (Save), Ctrl+U (Source), Ctrl+C (Copy outside input)
    const handleSecurityKeys = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA");

      if (isCmdOrCtrl && (key === "s" || key === "u")) {
        e.preventDefault();
      }
      if (isCmdOrCtrl && key === "c" && !isInput) {
        e.preventDefault();
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("dragstart", handleDragStart);
    window.addEventListener("copy", handleCopy);
    window.addEventListener("keydown", handleSecurityKeys);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("dragstart", handleDragStart);
      window.removeEventListener("copy", handleCopy);
      window.removeEventListener("keydown", handleSecurityKeys);
    };
  }, []);
  
  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [formStatus, setFormStatus] = useState<{ type: "idle" | "submitting" | "success" | "error"; text: string }>({
    type: "idle",
    text: ""
  });

  // Scroll to Top Ref
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    // Fetch aggregate portfolio data
    fetch("/api/public/data?t=" + Date.now())
      .then((res) => res.json())
      .then((payload) => {
        setData(payload);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        console.error("Failed to load portfolio:", err);
      });

    // Custom Cursor tracking
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Scroll display scroll-to-top button
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
      setFormStatus({ type: "error", text: "All fields are required in transmission." });
      return;
    }
    setFormStatus({ type: "submitting", text: "Transmitting payload..." });

    try {
      const res = await fetch("/api/public/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      const result = await res.json();
      if (result.success) {
        setFormStatus({ type: "success", text: "Transmission logged. Connection established." });
        setContactForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setFormStatus({ type: "error", text: result.error || "Transmission rejected by security grid." });
      }
    } catch (err) {
      setFormStatus({ type: "error", text: "Grid timeout. Connection failed." });
    }
  };

  // Typist intro text
  const [typedText, setTypedText] = useState("");
  const rawPhrases = data?.profile?.typingPhrases;

  useEffect(() => {
    if (loading) return;

    const typingTexts = (() => {
      if (rawPhrases) {
        const parsed = rawPhrases
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
        if (parsed.length > 0) return parsed;
      }
      return [
        "Compiling secure architectures...",
        "Emulating threat payloads...",
        "Auditing system kernels...",
        "Defending endpoints..."
      ];
    })();

    let isDeleting = false;
    let text = "";
    let loopIndex = 0;
    let timer: any;

    const tick = () => {
      const fullText = typingTexts[loopIndex % typingTexts.length];
      if (isDeleting) {
        text = fullText.substring(0, text.length - 1);
      } else {
        text = fullText.substring(0, text.length + 1);
      }

      setTypedText(text);

      let delta = 100 - Math.random() * 50;
      if (isDeleting) delta /= 2;

      if (!isDeleting && text === fullText) {
        delta = 2000;
        isDeleting = true;
      } else if (isDeleting && text === "") {
        isDeleting = false;
        loopIndex++;
        delta = 500;
      }

      timer = setTimeout(tick, delta);
    };

    timer = setTimeout(tick, 500);
    return () => clearTimeout(timer);
  }, [loading, rawPhrases]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#07111F] text-white">
        <div className="scanlines"></div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="w-12 h-12 border-4 border-cyber-green/20 border-t-cyber-green rounded-full mb-4 shadow-[0_0_15px_#00FF9D]"
        />
        <div className="font-orbitron font-bold tracking-widest text-xs text-cyber-green animate-pulse">
          BOOTING CYBERSECURITY GRID v1.0.4
        </div>
      </div>
    );
  }

  if (!data || data.error || !data.profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#07111F] text-white p-6 text-center font-mono">
        <div className="scanlines"></div>
        <div className="w-16 h-16 border-2 border-red-500 rounded-full flex items-center justify-center mb-6 text-red-500 font-bold text-xl shadow-[0_0_15px_#ef4444]">
          !
        </div>
        <h1 className="font-orbitron font-black text-lg text-red-500 mb-2 uppercase tracking-wider">
          DATABASE CONNECTION ERROR
        </h1>
        <p className="text-xs text-gray-400 max-w-md leading-relaxed mb-6">
          The system was unable to establish a secure link with the cloud database. Verify that all environment variables (DATABASE_URL, DIRECT_URL) are correctly loaded in Vercel.
        </p>
        <div className="text-[10px] text-gray-500 bg-black/40 px-4 py-2 rounded-lg border border-white/5">
          STATUS: OFFLINE // {data?.error || "ERR_NULL_PAYLOAD"}
        </div>
      </div>
    );
  }

  const { profile, settings, education, skills, projects, certifications, articles } = data;

  // Filter lists
  const filteredCerts = certifications.filter((c: any) => certFilter === "all" || c.category === certFilter);

  // Find current pursuing qualification CGPA based on timeline keywords (Expected, Present, Pursuing)
  const currentCgpa = (() => {
    if (!education || education.length === 0) return "N/A";
    const active = education.find((edu: any) => {
      const dur = (edu.duration || "").toLowerCase();
      return dur.includes("expected") || dur.includes("present") || dur.includes("pursuing");
    });
    return active ? active.grade : education[education.length - 1].grade;
  })();

  return (
    <AntiGravityCanvas>
      <BootLoader />
      <div id="top-portal" className="min-h-screen relative overflow-hidden select-none">
        {/* Background elements */}
        <div className="scanlines"></div>
        <div className="animated-bg"></div>
      
      {/* Aurora Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00FF9D]/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#00C8FF]/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Dynamic Cursor Glow */}
      <div
        className="fixed hidden md:block pointer-events-none z-50 w-6 h-6 rounded-full border border-cyber-green/40 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 mix-blend-screen bg-cyber-green/5"
        style={{ left: cursorPos.x, top: cursorPos.y }}
      />
      <div
        className="fixed hidden md:block pointer-events-none z-40 w-72 h-72 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 bg-cyber-blue/5"
        style={{ left: cursorPos.x, top: cursorPos.y }}
      />

      {/* HEADER NAVIGATION */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#07111F]/60 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto rounded-b-[20px]">
        <a 
          href="#top-portal" 
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("top-portal")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <Shield className="text-cyber-green w-6 h-6 animate-pulse group-hover:scale-105 transition-transform" />
          <span className="font-orbitron font-black text-sm tracking-widest bg-gradient-to-r from-cyber-green to-cyber-blue bg-clip-text text-transparent group-hover:opacity-85 transition-opacity">
            {profile.name?.toUpperCase() || "GRID_AGENT"}
          </span>
        </a>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6 text-xs font-orbitron font-semibold tracking-wider text-gray-400">
            <a href="#about" onClick={(e) => handleNavClick(e, "about")} className="hover:text-cyber-green transition-colors">ABOUT</a>
            <a href="#qualifications" onClick={(e) => handleNavClick(e, "qualifications")} className="hover:text-cyber-green transition-colors">QUALIFICATIONS</a>
            <a href="#skills" onClick={(e) => handleNavClick(e, "skills")} className="hover:text-cyber-green transition-colors">SKILLS</a>
            <a href="#projects" onClick={(e) => handleNavClick(e, "projects")} className="hover:text-cyber-green transition-colors">PROJECTS</a>
            <a href="#certifications" onClick={(e) => handleNavClick(e, "certifications")} className="hover:text-cyber-green transition-colors">CERTIFICATES</a>
            <a href="#contact" onClick={(e) => handleNavClick(e, "contact")} className="hover:text-cyber-green transition-colors">CONTACT</a>
          </nav>
          <div className="flex items-center gap-2">
            {/* CTF Security Challenge Trigger */}
            <button
              onClick={() => setCtfModalOpen(true)}
              className="px-2.5 py-1.5 rounded-lg border border-cyber-blue/40 bg-black/40 text-cyber-blue hover:bg-cyber-blue/10 transition-all flex items-center gap-1.5 text-xs font-mono cursor-pointer"
              title="Launch CTF Security Audit Challenge"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-cyber-blue" />
              <span className="hidden lg:inline">CTF AUDIT</span>
            </button>

            <button
              onClick={() => setIsPaletteOpen(true)}
              className="px-2.5 py-1.5 rounded-lg border border-white/10 hover:border-cyber-green/40 bg-black/40 text-gray-400 hover:text-cyber-green transition-all flex items-center gap-1.5 text-xs font-mono"
              title="Search Dossier (Ctrl + K)"
            >
              <Search className="w-3.5 h-3.5 text-cyber-green" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden sm:inline px-1 py-0.5 rounded bg-white/10 text-[9px]">Ctrl+K</kbd>
            </button>

            <button
              onClick={() => setIsTerminalOpen(true)}
              className="p-1.5 rounded-lg border border-white/10 hover:border-cyber-green/40 bg-black/40 text-gray-400 hover:text-cyber-green transition-all"
              title="Open Hacker Console (~)"
            >
              <Terminal className="w-4 h-4 text-cyber-green" />
            </button>

            <a href="/admin/login" className="btn-cyber flex items-center gap-1.5 px-3.5 py-1.5 border-cyber-blue/50 text-cyber-blue text-xs hover:shadow-[0_0_15px_#00C8FF]">
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ADMIN</span>
            </a>

            {/* Mobile Navigation Toggle Button */}
            <button
              onClick={() => setIsMobileNavOpen((prev) => !prev)}
              className="p-1.5 rounded-lg border border-white/10 hover:border-cyber-green/40 bg-black/40 text-gray-400 hover:text-cyber-green transition-all md:hidden"
              aria-label="Toggle Mobile Navigation Menu"
            >
              {isMobileNavOpen ? <X className="w-5 h-5 text-cyber-green" /> : <Menu className="w-5 h-5 text-cyber-green" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileNavOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden mt-4 pt-4 border-t border-white/10 flex flex-col gap-3 font-orbitron text-xs font-semibold tracking-wider text-gray-300 bg-[#07111F]/95 p-4 rounded-xl shadow-2xl"
            >
              <a
                href="#about"
                onClick={(e) => handleNavClick(e, "about")}
                className="hover:text-cyber-green transition-colors py-1.5 border-b border-white/5"
              >
                ABOUT
              </a>
              <a
                href="#qualifications"
                onClick={(e) => handleNavClick(e, "qualifications")}
                className="hover:text-cyber-green transition-colors py-1.5 border-b border-white/5"
              >
                QUALIFICATIONS
              </a>
              <a
                href="#skills"
                onClick={(e) => handleNavClick(e, "skills")}
                className="hover:text-cyber-green transition-colors py-1.5 border-b border-white/5"
              >
                SKILLS
              </a>
              <a
                href="#projects"
                onClick={(e) => handleNavClick(e, "projects")}
                className="hover:text-cyber-green transition-colors py-1.5 border-b border-white/5"
              >
                PROJECTS
              </a>
              <a
                href="#certifications"
                onClick={(e) => handleNavClick(e, "certifications")}
                className="hover:text-cyber-green transition-colors py-1.5 border-b border-white/5"
              >
                CERTIFICATES
              </a>
              <a
                href="#contact"
                onClick={(e) => handleNavClick(e, "contact")}
                className="hover:text-cyber-green transition-colors py-1.5"
              >
                CONTACT
              </a>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-16 space-y-24">
        {/* HERO SECTION */}
        <section className="min-h-[75vh] flex flex-col md:flex-row items-center justify-between gap-12 py-8 relative">
          <div className="flex-1 space-y-6 text-left">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="cyber-tag flex gap-1.5 items-center w-fit">
                <span className="w-1.5 h-1.5 bg-cyber-green rounded-full animate-pulse"></span>
                STATUS: GRID SECURE // ACTIVE
              </div>
              {ctfBadgeUnlocked && (
                <div className="cyber-tag border-cyber-green bg-cyber-green/10 text-cyber-green flex items-center gap-1 font-bold text-[10px] animate-bounce">
                  <ShieldCheck className="w-3.5 h-3.5" /> INTERNAL SECURITY VERIFIED
                </div>
              )}
            </div>


            <h1 className="text-4xl md:text-6xl font-orbitron font-black text-white leading-tight">
              I am <span className="holo-text">{profile.name}</span>
            </h1>
            <div className="font-mono text-sm md:text-lg text-cyber-blue h-8 flex items-center">
              <span>{typedText}</span>
              <span className="w-2 h-4 bg-cyber-blue ml-1 animate-pulse"></span>
            </div>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-xl">
              {profile.tagline}
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <a href={profile.resumeUrl} download className="btn-cyber flex items-center gap-2">
                <Download className="w-4 h-4" /> DOWNLOAD RESUME
              </a>
              <a href="#contact" className="btn-cyber btn-cyber-blue flex items-center gap-2">
                <Mail className="w-4 h-4" /> CONTACT GATEWAY
              </a>
            </div>
          </div>
          <div className="flex-1 flex justify-center relative">
            <div className="absolute inset-[-10px] border border-cyber-green/20 rounded-[20px] pointer-events-none"></div>
            <div className="absolute inset-[-20px] border border-cyber-blue/10 rounded-[20px] pointer-events-none"></div>
            <div 
              className="w-72 h-72 md:w-96 md:h-96 rounded-[20px] overflow-hidden glass-card hud-box p-3 relative transition-all duration-500"
              style={{
                borderColor: profile.profileImageBorderColor || '#00FF9D',
                boxShadow: `0 0 20px ${profile.profileImageBorderColor || '#00FF9D'}`
              }}
            >
              <div className="absolute inset-0 bg-cyber-green/5 mix-blend-color pointer-events-none z-10"></div>
              <img
                src={profile.profileImageUrl || "/placeholder_profile.png"}
                alt={profile.name}
                className="w-full h-full object-cover rounded-[12px] transition-all duration-500"
                style={{
                  filter: `grayscale(${profile.profileImageGrayscale ?? 100}%)`,
                  transform: `scale(${profile.profileImageScale ?? 1.0})`
                }}
              />
            </div>
          </div>
        </section>

        {/* ACHIEVEMENTS / COUNTERS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Certifications */}
          <div className="glass-card hud-box p-6 flex flex-col items-center justify-center text-center gap-2">
            <div className="text-cyber-green mb-1">{getIcon("Award")}</div>
            <span className="font-orbitron font-black text-2xl md:text-4xl text-white shadow-glow">
              {certifications?.length || 0}
            </span>
            <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">
              Certifications Verified
            </span>
          </div>

          {/* Card 2: Projects */}
          <div className="glass-card hud-box p-6 flex flex-col items-center justify-center text-center gap-2">
            <div className="text-cyber-green mb-1">{getIcon("Code")}</div>
            <span className="font-orbitron font-black text-2xl md:text-4xl text-white shadow-glow">
              {projects?.length || 0}
            </span>
            <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">
              Security Projects Completed
            </span>
          </div>

          {/* Card 3: Current CGPA */}
          <div className="glass-card hud-box p-6 flex flex-col items-center justify-center text-center gap-2">
            <div className="text-cyber-green mb-1">{getIcon("BookOpen")}</div>
            <span className="font-orbitron font-black text-2xl md:text-4xl text-white shadow-glow">
              {currentCgpa}
            </span>
            <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">
              Current Qualification CGPA
            </span>
          </div>
        </section>

        {/* ABOUT ME SECTION */}
        <section id="about" className="space-y-6 scroll-mt-24">
          <div className="flex items-center gap-3">
            <h2 className="font-orbitron text-2xl md:text-3xl font-black text-white">SYSTEM_DOSSIER // ABOUT</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-cyber-green/40 to-transparent"></div>
          </div>
          <div className="glass-card p-6 md:p-8 space-y-6 leading-relaxed text-gray-300 text-sm">
            <p>{profile.bio}</p>
            <div className="border-t border-white/5 pt-6 space-y-3 font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between py-2 border-b border-white/5 gap-2">
                <span className="text-gray-400 font-bold shrink-0">OBJECTIVE:</span>
                <span className="text-white text-left max-w-xl leading-relaxed">{profile.careerObjective}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-gray-400 font-bold">LOCATION:</span>
                <span className="text-white">{profile.location}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-gray-400 font-bold">EMAIL:</span>
                <span className="text-cyber-blue font-bold">{profile.email}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-400 font-bold">PHONE:</span>
                <span className="text-white">{profile.phone}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ACADEMIC LOG // QUALIFICATIONS */}
        <TimelineSection education={education} />

        {/* SKILLS SECTION */}
        <SkillsVisualization skills={skills} />

        {/* PROJECTS SECTION */}
        <section id="projects" className="space-y-6 scroll-mt-24">
          <div className="flex items-center gap-3">
            <h2 className="font-orbitron text-2xl md:text-3xl font-black text-white">ENGINEERING_LOGS // PROJECTS</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-cyber-blue/40 to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project: any) => (
              <div key={project.id} className="glass-card hud-box p-6 flex flex-col gap-4">
                <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/5 bg-black/40 relative group">
                  <div className="absolute inset-0 bg-[#07111F]/80 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-all duration-300 backdrop-blur-sm z-20 p-3 flex-wrap">
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setProjectTab("details");
                      }}
                      className="btn-cyber flex items-center gap-1.5 px-3 py-2 border-cyber-green text-cyber-green text-xs"
                    >
                      <Eye className="w-4 h-4" /> VIEW SPEC
                    </button>
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-cyber flex items-center gap-1.5 px-3.5 py-2 bg-cyber-green/20 border-cyber-green text-cyber-green text-xs font-bold shadow-[0_0_10px_rgba(0,255,157,0.3)] hover:bg-cyber-green hover:text-black transition-all"
                      >
                        <Globe className="w-4 h-4" /> VIEW PROJECT
                      </a>
                    )}
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noreferrer" className="btn-cyber btn-cyber-blue flex items-center gap-1.5 px-3 py-2 text-xs">
                        <ExternalLink className="w-4 h-4" /> SOURCE
                      </a>
                    )}
                  </div>
                  <img
                    src={project.imageUrl || "/placeholder_project.jpg"}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded bg-[#07111F]/90 border border-cyber-blue/40 text-[9px] font-mono text-cyber-blue font-bold tracking-widest uppercase">
                    {project.category}
                  </div>
                </div>
                <div className="space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-orbitron font-bold text-lg text-white group-hover:text-cyber-green transition-colors">{project.title}</h3>
                      <span className="cyber-tag text-[9px] border-emerald-500/20 text-cyber-green">{project.status?.toUpperCase()}</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{project.description}</p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {ensureArray(project.tags).map((tag: string) => (
                        <span key={tag} className="cyber-tag text-[8.5px] border-white/10 text-gray-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5 font-mono text-xs mt-2">
                    {project.liveUrl ? (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-cyber-green hover:underline font-bold text-[11px]"
                      >
                        <Globe className="w-3.5 h-3.5" /> VIEW PROJECT <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-gray-500 text-[10px]">INTERNAL DOSSIER</span>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-cyber-blue hover:underline text-[11px]"
                      >
                        <Code className="w-3.5 h-3.5" /> REPOSITORY
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>



        {/* CERTIFICATIONS SECTION */}
        <CertificationsSection certifications={certifications} />

        {/* ENGINEERING BLOG SECTION */}
        <BlogSection articles={articles} />

        {/* EXECUTIVE DOSSIER EXPORT */}
        <DossierExport data={data} />


        {/* CONTACT SECTION */}
        <section id="contact" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start scroll-mt-24">
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="font-orbitron text-2xl md:text-3xl font-black text-white">SECURE_CHANNEL // CONTACT</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-cyber-green/40 to-transparent"></div>
            </div>
            <div className="glass-card p-6 md:p-8 space-y-6">
              <p className="text-xs text-gray-400 leading-relaxed">
                Secure communications protocol initialized. Submit the adjacent packet form to route messages to {profile.name || "Alex Thorne"}'s mailbox. Cryptographic signature and source IP verification logged on transmit.
              </p>
              <div className="space-y-4 font-mono text-xs text-gray-300">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-cyber-green" />
                  <a href={`mailto:${profile.email}`} className="hover:underline">{profile.email}</a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-cyber-green" />
                  <span>{profile.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-cyber-green" />
                  <span>{profile.location}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="font-orbitron text-2xl md:text-3xl font-black text-white">TRANSMIT_PACKET // INPUT</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-cyber-blue/40 to-transparent"></div>
            </div>
            <form onSubmit={handleContactSubmit} className="glass-card p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-gray-400 uppercase">Agent Name</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="Enter name"
                    className="w-full bg-[#040a12]/80 border border-white/10 rounded-lg px-4 py-3 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-cyber-green focus:shadow-[0_0_10px_rgba(0,255,157,0.1)] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-gray-400 uppercase">Routing Email</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="Enter email address"
                    className="w-full bg-[#040a12]/80 border border-white/10 rounded-lg px-4 py-3 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-cyber-green focus:shadow-[0_0_10px_rgba(0,255,157,0.1)] transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-gray-400 uppercase">Payload Subject</label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  placeholder="Enter message header"
                  className="w-full bg-[#040a12]/80 border border-white/10 rounded-lg px-4 py-3 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-cyber-green focus:shadow-[0_0_10px_rgba(0,255,157,0.1)] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-gray-400 uppercase">Message Block</label>
                <textarea
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="Enter message logs..."
                  className="w-full bg-[#040a12]/80 border border-white/10 rounded-lg px-4 py-3 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-cyber-green focus:shadow-[0_0_10px_rgba(0,255,157,0.1)] transition-all resize-none"
                />
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-4 justify-between pt-2">
                <div className="text-xs font-mono">
                  {formStatus.type === "success" && (
                    <span className="text-cyber-green font-bold">{formStatus.text}</span>
                  )}
                  {formStatus.type === "error" && (
                    <span className="text-rose-500 font-bold">{formStatus.text}</span>
                  )}
                  {formStatus.type === "submitting" && (
                    <span className="text-cyber-blue flex items-center gap-1.5 animate-pulse">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> {formStatus.text}
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={formStatus.type === "submitting"}
                  className="btn-cyber flex items-center gap-2 self-end"
                >
                  TRANSMIT PACKET
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#040a12]/60 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Shield className="text-cyber-green w-5 h-5" />
            <span className="font-orbitron font-bold text-xs tracking-wider text-gray-400">
              {settings.footerText || "Grid Security Matrix"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-6 font-mono text-[11px] text-gray-400">
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 hover:text-cyber-green transition-colors group"
            >
              <svg className="w-4 h-4 fill-current text-gray-400 group-hover:text-cyber-green transition-colors" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GITHUB</span>
            </a>

            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 hover:text-cyber-blue transition-colors group"
            >
              <svg className="w-4 h-4 fill-current text-gray-400 group-hover:text-cyber-blue transition-colors" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
              <span>LINKEDIN</span>
            </a>

            <a
              href={profile.twitter}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 hover:text-cyber-blue transition-colors group"
            >
              <svg className="w-4 h-4 fill-current text-gray-400 group-hover:text-cyber-blue transition-colors" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>TWITTER</span>
            </a>

            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-2 hover:text-cyber-green transition-colors group"
            >
              <svg className="w-4 h-4 fill-current text-gray-400 group-hover:text-cyber-green transition-colors" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              <span>EMAIL</span>
            </a>
          </div>
          <div className="text-[10px] font-mono text-gray-600">
            © {new Date().getFullYear()} {profile.name || "Alex Thorne"}. All operations verified.
          </div>
        </div>
      </footer>

      {/* Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-20 right-6 z-40 p-3 rounded-full bg-[#07111F]/90 border border-cyber-green/50 text-cyber-green hover:bg-cyber-green/20 transition-all shadow-[0_0_15px_#00FF9D] cursor-pointer"
            title="Scroll back to top"
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* PROJECT DETAILED SPEC MODAL */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-4xl glass-card border-cyber-green/30 bg-[#07111F]/95 p-6 md:p-8 flex flex-col max-h-[90vh] overflow-y-auto relative hud-box"
            >
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4 pr-8">
                  <div>
                    <div className="cyber-tag text-[9px] border-cyber-blue/30 text-cyber-blue font-bold uppercase tracking-wider mb-2">
                      PROJECT DATA DOSSIER // {selectedProject.id}
                    </div>
                    <h2 className="font-orbitron font-black text-2xl md:text-3xl text-white">{selectedProject.title}</h2>
                    <p className="font-mono text-[10px] text-cyber-green uppercase mt-1">{selectedProject.role}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {selectedProject.liveUrl && (
                      <a
                        href={selectedProject.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-cyber flex items-center gap-2 px-5 py-2.5 bg-cyber-green/20 border-cyber-green text-cyber-green font-bold hover:bg-cyber-green hover:text-black transition-all shadow-[0_0_15px_rgba(0,255,157,0.3)] text-xs"
                      >
                        <Globe className="w-4 h-4" /> VIEW DEPLOYED PROJECT <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {selectedProject.githubUrl && (
                      <a
                        href={selectedProject.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-cyber btn-cyber-blue flex items-center gap-2 px-4 py-2.5 text-xs"
                      >
                        <Code className="w-4 h-4" /> REPOSITORY
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex border-b border-white/10 pb-px gap-6 font-orbitron text-xs font-bold tracking-wider">
                  <button
                    onClick={() => setProjectTab("details")}
                    className={`pb-2 border-b-2 transition-colors ${projectTab === "details" ? "border-cyber-green text-cyber-green" : "border-transparent text-gray-400 hover:text-white"}`}
                  >
                    OVERVIEW & CHALLENGES
                  </button>
                  <button
                    onClick={() => setProjectTab("logs")}
                    className={`pb-2 border-b-2 transition-colors ${projectTab === "logs" ? "border-cyber-green text-cyber-green" : "border-transparent text-gray-400 hover:text-white"}`}
                  >
                    SYSTEM EXECUTION LOGS
                  </button>
                </div>

                {projectTab === "details" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start text-sm">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-orbitron text-xs text-white tracking-widest uppercase">Project Overview</h4>
                        <p className="text-xs text-gray-400 leading-relaxed">{selectedProject.fullDescription}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {ensureArray(selectedProject.tags).map((t: string) => (
                          <span key={t} className="cyber-tag text-[8px]">{t}</span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-rose-950/10 border border-rose-500/20 rounded-xl space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-rose-500 uppercase font-orbitron">
                          <ShieldCheck className="w-4 h-4 text-rose-500" /> Critical Impediments
                        </div>
                        <ul className="list-disc pl-4 space-y-1.5 text-xs text-gray-400 leading-relaxed">
                          {ensureArray(selectedProject.challenges).map((c: string, idx: number) => (
                            <li key={idx}>{c}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 bg-cyber-green/5 border border-cyber-green/20 rounded-xl space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-cyber-green uppercase font-orbitron">
                          <Check className="w-4 h-4 text-cyber-green" /> Engineering Countermeasures
                        </div>
                        <ul className="list-disc pl-4 space-y-1.5 text-xs text-gray-400 leading-relaxed">
                          {ensureArray(selectedProject.solutions).map((s: string, idx: number) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-orbitron text-xs text-white tracking-widest uppercase">Console Diagnostics Output</h4>
                      <span className="cyber-tag text-[8px] bg-cyber-green/5 border-cyber-green/30 text-cyber-green font-bold">TERMINAL ON // STREAMING</span>
                    </div>
                    <div className="bg-black/80 border border-white/5 rounded-xl p-4 font-mono text-[10px] space-y-2 overflow-x-auto text-gray-400 leading-relaxed max-h-[300px]">
                      {ensureArray(selectedProject.logs).map((log: string, idx: number) => {
                        let color = "text-gray-400";
                        if (log.startsWith("[OK]")) color = "text-cyber-green";
                        if (log.startsWith("[WARN]")) color = "text-amber-400";
                        if (log.startsWith("[ACT]")) color = "text-cyber-blue animate-pulse";
                        return (
                          <div key={idx} className={color}>
                            {log}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CommandPalette data={data} isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />
      <TerminalModal data={data} isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} />
      <AIAssistantWidget data={data} />
      <CTFChallengeModal isOpen={ctfModalOpen} onClose={() => setCtfModalOpen(false)} onSuccessBadge={() => setCtfBadgeUnlocked(true)} />
    </div>
    </AntiGravityCanvas>
  );
}
