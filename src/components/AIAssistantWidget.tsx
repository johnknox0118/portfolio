"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu, X, Send, User, Bot, Sparkles, Download, Mail, ExternalLink,
  Globe, ShieldCheck, FileText, Code, CheckCircle, ArrowUpRight, Loader2
} from "lucide-react";
import { smoothScrollTo } from "./SmoothScrollProvider";

interface ActionItem {
  type: "link" | "scroll";
  text: string;
  url?: string;
  targetId?: string;
}

interface MessageItem {
  sender: "user" | "ai";
  text: string;
  actions?: ActionItem[];
}

interface AIAssistantWidgetProps {
  data?: any;
}

const ARTICLES = [
  {
    id: "art-1",
    title: "Zero-Trust Architecture in Modern Serverless & Next.js Environments",
    excerpt: "Cryptographic JWT session validation, role-based database access, and perimeter defense in serverless Next.js edge environments.",
    category: "CYBERSECURITY",
    readTime: "6 min read",
    date: "July 2026",
    tags: ["Zero-Trust", "Next.js", "JWT", "PostgreSQL", "App Sec"],
  },
  {
    id: "art-2",
    title: "Building High-Performance 60FPS Interactive HUD Systems in React 19",
    excerpt: "GPU-accelerated compositing, hardware transforms, and Framer Motion spring physics for zero-lag UI rendering.",
    category: "ENGINEERING",
    readTime: "8 min read",
    date: "June 2026",
    tags: ["React 19", "Performance", "CSS GPU", "Framer Motion"],
  },
];

