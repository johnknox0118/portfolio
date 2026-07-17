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
  Fingerprint, MessagesSquare, Crown
} from "lucide-react";

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
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [certFilter, setCertFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [projectTab, setProjectTab] = useState("details");
  
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
  const typingTexts = [
    "Compiling secure architectures...",
    "Emulating threat payloads...",
    "Auditing system kernels...",
    "Defending endpoints..."
  ];

  useEffect(() => {
    if (loading) return;
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
  }, [loading]);

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

  const { profile, settings, education, skills, projects, certifications } = data;

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
    <div id="top-portal" className="min-h-screen relative overflow-x-hidden select-none">
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
        <div className="flex items-center gap-10">
          <nav className="hidden md:flex items-center gap-8 text-xs font-orbitron font-semibold tracking-wider text-gray-400">
            <a href="#about" className="hover:text-cyber-green transition-colors">ABOUT</a>
            <a href="#qualifications" className="hover:text-cyber-green transition-colors">QUALIFICATIONS</a>
            <a href="#skills" className="hover:text-cyber-green transition-colors">SKILLS</a>
            <a href="#projects" className="hover:text-cyber-green transition-colors">PROJECTS</a>
            <a href="#certifications" className="hover:text-cyber-green transition-colors">CERTIFICATES</a>
            <a href="#contact" className="hover:text-cyber-green transition-colors">CONTACT</a>
          </nav>
          <a href="/admin/login" className="btn-cyber flex items-center gap-1.5 px-4 py-2 border-cyber-blue/50 text-cyber-blue hover:shadow-[0_0_15px_#00C8FF]">
            <Lock className="w-3.5 h-3.5" />
            ADMIN
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-16 space-y-24">
        {/* HERO SECTION */}
        <section className="min-h-[75vh] flex flex-col md:flex-row items-center justify-between gap-12 py-8 relative">
          <div className="flex-1 space-y-6 text-left">
            <div className="cyber-tag flex gap-1.5 items-center w-fit">
              <span className="w-1.5 h-1.5 bg-cyber-green rounded-full animate-pulse"></span>
              STATUS: GRID SECURE // ACTIVE
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
              <div className="flex justify-between py-1 border-b border-white/5"><span className="text-gray-400">OBJECTIVE:</span><span className="text-white text-right max-w-lg">{profile.careerObjective}</span></div>
              <div className="flex justify-between py-1 border-b border-white/5"><span className="text-gray-400">LOCATION:</span><span className="text-white">{profile.location}</span></div>
              <div className="flex justify-between py-1 border-b border-white/5"><span className="text-gray-400">EMAIL:</span><span className="text-cyber-blue">{profile.email}</span></div>
              <div className="flex justify-between py-1"><span className="text-gray-400">PHONE:</span><span className="text-white">{profile.phone}</span></div>
            </div>
          </div>
        </section>

        {/* ACADEMIC LOG // QUALIFICATIONS */}
        <section id="qualifications" className="space-y-6 scroll-mt-24">
          <div className="flex items-center gap-3">
            <h2 className="font-orbitron text-2xl md:text-3xl font-black text-white">ACADEMIC_LOG // QUALIFICATIONS</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-cyber-blue/40 to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {education.map((edu: any) => (
              <div key={edu.id} className="glass-card p-6 border-cyber-blue/30 space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-orbitron font-bold text-sm text-white">{edu.degree}</h3>
                    <p className="font-mono text-[10px] text-cyber-blue">{edu.institution}</p>
                  </div>
                  <span className="cyber-tag text-[9px] border-cyber-blue/30 text-cyber-blue whitespace-nowrap">{edu.duration}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{edu.description}</p>
                <div className="text-xs font-mono font-bold text-cyber-green">{edu.grade}</div>
              </div>
            ))}
          </div>
        </section>

        {/* SKILLS SECTION */}
        <section id="skills" className="space-y-6 scroll-mt-24">
          <div className="flex items-center gap-3">
            <h2 className="font-orbitron text-2xl md:text-3xl font-black text-white">CORE_SKILLS // TECHNOLOGIES</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-cyber-green/40 to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill: any) => (
              <div key={skill.id} className="glass-card hud-box p-5 space-y-4 hover:border-cyber-green/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-cyber-green bg-cyber-green/5 p-2 rounded-lg border border-cyber-green/10">
                      {getIcon(skill.logo)}
                    </div>
                    <div>
                      <h3 className="font-orbitron font-bold text-sm text-white">{skill.name}</h3>
                      <p className="font-mono text-[9px] text-gray-500 uppercase tracking-wider">{skill.category}</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-cyber-green">{skill.progress}%</span>
                </div>
                <div className="space-y-1.5">
                  <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.progress}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-cyber-green to-cyber-blue rounded-full shadow-[0_0_10px_#00FF9D]"
                    />
                  </div>
                  <div className="flex justify-between font-mono text-[9px] text-gray-500">
                    <span>LEVEL: SECURE</span>
                    <span>EXP: {skill.yearsOfExp} YEARS</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

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
                  <div className="absolute inset-0 bg-[#07111F]/70 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-all duration-300 backdrop-blur-sm z-20">
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setProjectTab("details");
                      }}
                      className="btn-cyber flex items-center gap-1.5 px-4 py-2 border-cyber-green text-cyber-green"
                    >
                      <Eye className="w-4 h-4" /> VIEW SPEC
                    </button>
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noreferrer" className="btn-cyber btn-cyber-blue flex items-center gap-1.5 px-4 py-2">
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
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-orbitron font-bold text-lg text-white group-hover:text-cyber-green transition-colors">{project.title}</h3>
                    <span className="cyber-tag text-[9px] border-emerald-500/20 text-cyber-green">{project.status?.toUpperCase()}</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{project.description}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {project.tags.map((tag: string) => (
                      <span key={tag} className="cyber-tag text-[8.5px] border-white/10 text-gray-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CERTIFICATIONS SECTION */}
        <section id="certifications" className="space-y-6 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <h2 className="font-orbitron text-2xl md:text-3xl font-black text-white">VERIFIED_CREDENTIALS // CERTIFICATES</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-cyber-green/40 to-transparent"></div>
            </div>
            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2 text-[10px] font-orbitron tracking-wider">
              {["all", "certification", "ctf", "award", "course"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCertFilter(cat)}
                  className={`px-3 py-1.5 border rounded uppercase transition-all duration-300 ${
                    certFilter === cat
                      ? "border-cyber-green bg-cyber-green/10 text-cyber-green shadow-[0_0_10px_rgba(0,255,157,0.15)]"
                      : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCerts.map((cert: any) => (
              <div key={cert.id} className="glass-card p-6 flex flex-col gap-4 border-cyber-green/20">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-4">
                    <div className="text-cyber-green bg-cyber-green/5 p-3 rounded-lg border border-cyber-green/10 self-start">
                      {getIcon(cert.icon)}
                    </div>
                    <div>
                      <h3 className="font-orbitron font-bold text-sm text-white leading-snug">{cert.title}</h3>
                      <p className="font-mono text-[10px] text-cyber-blue mt-0.5">{cert.issuer}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="cyber-tag text-[8px] py-0.5 border-cyber-blue/20 text-cyber-blue">{cert.category.toUpperCase()}</span>
                        <span className="text-[10px] font-mono text-gray-500">{cert.year}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{cert.description}</p>
                <div className="flex flex-wrap gap-2">
                  {cert.skills.map((skill: string) => (
                    <span key={skill} className="cyber-tag text-[8px] py-0.5 border-white/5 bg-white/2 text-gray-400">{skill}</span>
                  ))}
                </div>
                <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-2">
                  <div className="text-[10px] font-mono text-gray-500">ID: {cert.credentialId}</div>
                  <a
                    href={cert.verificationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-mono text-cyber-green hover:underline"
                  >
                    SECURE_LINK <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>


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
          <div className="flex gap-6 font-mono text-[10px] text-gray-500">
            <a href={profile.github} target="_blank" rel="noreferrer" className="hover:text-cyber-green">GITHUB</a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:text-cyber-green">LINKEDIN</a>
            <a href={profile.twitter} target="_blank" rel="noreferrer" className="hover:text-cyber-green">TWITTER</a>
            <a href={`mailto:${profile.email}`} className="hover:text-cyber-green">EMAIL</a>
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
            className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-[#07111F]/80 border border-cyber-green/50 text-cyber-green hover:bg-cyber-green/10 transition-colors shadow-[0_0_15px_#00FF9D]"
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
                <div>
                  <div className="cyber-tag text-[9px] border-cyber-blue/30 text-cyber-blue font-bold uppercase tracking-wider mb-2">
                    PROJECT DATA DOSSIER // {selectedProject.id}
                  </div>
                  <h2 className="font-orbitron font-black text-2xl md:text-3xl text-white">{selectedProject.title}</h2>
                  <p className="font-mono text-[10px] text-cyber-green uppercase mt-1">{selectedProject.role}</p>
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
                        {selectedProject.tags.map((t: string) => (
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
                          {selectedProject.challenges.map((c: string, idx: number) => (
                            <li key={idx}>{c}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 bg-cyber-green/5 border border-cyber-green/20 rounded-xl space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-cyber-green uppercase font-orbitron">
                          <Check className="w-4 h-4 text-cyber-green" /> Engineering Countermeasures
                        </div>
                        <ul className="list-disc pl-4 space-y-1.5 text-xs text-gray-400 leading-relaxed">
                          {selectedProject.solutions.map((s: string, idx: number) => (
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
                      {selectedProject.logs.map((log: string, idx: number) => {
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

    </div>
  );
}
