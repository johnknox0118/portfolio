"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, ShieldCheck, Terminal, Code, Award, Trophy, Flag, Flame, Cpu, 
  Globe, Activity, Settings, Database, BookOpen, Users, Gamepad2, 
  FileCode, Brain, Medal, Mail, Phone, MapPin, Menu, X, ExternalLink, 
  Lock, Download, Eye, Loader2, Check, ChevronUp, Camera, FileText,
  Box, ShieldAlert, Laptop, Server, Wifi, Unlock, Key, FileCheck, Layers, GitBranch,
  Search, Zap, Play, Pause, HelpCircle, AlertTriangle, Coffee, CodeXml, FileJson,
  Fingerprint, MessagesSquare, Crown
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
import AntiGravityFloatCard from "@/components/three/AntiGravityFloatCard";
import SectionDivider from "@/components/SectionDivider";
import GlobalClickRipple from "@/components/GlobalClickRipple";
import MorphingGlassBlobs from "@/components/MorphingGlassBlobs";
import SmoothScrollProvider, { smoothScrollTo } from "@/components/SmoothScrollProvider";
import CyberSectionWrapper from "@/components/cyber/CyberSectionWrapper";
import AboutFloatingCard3D from "@/components/cyber/AboutFloatingCard3D";
import Cyber3DCard from "@/components/cyber/Cyber3DCard";
import SectionProgress from "@/components/SectionProgress";
import ProjectStack from "@/components/ProjectStack";
import Navbar from "@/components/Navbar";
import Cyber3DButtonBox from "@/components/cyber/Cyber3DButtonBox";
import { LetterFormationText, MorphingText, FlipText, IAm3DText } from "@/components/text/AnimatedTypography";

