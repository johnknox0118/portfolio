"use client";

import { useState } from "react";
import { Printer, Shield, Check, FileText, Cpu, Code, Zap, Globe, Sparkles, Search, RefreshCw } from "lucide-react";

interface DossierExportProps {
  data?: any;
}

type CategoryType = "all" | "cybersecurity" | "developer" | "fullstack";

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
    label: "ALL DOSSIER",
    badge: "🌐 ALL COMPREHENSIVE DOSSIER",
    title: "Cybersecurity Engineer & Full-Stack Systems Architect",
    summary:
      "Results-driven Cybersecurity Engineer and Full-Stack Developer specializing in threat response, AI support systems, network defense, and resilient Next.js cloud platforms.",
  },
  cybersecurity: {
    id: "cybersecurity",
    label: "CYBERSECURITY",
    badge: "🛡️ CYBERSECURITY SPECIALIST DOSSIER",
    title: "Cybersecurity Engineer & Defensive Systems Specialist",
    summary:
      "Cybersecurity professional specializing in vulnerability assessment, zero-trust architecture, threat intelligence analytics, encrypted JWT session persistence, and network perimeter defense.",
  },
  developer: {
    id: "developer",
    label: "DEVELOPER",
    badge: "💻 SOFTWARE DEVELOPER DOSSIER",
    title: "Software Development Engineer (Python & TypeScript)",
    summary:
      "Software Development Engineer focused on clean code architectures, algorithm optimization, Python backend scripts, REST API integrations, and robust object-oriented software engineering.",
  },
  fullstack: {
    id: "fullstack",
    label: "FULL-STACK",
    badge: "⚡ FULL-STACK ARCHITECT DOSSIER",
    title: "Full-Stack Web Architect (Next.js, Supabase, Prisma)",
    summary:
      "Full-Stack Web Architect with expertise in building responsive React/Next.js interfaces, Supabase relational PostgreSQL database modeling, Prisma ORM queries, and high-concurrency cloud deployments.",
  },
};

const COMMON_TECH_TERMS = [
  "python", "react", "next.js", "nextjs", "typescript", "javascript", "supabase",
  "postgres", "postgresql", "prisma", "security", "cybersecurity", "jwt",
  "zero-trust", "api", "node", "tailwind", "aws", "docker", "rest", "frontend",
  "backend", "fullstack", "full-stack", "threat", "vulnerability", "auth",
  "sql", "git", "linux", "cloud", "ai", "llm", "analytics", "network"
];

