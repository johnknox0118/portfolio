"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  ShieldCheck,
  Terminal,
  CheckCircle2,
  ArrowRight,
  X,
  AlertTriangle,
  User,
  Mail,
  Briefcase,
  Loader2,
  Sparkles,
  RefreshCw,
  Trophy,
} from "lucide-react";

interface CTFChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessBadge: () => void;
}

interface CTFQuestion {
  id: number;
  stageNumber: number;
  category: string;
  title: string;
  description: string;
  clue?: string;
  type: "text" | "multiple_choice";
  options?: Array<{ id: string; text: string }>;
  hint?: string;
  points: number;
}

const DEFAULT_QUESTIONS: CTFQuestion[] = [
  {
    id: 1,
    stageNumber: 1,
    category: "ENCODING",
    title: "Decode Auth Token Payload",
    description: "Inspect the following Base64 token and enter the decoded ASCII string below:",
    clue: "a2FsbGUtY3liZXItc2Vj",
    type: "text",
    points: 100,
  },
  {
    id: 2,
    stageNumber: 2,
    category: "JWT AUDIT",
    title: "Identify Token Vulnerability",
    description: "Select the critical security flaw in this JSON Web Token header:",
    clue: '{\n  "alg": "none",\n  "typ": "JWT"\n}',
    type: "multiple_choice",
    options: [
      { id: "typ", text: 'A) The "typ" header parameter is missing bearer scope.' },
      { id: "none", text: 'B) CRITICAL: "alg": "none" disables signature verification, allowing token forgery.' },
      { id: "format", text: "C) JSON key indentation is missing tab stops." },
    ],
    points: 150,
  },
  {
    id: 3,
    stageNumber: 3,
    category: "SECURE CODING",
    title: "Patch Database Injection Query",
    description: "Select the secure implementation to patch string concatenation vulnerability:",
    clue: 'SELECT * FROM users WHERE id = \'" + userInput + "\';',
    type: "multiple_choice",
    options: [
      { id: "sanitize", text: "A) Strip quote characters using regex replace." },
      { id: "parametrized", text: "B) SECURE: Use Parametrized Prepared Statements (e.g. Prisma ORM / $1 parameters)." },
      { id: "eval", text: "C) Wrap query string inside eval()." },
    ],
    points: 200,
  },
];

function computeElapsedSeconds(startTimestamp: number): number {
  return Math.max(1, Math.round((Date.now() - startTimestamp) / 1000));
}

