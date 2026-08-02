"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal as TerminalIcon, X, Check, ArrowRight } from "lucide-react";

interface TerminalModalProps {
  data?: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function TerminalModal({ data, isOpen, onClose }: TerminalModalProps) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<Array<{ command: string; output: string }>>([
    {
      command: "welcome",
      output:
        "SECURE HACKER CONSOLE v2.0\nType 'help' to display available system commands.",
    },
  ]);

  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom whenever terminal history updates
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  if (!isOpen) return null;

  const profile = data?.profile || {};
  const projects = data?.projects || [];
  const skills = data?.skills || [];
  const certs = data?.certifications || [];

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    if (!cmd) return;

    let output = "";

    switch (cmd) {
      case "help":
        output =
          "AVAILABLE SYSTEM COMMANDS:\n" +
          "  about      - Display cybersecurity profile & bio\n" +
          "  projects   - Output engineering projects ledger\n" +
          "  skills     - Output technical skills inventory\n" +
          "  certs      - Output certification credentials\n" +
          "  contact    - Display direct contact channels\n" +
          "  resume     - Open or download official CV\n" +
          "  github     - Open GitHub developer profile\n" +
          "  linkedin   - Open LinkedIn network profile\n" +
          "  clear      - Reset terminal screen history";
        break;

      case "about":
        output = `${profile.name || "Johnknox Kalle"} // ${profile.title || "Cybersecurity Engineer"}\nBio: ${profile.bio || "Security Architecture & Systems Development Specialist"}`;
        break;

      case "projects":
        output = projects
          .map((p: any, idx: number) => `[${idx + 1}] ${p.title} — ${p.description}`)
          .join("\n");
        break;

      case "skills":
        output = skills
          .map((s: any) => `• ${s.name} (${s.category.toUpperCase()}) — ${s.yearsOfExp} yrs exp`)
          .join("\n");
        break;

      case "certs":
        output = certs
          .map((c: any) => `✓ ${c.title} [${c.issuer}, ${c.year}]`)
          .join("\n");
        break;

      case "contact":
        output = `Phone: ${profile.phone || "N/A"}\nEmail: ${profile.email || "N/A"}\nLocation: ${profile.location || "N/A"}`;
        break;

      case "resume":
        if (profile.resumeUrl) {
          window.open(profile.resumeUrl, "_blank");
          output = "Opening official Resume PDF dossier...";
        } else {
          output = "Resume URL is not configured in settings.";
        }
        break;

      case "github":
        if (profile.github) {
          window.open(profile.github, "_blank");
          output = `Launching GitHub profile: ${profile.github}`;
        }
        break;

      case "linkedin":
        if (profile.linkedin) {
          window.open(profile.linkedin, "_blank");
          output = `Launching LinkedIn profile: ${profile.linkedin}`;
        }
        break;

      case "clear":
        setHistory([]);
        setInput("");
        return;

      default:
        output = `Command not recognized: '${cmd}'. Type 'help' for available system commands.`;
        break;
    }

    setHistory((prev) => [...prev, { command: cmd, output }]);
    setInput("");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-3xl glass-card border-cyber-green/40 bg-[#040912]/95 rounded-2xl p-6 shadow-[0_0_60px_rgba(0,255,157,0.2)] hud-box flex flex-col h-[75vh] max-h-[600px] relative"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <TerminalIcon className="w-5 h-5 text-cyber-green" />
              <span className="font-orbitron font-black text-xs text-white tracking-widest uppercase">
                HACKER_CONSOLE // TERMINAL v2.0
              </span>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Terminal Console Output Scroll Region */}
          <div className="flex-1 overflow-y-auto font-mono text-xs p-4 my-3 bg-black/70 border border-white/5 rounded-xl space-y-4 leading-relaxed text-gray-300">
            {history.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center gap-2 text-cyber-green font-bold">
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>user@cyber-terminal:~$ {item.command}</span>
                </div>
                <pre className="text-gray-300 font-mono whitespace-pre-wrap pl-5 text-[11px]">
                  {item.output}
                </pre>
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>

          {/* Command Prompt Input Bar */}
          <form onSubmit={handleCommand} className="flex items-center gap-2 bg-black/50 border border-white/10 rounded-xl px-4 py-2.5">
            <span className="text-cyber-green font-mono text-xs font-bold">$</span>
            <input
              type="text"
              autoFocus
              placeholder="Type command ('help', 'projects', 'skills', 'about', 'clear')..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-transparent font-mono text-xs text-white placeholder-gray-500 focus:outline-none"
            />
            <button type="submit" className="btn-cyber px-3 py-1 text-[10px]">
              EXECUTE
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
