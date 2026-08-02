"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu, X, Send, User, Bot, Sparkles, Download, Mail, ExternalLink,
  Globe, ShieldCheck, FileText, Code, CheckCircle, ArrowUpRight
} from "lucide-react";

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
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      sender: "ai",
      text: "Greetings. I am J.A.M.S. // CYBER_AI. I have live system access to all projects, certificates, technical skills, education records, and engineering writeups in Johnknox's portfolio. Ask me to find or open anything!",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const profile = data?.profile || {};
  const projects: any[] = data?.projects || [];
  const skills: any[] = data?.skills || [];
  const certs: any[] = data?.certifications || [];
  const education: any[] = data?.education || [];
  const internships: any[] = data?.internships || [];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleAsk = (queryText?: string) => {
    const textToProcess = (queryText || input).trim();
    if (!textToProcess) return;

    const userMsg: MessageItem = { sender: "user", text: textToProcess };
    const q = textToProcess.toLowerCase();

    let aiReply = "";
    const actions: ActionItem[] = [];

    // 1. SPECIFIC PROJECT SEARCH & INTENT MATCHING
    const matchedProject = projects.find(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        q.includes(p.title.toLowerCase()) ||
        (p.category && q.includes(p.category.toLowerCase())) ||
        (p.tags && p.tags.some((t: string) => q.includes(t.toLowerCase())))
    );

    // 2. SPECIFIC CERTIFICATE SEARCH
    const matchedCert = certs.find(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.issuer.toLowerCase().includes(q) ||
        (c.category && q.includes(c.category.toLowerCase()))
    );

    // 3. SPECIFIC ARTICLE SEARCH
    const matchedArticle = ARTICLES.find(
      (a) => a.title.toLowerCase().includes(q) || a.tags.some((t) => q.includes(t.toLowerCase()))
    );

    if (matchedProject && (q.includes("project") || q.includes("open") || q.includes("show") || q.includes("view") || q.includes("tell") || q.includes(matchedProject.title.toLowerCase()))) {
      aiReply = `🔍 PROJECT DOSSIER FOUND:\n\n📌 Title: ${matchedProject.title}\n🏷️ Category: ${matchedProject.category || "Full-Stack System"}\n⚡ Status: ${matchedProject.status || "Active"}\n\n📝 Description: ${matchedProject.description}\n\n🛠️ Tech Tags: ${matchedProject.tags?.join(", ") || "N/A"}`;
      
      if (matchedProject.liveUrl) {
        actions.push({ type: "link", text: "🚀 Launch Live Project", url: matchedProject.liveUrl });
      }
      if (matchedProject.githubUrl) {
        actions.push({ type: "link", text: "💻 Source Repository", url: matchedProject.githubUrl });
      }
      actions.push({ type: "scroll", text: "📜 Jump to Projects Section", targetId: "projects" });

    } else if (matchedCert && (q.includes("cert") || q.includes("credential") || q.includes("open") || q.includes("verify") || q.includes(matchedCert.title.toLowerCase()))) {
      aiReply = `🛡️ VERIFIED CREDENTIAL DOSSIER:\n\n📜 Title: ${matchedCert.title}\n🏛️ Issuer: ${matchedCert.issuer}\n📅 Year: ${matchedCert.year}\n🔑 Credential ID: ${matchedCert.credentialId || "AUTHENTICATED"}\n\n📌 Description: ${matchedCert.description || "Official security certification."}`;
      
      if (matchedCert.verificationUrl) {
        actions.push({ type: "link", text: "🛡️ Verify Credential Link", url: matchedCert.verificationUrl });
      }
      actions.push({ type: "scroll", text: "📜 View Certifications Matrix", targetId: "certifications" });

    } else if (matchedArticle && (q.includes("article") || q.includes("paper") || q.includes("blog") || q.includes("read"))) {
      aiReply = `📄 ENGINEERING RESEARCH ARTICLE:\n\n📰 Title: ${matchedArticle.title}\n⏱️ Read Time: ${matchedArticle.readTime}\n🏷️ Category: ${matchedArticle.category}\n\nSummary: ${matchedArticle.excerpt}`;
      actions.push({ type: "scroll", text: "📖 Open Research Articles Drawer", targetId: "blog" });

    } else if (q.includes("project") || q.includes("work") || q.includes("portfolio") || q.includes("build") || q.includes("repo")) {
      const projList = projects.map((p, i) => `[${i + 1}] ${p.title} (${p.category || "Web App"})\n   └ ${p.description}`).join("\n\n");
      aiReply = ` Johnknox has engineered ${projects.length} major production projects:\n\n${projList || "Security platforms and full-stack web applications."}`;
      actions.push({ type: "scroll", text: "📜 Explore Projects Ledger", targetId: "projects" });

    } else if (q.includes("cert") || q.includes("credential") || q.includes("qualification") || q.includes("degree") || q.includes("college") || q.includes("gpa")) {
      const certList = certs.map((c) => `✓ ${c.title} — ${c.issuer} (${c.year})`).join("\n");
      const eduList = education.map((e) => `🎓 ${e.degree} — ${e.institution}`).join("\n");
      aiReply = ` Verified Credentials & Academic Ledger:\n\nCertifications:\n${certList || "Verified Security Credentials"}\n\nAcademic Education:\n${eduList || "Prathyusha Engineering College"}`;
      actions.push({ type: "scroll", text: "📜 View Qualifications Timeline", targetId: "qualifications" });
      actions.push({ type: "scroll", text: "🛡️ View Credentials Matrix", targetId: "certifications" });

    } else if (q.includes("skill") || q.includes("stack") || q.includes("tech") || q.includes("python") || q.includes("react") || q.includes("language")) {
      const topSkills = skills.map((s) => `• ${s.name} (${s.progress || 90}% — ${s.yearsOfExp || 2} yrs exp)`).join("\n");
      aiReply = ` Verified Technical Skills Stack:\n\n${topSkills || "Cybersecurity, Python, Next.js, PostgreSQL, Cloud Security"}`;
      actions.push({ type: "scroll", text: "⚡ View Interactive Skills Matrix", targetId: "skills" });

    } else if (q.includes("contact") || q.includes("email") || q.includes("phone") || q.includes("hire") || q.includes("location") || q.includes("linkedin") || q.includes("github")) {
      aiReply = ` Direct Communication Channels:\n\n📧 Email: ${profile.email || "johnknox.kalle@gmail.com"}\n📞 Phone: ${profile.phone || "+91 9182597274"}\n📍 Location: ${profile.location || "Prathyusha Engineering College, Thiruvallur, Tamilnadu"}`;
      if (profile.email) actions.push({ type: "link", text: "📧 Send Direct Email", url: `mailto:${profile.email}` });
      if (profile.linkedin) actions.push({ type: "link", text: "🔗 Open LinkedIn Profile", url: profile.linkedin });
      if (profile.github) actions.push({ type: "link", text: "🐙 Open GitHub Developer Profile", url: profile.github });
      actions.push({ type: "scroll", text: "✉️ Open Contact Form", targetId: "contact" });

    } else if (q.includes("resume") || q.includes("cv") || q.includes("download")) {
      aiReply = " You can view or download Johnknox Kalle's official verified resume dossier using the action below.";
      if (profile.resumeUrl) {
        actions.push({ type: "link", text: "📥 Download Official Resume PDF", url: profile.resumeUrl });
      } else {
        actions.push({ type: "scroll", text: "📜 View Profile Bio & Details", targetId: "about" });
      }

    } else if (q.includes("who") || q.includes("bio") || q.includes("about") || q.includes("johnknox") || q.includes("kalle")) {
      aiReply = ` ${profile.name || "Johnknox Kalle"} // ${profile.title || "Cybersecurity Engineer & Systems Architect"}\n\nTagline: ${profile.tagline || "Securing Systems & Building Resilient Infrastructure"}\n\nBio: ${profile.bio || "Specializing in threat analysis, secure system architectures, Python development, and full-stack cloud applications."}`;
      if (profile.resumeUrl) actions.push({ type: "link", text: "📥 Download Resume PDF", url: profile.resumeUrl });
      actions.push({ type: "scroll", text: "📜 View Full Dossier", targetId: "about" });

    } else {
      aiReply = `🤖 I analyzed your query regarding "${textToProcess}".\n\nI have dynamic access to all ${projects.length} projects, ${certs.length} certificates, ${skills.length} technical skills, and research papers. Try asking:\n\n• "Open project [name]"\n• "Show certifications"\n• "What are his technical skills?"\n• "Get contact information"\n• "Download resume"`;
    }

    setMessages((prev) => [...prev, userMsg, { sender: "ai", text: aiReply, actions }]);
    setInput("");
  };

  if (!mounted) return null;

  const content = (
    <>
      {/* Floating Trigger Button - Responsive Mobile/Desktop Positioning */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[99999]">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen((prev) => !prev)}
          className="btn-cyber flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 bg-[#07111F]/90 border-cyber-green text-cyber-green rounded-full shadow-[0_0_30px_rgba(0,255,157,0.4)] backdrop-blur-md font-mono text-xs font-bold cursor-pointer"
        >
          <div className="relative">
            <Cpu className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse text-cyber-green" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyber-green animate-ping" />
          </div>
          <span>J.A.M.S. AI</span>
        </motion.button>
      </div>

      {/* AI Assistant Chat Drawer - Responsive Mobile/Desktop Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-16 right-3 left-3 sm:left-auto sm:right-6 sm:bottom-20 z-[100000] w-auto sm:w-[420px] max-w-full"
          >
            <div className="glass-card border-cyber-green/40 bg-[#07111F]/95 rounded-2xl p-5 shadow-[0_0_60px_rgba(0,255,157,0.25)] hud-box flex flex-col h-[540px] max-h-[82vh]">
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
              <div className="flex-1 overflow-y-auto font-mono text-xs my-3 pr-2 space-y-4">
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
                  placeholder="Ask J.A.M.S. to find/open projects, certs, skills..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-cyber-green"
                />
                <button
                  type="submit"
                  className="btn-cyber p-2.5 border-cyber-green text-cyber-green rounded-xl hover:bg-cyber-green hover:text-black transition-all cursor-pointer"
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