const ContactNetworkOrb = dynamic(() => import("@/components/ContactNetworkOrb"), {
  ssr: false,
});
const HeroNetworkGlobe = dynamic(() => import("@/components/three/HeroNetworkGlobe"), {
  ssr: false,
});
const SkillsOrbitField = dynamic(() => import("@/components/three/SkillsOrbitField"), {
  ssr: false,
});


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

  // Helper to ensure all external URLs start with a valid protocol
  const ensureUrl = (url?: string) => {
    if (!url) return "#";
    const trimmed = url.trim();
    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("mailto:") ||
      trimmed.startsWith("#")
    ) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [originBounds, setOriginBounds] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [projectTab, setProjectTab] = useState("details");
  
  // Command Palette & Terminal States
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  // CTF Challenge Modal & Achievement Badge State
  const [ctfModalOpen, setCtfModalOpen] = useState(false);
  const [ctfBadgeUnlocked, setCtfBadgeUnlocked] = useState(false);

  // Keyboard shortcut listener for Ctrl+K / Cmd+K and `~` key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.key) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
      if (e.key === "`" || e.key === "~") {
        e.preventDefault();
        setIsTerminalOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSelectedProject(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
    let isFetching = false;

    // Fetch aggregate portfolio data with automatic retry
    const loadPortfolioData = (attempt = 1) => {
      if (isFetching) return;
      isFetching = true;
      fetch("/api/public/data?t=" + Date.now())
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((payload) => {
          setData(payload);
          setLoading(false);
          isFetching = false;
        })
        .catch((err) => {
          console.warn(`Portfolio data fetch attempt ${attempt} failed:`, err);
          isFetching = false;
          if (attempt < 3) {
            setTimeout(() => loadPortfolioData(attempt + 1), 600);
          } else {
            setLoading(false);
            console.error("Failed to load portfolio after retries:", err);
          }
        });
    };

    loadPortfolioData();

    // Live Cross-Tab & Admin Synchronization
    let syncChannel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      try {
        syncChannel = new BroadcastChannel("portfolio_sync");
        syncChannel.onmessage = () => {
          loadPortfolioData();
        };
      } catch (e) {
        // Fallback gracefully if BroadcastChannel is blocked
      }
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "portfolio_sync_timestamp") {
        loadPortfolioData();
      }
    };

    window.addEventListener("storage", handleStorage);

    // Scroll display scroll-to-top button
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", handleStorage);
      if (syncChannel) {
        syncChannel.close();
      }
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

  // Professional roles for MorphingText (#7)
  const morphingPhrases = (() => {
    if (data?.profile?.typingPhrases) {
      const parsed = data.profile.typingPhrases
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
      if (parsed.length > 0) return parsed;
    }
    const roleTitle = data?.profile?.title?.toUpperCase();
    return [
      roleTitle || "CYBERSECURITY ENGINEER",
      "DEFENSIVE SYSTEMS ARCHITECT",
      "FULL-STACK SOFTWARE DEVELOPER",
      "CLOUD & API SECURITY SPECIALIST",
      "VULNERABILITY & THREAT RESEARCHER",
    ];
  })();

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
    <SmoothScrollProvider>
      <GlobalClickRipple />
      <AntiGravityCanvas>
        <BootLoader />
        <div id="portal-root" className="min-h-screen relative overflow-hidden select-none">
          {/* Morphing glass blobs for atmospheric depth */}
          <MorphingGlassBlobs />

          {/* Background elements */}
          <div className="animated-bg"></div>
        
          {/* Aurora Background Glows */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00FF9D]/5 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#00C8FF]/5 rounded-full blur-[120px] pointer-events-none"></div>

          {/* HEADER NAVIGATION */}
          <Navbar
            profile={profile}
            onCtfClick={() => setCtfModalOpen(true)}
            onSearchClick={() => setIsPaletteOpen(true)}
            onTerminalClick={() => setIsTerminalOpen(true)}
            ctfBadgeUnlocked={ctfBadgeUnlocked}
          />

      {/* Floating Section Progress Navigation (Animation #64) */}
      <SectionProgress />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-24 sm:pt-28 pb-16 space-y-16 sm:space-y-24 overflow-x-hidden">
        {/* HERO SECTION */}
        <section id="top-portal" className="min-h-[75vh] py-8 relative">
          {/* 3D wireframe network globe — decorative background layer only */}
          <HeroNetworkGlobe />

          <div className="w-full relative flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 z-20">
            <div className="flex-1 lg:flex-[1.4] space-y-0 text-left relative z-20 pointer-events-auto max-w-3xl">
              <div className="flex flex-wrap gap-2 items-center mb-6">
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

              <div className="mb-2" style={{ perspective: 1000, transformStyle: "preserve-3d" }}>
                <IAm3DText />
              </div>

              <h1 
                aria-label={profile.name || "Johnknox Kalle"}
                className="text-3xl sm:text-5xl md:text-6xl lg:text-[3.75rem] xl:text-[4.25rem] leading-[1.15] select-text mb-5 sm:mb-6"
              >
                <LetterFormationText text={profile.name || "Johnknox Kalle"} />
              </h1>

              <div className="min-h-8 md:min-h-10 flex items-center mb-7">
                <MorphingText phrases={morphingPhrases} glowColor="cyan" />
              </div>

              <p className="font-bold text-gray-200 text-sm md:text-base leading-relaxed max-w-xl mb-8 tracking-wide">
                {profile.tagline}
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-5 pt-2 relative z-40 pointer-events-auto w-full sm:w-auto">
                <Cyber3DButtonBox
                  href={ensureUrl(profile.resumeUrl)}
                  download="Johnknox_Kalle_Resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  label="DOWNLOAD RESUME"
                  icon={<Download className="w-4 h-4" />}
                  variant="green"
                  floatDelay={0}
                  onClick={(e) => {
                    if (!profile.resumeUrl) return;
                    e.preventDefault();
                    const resumeUrl = ensureUrl(profile.resumeUrl);
                    const filename = profile.resumeUrl.split("/").pop() || "Johnknox_Kalle_Resume.pdf";
                    fetch(resumeUrl)
                      .then((res) => {
                        if (!res.ok) throw new Error("Failed to fetch file");
                        return res.blob();
                      })
                      .then((blob) => {
                        const blobUrl = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = blobUrl;
                        a.download = filename.toLowerCase().endsWith(".pdf") ? filename : `${filename}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(blobUrl);
                      })
                      .catch(() => {
                        window.open(resumeUrl, "_blank", "noopener,noreferrer");
                      });
                  }}
                />
                <Cyber3DButtonBox
                  href="#contact"
                  label="CONTACT GATEWAY"
                  icon={<Mail className="w-4 h-4" />}
                  variant="blue"
                  floatDelay={0.75}
                  onClick={(e) => {
                    e.preventDefault();
                    smoothScrollTo("#contact", { offset: 0, duration: 1.2 });
                  }}
                />
              </div>
            </div>
            <div className="flex-1 lg:flex-[0.8] flex justify-center relative z-10 mt-8 lg:mt-0">
              <AntiGravityFloatCard>
                <div className="relative">
                  <div className="absolute inset-[-10px] border border-cyber-green/20 rounded-[20px] pointer-events-none"></div>
                  <div className="absolute inset-[-20px] border border-cyber-blue/10 rounded-[20px] pointer-events-none"></div>
                  <div 
                    className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 max-w-[85vw] max-h-[85vw] rounded-[20px] overflow-hidden glass-card hud-box p-3 relative transition-all duration-500"
                    style={{
                      borderColor: profile.profileImageBorderColor || '#00FF9D',
                      boxShadow: `0 0 20px ${profile.profileImageBorderColor || '#00FF9D'}`
                    }}
                  >
                    <div className="absolute inset-0 bg-cyber-green/5 mix-blend-color pointer-events-none z-10"></div>
                    {/* Realistic Continuous Diagonal Glass Shine Reflection Sweep (Top-Right to Bottom-Left) */}
                    <div className="pointer-events-none absolute inset-0 rounded-[20px] overflow-hidden z-25">
                      <div className="glass-shine-beam" />
                    </div>
                    <img
                      src={profile.profileImageUrl || "/uploads/1783845930934_johnknox__2_.jpg"}
                      alt={profile.name}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes("johnknox__2_")) {
                          target.src = "/uploads/1783845930934_johnknox__2_.jpg";
                        }
                      }}
                      className="w-full h-full object-cover rounded-[12px] transition-all duration-500"
                      style={{
                        filter: `grayscale(${profile.profileImageGrayscale ?? 100}%)`,
                        transform: `scale(${profile.profileImageScale ?? 1.0})`
                      }}
                    />
                  </div>
                </div>
              </AntiGravityFloatCard>
            </div>
          </div>
        </section>

        {/* ACHIEVEMENTS / COUNTERS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Certifications */}
          <Cyber3DCard glowColor="green" index={0} depth={180} className="h-full">
            <div className="glass-card hud-box glass-shine card-spotlight p-6 flex flex-col items-center justify-center text-center gap-2 h-full">
              <div className="text-cyber-green mb-1">{getIcon("Award")}</div>
              <span className="font-orbitron font-black text-2xl md:text-4xl text-white shadow-glow">
                {certifications?.length || 0}
              </span>
              <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">
                Certifications Verified
              </span>
            </div>
          </Cyber3DCard>

          {/* Card 2: Projects */}
          <Cyber3DCard glowColor="green" index={1} depth={180} className="h-full">
            <div className="glass-card hud-box glass-shine card-spotlight p-6 flex flex-col items-center justify-center text-center gap-2 h-full">
              <div className="text-cyber-green mb-1">{getIcon("Code")}</div>
              <span className="font-orbitron font-black text-2xl md:text-4xl text-white shadow-glow">
                {projects?.length || 0}
              </span>
              <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">
                Security Projects Completed
              </span>
            </div>
          </Cyber3DCard>

          {/* Card 3: Current CGPA */}
          <Cyber3DCard glowColor="green" index={2} depth={180} className="h-full">
            <div className="glass-card hud-box glass-shine card-spotlight p-6 flex flex-col items-center justify-center text-center gap-2 h-full">
              <div className="text-cyber-green mb-1">{getIcon("BookOpen")}</div>
              <span className="font-orbitron font-black text-2xl md:text-4xl text-white shadow-glow">
                {currentCgpa}
              </span>
              <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">
                Current Qualification CGPA
              </span>
            </div>
          </Cyber3DCard>
        </div>

        {/* ABOUT ME SECTION */}
        <CyberSectionWrapper id="about" className="space-y-6" variant="cinematic">
          <div className="space-y-3">
            <FlipText as="h2" text="SYSTEM DOSSIER" subtitle="// ABOUT" className="text-2xl md:text-3xl" />
            <SectionDivider color="green" />
          </div>
          <AboutFloatingCard3D profile={profile} />
        </CyberSectionWrapper>

        {/* ACADEMIC LOG // QUALIFICATIONS */}
        <TimelineSection education={education} />

        {/* SKILLS SECTION */}
        <div className="relative">
          {/* 3D orbiting constellation — subtle decorative background layer only on desktop */}
          <div className="hidden md:block">
            <SkillsOrbitField />
          </div>
          <div className="relative z-10">
            <SkillsVisualization skills={skills} />
          </div>
        </div>

        {/* PROJECTS SECTION */}
        <CyberSectionWrapper id="projects" className="space-y-6" variant="cinematic">
          <div className="space-y-3">
            <FlipText as="h2" text="ENGINEERING LOGS" subtitle="// PROJECTS" className="text-2xl md:text-3xl" />
            <SectionDivider color="blue" />
          </div>
          <ProjectStack
            projects={projects}
            onSelectProject={(project, bounds) => {
              setOriginBounds(bounds || null);
              setSelectedProject(project);
              setProjectTab("details");
            }}
            ensureArray={ensureArray}
          />
        </CyberSectionWrapper>



        {/* CERTIFICATIONS SECTION */}
        <CertificationsSection certifications={certifications} />

        {/* ENGINEERING BLOG SECTION */}
        <BlogSection articles={articles} />

        {/* EXECUTIVE DOSSIER EXPORT */}
        <DossierExport data={data} />


        {/* CONTACT SECTION */}
        <CyberSectionWrapper id="contact" variant="fadeUp">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FlipText as="h2" text="SECURE CHANNEL" subtitle="// CONTACT" className="text-2xl md:text-3xl" />
                </div>
                <SectionDivider color="green" />
              </div>
              <Cyber3DCard glowColor="green" index={0} depth={220} className="h-full">
                <div className="glass-card animated-gradient-border p-6 md:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Secure communications protocol initialized. Submit the adjacent packet form to route messages to {profile.name || "John Knox"}'s mailbox. Cryptographic signature and source IP verification logged on transmit.
                    </p>
                    <div className="shrink-0 flex items-center justify-center">
                      <ContactNetworkOrb />
                    </div>
                  </div>
                  <div className="space-y-4 font-mono text-xs text-gray-300 pt-3 border-t border-white/5">
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
              </Cyber3DCard>
            </div>
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FlipText as="h2" text="TRANSMIT PACKET" subtitle="// INPUT" className="text-2xl md:text-3xl" />
                </div>
                <SectionDivider color="blue" />
              </div>
              <Cyber3DCard glowColor="blue" index={1} depth={220} className="h-full">
                <form onSubmit={handleContactSubmit} className="glass-card p-6 md:p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Agent Name</label>
                      <input
                        type="text"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="Enter name"
                        className="w-full bg-[#040a12]/80 border border-white/10 rounded-lg px-4 py-3 text-base sm:text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-cyber-green focus:shadow-[0_0_10px_rgba(0,255,157,0.1)] transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Routing Email</label>
                      <input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        placeholder="Enter email address"
                        className="w-full bg-[#040a12]/80 border border-white/10 rounded-lg px-4 py-3 text-base sm:text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-cyber-green focus:shadow-[0_0_10px_rgba(0,255,157,0.1)] transition-all"
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
                      className="w-full bg-[#040a12]/80 border border-white/10 rounded-lg px-4 py-3 text-base sm:text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-cyber-green focus:shadow-[0_0_10px_rgba(0,255,157,0.1)] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-gray-400 uppercase">Message Block</label>
                    <textarea
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Enter message logs..."
                      className="w-full bg-[#040a12]/80 border border-white/10 rounded-lg px-4 py-3 text-base sm:text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-cyber-green focus:shadow-[0_0_10px_rgba(0,255,157,0.1)] transition-all resize-none"
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
              </Cyber3DCard>
            </div>
          </div>
        </CyberSectionWrapper>
      </main>

      {/* FOOTER */}
      <footer className="relative z-20 border-t border-white/5 bg-[#040a12]/80 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Shield className="text-cyber-green w-5 h-5" />
            <span className="font-orbitron font-bold text-xs tracking-wider text-gray-400">
              {settings.footerText || "Grid Security Matrix"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] text-gray-400 relative z-30 pointer-events-auto">
            <a
              href={ensureUrl(profile.github || "https://github.com/johnknox0118")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-cyber-green/10 hover:border-cyber-green/50 hover:text-cyber-green social-icon-hover cursor-pointer transition-all duration-200"
            >
              <svg className="w-4 h-4 fill-current transition-colors" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GITHUB</span>
            </a>

            <a
              href={ensureUrl(profile.linkedin || "https://www.linkedin.com/in/john-knox-kalle-309b15301/")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-cyber-blue/10 hover:border-cyber-blue/50 hover:text-cyber-blue social-icon-hover cursor-pointer transition-all duration-200"
            >
              <svg className="w-4 h-4 fill-current transition-colors" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
              <span>LINKEDIN</span>
            </a>

            <a
              href={ensureUrl(profile.twitter || "https://x.com/johnknox0118")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/10 hover:border-white/50 hover:text-white social-icon-hover cursor-pointer transition-all duration-200"
            >
              <svg className="w-4 h-4 fill-current transition-colors" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>TWITTER</span>
            </a>

            <a
              href={`mailto:${profile.email || "johnknox.kalle@gmail.com"}`}
              onClick={() => {
                if (profile.email) {
                  navigator.clipboard?.writeText(profile.email);
                }
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-cyber-green/10 hover:border-cyber-green/50 hover:text-cyber-green social-icon-hover cursor-pointer transition-all duration-200"
              title={`Send email to ${profile.email || "johnknox.kalle@gmail.com"} (copies to clipboard)`}
            >
              <svg className="w-4 h-4 fill-current transition-colors" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              <span>EMAIL</span>
            </a>
          </div>
          <div className="text-[10px] font-mono text-gray-600">
            © {new Date().getFullYear()} {profile.name || "John Knox"}. All operations verified.
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
            onClick={() => smoothScrollTo(0, { duration: 1.0 })}
            className="fixed bottom-20 right-6 z-40 p-3 rounded-full bg-[#07111F]/90 border border-cyber-green/50 text-cyber-green hover:bg-cyber-green/20 transition-all shadow-[0_0_15px_#00FF9D] cursor-pointer"
            title="Scroll back to top"
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* PROJECT DETAILED SPEC MODAL */}
      <AnimatePresence>
        {selectedProject && (() => {
          const flipInitial = (() => {
            if (!originBounds || typeof window === "undefined") {
              return { scale: 0.94, opacity: 0, y: 20, x: 0 };
            }
            const modalTargetW = Math.min(896, window.innerWidth * 0.92);
            const modalTargetH = Math.min(window.innerHeight * 0.85, 750);
            const modalCenterX = window.innerWidth / 2;
            const modalCenterY = window.innerHeight / 2;

            const cardCenterX = originBounds.left + originBounds.width / 2;
            const cardCenterY = originBounds.top + originBounds.height / 2;

            const deltaX = cardCenterX - modalCenterX;
            const deltaY = cardCenterY - modalCenterY;
            const scale = Math.max(0.2, Math.min(originBounds.width / modalTargetW, originBounds.height / modalTargetH));

            return {
              x: deltaX,
              y: deltaY,
              scale: scale,
              opacity: 0.6,
            };
          })();

          const flipExit = (() => {
            if (!originBounds || typeof window === "undefined") {
              return { scale: 0.94, opacity: 0, y: 20, x: 0 };
            }
            const modalTargetW = Math.min(896, window.innerWidth * 0.92);
            const modalTargetH = Math.min(window.innerHeight * 0.85, 750);
            const modalCenterX = window.innerWidth / 2;
            const modalCenterY = window.innerHeight / 2;

            const cardCenterX = originBounds.left + originBounds.width / 2;
            const cardCenterY = originBounds.top + originBounds.height / 2;

            return {
              x: cardCenterX - modalCenterX,
              y: cardCenterY - modalCenterY,
              scale: Math.max(0.2, Math.min(originBounds.width / modalTargetW, originBounds.height / modalTargetH)) * 0.85,
              opacity: 0,
            };
          })();

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setSelectedProject(null)}
              className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md"
            >
              <motion.div
                initial={flipInitial}
                animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                exit={flipExit}
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                data-lenis-prevent="true"
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                className="w-full max-w-4xl glass-card border-cyber-green/30 bg-[#07111F]/95 p-4 sm:p-6 md:p-8 flex flex-col max-h-[90vh] overflow-y-auto relative hud-box shadow-[0_0_60px_rgba(0,255,157,0.18)] will-change-transform"
              >
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors cursor-pointer"
                >
                <X className="w-6 h-6" />
              </button>

              <div className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4 pr-8">
                  <div>
                    <div className="cyber-tag text-[9px] border-cyber-blue/30 text-cyber-blue font-bold uppercase tracking-wider mb-2">
                      PROJECT DATA DOSSIER // {selectedProject.id}
                    </div>
                    <h2 className="font-orbitron font-black text-xl sm:text-2xl md:text-3xl text-white break-words">{selectedProject.title}</h2>
                    <p className="font-mono text-[10px] text-cyber-green uppercase mt-1">{selectedProject.role}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    {selectedProject.liveUrl && (
                      <a
                        href={selectedProject.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-cyber flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-cyber-green/20 border-cyber-green text-cyber-green font-bold hover:bg-cyber-green hover:text-black transition-all shadow-[0_0_15px_rgba(0,255,157,0.3)] text-xs"
                      >
                        <Globe className="w-4 h-4" /> VIEW DEPLOYED PROJECT <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {selectedProject.githubUrl && (
                      <a
                        href={selectedProject.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-cyber btn-cyber-blue flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-xs"
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
        );
      })()}
      </AnimatePresence>

      <CommandPalette data={data} isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />
      <TerminalModal data={data} isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} />
      <AIAssistantWidget data={data} />
      <CTFChallengeModal isOpen={ctfModalOpen} onClose={() => setCtfModalOpen(false)} onSuccessBadge={() => setCtfBadgeUnlocked(true)} />
      </div>
      </AntiGravityCanvas>
    </SmoothScrollProvider>
  );
}