export default function AIAssistantWidget({ data }: AIAssistantWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      sender: "ai",
      text: "Greetings. I am J.A.M.S. // CYBER_AI. I have live system access to all projects, certificates, technical skills, education records, and engineering writeups in Johnknox's portfolio. Ask me to find or open anything!",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Isolate J.A.M.S. chat drawer so mouse wheel / touch never scrolls background
  useEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer || !isOpen) return;

    const stopPropagation = (e: Event) => {
      e.stopPropagation();
    };

    drawer.addEventListener("wheel", stopPropagation, { passive: true });
    drawer.addEventListener("touchmove", stopPropagation, { passive: true });

    return () => {
      drawer.removeEventListener("wheel", stopPropagation);
      drawer.removeEventListener("touchmove", stopPropagation);
    };
  }, [isOpen]);

  const profile = data?.profile || {};
  const projects: any[] = data?.projects || [];
  const skills: any[] = data?.skills || [];
  const certs: any[] = data?.certifications || [];
  const education: any[] = data?.education || [];
  const internships: any[] = data?.internships || [];

  const scrollToSection = (id: string) => {
    smoothScrollTo(`#${id}`, { offset: 0, duration: 1.0 });
  };

  const handleAsk = async (queryText?: string) => {
    const textToProcess = (queryText || input).trim();
    if (!textToProcess || isLoading) return;

    const userMsg: MessageItem = { sender: "user", text: textToProcess };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToProcess,
          history: messages.slice(-6),
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const resData = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: resData.reply || "Transmission received, but payload empty.",
          actions: resData.actions || [],
        },
      ]);
    } catch (error) {
      console.warn("Live /api/ai/chat failed, utilizing local fallback engine:", error);

      // Local Fallback Grounding
      const q = textToProcess.toLowerCase();
      let aiReply = "";
      const actions: ActionItem[] = [];

      const matchedProject = projects.find(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          q.includes(p.title?.toLowerCase()) ||
          (p.category && q.includes(p.category?.toLowerCase())) ||
          (p.tags && Array.isArray(p.tags) && p.tags.some((t: string) => q.includes(t?.toLowerCase())))
      );

      const matchedCert = certs.find(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.issuer?.toLowerCase().includes(q)
      );

      if (matchedProject) {
        aiReply = `🔍 **PROJECT DOSSIER FOUND:**\n\n📌 **${matchedProject.title}**\n🏷️ **Category:** ${matchedProject.category || "Full-Stack System"}\n⚡ **Status:** ${matchedProject.status || "Active"}\n\n📝 ${matchedProject.description}\n\n🛠️ **Tech Tags:** ${Array.isArray(matchedProject.tags) ? matchedProject.tags.join(", ") : matchedProject.tags || "N/A"}`;
        if (matchedProject.liveUrl) actions.push({ type: "link", text: "🚀 Launch Live Project", url: matchedProject.liveUrl });
        if (matchedProject.githubUrl) actions.push({ type: "link", text: "💻 Source Repository", url: matchedProject.githubUrl });
        actions.push({ type: "scroll", text: "📜 Jump to Projects", targetId: "projects" });
      } else if (matchedCert) {
        aiReply = `🛡️ **VERIFIED CREDENTIAL FOUND:**\n\n📜 **${matchedCert.title}**\n🏛️ **Issuer:** ${matchedCert.issuer}\n📅 **Year:** ${matchedCert.year}\n🔑 **Credential ID:** ${matchedCert.credentialId || "AUTHENTICATED"}\n\n📌 ${matchedCert.description || "Official security certification."}`;
        if (matchedCert.verificationUrl) actions.push({ type: "link", text: "🛡️ Verify Credential Link", url: matchedCert.verificationUrl });
        actions.push({ type: "scroll", text: "📜 View Certifications", targetId: "certifications" });
      } else if (q.includes("project") || q.includes("work") || q.includes("portfolio") || q.includes("build") || q.includes("repo")) {
        const projList = projects.slice(0, 4).map((p, i) => `**${i + 1}. ${p.title}** (${p.category || "System"})\n   └ ${p.description}`).join("\n\n");
        aiReply = `⚡ Johnknox has engineered **${projects.length} major production projects**:\n\n${projList}\n\nAsk me about any specific project to inspect its architecture or launch it!`;
        actions.push({ type: "scroll", text: "📜 Explore Projects Ledger", targetId: "projects" });
      } else if (q.includes("cert") || q.includes("credential") || q.includes("qualification") || q.includes("degree")) {
        const certList = certs.map((c) => `✓ **${c.title}** — ${c.issuer} (${c.year})`).join("\n");
        const eduList = education.map((e) => `🎓 **${e.degree}** — ${e.institution}`).join("\n");
        aiReply = `🛡️ **Verified Credentials & Academic Ledger:**\n\n${certList}\n\n${eduList}`;
        actions.push({ type: "scroll", text: "📜 View Qualifications Timeline", targetId: "qualifications" });
        actions.push({ type: "scroll", text: "🛡️ View Credentials Matrix", targetId: "certifications" });
      } else if (q.includes("skill") || q.includes("stack") || q.includes("tech") || q.includes("python") || q.includes("react")) {
        const topSkills = skills.slice(0, 8).map((s) => `• **${s.name}** (${s.progress || 90}% — ${s.yearsOfExp || 2} yrs exp)`).join("\n");
        aiReply = `⚡ **Verified Technical Skills Stack:**\n\n${topSkills}`;
        actions.push({ type: "scroll", text: "⚡ View Interactive Skills Matrix", targetId: "skills" });
      } else if (q.includes("contact") || q.includes("email") || q.includes("phone") || q.includes("hire") || q.includes("location")) {
        aiReply = `📬 **Direct Communication Channels:**\n\n📧 **Email:** [${profile.email || "johnknox.kalle@gmail.com"}](mailto:${profile.email || "johnknox.kalle@gmail.com"})\n📞 **Phone:** ${profile.phone || "+91 9182597274"}\n📍 **Location:** ${profile.location || "Tamilnadu, India"}`;
        if (profile.email) actions.push({ type: "link", text: "📧 Send Direct Email", url: `mailto:${profile.email}` });
        if (profile.linkedin) actions.push({ type: "link", text: "🔗 Open LinkedIn", url: profile.linkedin });
        if (profile.github) actions.push({ type: "link", text: "🐙 Open GitHub", url: profile.github });
        actions.push({ type: "scroll", text: "✉️ Open Contact Form", targetId: "contact" });
      } else if (q.includes("resume") || q.includes("cv") || q.includes("download")) {
        aiReply = "📄 You can view or download Johnknox Kalle's official verified resume dossier using the action below:";
        if (profile.resumeUrl) actions.push({ type: "link", text: "📥 Download Official Resume PDF", url: profile.resumeUrl });
        actions.push({ type: "scroll", text: "📜 Open Resume Section", targetId: "dossier" });
      } else {
        aiReply = `🤖 **Greetings.** I am J.A.M.S. // CYBER_AI v2.0.\n\nI have dynamic access to all ${projects.length} projects, ${certs.length} certificates, ${skills.length} technical skills, and research papers. Try asking:\n\n• "Show projects"\n• "Show certifications"\n• "What are his technical skills?"\n• "Get contact information"`;
        actions.push({ type: "scroll", text: "📜 View Projects", targetId: "projects" });
      }

      setMessages((prev) => [...prev, { sender: "ai", text: aiReply, actions }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  const content = (
    <>
      {/* Floating Trigger Button - Responsive Mobile/Desktop Positioning */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[99999] pointer-events-auto">
        {/* Floating Levitation Motion Wrapper */}
        <motion.div
          animate={{
            y: [0, -7, 0],
            rotate: [-0.3, 0.3, -0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative group cursor-pointer"
        >
          {/* Subtle Refined Ambient Backdrop Glow */}
          <motion.div
            animate={{
              scale: [0.96, 1.05, 0.96],
              opacity: [0.18, 0.32, 0.18],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute -inset-1 rounded-full blur-md -z-10"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(0, 255, 157, 0.35) 0%, rgba(0, 200, 255, 0.15) 50%, transparent 75%)",
            }}
          />

          {/* Main Button Shell - Sleek Dark Obsidian with Controlled Luminance */}
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsOpen((prev) => !prev)}
            className="relative flex items-center gap-2.5 px-3.5 py-2 sm:px-4.5 sm:py-2.5 rounded-full bg-[#050e18]/95 border border-cyber-green/35 text-white backdrop-blur-xl shadow-[0_0_15px_rgba(0,255,157,0.18)] hover:shadow-[0_0_24px_rgba(0,255,157,0.4)] transition-shadow duration-300 cursor-pointer overflow-hidden select-none"
          >
            {/* Subtle Rotating Laser Border Sweep */}
            <div
              className="pointer-events-none absolute -inset-[1.5px] rounded-full overflow-hidden z-0"
              style={{
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "exclude",
                WebkitMaskComposite: "xor",
                padding: "1.5px",
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0deg, rgba(0,255,157,0.55) 50deg, rgba(0,200,255,0.35) 85deg, transparent 120deg)",
                }}
              />
            </div>

            {/* Icon & Refined Radar Ping */}
            <div className="relative z-10 flex items-center justify-center">
              <div className="relative p-1 rounded-md bg-cyber-green/10 border border-cyber-green/25 shadow-[0_0_6px_rgba(0,255,157,0.2)]">
                <Cpu className="w-4 h-4 text-cyber-green drop-shadow-[0_0_4px_rgba(0,255,157,0.5)] animate-pulse" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-green/70 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyber-green/90 shadow-[0_0_4px_#00FF9D]" />
              </span>
            </div>

            {/* Crisp, Balanced Typography */}
            <div className="relative z-10 flex items-center gap-1.5 font-orbitron font-bold tracking-wider text-xs sm:text-[13px]">
              <motion.span
                animate={{
                  textShadow: [
                    "0 0 3px rgba(0,255,157,0.4)",
                    "0 0 6px rgba(0,255,157,0.7), 0 0 10px rgba(0,200,255,0.3)",
                    "0 0 3px rgba(0,255,157,0.4)",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="text-white tracking-wider"
              >
                J.A.M.S.
              </motion.span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyber-green/15 text-cyber-green border border-cyber-green/30 shadow-[0_0_6px_rgba(0,255,157,0.2)]">
                AI
              </span>
            </div>

            {/* Refined Sparkle Accent */}
            <Sparkles className="w-3.5 h-3.5 text-cyber-green/80 animate-pulse relative z-10 hidden sm:inline-block drop-shadow-[0_0_3px_rgba(0,255,157,0.4)]" />
          </motion.button>
        </motion.div>
      </div>

      {/* AI Assistant Chat Drawer - Responsive Mobile/Desktop Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={drawerRef}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            style={{ overscrollBehavior: "contain" }}
            className="fixed bottom-16 right-3 left-3 sm:left-auto sm:right-6 sm:bottom-20 z-[100000] w-auto sm:w-[420px] max-w-full"
          >
            <div
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              style={{ overscrollBehavior: "contain" }}
              className="glass-card border-cyber-green/40 bg-[#07111F]/95 rounded-2xl p-5 shadow-[0_0_60px_rgba(0,255,157,0.25)] hud-box flex flex-col h-[540px] max-h-[82vh]"
            >
              {/* Header Bar */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <Bot className="w-5 h-5 text-cyber-green" />
                  <div>
                    <div className="font-orbitron font-black text-xs text-white uppercase tracking-wider">
                      J.A.M.S. // ASSISTANT v2.0
                    </div>
                    <div className="font-mono text-[9px] text-cyber-green flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse" />
                      LIVE KNOWLEDGE ENGINE ACTIVE
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Prompt Chips */}
              <div className="flex flex-wrap gap-1.5 py-3 border-b border-white/5">
                {[
                  { label: "Who is Johnknox?", q: "Who is Johnknox?" },
                  { label: "Show top projects", q: "Show top projects" },
                  { label: "What are his skills?", q: "What are his skills?" },
                  { label: "Download resume", q: "Download resume" },
                ].map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => handleAsk(chip.q)}
                    className="cyber-tag text-[9px] border-white/10 hover:border-cyber-green text-gray-300 hover:text-cyber-green px-2.5 py-1 transition-all cursor-pointer"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Messages Output Scroll Region */}
              <div
                data-lenis-prevent="true"
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                style={{ overscrollBehavior: "contain" }}
                className="flex-1 overflow-y-auto overscroll-contain font-mono text-xs my-3 pr-2 space-y-4"
              >
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[88%] p-3.5 rounded-xl text-xs leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-cyber-blue/15 border border-cyber-blue/30 text-white rounded-br-none"
                          : "bg-black/60 border border-white/10 text-gray-200 rounded-bl-none"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider mb-1.5 text-gray-400">
                        {msg.sender === "user" ? (
                          <User className="w-3 h-3 text-cyber-blue" />
                        ) : (
                          <Sparkles className="w-3 h-3 text-cyber-green" />
                        )}
                        {msg.sender === "user" ? "You" : "J.A.M.S. AI"}
                      </div>
                      <pre className="font-mono whitespace-pre-wrap text-xs text-gray-200 leading-relaxed font-sans">
                        {msg.text}
                      </pre>

                      {/* Interactive Action Launcher Buttons */}
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-white/10">
                          {msg.actions.map((act, aIdx) => (
                            <button
                              key={aIdx}
                              onClick={() => {
                                if (act.type === "link" && act.url) {
                                  window.open(act.url, "_blank");
                                } else if (act.type === "scroll" && act.targetId) {
                                  scrollToSection(act.targetId);
                                  setIsOpen(false);
                                }
                              }}
                              className="cyber-tag text-[9.5px] border-cyber-green/40 bg-cyber-green/10 text-cyber-green hover:bg-cyber-green hover:text-black font-mono font-bold px-2.5 py-1.5 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <span>{act.text}</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {/* Real-time Decrypting/Thinking Indicator */}
                {isLoading && (
                  <div className="flex gap-3 justify-start animate-fade-in">
                    <div className="max-w-[88%] p-3 rounded-xl text-xs bg-black/70 border border-cyber-green/40 text-cyber-green rounded-bl-none flex items-center gap-2.5 shadow-[0_0_20px_rgba(0,255,157,0.18)]">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-cyber-green shrink-0" />
                      <span className="font-mono text-[10px] animate-pulse tracking-wide font-bold">
                        J.A.M.S. DECRYPTING PACKET & QUERYING LIVE MATRIX...
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAsk();
                }}
                className="flex items-center gap-2 pt-2 border-t border-white/10"
              >
                <input
                  type="text"
                  disabled={isLoading}
                  placeholder={isLoading ? "J.A.M.S. is synthesizing..." : "Ask J.A.M.S. to find/open projects, certs, skills..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-cyber-green disabled:opacity-50 transition-all"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="btn-cyber p-2.5 border-cyber-green text-cyber-green rounded-xl hover:bg-cyber-green hover:text-black disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-cyber-green transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return createPortal(content, document.body);
}
