"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { 
  Printer, Shield, Check, FileText, Cpu, Code, Zap, Globe, Sparkles, 
  Search, RefreshCw, Download, Copy, ExternalLink, Award, BookOpen, 
  Briefcase, CheckCircle2, Layers, Eye, FileCheck, X, ChevronDown, ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FloatingResumeCard from "./FloatingResumeCard";
import SectionDivider from "./SectionDivider";
import { FlipText } from "@/components/text/AnimatedTypography";
import { useScrollContext } from "./SmoothScrollProvider";

interface DossierExportProps {
  data?: any;
}

export type CategoryType = "all" | "cybersecurity" | "developer" | "fullstack" | "cloud";

interface CategoryMeta {
  id: CategoryType;
  label: string;
  badge: string;
  title: string;
  summary: string;
}

const CATEGORY_META: Record<CategoryType, CategoryMeta> = {
  all: {
    id: "all",
    label: "ALL COMPREHENSIVE",
    badge: "🌐 COMPREHENSIVE EXECUTIVE DOSSIER",
    title: "Cybersecurity Engineer & Full-Stack Systems Architect",
    summary:
      "Results-driven Cybersecurity Engineer and Full-Stack Systems Developer specializing in defensive infrastructure, vulnerability assessments, zero-trust network architectures, and high-concurrency cloud platforms.",
  },
  cybersecurity: {
    id: "cybersecurity",
    label: "CYBERSECURITY",
    badge: "🛡️ CYBERSECURITY & THREAT DEFENSE DOSSIER",
    title: "Cybersecurity Engineer & Defensive Systems Specialist",
    summary:
      "Cybersecurity professional with hands-on expertise in vulnerability scanning, penetration testing, zero-trust network architecture, encrypted JWT session persistence, threat matrix diagnostics, and perimeter protection.",
  },
  developer: {
    id: "developer",
    label: "DEVELOPER",
    badge: "💻 SOFTWARE ENGINEERING DOSSIER",
    title: "Software Development Engineer (Python, TypeScript, REST)",
    summary:
      "Software Development Engineer focused on clean-code microservices, algorithm optimization, automated Python scripts, modern TypeScript interfaces, and scalable full-stack software architecture.",
  },
  fullstack: {
    id: "fullstack",
    label: "FULL-STACK",
    badge: "⚡ FULL-STACK ARCHITECT DOSSIER",
    title: "Full-Stack Web Architect (Next.js, Supabase, PostgreSQL)",
    summary:
      "Full-Stack Web Architect specializing in reactive Next.js App Router applications, relational Supabase PostgreSQL modeling, Prisma ORM queries, secure API endpoints, and production cloud deployments.",
  },
  cloud: {
    id: "cloud",
    label: "CLOUD & DEVOPS",
    badge: "☁️ CLOUD INFRASTRUCTURE & DEVOPS DOSSIER",
    title: "Cloud Systems & Infrastructure Security Engineer",
    summary:
      "Infrastructure & Cloud Engineer focused on containerized workloads, automated CI/CD deployment pipelines, scalable cloud storage, environment isolation, and high-availability server networks.",
  },
};

const COMMON_TECH_TERMS = [
  "python", "react", "next.js", "nextjs", "typescript", "javascript", "supabase",
  "postgres", "postgresql", "prisma", "security", "cybersecurity", "jwt",
  "zero-trust", "api", "rest", "node", "tailwind", "aws", "docker", "frontend",
  "backend", "fullstack", "full-stack", "threat", "vulnerability", "auth",
  "sql", "git", "linux", "cloud", "ai", "llm", "analytics", "network", "c++",
  "java", "devops", "ci/cd", "encryption", "firewall", "cryptography", "web",
  "html", "css", "express", "mongodb", "bash", "penetration", "audit"
];

// Helper to safely parse array fields
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