export default function CTFChallengeModal({ isOpen, onClose, onSuccessBadge }: CTFChallengeModalProps) {
  const [questions, setQuestions] = useState<CTFQuestion[]>(DEFAULT_QUESTIONS);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Participant Registration State (Stage 0)
  const [participant, setParticipant] = useState({
    name: "",
    email: "",
    role: "Recruiter / Talent Scout",
  });
  const [submissionId, setSubmissionId] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [timeSpent, setTimeSpent] = useState<number>(0);

  // Active Stage Verification State
  const [textInput, setTextInput] = useState("");
  const [selectedChoice, setSelectedChoice] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Fetch dynamic questions from backend when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setLoadingQuestions(true);
    fetch("/api/public/ctf?t=" + Date.now())
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
          setQuestions(data.questions);
        }
      })
      .catch((err) => {
        console.warn("Could not load dynamic CTF questions, using local defaults:", err);
      })
      .finally(() => {
        setLoadingQuestions(false);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const currentQuestion = questions[currentIndex] || questions[0];
  const totalStages = questions.length;
  const totalPoints = questions.reduce((acc, q) => acc + (q.points || 100), 0);

  // 1. Participant Registration Submit (Begin Challenge)
  const handleStartChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participant.name.trim()) {
      setErrorMsg("Please enter your name or callsign to initiate the security audit.");
      return;
    }

    setErrorMsg("");
    setVerifying(true);
    const now = Date.now();
    setStartTime(now);

    try {
      const res = await fetch("/api/public/ctf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          userName: participant.name,
          email: participant.email,
          role: participant.role,
        }),
      });
      const data = await res.json();
      if (data.submissionId) {
        setSubmissionId(data.submissionId);
      }
    } catch (err) {
      console.warn("Session logging fallback:", err);
    } finally {
      setVerifying(false);
      setStarted(true);
    }
  };

  // 2. Stage Verification
  const handleVerifyAnswer = async (submittedAnswer: string) => {
    if (!submittedAnswer.trim()) return;
    setErrorMsg("");
    setVerifying(true);

    try {
      const res = await fetch("/api/public/ctf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          questionId: currentQuestion.id,
          answer: submittedAnswer.trim(),
          submissionId,
        }),
      });

      const result = await res.json();

      if (result.correct) {
        const addedPoints = result.pointsAwarded || currentQuestion.points || 100;
        const newScore = score + addedPoints;
        setScore(newScore);
        setTextInput("");
        setSelectedChoice("");

        if (currentIndex + 1 < totalStages) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          // Challenge Completed!
          const elapsed = computeElapsedSeconds(startTime);
          setTimeSpent(elapsed);
          setCompleted(true);
          onSuccessBadge();

          // Finalize submission on backend
          try {
            await fetch("/api/public/ctf", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "complete",
                submissionId,
                timeSpentSec: elapsed,
              }),
            });
          } catch (e) {
            console.warn("Completion sync error:", e);
          }
        }
      } else {
        setErrorMsg(result.hint || "Incorrect payload or answer. Inspect clue and try again.");
      }
    } catch (err) {
      // Fallback verification for local offline demo
      const fallbackAnswers: { [key: number]: string } = {
        1: "kalle-cyber-sec",
        2: "none",
        3: "parametrized",
      };
      const expected = fallbackAnswers[currentQuestion.id] || "kalle-cyber-sec";
      if (submittedAnswer.trim().toLowerCase() === expected.toLowerCase()) {
        const addedPoints = currentQuestion.points || 100;
        setScore((prev) => prev + addedPoints);
        setTextInput("");
        setSelectedChoice("");
        if (currentIndex + 1 < totalStages) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          setCompleted(true);
          onSuccessBadge();
        }
      } else {
        setErrorMsg(currentQuestion.hint || "Incorrect answer. Inspect clue and try again.");
      }
    } finally {
      setVerifying(false);
    }
  };

  const resetCTF = () => {
    setStarted(false);
    setCurrentIndex(0);
    setTextInput("");
    setSelectedChoice("");
    setErrorMsg("");
    setScore(0);
    setCompleted(false);
    setSubmissionId(null);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m > 0 ? `${m}m ` : ""}${s}s`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          className="w-full max-w-xl glass-card border-cyber-green/40 bg-[#07111F]/95 rounded-2xl p-4 sm:p-6 shadow-[0_0_60px_rgba(0,255,157,0.25)] hud-box flex flex-col gap-5 relative max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-cyber-green animate-pulse" />
              <span className="font-orbitron font-black text-xs text-white tracking-widest uppercase">
                RECRUITER_CTF // SECURITY AUDIT CHALLENGE
              </span>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Indicator Bar */}
          {started && (
            <div className="space-y-1 font-mono text-[10px]">
              <div className="flex justify-between text-gray-400">
                <span className="flex items-center gap-1.5">
                  <span className="text-white font-bold">{participant.name}</span>
                  <span className="text-gray-600">//</span>
                  <span className="text-cyber-blue">{score} PTS</span>
                </span>
                <span className="text-cyber-green font-bold">
                  {completed ? `AUDIT COMPLETE (${score} / ${totalPoints} PTS)` : `STAGE ${currentIndex + 1} OF ${totalStages}`}
                </span>
              </div>
              <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-cyber-green to-cyber-blue transition-all duration-500"
                  style={{
                    width: completed ? "100%" : `${((currentIndex) / totalStages) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Error Notice */}
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/40 rounded-xl text-rose-400 text-xs font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STAGE 0: Participant Identity Gateway */}
          {!started && !completed && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="cyber-tag border-cyber-green/30 text-cyber-green text-[9px]">
                  INITIALIZE AUDIT ACCESS
                </span>
                <h3 className="font-orbitron font-bold text-base text-white">Identify Security Clearance</h3>
                <p className="text-xs font-mono text-gray-400 leading-relaxed">
                  Enter your credentials below. Your score, audit speed, and completed stages will be logged in Johnknox Kalle's verified security telemetry.
                </p>
              </div>

              <form onSubmit={handleStartChallenge} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-gray-400 uppercase flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyber-green" /> Callsign / Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Hunter or Google Security Scout"
                    value={participant.name}
                    onChange={(e) => setParticipant({ ...participant, name: e.target.value })}
                    className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-base sm:text-xs font-mono text-white focus:outline-none focus:border-cyber-green"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-400 uppercase flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-cyber-blue" /> Role / Affiliation
                    </label>
                    <select
                      value={participant.role}
                      onChange={(e) => setParticipant({ ...participant, role: e.target.value })}
                      className="w-full bg-[#040a12] border border-white/10 rounded-lg px-3 py-2.5 text-base sm:text-xs font-mono text-white focus:outline-none focus:border-cyber-blue"
                    >
                      <option value="Recruiter / Talent Scout">Recruiter / Talent Scout</option>
                      <option value="Security Engineer / Architect">Security Engineer / Architect</option>
                      <option value="Software Developer / Peer">Software Developer / Peer</option>
                      <option value="Student / Researcher">Student / Researcher</option>
                      <option value="CTF Competitor">CTF Competitor</option>
                      <option value="Guest Visitor">Guest Visitor</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-400 uppercase flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-cyber-cyan" /> Email (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. hunter@company.com"
                      value={participant.email}
                      onChange={(e) => setParticipant({ ...participant, email: e.target.value })}
                      className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-base sm:text-xs font-mono text-white focus:outline-none focus:border-cyber-cyan"
                    />
                  </div>
                </div>

                <div className="p-3 bg-cyber-green/5 border border-cyber-green/20 rounded-xl text-[11px] font-mono text-gray-300 flex items-center justify-between">
                  <span>{totalStages} Security Stages Configured</span>
                  <span className="text-cyber-green font-bold">{totalPoints} Max Points</span>
                </div>

                <button
                  type="submit"
                  disabled={verifying}
                  className="btn-cyber flex items-center gap-2 w-full justify-center text-xs py-3"
                >
                  {verifying ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      START SECURITY AUDIT <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ACTIVE CHALLENGE STAGE */}
          {started && !completed && currentQuestion && (
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="cyber-tag border-cyber-green/30 text-cyber-green text-[9px] uppercase">
                    STAGE {currentQuestion.stageNumber || currentIndex + 1} // {currentQuestion.category || "AUDIT"}
                  </span>
                  <span className="text-[10px] font-mono text-cyber-blue font-bold">
                    +{currentQuestion.points || 100} PTS
                  </span>
                </div>
                <h3 className="font-orbitron font-bold text-sm text-white">{currentQuestion.title}</h3>
                <p className="text-xs font-mono text-gray-400 leading-relaxed">
                  {currentQuestion.description}
                </p>
              </div>

              {/* Clue / Payload Box */}
              {currentQuestion.clue && (
                <pre className="p-3 bg-black/60 border border-cyber-green/20 rounded-xl font-mono text-xs text-cyber-green font-bold tracking-wider overflow-x-auto whitespace-pre-wrap select-all">
                  {currentQuestion.clue}
                </pre>
              )}

              {/* Input Format A: Multiple Choice */}
              {currentQuestion.type === "multiple_choice" && (
                <div className="space-y-2 font-mono text-xs">
                  {(currentQuestion.options || []).map((option) => (
                    <button
                      key={option.id}
                      disabled={verifying}
                      onClick={() => {
                        setSelectedChoice(option.id);
                        handleVerifyAnswer(option.id);
                      }}
                      className={`w-full text-left p-3 glass-card rounded-xl border transition-all cursor-pointer ${
                        selectedChoice === option.id
                          ? "border-cyber-green text-white bg-cyber-green/10"
                          : "border-white/10 text-gray-300 hover:border-white/30 hover:text-white"
                      }`}
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Format B: Text Flag / String Verification */}
              {currentQuestion.type === "text" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleVerifyAnswer(textInput);
                  }}
                  className="space-y-3"
                >
                  <input
                    type="text"
                    required
                    placeholder="Enter decoded string or solution flag..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-base sm:text-xs font-mono text-white focus:outline-none focus:border-cyber-green"
                  />
                  <button
                    type="submit"
                    disabled={verifying}
                    className="btn-cyber flex items-center gap-2 w-full justify-center text-xs"
                  >
                    {verifying ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        VERIFY STAGE {currentIndex + 1} <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* COMPLETION SCREEN */}
          {completed && (
            <div className="space-y-5 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-cyber-green/20 border-2 border-cyber-green flex items-center justify-center mx-auto text-cyber-green shadow-[0_0_30px_rgba(0,255,157,0.4)]">
                <CheckCircle2 className="w-8 h-8 animate-bounce" />
              </div>

              <div className="space-y-1.5">
                <span className="cyber-tag border-cyber-green text-cyber-green font-bold text-[10px]">
                  INTERNAL SECURITY VERIFIED
                </span>
                <h3 className="font-orbitron font-black text-xl text-white">Audit Passed Successfully!</h3>
                <p className="text-xs font-mono text-gray-300 max-w-md mx-auto leading-relaxed">
                  Congratulations <span className="text-cyber-green font-bold">{participant.name}</span>. You successfully demonstrated cybersecurity proficiency and unlocked the verified audit achievement badge.
                </p>
              </div>

              {/* Stats Dossier */}
              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                <div className="p-3 glass-card rounded-xl border border-white/10">
                  <div className="text-[9px] font-mono text-gray-400">SCORE</div>
                  <div className="font-orbitron font-bold text-cyber-green text-base">
                    {score} <span className="text-[10px] text-gray-400">/ {totalPoints}</span>
                  </div>
                </div>
                <div className="p-3 glass-card rounded-xl border border-white/10">
                  <div className="text-[9px] font-mono text-gray-400">STAGES</div>
                  <div className="font-orbitron font-bold text-cyber-blue text-base">
                    {totalStages} / {totalStages}
                  </div>
                </div>
                <div className="p-3 glass-card rounded-xl border border-white/10">
                  <div className="text-[9px] font-mono text-gray-400">TIME</div>
                  <div className="font-orbitron font-bold text-cyber-cyan text-base">
                    {formatSeconds(timeSpent)}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-black/40 border border-white/10 rounded-xl text-[10px] font-mono text-gray-400 max-w-md mx-auto">
                * Telemetry record ID #{submissionId || "LIVE"} logged to Johnknox Kalle's admin security hub.
              </div>

              <div className="flex gap-3 justify-center">
                <button onClick={resetCTF} className="btn-cyber px-4 py-2 text-xs border-white/20 text-gray-300">
                  <RefreshCw className="w-3.5 h-3.5 inline mr-1" /> RETRY AUDIT
                </button>
                <button onClick={onClose} className="btn-cyber px-4 py-2 text-xs text-cyber-green">
                  CLOSE &amp; EXPLORE PORTFOLIO
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