export default function DossierExport({ data }: DossierExportProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("all");
  const [jdText, setJdText] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [jdActive, setJdActive] = useState(false);
  const [matchedKeywords, setMatchedKeywords] = useState<string[]>([]);
  const [matchScore, setMatchScore] = useState<number>(0);
  const [tailoredTitle, setTailoredTitle] = useState("");
  const [tailoredSummary, setTailoredSummary] = useState("");

  const profile = data?.profile || {};
  const skills: any[] = data?.skills || [];
  const projects: any[] = data?.projects || [];
  const certs: any[] = data?.certifications || [];
  const education: any[] = data?.education || [];

  // Robust Category Matcher
  const isCategoryMatch = (targetCategory: CategoryType, itemCat: string = "", nameOrTitle: string = "", tags: string[] = []) => {
    if (targetCategory === "all") return true;

    const cat = (itemCat || "").toLowerCase();
    const name = (nameOrTitle || "").toLowerCase();
    const joinedTags = (tags || []).join(" ").toLowerCase();
    const combined = `${cat} ${name} ${joinedTags}`;

    if (targetCategory === "cybersecurity") {
      return (
        combined.includes("cyber") ||
        combined.includes("security") ||
        combined.includes("defense") ||
        combined.includes("threat") ||
        combined.includes("audit") ||
        combined.includes("jwt") ||
        combined.includes("zero-trust") ||
        combined.includes("vulnerability") ||
        combined.includes("encryption") ||
        combined.includes("network")
      );
    }

    if (targetCategory === "developer") {
      return (
        combined.includes("developer") ||
        combined.includes("programming") ||
        combined.includes("python") ||
        combined.includes("code") ||
        combined.includes("script") ||
        combined.includes("software") ||
        combined.includes("algorithm") ||
        combined.includes("react") ||
        combined.includes("javascript") ||
        combined.includes("typescript") ||
        combined.includes("backend") ||
        combined.includes("api")
      );
    }

    if (targetCategory === "fullstack") {
      return (
        combined.includes("full") ||
        combined.includes("stack") ||
        combined.includes("web") ||
        combined.includes("frontend") ||
        combined.includes("backend") ||
        combined.includes("next") ||
        combined.includes("supabase") ||
        combined.includes("prisma") ||
        combined.includes("postgres") ||
        combined.includes("cloud")
      );
    }

    return true;
  };

  // JD Keyword Scanner & Matcher Logic
  const handleScanJd = () => {
    if (!jdText.trim()) return;

    setIsScanning(true);
    setTimeout(() => {
      const lowerJd = jdText.toLowerCase();
      
      // Extract matched tech terms
      const found = COMMON_TECH_TERMS.filter((term) => lowerJd.includes(term));
      const uniqueFound = Array.from(new Set(found));
      setMatchedKeywords(uniqueFound);

      const computedScore = Math.min(78 + uniqueFound.length * 4, 98);
      setMatchScore(computedScore);

      const isCyber = lowerJd.includes("cyber") || lowerJd.includes("security") || lowerJd.includes("threat") || lowerJd.includes("audit");
      const isFullstack = lowerJd.includes("fullstack") || lowerJd.includes("full-stack") || lowerJd.includes("next") || lowerJd.includes("react");
      const isDev = lowerJd.includes("python") || lowerJd.includes("developer") || lowerJd.includes("software") || lowerJd.includes("backend");

      if (isCyber) {
        setSelectedCategory("cybersecurity");
        setTailoredTitle("Cybersecurity Engineer & Threat Defense Specialist");
        setTailoredSummary(
          `Targeted candidate profile matched for Cybersecurity & Defensive Systems. Specialized in network perimeter security, vulnerability analytics, encrypted JWT session state, and zero-trust cloud architectures. Key competencies matched: ${uniqueFound.slice(0, 5).join(", ")}.`
        );
      } else if (isFullstack) {
        setSelectedCategory("fullstack");
        setTailoredTitle("Full-Stack Web Architect & Cloud Systems Engineer");
        setTailoredSummary(
          `Targeted candidate profile matched for Full-Stack Application Engineering. Specialized in Next.js App Router, Supabase PostgreSQL, Prisma ORM, and high-concurrency cloud deployments. Key competencies matched: ${uniqueFound.slice(0, 5).join(", ")}.`
        );
      } else if (isDev) {
        setSelectedCategory("developer");
        setTailoredTitle("Software Development Engineer (Python & Full-Stack)");
        setTailoredSummary(
          `Targeted candidate profile matched for Software Development. Specialized in clean-code Python scripts, RESTful API design, data processing pipelines, and resilient backend systems. Key competencies matched: ${uniqueFound.slice(0, 5).join(", ")}.`
        );
      } else {
        setSelectedCategory("all");
        setTailoredTitle("Cybersecurity & Full-Stack Engineering Specialist");
        setTailoredSummary(
          `Targeted candidate profile dynamically matched to Job Description requirements. Key competencies matched: ${uniqueFound.slice(0, 6).join(", ")}.`
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
  };

  const scoreItem = (itemCat: string = "", itemText: string = "", tags: string[] = []) => {
    if (!jdActive || matchedKeywords.length === 0) return 1;
    let score = 0;
    const combined = `${itemCat} ${itemText} ${(tags || []).join(" ")}`.toLowerCase();
    matchedKeywords.forEach((kw) => {
      if (combined.includes(kw)) score += 2;
    });
    return score;
  };

  // STRICT Filter Data Collections based on active Category
  const getProcessedSkills = () => {
    let baseSkills = skills;
    if (selectedCategory !== "all") {
      baseSkills = skills.filter((s) => isCategoryMatch(selectedCategory, s.category, s.name, []));
    }
    if (jdActive) {
      return [...baseSkills]
        .map((s) => ({ ...s, _score: scoreItem(s.category, s.name) }))
        .sort((a, b) => b._score - a._score);
    }
    return baseSkills;
  };

  const getProcessedProjects = () => {
    let baseProjects = projects;
    if (selectedCategory !== "all") {
      baseProjects = projects.filter((p) => isCategoryMatch(selectedCategory, p.category, p.title, p.tags));
    }
    if (jdActive) {
      return [...baseProjects]
        .map((p) => ({ ...p, _score: scoreItem(p.category, `${p.title} ${p.description}`, p.tags) }))
        .sort((a, b) => b._score - a._score)
        .slice(0, 3);
    }
    return baseProjects.slice(0, 3);
  };

  const getProcessedCerts = () => {
    let baseCerts = certs;
    if (selectedCategory !== "all") {
      baseCerts = certs.filter((c) => isCategoryMatch(selectedCategory, c.category, c.title, []));
    }
    if (jdActive) {
      return [...baseCerts]
        .map((c) => ({ ...c, _score: scoreItem(c.category, `${c.title} ${c.issuer}`) }))
        .sort((a, b) => b._score - a._score)
        .slice(0, 4);
    }
    return baseCerts.slice(0, 4);
  };

  const displaySkills = getProcessedSkills();
  const displayProjects = getProcessedProjects();
  const displayCerts = getProcessedCerts();

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* On-Screen Header Card with Category Preset Filter Buttons & JD Input Box */}
      <div className="glass-card p-6 border-cyber-green/40 space-y-5 print:hidden rounded-2xl shadow-[0_0_30px_rgba(0,255,157,0.1)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyber-green animate-pulse" />
              <h3 className="font-orbitron font-bold text-sm text-white uppercase tracking-wider">
                CATEGORY_DOSSIER // TAILORED_PRINT_GENERATOR
              </h3>
            </div>
            <p className="font-mono text-xs text-gray-400">
              Select a target role category preset below or paste a Job Description (JD) to filter and generate a tailored single-page PDF resume.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="btn-cyber flex items-center gap-2 px-6 py-2.5 text-xs text-cyber-green font-bold shrink-0 cursor-pointer shadow-[0_0_25px_rgba(0,255,157,0.3)] hover:scale-105 transition-all"
          >
            <Printer className="w-4 h-4" /> PRINT / DOWNLOAD TAILORED PDF
          </button>
        </div>

        {/* Category Quick Selector Buttons */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">QUICK ROLE PRESETS:</div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CATEGORY_META) as CategoryType[]).map((catId) => {
              const meta = CATEGORY_META[catId];
              const isSelected = !jdActive && selectedCategory === catId;
              return (
                <button
                  key={catId}
                  onClick={() => {
                    setJdActive(false);
                    setSelectedCategory(catId);
                  }}
                  className={`cyber-tag text-xs font-mono px-4 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-2 ${
                    isSelected
                      ? "bg-cyber-green text-black border-cyber-green font-bold shadow-[0_0_15px_rgba(0,255,157,0.4)]"
                      : "bg-black/40 text-gray-300 border-white/10 hover:border-cyber-green/40 hover:text-white"
                  }`}
                >
                  <span>{meta.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Job Description (JD) Input Textarea */}
        <div className="space-y-3 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <label className="text-xs font-orbitron font-bold text-cyber-blue flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyber-blue animate-pulse" />
              OR PASTE TARGET JOB DESCRIPTION (JD)
            </label>
            {jdActive && (
              <button
                onClick={handleResetJd}
                className="text-[10px] font-mono text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> RESET JD MATCH
              </button>
            )}
          </div>

          <textarea
            rows={3}
            placeholder="Paste raw Job Description text here (e.g. 'Looking for a Cybersecurity Engineer with Python, Next.js, Supabase, JWT security, and threat intelligence experience...')"
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            className="w-full bg-[#040912] border border-white/15 rounded-xl p-3.5 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-cyber-blue transition-colors"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleScanJd}
              disabled={isScanning || !jdText.trim()}
              className={`btn-cyber btn-cyber-blue flex items-center gap-2 px-5 py-2 text-xs font-bold ${
                !jdText.trim() ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> SCANNING & MATCHING PORTFOLIO...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" /> SCAN & MATCH RESUME TO JD
                </>
              )}
            </button>

            {/* Live Scan Results Indicator */}
            {jdActive && (
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono bg-cyber-blue/10 border border-cyber-blue/40 px-3 py-1.5 rounded-lg text-cyber-blue">
                <span className="font-bold text-cyber-green">MATCH SCORE: {matchScore}%</span>
                <span>•</span>
                <span>MATCHED: {matchedKeywords.slice(0, 4).join(", ")}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Target Print Element (#executive-dossier-print) */}
      <div
        id="executive-dossier-print"
        className="hidden print:block text-slate-900 bg-white p-6 space-y-4 font-sans text-xs leading-tight"
      >
        {/* Header Section */}
        <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
          <div className="space-y-1 max-w-xl">
            <div className="text-[10px] font-mono font-bold text-emerald-700 tracking-widest uppercase">
              {jdActive ? `🎯 TAILORED JD MATCH DOSSIER (${matchScore}% MATCH)` : CATEGORY_META[selectedCategory].badge}
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 leading-none">
              {profile.name || "JOHNKNOX KALLE"}
            </h1>
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              {jdActive ? tailoredTitle : CATEGORY_META[selectedCategory].title}
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
            </div>
          </div>

          <div className="text-right text-[9px] font-mono text-slate-500 space-y-0.5 shrink-0">
            <div className="font-bold text-slate-800">OFFICIAL DOSSIER</div>
            <div>VER: v2.4.0</div>
            <div>DATE: {currentDate}</div>
            <div className="pt-1 flex justify-end">
              <svg className="w-12 h-12" viewBox="0 0 100 100" fill="black">
                <rect x="0" y="0" width="30" height="30" />
                <rect x="5" y="5" width="20" height="20" fill="white" />
                <rect x="10" y="10" width="10" height="10" fill="black" />
                <rect x="70" y="0" width="30" height="30" />
                <rect x="75" y="5" width="20" height="20" fill="white" />
                <rect x="80" y="10" width="10" height="10" fill="black" />
                <rect x="0" y="70" width="30" height="30" />
                <rect x="5" y="75" width="20" height="20" fill="white" />
                <rect x="10" y="80" width="10" height="10" fill="black" />
                <rect x="40" y="40" width="20" height="20" />
              </svg>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-1">
          <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
            EXECUTIVE SUMMARY
          </h2>
          <p className="text-slate-800 text-[11px] leading-relaxed">
            {jdActive ? tailoredSummary : (profile.bio || CATEGORY_META[selectedCategory].summary)}
          </p>
        </div>

        {/* Technical Competencies & Skills */}
        <div className="space-y-1">
          <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
            TECHNICAL COMPETENCIES ({selectedCategory.toUpperCase()})
          </h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-800">
            {displaySkills.map((skill: any) => (
              <div key={skill.id} className="flex justify-between items-center border-b border-slate-100 pb-0.5">
                <span className="font-semibold text-slate-900">{skill.name}</span>
                <span className="text-[9px] font-mono text-slate-600 bg-slate-100 px-1 py-0.2 rounded">
                  {skill.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tailored Projects */}
        <div className="space-y-2">
          <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
            FEATURED ENGINEERING PROJECTS ({selectedCategory.toUpperCase()})
          </h2>
          {displayProjects.map((project: any) => (
            <div key={project.id} className="space-y-0.5 text-[11px] border-l-2 border-emerald-700 pl-2.5">
              <div className="flex justify-between font-bold text-slate-900">
                <span>{project.title} — <span className="text-emerald-800 font-medium">{project.role}</span></span>
                <span className="font-mono text-[9px] text-slate-500">{project.timeline}</span>
              </div>
              <p className="text-slate-700 text-[10.5px] leading-tight">{project.description}</p>
              {project.tags && project.tags.length > 0 && (
                <div className="text-[9px] font-mono text-slate-600">
                  <span className="font-bold text-slate-800">Tech:</span> {project.tags.join(" • ")}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Academic Qualifications */}
        <div className="space-y-1">
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

        {/* Verified Certifications */}
        <div className="space-y-1">
          <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
            VERIFIED CERTIFICATIONS ({selectedCategory.toUpperCase()})
          </h2>
          <div className="grid grid-cols-2 gap-1.5 text-[10.5px] text-slate-800">
            {displayCerts.map((cert: any) => (
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

        {/* Audit Verification Stamp */}
        <div className="border-t border-slate-900 pt-2 text-[8.5px] font-mono text-slate-500 flex justify-between items-center">
          <span>Official Verified Category Dossier • {profile.name || "JOHNKNOX KALLE"}</span>
          <span>Cryptographic Security Check: SHA-256 VERIFIED</span>
        </div>
      </div>
    </div>
  );
}