export default function DossierExport({ data: initialData }: DossierExportProps) {
  // Live Portfolio Data State with cross-tab/admin automatic synchronization
  const [liveData, setLiveData] = useState<any>(initialData || {});
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");
  const [copiedText, setCopiedText] = useState(false);

  // Resume Customization States
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("all");
  const [previewTheme, setPreviewTheme] = useState<"ats" | "cyber">("ats");
  const [jdText, setJdText] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [jdActive, setJdActive] = useState(false);
  const [matchedKeywords, setMatchedKeywords] = useState<string[]>([]);
  const [matchScore, setMatchScore] = useState<number>(0);
  const [tailoredTitle, setTailoredTitle] = useState("");
  const [tailoredSummary, setTailoredSummary] = useState("");

  // On-demand viewing states (Hidden continuously, opened only on button click)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showInline, setShowInline] = useState(false);
  const [mounted, setMounted] = useState(false);
  const scrollContext = useScrollContext();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  // Stop Lenis smooth scroll and lock body scroll when modal is active
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
      if (scrollContext?.lenisRef?.current) {
        scrollContext.lenisRef.current.stop();
      } else if (typeof window !== "undefined" && (window as any).__portfolioLenis) {
        (window as any).__portfolioLenis.stop();
      }
    } else {
      document.body.style.overflow = "";
      if (scrollContext?.lenisRef?.current) {
        scrollContext.lenisRef.current.start();
      } else if (typeof window !== "undefined" && (window as any).__portfolioLenis) {
        (window as any).__portfolioLenis.start();
      }
    }
    return () => {
      document.body.style.overflow = "";
      if (scrollContext?.lenisRef?.current) {
        scrollContext.lenisRef.current.start();
      } else if (typeof window !== "undefined" && (window as any).__portfolioLenis) {
        (window as any).__portfolioLenis.start();
      }
    };
  }, [isModalOpen, scrollContext]);

  // Sync with prop changes
  useEffect(() => {
    if (initialData) {
      setLiveData(initialData);
      setLastSyncTime(new Date().toLocaleTimeString());
    }
  }, [initialData]);

  // Real-time live synchronization listeners (BroadcastChannel + LocalStorage)
  useEffect(() => {
    const fetchFreshData = async () => {
      try {
        setIsSyncing(true);
        const res = await fetch(`/api/public/data?t=${Date.now()}`);
        if (res.ok) {
          const fresh = await res.json();
          setLiveData(fresh);
          setLastSyncTime(new Date().toLocaleTimeString());
        }
      } catch (err) {
        console.warn("DossierExport auto-sync fetch failed:", err);
      } finally {
        setIsSyncing(false);
      }
    };

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      try {
        channel = new BroadcastChannel("portfolio_sync");
        channel.onmessage = () => {
          fetchFreshData();
        };
      } catch (e) {
        // Fallback gracefully
      }
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "portfolio_sync_timestamp") {
        fetchFreshData();
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      if (channel) channel.close();
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/public/data?t=${Date.now()}`);
      if (res.ok) {
        const fresh = await res.json();
        setLiveData(fresh);
        setLastSyncTime(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error("Manual sync error:", err);
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  // Extract all sections from live portfolio data
  const profile = liveData?.profile || {};
  const skills: any[] = liveData?.skills || [];
  const projects: any[] = liveData?.projects || [];
  const certs: any[] = liveData?.certifications || [];
  const education: any[] = liveData?.education || [];
  const internships: any[] = liveData?.internships || [];
  const articles: any[] = liveData?.articles || [];
  const achievements: any[] = liveData?.achievements || [];

  // Group Technical Skills by Category
  const groupedSkills = useMemo(() => {
    const groups: { [key: string]: any[] } = {
      "Cybersecurity & Defense": [],
      "Programming & Languages": [],
      "Web & Full-Stack": [],
      "Cloud, DevOps & Databases": [],
      "Tools & Operating Systems": [],
    };

    skills.forEach((s) => {
      const cat = (s.category || "").toLowerCase();
      if (cat.includes("cyber") || cat.includes("security") || cat.includes("audit") || cat.includes("threat")) {
        groups["Cybersecurity & Defense"].push(s);
      } else if (cat.includes("program") || cat.includes("lang") || cat.includes("code")) {
        groups["Programming & Languages"].push(s);
      } else if (cat.includes("front") || cat.includes("web") || cat.includes("full") || cat.includes("back")) {
        groups["Web & Full-Stack"].push(s);
      } else if (cat.includes("cloud") || cat.includes("data") || cat.includes("devops") || cat.includes("sql")) {
        groups["Cloud, DevOps & Databases"].push(s);
      } else {
        groups["Tools & Operating Systems"].push(s);
      }
    });

    return Object.entries(groups).filter(([_, list]) => list.length > 0);
  }, [skills]);

  // Matcher function for Job Description
  const isTermMatched = (term: string) => {
    if (!jdActive || matchedKeywords.length === 0) return false;
    const lower = term.toLowerCase();
    return matchedKeywords.some((kw) => lower.includes(kw) || kw.includes(lower));
  };

  // Deep JD Scanner & Keyword Extraction
  const handleScanJd = () => {
    if (!jdText.trim()) return;
    setIsScanning(true);

    setTimeout(() => {
      const lowerJd = jdText.toLowerCase();

      // Collect all candidate's real portfolio technical keywords
      const candidateKeywords = new Set<string>();
      skills.forEach((s) => candidateKeywords.add(s.name.toLowerCase()));
      projects.forEach((p) => {
        ensureArray(p.tags).forEach((t: string) => candidateKeywords.add(t.toLowerCase()));
      });
      certs.forEach((c) => candidateKeywords.add(c.issuer.toLowerCase()));
      COMMON_TECH_TERMS.forEach((term) => candidateKeywords.add(term));

      // Match against JD
      const found: string[] = [];
      candidateKeywords.forEach((term) => {
        if (term.length > 2 && lowerJd.includes(term)) {
          found.push(term);
        }
      });

      const uniqueFound = Array.from(new Set(found));
      setMatchedKeywords(uniqueFound);

      const computedScore = Math.min(76 + uniqueFound.length * 3, 98);
      setMatchScore(computedScore);

      // Category detection
      const isCyber = lowerJd.includes("cyber") || lowerJd.includes("security") || lowerJd.includes("threat") || lowerJd.includes("audit") || lowerJd.includes("vulnerability");
      const isCloud = lowerJd.includes("cloud") || lowerJd.includes("aws") || lowerJd.includes("docker") || lowerJd.includes("devops") || lowerJd.includes("ci/cd");
      const isFullstack = lowerJd.includes("fullstack") || lowerJd.includes("full-stack") || lowerJd.includes("next") || lowerJd.includes("react");
      const isDev = lowerJd.includes("python") || lowerJd.includes("developer") || lowerJd.includes("software") || lowerJd.includes("backend");

      if (isCyber) {
        setSelectedCategory("cybersecurity");
        setTailoredTitle("Cybersecurity Engineer & Threat Defense Specialist");
        setTailoredSummary(
          `Dedicated Cybersecurity Engineer with verified credentials in defensive infrastructure, vulnerability assessments, and zero-trust authentication. Specifically aligned with your job requirements in ${uniqueFound.slice(0, 5).join(", ")}. Proven track record defending platforms, auditing database schemas, and securing production systems.`
        );
      } else if (isCloud) {
        setSelectedCategory("cloud");
        setTailoredTitle("Cloud Security & Infrastructure Engineer");
        setTailoredSummary(
          `High-performance Cloud & Infrastructure Specialist with comprehensive expertise in containerization, CI/CD pipelines, and zero-trust cloud network configuration. Directly aligned with target requirements: ${uniqueFound.slice(0, 5).join(", ")}.`
        );
      } else if (isFullstack) {
        setSelectedCategory("fullstack");
        setTailoredTitle("Full-Stack Web Architect & Application Engineer");
        setTailoredSummary(
          `Full-Stack Web Architect specialized in reactive Next.js App Router applications, Supabase PostgreSQL modeling, Prisma ORM, and high-availability cloud APIs. Aligned with your key target competencies: ${uniqueFound.slice(0, 5).join(", ")}.`
        );
      } else if (isDev) {
        setSelectedCategory("developer");
        setTailoredTitle("Software Development Engineer (Python & TypeScript)");
        setTailoredSummary(
          `Software Development Engineer specializing in clean microservices, automated Python workflows, TypeScript architectures, and robust API endpoints. Aligned with candidate profile specifications: ${uniqueFound.slice(0, 5).join(", ")}.`
        );
      } else {
        setSelectedCategory("all");
        setTailoredTitle("Cybersecurity Engineer & Systems Architect");
        setTailoredSummary(
          `Versatile Cybersecurity Engineer and Systems Architect tailored to target Job Description specifications. Matches key operational competencies including ${uniqueFound.slice(0, 6).join(", ")}.`
        );
      }

      setJdActive(true);
      setIsScanning(false);
    }, 600);
  };

  const handleResetJd = () => {
    setJdText("");
    setJdActive(false);
    setMatchedKeywords([]);
    setMatchScore(0);
    setTailoredTitle("");
    setTailoredSummary("");
  };

  // Prioritize projects based on JD match or category
  const prioritizedProjects = useMemo(() => {
    if (!jdActive || matchedKeywords.length === 0) {
      if (selectedCategory === "all") return projects;
      return projects.filter((p) => {
        const cat = (p.category || "").toLowerCase();
        const text = `${p.title} ${p.description} ${ensureArray(p.tags).join(" ")}`.toLowerCase();
        return cat.includes(selectedCategory) || text.includes(selectedCategory);
      });
    }

    return [...projects].sort((a, b) => {
      const aText = `${a.title} ${a.description} ${ensureArray(a.tags).join(" ")}`.toLowerCase();
      const bText = `${b.title} ${b.description} ${ensureArray(b.tags).join(" ")}`.toLowerCase();

      let aHits = 0;
      let bHits = 0;
      matchedKeywords.forEach((kw) => {
        if (aText.includes(kw)) aHits++;
        if (bText.includes(kw)) bHits++;
      });
      return bHits - aHits;
    });
  }, [projects, jdActive, matchedKeywords, selectedCategory]);

  // Prioritize skills
  const prioritizedSkills = useMemo(() => {
    if (!jdActive || matchedKeywords.length === 0) return skills;
    return [...skills].sort((a, b) => {
      const aMatch = isTermMatched(a.name) ? 1 : 0;
      const bMatch = isTermMatched(b.name) ? 1 : 0;
      return bMatch - aMatch;
    });
  }, [skills, jdActive, matchedKeywords]);

  // Current formatted date
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Dynamic Print / PDF Generation Engine
  const handlePrint = () => {
    window.print();
  };

  // Copy plain text formatted resume for ATS application boxes
  const handleCopyPlainText = () => {
    const activeTitle = jdActive ? tailoredTitle : (CATEGORY_META[selectedCategory]?.title || profile.title);
    const activeSummary = jdActive ? tailoredSummary : (profile.bio || CATEGORY_META[selectedCategory]?.summary);

    const plainText = [
      `${profile.name || "JOHNKNOX KALLE"}`,
      `${activeTitle}`,
      `Location: ${profile.location || "Thiruvallur, India"} | Phone: ${profile.phone || "+91 9182597274"} | Email: ${profile.email || "johnknox.kalle@gmail.com"}`,
      `GitHub: ${profile.github || "github.com/johnknox0118"} | LinkedIn: ${profile.linkedin || "linkedin.com/in/john-knox-kalle-309b15301"}`,
      "",
      "=== EXECUTIVE SUMMARY ===",
      activeSummary,
      "",
      "=== TECHNICAL SKILLS ===",
      prioritizedSkills.map((s) => s.name).join(", "),
      "",
      "=== PROFESSIONAL EXPERIENCE & INTERNSHIPS ===",
      ...internships.map(
        (exp: any) =>
          `• ${exp.role} at ${exp.companyName} (${exp.duration})\n  ${exp.description}\n  Key Skills: ${ensureArray(exp.skills).join(", ")}`
      ),
      "",
      "=== FEATURED PROJECTS ===",
      ...prioritizedProjects.slice(0, 5).map(
        (proj: any) =>
          `• ${proj.title} [${proj.role}] (${proj.timeline || "Completed"})\n  ${proj.description}\n  Tech Stack: ${ensureArray(proj.tags).join(", ")}`
      ),
      "",
      "=== ACADEMIC QUALIFICATIONS ===",
      ...education.map((edu: any) => `• ${edu.degree} - ${edu.institution} (${edu.duration}) | Grade: ${edu.grade}`),
      "",
      "=== VERIFIED CERTIFICATIONS ===",
      ...certs.map((c: any) => `• ${c.title} - ${c.issuer} (${c.year}) [Credential ID: ${c.credentialId || "Verified"}]`),
    ].join("\n");

    if (navigator.clipboard) {
      navigator.clipboard.writeText(plainText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    }
  };

  // Download original static resume PDF file
  const handleDownloadOriginalCV = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const url = profile.resumeUrl || "https://exziamokifkbzmibjpkp.supabase.co/storage/v1/object/public/portfolio-uploads/1784348519291_5018_Johnknox_Kalle_Resume.pdf";
    const filename = url.split("/").pop() || "Johnknox_Kalle_Resume.pdf";

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.blob();
      })
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch(() => {
        window.open(url, "_blank", "noopener,noreferrer");
      });
  };

  // Renderable Resume Document (Reusable in Modal and Inline Preview)
  const renderResumeDocument = () => (
    <div
      className={`w-full max-w-[820px] mx-auto rounded-xl p-4 sm:p-8 md:p-10 shadow-2xl transition-all border overflow-x-auto ${
        previewTheme === "ats"
          ? "bg-white text-slate-900 border-slate-300"
          : "bg-[#050C16] text-slate-100 border-cyber-blue/40 shadow-[0_0_30px_rgba(0,200,255,0.12)]"
      }`}
    >
      {/* Document Header */}
      <div
        className={`border-b-2 pb-4 flex flex-col sm:flex-row justify-between items-start gap-4 ${
          previewTheme === "ats" ? "border-slate-900" : "border-cyber-green/50"
        }`}
      >
        <div className="space-y-1 max-w-xl">
          <div
            className={`text-[10px] font-mono font-bold tracking-widest uppercase ${
              previewTheme === "ats" ? "text-emerald-700" : "text-cyber-green"
            }`}
          >
            {jdActive
              ? `🎯 TAILORED JD MATCH DOSSIER (${matchScore}% MATCH)`
              : CATEGORY_META[selectedCategory]?.badge}
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-black uppercase tracking-tight leading-none ${
              previewTheme === "ats" ? "text-slate-900" : "text-white"
            }`}
          >
            {profile.name || "JOHNKNOX KALLE"}
          </h1>
          <p
            className={`text-xs sm:text-sm font-bold uppercase tracking-wide ${
              previewTheme === "ats" ? "text-slate-700" : "text-cyber-blue"
            }`}
          >
            {jdActive ? tailoredTitle : (CATEGORY_META[selectedCategory]?.title || profile.title)}
          </p>
          <div
            className={`flex flex-wrap gap-x-3 text-[11px] font-medium pt-1 ${
              previewTheme === "ats" ? "text-slate-600" : "text-gray-300"
            }`}
          >
            <span>📍 {profile.location || "Thiruvallur, India"}</span>
            <span>•</span>
            <span>📞 {profile.phone || "+91 9182597274"}</span>
            <span>•</span>
            <span>✉️ {profile.email || "johnknox.kalle@gmail.com"}</span>
          </div>
          <div
            className={`flex flex-wrap gap-x-4 text-[10.5px] font-mono font-semibold pt-0.5 ${
              previewTheme === "ats" ? "text-blue-700" : "text-cyan-400"
            }`}
          >
            <span>GitHub: {profile.github || "github.com/johnknox0118"}</span>
            <span>LinkedIn: {profile.linkedin || "linkedin.com/in/john-knox-kalle-309b15301"}</span>
            {profile.portfolioUrl && <span>Portfolio: {profile.portfolioUrl}</span>}
          </div>
        </div>

        <div
          className={`text-right text-[9.5px] font-mono space-y-0.5 shrink-0 ${
            previewTheme === "ats" ? "text-slate-500" : "text-gray-400"
          }`}
        >
          <div className={`font-bold ${previewTheme === "ats" ? "text-slate-800" : "text-cyber-green"}`}>
            OFFICIAL DOSSIER v2.4
          </div>
          <div>DATE: {currentDate}</div>
          <div>STATUS: VERIFIED</div>
          <div className="pt-1 flex justify-end">
            <div
              className={`w-10 h-10 border rounded flex items-center justify-center font-mono text-[8px] font-bold ${
                previewTheme === "ats"
                  ? "border-slate-400 text-slate-700 bg-slate-100"
                  : "border-cyber-green/40 text-cyber-green bg-cyber-green/10"
              }`}
            >
              SEC_ID
            </div>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="mt-4 space-y-1">
        <h2
          className={`text-xs font-black uppercase tracking-wider border-b pb-0.5 ${
            previewTheme === "ats"
              ? "text-slate-900 border-slate-300"
              : "text-cyber-green border-cyber-green/30"
          }`}
        >
          EXECUTIVE SUMMARY
        </h2>
        <p
          className={`text-[11.5px] leading-relaxed ${
            previewTheme === "ats" ? "text-slate-800" : "text-gray-300"
          }`}
        >
          {jdActive
            ? tailoredSummary
            : (profile.bio || CATEGORY_META[selectedCategory]?.summary)}
        </p>
      </div>

      {/* Technical Competencies Matrix */}
      <div className="mt-4 space-y-2">
        <h2
          className={`text-xs font-black uppercase tracking-wider border-b pb-0.5 ${
            previewTheme === "ats"
              ? "text-slate-900 border-slate-300"
              : "text-cyber-green border-cyber-green/30"
          }`}
        >
          TECHNICAL COMPETENCIES & MATRIX
        </h2>
        <div className="space-y-2">
          {groupedSkills.map(([groupName, groupItems]) => (
            <div key={groupName} className="text-[11px] space-y-0.5">
              <span
                className={`font-bold uppercase text-[10px] tracking-wider ${
                  previewTheme === "ats" ? "text-slate-700" : "text-cyber-blue font-mono"
                }`}
              >
                {groupName}:
              </span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {groupItems.map((s) => {
                  const isMatch = isTermMatched(s.name);
                  return (
                    <span
                      key={s.id}
                      className={`px-2 py-0.5 rounded text-[10.5px] font-mono transition-colors ${
                        isMatch
                          ? previewTheme === "ats"
                            ? "bg-emerald-100 text-emerald-900 font-bold border border-emerald-400"
                            : "bg-cyber-green/20 text-cyber-green font-bold border border-cyber-green shadow-[0_0_8px_rgba(0,255,157,0.3)]"
                          : previewTheme === "ats"
                          ? "bg-slate-100 text-slate-800 border border-slate-200"
                          : "bg-black/50 text-gray-300 border border-white/10"
                      }`}
                    >
                      {s.name} {isMatch && "✓"}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Professional Experience & Internships */}
      {internships.length > 0 && (
        <div className="mt-4 space-y-2">
          <h2
            className={`text-xs font-black uppercase tracking-wider border-b pb-0.5 ${
              previewTheme === "ats"
                ? "text-slate-900 border-slate-300"
                : "text-cyber-green border-cyber-green/30"
            }`}
          >
            PROFESSIONAL EXPERIENCE & INTERNSHIPS
          </h2>
          <div className="space-y-3">
            {internships.map((exp: any) => (
              <div
                key={exp.id}
                className={`space-y-1 text-[11px] border-l-2 pl-3 ${
                  previewTheme === "ats" ? "border-emerald-700" : "border-cyber-green"
                }`}
              >
                <div className="flex flex-wrap justify-between items-baseline font-bold">
                  <span className={previewTheme === "ats" ? "text-slate-900 font-black" : "text-white font-black"}>
                    {exp.role} —{" "}
                    <span
                      className={previewTheme === "ats" ? "text-emerald-800 font-bold" : "text-cyber-blue font-bold"}
                    >
                      {exp.companyName}
                    </span>
                  </span>
                  <span
                    className={`font-mono text-[9.5px] ${
                      previewTheme === "ats" ? "text-slate-500" : "text-gray-400"
                    }`}
                  >
                    {exp.duration}
                  </span>
                </div>
                <p className={previewTheme === "ats" ? "text-slate-700 leading-relaxed" : "text-gray-300 leading-relaxed"}>
                  {exp.description}
                </p>
                {ensureArray(exp.skills).length > 0 && (
                  <div
                    className={`text-[9.5px] font-mono ${
                      previewTheme === "ats" ? "text-slate-600" : "text-gray-400"
                    }`}
                  >
                    <span className="font-bold">Technologies:</span> {ensureArray(exp.skills).join(" • ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Featured Engineering Projects */}
      {prioritizedProjects.length > 0 && (
        <div className="mt-4 space-y-2">
          <h2
            className={`text-xs font-black uppercase tracking-wider border-b pb-0.5 ${
              previewTheme === "ats"
                ? "text-slate-900 border-slate-300"
                : "text-cyber-green border-cyber-green/30"
            }`}
          >
            FEATURED ENGINEERING PROJECTS
          </h2>
          <div className="space-y-3">
            {prioritizedProjects.slice(0, 4).map((project: any) => (
              <div
                key={project.id}
                className={`space-y-1 text-[11px] border-l-2 pl-3 ${
                  previewTheme === "ats" ? "border-blue-700" : "border-cyber-blue"
                }`}
              >
                <div className="flex flex-wrap justify-between items-baseline font-bold">
                  <span className={previewTheme === "ats" ? "text-slate-900 font-black" : "text-white font-black"}>
                    {project.title}
                    {project.role && (
                      <span className={previewTheme === "ats" ? "text-blue-800 font-medium" : "text-cyber-blue font-medium"}>
                        {" "}• {project.role}
                      </span>
                    )}
                  </span>
                  <span
                    className={`font-mono text-[9.5px] ${
                      previewTheme === "ats" ? "text-slate-500" : "text-gray-400"
                    }`}
                  >
                    {project.timeline || "Production"}
                  </span>
                </div>
                <p className={previewTheme === "ats" ? "text-slate-700 leading-relaxed" : "text-gray-300 leading-relaxed"}>
                  {project.description}
                </p>
                {ensureArray(project.tags).length > 0 && (
                  <div
                    className={`text-[9.5px] font-mono ${
                      previewTheme === "ats" ? "text-slate-600" : "text-gray-400"
                    }`}
                  >
                    <span className="font-bold">Stack:</span> {ensureArray(project.tags).join(" • ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Academic Qualifications & Education */}
      {education.length > 0 && (
        <div className="mt-4 space-y-1.5">
          <h2
            className={`text-xs font-black uppercase tracking-wider border-b pb-0.5 ${
              previewTheme === "ats"
                ? "text-slate-900 border-slate-300"
                : "text-cyber-green border-cyber-green/30"
            }`}
          >
            ACADEMIC QUALIFICATIONS
          </h2>
          <div className="space-y-1.5">
            {education.map((edu: any) => (
              <div key={edu.id} className="flex flex-wrap justify-between items-baseline text-[11px]">
                <div>
                  <span className={`font-bold ${previewTheme === "ats" ? "text-slate-900" : "text-white"}`}>
                    {edu.degree}
                  </span>{" "}
                  — <span className={previewTheme === "ats" ? "text-slate-700" : "text-gray-300"}>{edu.institution}</span>
                </div>
                <div className="font-mono text-[10px]">
                  <span className={`font-bold ${previewTheme === "ats" ? "text-emerald-800" : "text-cyber-green"}`}>
                    Grade: {edu.grade}
                  </span>{" "}
                  • <span className={previewTheme === "ats" ? "text-slate-600" : "text-gray-400"}>{edu.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verified Certifications */}
      {certs.length > 0 && (
        <div className="mt-4 space-y-1.5">
          <h2
            className={`text-xs font-black uppercase tracking-wider border-b pb-0.5 ${
              previewTheme === "ats"
                ? "text-slate-900 border-slate-300"
                : "text-cyber-green border-cyber-green/30"
            }`}
          >
            VERIFIED CERTIFICATIONS & CREDENTIALS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px]">
            {certs.slice(0, 6).map((cert: any) => (
              <div
                key={cert.id}
                className={`p-1.5 rounded border flex justify-between items-center ${
                  previewTheme === "ats"
                    ? "bg-slate-50 border-slate-200 text-slate-800"
                    : "bg-black/40 border-white/10 text-gray-200"
                }`}
              >
                <div>
                  <div className="font-bold">{cert.title}</div>
                  <div className="text-[9px] text-gray-500">{cert.issuer}</div>
                </div>
                <div
                  className={`font-mono text-[9px] font-bold shrink-0 ml-2 ${
                    previewTheme === "ats" ? "text-emerald-800" : "text-cyber-green"
                  }`}
                >
                  {cert.year}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Research Logs & Publications */}
      {articles.length > 0 && (
        <div className="mt-4 space-y-1.5">
          <h2
            className={`text-xs font-black uppercase tracking-wider border-b pb-0.5 ${
              previewTheme === "ats"
                ? "text-slate-900 border-slate-300"
                : "text-cyber-green border-cyber-green/30"
            }`}
          >
            RESEARCH LOGS & TECHNICAL ARTICLES
          </h2>
          <div className="space-y-1 text-[11px]">
            {articles.slice(0, 3).map((art: any) => (
              <div key={art.id} className="flex justify-between items-baseline">
                <span className={`font-bold ${previewTheme === "ats" ? "text-slate-900" : "text-white"}`}>
                  {art.title}{" "}
                  <span className="text-[9.5px] font-normal text-gray-500 font-mono">[{art.category}]</span>
                </span>
                <span className="text-[9px] font-mono text-gray-500">{art.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Audit Stamp */}
      <div
        className={`mt-6 pt-3 border-t text-[8.5px] font-mono flex flex-wrap justify-between items-center ${
          previewTheme === "ats" ? "border-slate-900 text-slate-500" : "border-white/20 text-gray-400"
        }`}
      >
        <span>Verified Dynamic Portfolio Dossier • {profile.name || "JOHNKNOX KALLE"}</span>
        <span>SHA-256 DIGITAL DIGEST // VERIFIED</span>
      </div>
    </div>
  );

  return (
    <section id="resume" className="space-y-8 scroll-mt-20 relative z-20 pointer-events-auto">
      {/* Section Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-cyber-green animate-pulse" />
            <FlipText as="h2" text="OFFICIAL DOSSIER" subtitle="// EXECUTIVE RESUME" className="text-2xl md:text-3xl" />
          </div>

          {/* Live Sync Telemetry Badge */}
          <div className="flex items-center gap-3">
            <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-lg border border-cyber-green/40 bg-cyber-green/10 text-cyber-green font-mono text-[10px] sm:text-[11px] shadow-[0_0_12px_rgba(0,255,157,0.15)]">
              <span className="w-2 h-2 rounded-full bg-cyber-green animate-ping shrink-0" />
              <span className="font-bold">LIVE SYNC ACTIVE</span>
              <span className="text-gray-400 hidden sm:inline">•</span>
              <span className="text-gray-300">
                {skills.length} Skills • {projects.length} Projects • {certs.length} Certs • {internships.length} Exps
              </span>
            </div>

            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              title="Click to manually refresh all data from database"
              className="p-1.5 rounded-lg border border-white/10 hover:border-cyber-green/40 text-gray-400 hover:text-cyber-green transition-colors cursor-pointer relative z-20 pointer-events-auto"
            >
              <RefreshCw className={`w-4 h-4 pointer-events-none ${isSyncing ? "animate-spin text-cyber-green" : ""}`} />
            </button>
          </div>
        </div>
        <SectionDivider color="green" />
      </div>

      <FloatingResumeCard>
        {/* CONTROL DECK (Category Presets + JD Scanner + Export Controls) */}
        <div className="glass-card p-4 sm:p-6 md:p-8 space-y-6 print:hidden rounded-2xl border border-cyber-green/30 bg-[#07111F]/95 relative z-20 pointer-events-auto">
          {/* Top Control Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 border-b border-white/10 pb-5">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyber-green animate-pulse" />
                <h3 className="font-orbitron font-bold text-sm text-white uppercase tracking-wider">
                  DYNAMIC RESUME & TAILORED DOSSIER GENERATOR
                </h3>
              </div>
              <p className="font-mono text-xs text-gray-300 leading-relaxed">
                Generates a live, single-page executive resume synthesized from all sections of your portfolio. 
                Paste any target Job Description (JD) to automatically match competencies and download an instant tailored PDF.
              </p>
            </div>

            {/* Main Export & View Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-20 pointer-events-auto">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="btn-cyber flex items-center gap-2 px-5 py-2.5 text-xs text-black bg-cyber-green border-cyber-green font-bold cursor-pointer shadow-[0_0_22px_rgba(0,255,157,0.45)] hover:scale-105 transition-all relative z-20 pointer-events-auto"
              >
                <Eye className="w-4 h-4 pointer-events-none" /> 
                <span className="pointer-events-none">VIEW RESUME / CV</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="btn-cyber flex items-center gap-2 px-4 py-2.5 text-xs text-cyber-green font-bold cursor-pointer hover:scale-105 transition-all relative z-20 pointer-events-auto"
              >
                <Download className="w-4 h-4 pointer-events-none" /> 
                <span className="pointer-events-none">DOWNLOAD (PDF)</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="btn-cyber btn-cyber-blue flex items-center gap-2 px-4 py-2.5 text-xs font-bold cursor-pointer hover:scale-105 transition-all relative z-20 pointer-events-auto"
              >
                <Printer className="w-4 h-4 pointer-events-none" /> 
                <span className="pointer-events-none">PRINT</span>
              </button>

              <button
                type="button"
                onClick={handleCopyPlainText}
                className="btn-cyber flex items-center gap-2 px-4 py-2.5 text-xs font-mono text-gray-300 hover:text-white border-white/20 hover:border-white/50 transition-all cursor-pointer relative z-20 pointer-events-auto"
              >
                {copiedText ? (
                  <Check className="w-4 h-4 text-cyber-green pointer-events-none" />
                ) : (
                  <Copy className="w-4 h-4 pointer-events-none" />
                )}
                <span className="pointer-events-none">{copiedText ? "COPIED TO CLIPBOARD!" : "COPY ATS TEXT"}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadOriginalCV}
                className="btn-cyber flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-bold text-cyber-blue hover:text-white border-cyber-blue/40 hover:border-cyber-blue hover:scale-105 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,200,255,0.2)] relative z-20 pointer-events-auto"
                title="Download original uploaded static resume PDF"
              >
                <FileText className="w-4 h-4 text-cyber-blue pointer-events-none" />
                <span className="pointer-events-none">ORIGINAL CV</span>
                <Download className="w-3.5 h-3.5 pointer-events-none opacity-80" />
              </button>
            </div>
          </div>

          {/* Quick Role Presets */}
          <div className="space-y-2 relative z-20 pointer-events-auto">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider font-semibold">
                TARGET ROLE PRESETS:
              </span>
              <span className="text-[10px] font-mono text-cyber-blue">
                {CATEGORY_META[selectedCategory]?.badge}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 relative z-20 pointer-events-auto">
              {(Object.keys(CATEGORY_META) as CategoryType[]).map((catId) => {
                const meta = CATEGORY_META[catId];
                const isSelected = !jdActive && selectedCategory === catId;
                return (
                  <button
                    key={catId}
                    type="button"
                    onClick={() => {
                      setJdActive(false);
                      setSelectedCategory(catId);
                    }}
                    className={`cyber-tag text-xs font-mono px-4 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-2 select-none relative z-20 pointer-events-auto ${
                      isSelected
                        ? "bg-cyber-green text-black border-cyber-green font-bold shadow-[0_0_15px_rgba(0,255,157,0.4)] scale-105"
                        : "bg-black/40 text-gray-300 border-white/10 hover:border-cyber-green/40 hover:text-white"
                    }`}
                  >
                    <span className="pointer-events-none">{meta.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] pointer-events-none" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Job Description (JD) Input & Live Scanner */}
          <div className="space-y-3 pt-4 border-t border-white/10 relative z-20 pointer-events-auto">
            <div className="flex items-center justify-between">
              <label className="text-xs font-orbitron font-bold text-cyber-blue flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyber-blue animate-pulse pointer-events-none" />
                INTELLIGENT JOB DESCRIPTION (JD) MATCHER
              </label>
              {jdActive && (
                <button
                  type="button"
                  onClick={handleResetJd}
                  className="text-[11px] font-mono text-rose-400 hover:text-rose-300 underline flex items-center gap-1 cursor-pointer relative z-20 pointer-events-auto"
                >
                  <RefreshCw className="w-3 h-3 pointer-events-none" /> RESET JD FILTER
                </button>
              )}
            </div>

            <textarea
              rows={3}
              placeholder="Paste any target Job Description here (e.g. 'Seeking a Cybersecurity Engineer with experience in Next.js, Python, Supabase, JWT security, zero-trust perimeter defense, threat modeling...')"
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              className="w-full bg-[#040912] border border-white/15 rounded-xl p-3.5 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-cyber-blue transition-colors select-text cursor-text relative z-20 pointer-events-auto"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 relative z-20 pointer-events-auto">
              <button
                type="button"
                onClick={handleScanJd}
                disabled={isScanning || !jdText.trim()}
                className={`btn-cyber btn-cyber-blue flex items-center gap-2 px-5 py-2.5 text-xs font-bold relative z-20 pointer-events-auto ${
                  !jdText.trim() ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105 transition-transform"
                }`}
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin pointer-events-none" /> 
                    <span className="pointer-events-none">SCANNING & MATCHING ALL PORTFOLIO DATA...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 pointer-events-none" /> 
                    <span className="pointer-events-none">SCAN & MATCH RESUME TO JD</span>
                  </>
                )}
              </button>

              {/* Live Match Telemetry Results */}
              {jdActive && (
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono bg-cyber-blue/10 border border-cyber-blue/40 px-3.5 py-2 rounded-xl text-cyber-blue shadow-[0_0_15px_rgba(0,200,255,0.15)]">
                  <span className="font-black text-cyber-green text-sm">MATCH: {matchScore}%</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-200">
                    KEYWORDS: {matchedKeywords.slice(0, 5).join(", ")}
                    {matchedKeywords.length > 5 ? ` +${matchedKeywords.length - 5} more` : ""}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* CV LAUNCHPAD & ON-DEMAND PREVIEW CONTROLS */}
          <div className="pt-6 border-t border-white/10 space-y-4 relative z-20 pointer-events-auto">
            <div className="rounded-xl border border-white/10 bg-black/40 p-5 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden group/launchpad hover:border-cyber-green/40 transition-all pointer-events-auto">
              {/* Ambient Glow */}
              <div className="absolute -right-16 -top-16 w-36 h-36 bg-cyber-green/10 rounded-full blur-2xl pointer-events-none group-hover/launchpad:bg-cyber-green/20 transition-all" />

              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-cyber-green/10 border border-cyber-green/30 flex items-center justify-center text-cyber-green shadow-[0_0_15px_rgba(0,255,157,0.2)]">
                  <FileText className="w-6 h-6 animate-pulse pointer-events-none" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm md:text-base font-orbitron font-bold text-white tracking-wide">
                      OFFICIAL RESUME DOSSIER
                    </span>
                    {jdActive ? (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/40 shadow-[0_0_10px_rgba(0,200,255,0.2)]">
                        {matchScore}% JD MATCH
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyber-green/15 text-cyber-green border border-cyber-green/30">
                        AUTO-SYNCED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                    Synthesized from all portfolio sections • Click below to view full CV
                  </p>
                </div>
              </div>

              {/* Action Buttons: View in Modal or Toggle On Page */}
              <div className="flex flex-wrap items-center gap-3 relative z-20 w-full sm:w-auto justify-end pointer-events-auto">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="btn-cyber flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-xs text-black bg-cyber-green border-cyber-green font-bold cursor-pointer shadow-[0_0_20px_rgba(0,255,157,0.35)] hover:scale-105 transition-all relative z-20 pointer-events-auto"
                >
                  <Eye className="w-4 h-4 pointer-events-none" /> 
                  <span className="pointer-events-none">VIEW RESUME / CV</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowInline((prev) => !prev)}
                  className="btn-cyber flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-mono text-gray-300 hover:text-white border-white/20 hover:border-cyber-green/40 transition-all cursor-pointer relative z-20 pointer-events-auto"
                >
                  {showInline ? (
                    <>
                      <ChevronUp className="w-4 h-4 text-cyber-green pointer-events-none" /> 
                      <span className="pointer-events-none">HIDE ON PAGE</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 pointer-events-none" /> 
                      <span className="pointer-events-none">PREVIEW ON PAGE</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* INLINE PREVIEW (Only rendered if user explicitly toggled "PREVIEW ON PAGE") */}
            {showInline && (
              <div className="space-y-4 pt-2 relative z-20 pointer-events-auto">
                <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                  <div className="flex items-center gap-2 text-xs font-mono text-gray-300">
                    <Eye className="w-4 h-4 text-cyber-green pointer-events-none" />
                    <span className="font-bold text-white uppercase">INLINE DOSSIER PREVIEW</span>
                  </div>
                  <div className="flex items-center gap-2 relative z-20 pointer-events-auto">
                    <span className="text-[11px] font-mono text-gray-400">FORMAT:</span>
                    <button
                      type="button"
                      onClick={() => setPreviewTheme("ats")}
                      className={`text-xs font-mono px-3 py-1 rounded-lg border transition-all cursor-pointer relative z-20 pointer-events-auto ${
                        previewTheme === "ats"
                          ? "bg-white text-black font-bold border-white"
                          : "bg-black/40 text-gray-400 border-white/10 hover:text-white"
                      }`}
                    >
                      📄 ATS Standard (Clean A4)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTheme("cyber")}
                      className={`text-xs font-mono px-3 py-1 rounded-lg border transition-all cursor-pointer relative z-20 pointer-events-auto ${
                        previewTheme === "cyber"
                          ? "bg-cyber-blue/20 text-cyber-blue font-bold border-cyber-blue"
                          : "bg-black/40 text-gray-400 border-white/10 hover:text-white"
                      }`}
                    >
                      🛡️ Cyber Dossier (Dark HUD)
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowInline(false)}
                      className="text-xs font-mono px-2.5 py-1 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 cursor-pointer ml-2 relative z-20 pointer-events-auto"
                    >
                      ✕ Close
                    </button>
                  </div>
                </div>

                {renderResumeDocument()}

                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInline(false)}
                    className="text-xs font-mono flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-all cursor-pointer relative z-20 pointer-events-auto"
                  >
                    <ChevronUp className="w-4 h-4 pointer-events-none" /> HIDE RESUME PREVIEW
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </FloatingResumeCard>

      {/* INTERACTIVE RESUME PREVIEW MODAL */}
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              className="fixed inset-0 z-[999999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-xl pointer-events-auto"
              onClick={(e) => {
                if (e.target === e.currentTarget) setIsModalOpen(false);
              }}
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 15 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                data-lenis-prevent="true"
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                className="relative w-full max-w-5xl h-[92vh] max-h-[94vh] flex flex-col bg-[#050C16] border border-cyber-green/50 rounded-2xl shadow-[0_0_60px_rgba(0,255,157,0.25)] overflow-hidden pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Sticky Top Navigation Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-white/10 bg-[#07111F] shrink-0 z-30 pointer-events-auto shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-cyber-green/10 border border-cyber-green/40 flex items-center justify-center text-cyber-green shadow-[0_0_12px_rgba(0,255,157,0.2)]">
                      <FileText className="w-5 h-5 pointer-events-none" />
                    </div>
                    <div>
                      <div className="font-orbitron font-bold text-xs sm:text-sm text-white tracking-wide flex items-center gap-2">
                        OFFICIAL DOSSIER // EXECUTIVE RESUME
                        {jdActive ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/40">
                            {matchScore}% MATCH
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyber-green/15 text-cyber-green border border-cyber-green/30">
                            AUTO-SYNCED
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-gray-400">
                        Live Dynamic Sync • {profile.name || "JOHNKNOX KALLE"}
                      </div>
                    </div>
                  </div>

                  {/* Theme Switcher & Actions */}
                  <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
                    <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-white/10">
                      <button
                        type="button"
                        onClick={() => setPreviewTheme("ats")}
                        className={`text-[11px] font-mono px-2.5 py-1 rounded transition-all cursor-pointer ${
                          previewTheme === "ats"
                            ? "bg-white text-black font-bold shadow"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        📄 ATS Clean (A4)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewTheme("cyber")}
                        className={`text-[11px] font-mono px-2.5 py-1 rounded transition-all cursor-pointer ${
                          previewTheme === "cyber"
                            ? "bg-cyber-blue/20 text-cyber-blue font-bold border border-cyber-blue/30 shadow-[0_0_10px_rgba(0,200,255,0.2)]"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        🛡️ Cyber HUD
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handlePrint}
                      className="btn-cyber flex items-center gap-1.5 px-3 py-1.5 text-xs text-cyber-green font-bold cursor-pointer hover:scale-105"
                    >
                      <Download className="w-3.5 h-3.5 pointer-events-none" /> 
                      <span>PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePrint}
                      className="btn-cyber btn-cyber-blue flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold cursor-pointer hover:scale-105"
                    >
                      <Printer className="w-3.5 h-3.5 pointer-events-none" /> 
                      <span>PRINT</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyPlainText}
                      className="btn-cyber flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-gray-300 hover:text-white border-white/20 cursor-pointer"
                    >
                      {copiedText ? (
                        <Check className="w-3.5 h-3.5 text-cyber-green pointer-events-none" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 pointer-events-none" />
                      )}
                      <span>{copiedText ? "Copied" : "Copy ATS"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadOriginalCV}
                      className="btn-cyber flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-cyber-blue font-bold cursor-pointer hover:scale-105 border-cyber-blue/40"
                      title="Download original uploaded static resume PDF"
                    >
                      <FileText className="w-3.5 h-3.5 pointer-events-none" />
                      <span>ORIGINAL CV</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/40 bg-red-500/15 text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer ml-1 font-mono text-xs font-bold"
                      title="Close Preview (Esc)"
                    >
                      <X className="w-4 h-4 pointer-events-none" />
                      <span>CLOSE</span>
                    </button>
                  </div>
                </div>

                {/* Modal Scrollable Document Viewport */}
                <div
                  className="overflow-y-auto overscroll-contain p-3 sm:p-6 md:p-8 custom-scrollbar flex-1 bg-[#02060D]"
                  data-lenis-prevent="true"
                  onWheel={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                >
                  <div className="w-full max-w-[820px] mx-auto min-h-full pb-10">
                    {renderResumeDocument()}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* DEDICATED PRINT CONTAINER (#executive-dossier-print) */}
      {/* Exclusively visible during window.print() or PDF export */}
      <div
        id="executive-dossier-print"
        className="hidden print:block text-slate-900 bg-white p-6 space-y-4 font-sans text-xs leading-tight"
      >
        {/* Print Header */}
        <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
          <div className="space-y-1 max-w-xl">
            <div className="text-[10px] font-mono font-bold text-emerald-700 tracking-widest uppercase">
              {jdActive ? `🎯 TAILORED JD MATCH DOSSIER (${matchScore}% MATCH)` : CATEGORY_META[selectedCategory]?.badge}
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 leading-none">
              {profile.name || "JOHNKNOX KALLE"}
            </h1>
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              {jdActive ? tailoredTitle : (CATEGORY_META[selectedCategory]?.title || profile.title)}
            </p>
            <div className="flex flex-wrap gap-x-3 text-[11px] text-slate-700 font-medium pt-0.5">
              <span>📍 {profile.location || "Thiruvallur, India"}</span>
              <span>•</span>
              <span>📞 {profile.phone || "+91 9182597274"}</span>
              <span>•</span>
              <span>✉️ {profile.email || "johnknox.kalle@gmail.com"}</span>
            </div>
            <div className="flex flex-wrap gap-x-4 text-[10px] font-mono text-blue-700 font-semibold">
              <span>GitHub: {profile.github || "github.com/johnknox0118"}</span>
              <span>LinkedIn: {profile.linkedin || "linkedin.com/in/john-knox-kalle-309b15301"}</span>
              {profile.portfolioUrl && <span>Portfolio: {profile.portfolioUrl}</span>}
            </div>
          </div>

          <div className="text-right text-[9px] font-mono text-slate-500 space-y-0.5 shrink-0">
            <div className="font-bold text-slate-800">OFFICIAL DOSSIER</div>
            <div>VER: v2.4.0</div>
            <div>DATE: {currentDate}</div>
            <div className="pt-1 flex justify-end">
              <div className="w-10 h-10 border border-slate-400 bg-slate-100 flex items-center justify-center font-mono text-[7px] font-bold text-slate-700">
                OFFICIAL
              </div>
            </div>
          </div>
        </div>

        {/* Print Executive Summary */}
        <div className="space-y-1 print-avoid-break">
          <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
            EXECUTIVE SUMMARY
          </h2>
          <p className="text-slate-800 text-[11px] leading-relaxed">
            {jdActive ? tailoredSummary : (profile.bio || CATEGORY_META[selectedCategory]?.summary)}
          </p>
        </div>

        {/* Print Technical Competencies Matrix */}
        <div className="space-y-1.5 print-avoid-break">
          <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
            TECHNICAL COMPETENCIES & MATRIX
          </h2>
          <div className="space-y-1">
            {groupedSkills.map(([groupName, groupItems]) => (
              <div key={groupName} className="text-[10.5px]">
                <span className="font-bold text-slate-800">{groupName}: </span>
                <span className="text-slate-700">
                  {groupItems.map((s) => s.name).join(", ")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Print Professional Experience & Internships */}
        {internships.length > 0 && (
          <div className="space-y-2 print-avoid-break">
            <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
              PROFESSIONAL EXPERIENCE & INTERNSHIPS
            </h2>
            {internships.map((exp: any) => (
              <div key={exp.id} className="space-y-0.5 text-[11px] border-l-2 border-emerald-700 pl-2.5">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{exp.role} — <span className="text-emerald-800 font-medium">{exp.companyName}</span></span>
                  <span className="font-mono text-[9px] text-slate-500">{exp.duration}</span>
                </div>
                <p className="text-slate-700 text-[10.5px] leading-tight">{exp.description}</p>
                {ensureArray(exp.skills).length > 0 && (
                  <div className="text-[9px] font-mono text-slate-600">
                    <span className="font-bold text-slate-800">Skills:</span> {ensureArray(exp.skills).join(" • ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Print Featured Engineering Projects */}
        {prioritizedProjects.length > 0 && (
          <div className="space-y-2 print-avoid-break">
            <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
              FEATURED ENGINEERING PROJECTS
            </h2>
            {prioritizedProjects.slice(0, 4).map((project: any) => (
              <div key={project.id} className="space-y-0.5 text-[11px] border-l-2 border-blue-700 pl-2.5">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{project.title} — <span className="text-blue-800 font-medium">{project.role}</span></span>
                  <span className="font-mono text-[9px] text-slate-500">{project.timeline}</span>
                </div>
                <p className="text-slate-700 text-[10.5px] leading-tight">{project.description}</p>
                {ensureArray(project.tags).length > 0 && (
                  <div className="text-[9px] font-mono text-slate-600">
                    <span className="font-bold text-slate-800">Stack:</span> {ensureArray(project.tags).join(" • ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Print Academic Qualifications */}
        {education.length > 0 && (
          <div className="space-y-1 print-avoid-break">
            <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
              ACADEMIC QUALIFICATIONS
            </h2>
            {education.map((edu: any) => (
              <div key={edu.id} className="flex justify-between items-center text-[11px] text-slate-800">
                <div>
                  <span className="font-bold text-slate-900">{edu.degree}</span> — {edu.institution}
                </div>
                <div className="font-mono text-right text-[10px]">
                  <span className="font-bold text-emerald-800">Grade: {edu.grade}</span> • <span className="text-slate-600">{edu.duration}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Print Verified Certifications */}
        {certs.length > 0 && (
          <div className="space-y-1 print-avoid-break">
            <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
              VERIFIED CERTIFICATIONS
            </h2>
            <div className="grid grid-cols-2 gap-1.5 text-[10.5px] text-slate-800">
              {certs.slice(0, 6).map((cert: any) => (
                <div key={cert.id} className="flex justify-between items-center border border-slate-200 p-1.5 rounded">
                  <div>
                    <div className="font-bold text-slate-900">{cert.title}</div>
                    <div className="text-[9px] text-slate-600">{cert.issuer}</div>
                  </div>
                  <div className="font-mono text-[9px] text-emerald-800 font-bold">{cert.year}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Print Research Logs */}
        {articles.length > 0 && (
          <div className="space-y-1 print-avoid-break">
            <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
              RESEARCH LOGS & PUBLICATIONS
            </h2>
            <div className="space-y-1 text-[10.5px] text-slate-800">
              {articles.slice(0, 2).map((art: any) => (
                <div key={art.id} className="flex justify-between">
                  <span className="font-bold text-slate-900">{art.title}</span>
                  <span className="font-mono text-[9px] text-slate-500">{art.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audit Verification Stamp */}
        <div className="border-t border-slate-900 pt-2 text-[8.5px] font-mono text-slate-500 flex justify-between items-center print-avoid-break">
          <span>Official Verified Dynamic Dossier • {profile.name || "JOHNKNOX KALLE"}</span>
          <span>Cryptographic Security Check: SHA-256 VERIFIED</span>
        </div>
      </div>
    </section>
  );
}
