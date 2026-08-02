"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, User, Code, Award, Folder, Settings, Mail,
  LogOut, Plus, Trash, Edit, Check, Loader2, FileText, Camera, X, Globe, ExternalLink, Key, Lock
} from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load all aggregates
  const loadData = async () => {
    try {
      const res = await fetch("/api/public/data?t=" + Date.now());
      const result = await res.json();
      
      // Also load messages
      const msgRes = await fetch("/api/admin/messages?t=" + Date.now());
      const messages = await msgRes.json();
      
      setData({ ...result, messages });
      setLoading(false);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // State managers for editing/creating items
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Singular models (Profile / Settings)
  const [profileForm, setProfileForm] = useState<any>({});
  const [settingsForm, setSettingsForm] = useState<any>({});

  // CRUD selection state
  const [editingItem, setEditingItem] = useState<any>(null); // For skills, projects, certs, internships, achievements, gallery
  const [showFormModal, setShowFormModal] = useState(false);

  useEffect(() => {
    if (data) {
      setProfileForm(data.profile);
      setSettingsForm(data.settings);
    }
  }, [data]);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordStatus, setPasswordStatus] = useState<{ type: "idle" | "saving" | "success" | "error"; text: string }>({
    type: "idle",
    text: "",
  });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordStatus({ type: "error", text: "All password fields are required." });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: "error", text: "New password and confirm password do not match." });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordStatus({ type: "error", text: "New password must be at least 6 characters long." });
      return;
    }

    setPasswordStatus({ type: "saving", text: "" });
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setPasswordStatus({ type: "success", text: result.message || "Password updated successfully." });
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setPasswordStatus({ type: "error", text: result.error || "Failed to update password." });
      }
    } catch (err: any) {
      setPasswordStatus({ type: "error", text: "Network error occurred while updating password." });
    }
  };

  useEffect(() => {
    setSuccessMsg("");
    setPasswordStatus({ type: "idle", text: "" });
  }, [activeTab]);

  // Form saving utility for singular tables
  const saveSingular = async (entity: "profile" | "settings", formState: any) => {
    setSaving(true);
    setSuccessMsg("");
    try {
      const res = await fetch(`/api/admin/${entity}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      if (res.ok) {
        setSuccessMsg("System configuration updated successfully.");
        loadData();
      }
    } catch (err) {
      console.error("Update error:", err);
    } finally {
      setSaving(false);
    }
  };

  // CRUD helper functions for arrays
  const saveListItem = async (entity: string, itemData: any) => {
    setSaving(true);
    try {
      const method = itemData.id ? "PUT" : "POST";
      const res = await fetch(`/api/admin/${entity}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
      });
      if (res.ok) {
        setShowFormModal(false);
        setEditingItem(null);
        loadData();
      }
    } catch (err) {
      console.error(`Error saving ${entity}:`, err);
    } finally {
      setSaving(false);
    }
  };

  const deleteListItem = async (entity: string, id: number) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      const res = await fetch(`/api/admin/${entity}?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error(`Error deleting ${entity}:`, err);
    }
  };

  // File Upload Helper
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, onComplete: (url: string) => void, fieldId: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingFile(fieldId);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (result.success) {
        onComplete(result.url);
      } else {
        alert("Upload failed: " + (result.error || "Unknown server error"));
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      alert("Upload network error: " + err.message);
    } finally {
      setUploadingFile(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#07111F] text-white">
        <div className="scanlines"></div>
        <Loader2 className="w-10 h-10 text-cyber-green animate-spin mb-4" />
        <span className="font-orbitron text-xs text-cyber-green tracking-widest uppercase">LOADING MATRIX DIALS</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white flex flex-col md:flex-row relative">
      <div className="scanlines"></div>
      <div className="animated-bg"></div>

      {/* SIDEBAR NAVIGATION - Responsive Mobile Drawer / Desktop Sidebar */}
      <aside className="w-full md:w-64 bg-[#040a12] border-b md:border-b-0 md:border-r border-white/5 flex flex-col p-4 sm:p-6 gap-4 sm:gap-6 z-10 shrink-0">
        <div className="flex items-center justify-between pb-3 md:pb-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Shield className="text-cyber-green w-5 h-5 animate-pulse" />
            <span className="font-orbitron font-black text-xs tracking-widest text-cyber-green">CONTROL_PANEL // v1.0</span>
          </div>
          <button
            onClick={handleLogout}
            className="md:hidden flex items-center gap-1.5 btn-cyber px-2.5 py-1 text-[10px] border-rose-500/40 text-rose-500"
          >
            <LogOut className="w-3.5 h-3.5" /> LOGOUT
          </button>
        </div>

        <nav className="flex flex-row md:flex-col overflow-x-auto pb-2 md:pb-0 gap-2 font-orbitron text-[10px] tracking-widest font-semibold flex-grow scrollbar-none">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-left transition-all shrink-0 whitespace-nowrap ${
              activeTab === "overview" ? "bg-cyber-green/10 text-cyber-green border-l-2 border-cyber-green" : "text-gray-400 hover:text-white"
            }`}
          >
            <Shield className="w-4 h-4" /> OVERVIEW
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-left transition-all shrink-0 whitespace-nowrap ${
              activeTab === "profile" ? "bg-cyber-green/10 text-cyber-green border-l-2 border-cyber-green" : "text-gray-400 hover:text-white"
            }`}
          >
            <User className="w-4 h-4" /> PROFILE
          </button>
          <button
            onClick={() => setActiveTab("qualifications")}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-left transition-all shrink-0 whitespace-nowrap ${
              activeTab === "qualifications" ? "bg-cyber-green/10 text-cyber-green border-l-2 border-cyber-green" : "text-gray-400 hover:text-white"
            }`}
          >
            <Award className="w-4 h-4" /> QUALIFICATIONS
          </button>
          <button
            onClick={() => setActiveTab("skills")}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-left transition-all shrink-0 whitespace-nowrap ${
              activeTab === "skills" ? "bg-cyber-green/10 text-cyber-green border-l-2 border-cyber-green" : "text-gray-400 hover:text-white"
            }`}
          >
            <Code className="w-4 h-4" /> SKILLS
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-left transition-all shrink-0 whitespace-nowrap ${
              activeTab === "projects" ? "bg-cyber-green/10 text-cyber-green border-l-2 border-cyber-green" : "text-gray-400 hover:text-white"
            }`}
          >
            <Folder className="w-4 h-4" /> PROJECTS
          </button>
          <button
            onClick={() => setActiveTab("certifications")}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-left transition-all shrink-0 whitespace-nowrap ${
              activeTab === "certifications" ? "bg-cyber-green/10 text-cyber-green border-l-2 border-cyber-green" : "text-gray-400 hover:text-white"
            }`}
          >
            <Award className="w-4 h-4" /> CERTIFICATES
          </button>
          <button
            onClick={() => setActiveTab("articles")}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-left transition-all shrink-0 whitespace-nowrap ${
              activeTab === "articles" ? "bg-cyber-green/10 text-cyber-green border-l-2 border-cyber-green" : "text-gray-400 hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4" /> ARTICLES
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-left transition-all shrink-0 whitespace-nowrap ${
              activeTab === "messages" ? "bg-cyber-green/10 text-cyber-green border-l-2 border-cyber-green" : "text-gray-400 hover:text-white"
            }`}
          >
            <Mail className="w-4 h-4" /> MESSAGES
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-left transition-all shrink-0 whitespace-nowrap ${
              activeTab === "settings" ? "bg-cyber-green/10 text-cyber-green border-l-2 border-cyber-green" : "text-gray-400 hover:text-white"
            }`}
          >
            <Settings className="w-4 h-4" /> SETTINGS
          </button>
        </nav>

        <button
          onClick={handleLogout}
          className="hidden md:flex items-center justify-center gap-2 btn-cyber border-rose-500/40 text-rose-500 hover:shadow-[0_0_15px_rgba(244,63,94,0.3)] mt-auto"
        >
          LOGOUT <LogOut className="w-4 h-4" />
        </button>
      </aside>

      {/* DASHBOARD CONTENT BODY */}
      <main className="flex-grow p-6 md:p-8 max-w-5xl mx-auto space-y-8 z-10 w-full overflow-y-auto">
        {/* TAB OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <h2 className="font-orbitron font-black text-xl text-white">GRID_SYS // ANALYTICS & OVERVIEW</h2>
            
            {/* Primary Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card p-6 flex flex-col gap-2 border-cyber-green/30">
                <span className="font-mono text-[9px] text-gray-500 uppercase tracking-widest">Incoming Messages</span>
                <span className="font-orbitron font-black text-3xl text-cyber-green">{data.messages?.length || 0}</span>
                <span className="font-mono text-[9px] text-cyber-green">100% SECURE TRANSMISSIONS</span>
              </div>
              <div className="glass-card p-6 flex flex-col gap-2 border-cyber-blue/30">
                <span className="font-mono text-[9px] text-gray-500 uppercase tracking-widest">Active Projects</span>
                <span className="font-orbitron font-black text-3xl text-cyber-blue">{data.projects?.length || 0}</span>
                <span className="font-mono text-[9px] text-cyber-blue">PUBLICLY DEPLOYED</span>
              </div>
              <div className="glass-card p-6 flex flex-col gap-2 border-cyber-green/30">
                <span className="font-mono text-[9px] text-gray-500 uppercase tracking-widest">Credentials Listed</span>
                <span className="font-orbitron font-black text-3xl text-cyber-green">{data.certifications?.length || 0}</span>
                <span className="font-mono text-[9px] text-cyber-green">AUTHENTICATED RECORDS</span>
              </div>
              <div className="glass-card p-6 flex flex-col gap-2 border-cyber-blue/30">
                <span className="font-mono text-[9px] text-gray-500 uppercase tracking-widest">Skill Nodes</span>
                <span className="font-orbitron font-black text-3xl text-cyber-blue">{data.skills?.length || 0}</span>
                <span className="font-mono text-[9px] text-cyber-blue">VERIFIED PROFICIENCIES</span>
              </div>
            </div>

            {/* Analytics Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-orbitron font-bold text-xs text-white tracking-widest uppercase">System Analytics // Traffic Breakdown</h3>
                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>DESKTOP / LAPTOP VISITORS</span>
                      <span className="text-cyber-green font-bold">78%</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-cyber-green w-[78%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>MOBILE / TABLET VISITORS</span>
                      <span className="text-cyber-blue font-bold">22%</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-cyber-blue w-[22%]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 space-y-4">
                <h3 className="font-orbitron font-bold text-xs text-white tracking-widest uppercase">Database Storage & Infrastructure</h3>
                <div className="space-y-2 font-mono text-xs text-gray-300">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-gray-500">DATABASE PROVIDER:</span>
                    <span className="text-cyber-green font-bold">Supabase PostgreSQL</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-gray-500">STORAGE BUCKET:</span>
                    <span className="text-cyber-blue font-bold">portfolio-uploads (Public)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">AUTHENTICATION ENGINE:</span>
                    <span className="text-cyber-green font-bold">JWT + bcryptjs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* System Log Output */}
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-orbitron font-bold text-xs text-white tracking-widest uppercase">System Diagnostic Activities Log</h3>
              <div className="font-mono text-[10px] text-gray-400 space-y-2 bg-black/40 p-4 rounded-xl border border-white/5 leading-relaxed">
                <div>[OK] Grid initialized successfully. Databases mounted via Supabase Pooler.</div>
                <div>[SEC] Admin Session validated. JWT Cookie Encryption Active.</div>
                <div>[SYS] Listening for remote packet transmission queries & file uploads...</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB PROFILE */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <h2 className="font-orbitron font-black text-xl text-white">PROFILE_MANAGER // PARAMETERS</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveSingular("profile", profileForm);
              }}
              className="glass-card p-6 md:p-8 space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-gray-400 uppercase">Profile Name</label>
                  <input
                    type="text"
                    value={profileForm.name || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-cyber-green"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-gray-400 uppercase">Professional Title</label>
                  <input
                    type="text"
                    value={profileForm.title || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                    className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-cyber-green"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-gray-400 uppercase">Short Intro / Tagline</label>
                <input
                  type="text"
                  value={profileForm.tagline || ""}
                  onChange={(e) => setProfileForm({ ...profileForm, tagline: e.target.value })}
                  className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-cyber-green"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-gray-400 uppercase flex items-center justify-between">
                  <span>Auto-Typing Hero Subtitles (Comma-separated phrases)</span>
                  <span className="text-cyber-green text-[9px]">Live Hero Subtitle Loop</span>
                </label>
                <input
                  type="text"
                  placeholder="Compiling secure architectures..., Emulating threat payloads..., Defending endpoints..."
                  value={profileForm.typingPhrases || ""}
                  onChange={(e) => setProfileForm({ ...profileForm, typingPhrases: e.target.value })}
                  className="w-full bg-[#040a12] border border-cyber-green/30 rounded-lg px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-cyber-green shadow-[0_0_10px_rgba(0,255,157,0.1)]"
                />
                <p className="text-[10px] font-mono text-gray-500">
                  Separate phrases with commas. These phrases will auto-type continuously under your main title on the portfolio landing hero.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-gray-400 uppercase">Personal Dossier Bio</label>
                <textarea
                  rows={4}
                  value={profileForm.bio || ""}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-cyber-green resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-gray-400 uppercase">Career Objective</label>
                <textarea
                  rows={3}
                  value={profileForm.careerObjective || ""}
                  onChange={(e) => setProfileForm({ ...profileForm, careerObjective: e.target.value })}
                  className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-cyber-green resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-gray-400 uppercase">Location Address</label>
                  <input
                    type="text"
                    value={profileForm.location || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                    className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-cyber-green"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-gray-400 uppercase">Contact Gateway Email</label>
                  <input
                    type="email"
                    value={profileForm.email || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-cyber-green"
                  />
                </div>
              </div>

              {/* PHONE & SOCIAL CHANNELS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-gray-400 uppercase">Mobile Number</label>
                  <input
                    type="text"
                    value={profileForm.phone || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-cyber-green"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-gray-400 uppercase">GitHub Profile Link</label>
                  <input
                    type="text"
                    value={profileForm.github || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, github: e.target.value })}
                    className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-cyber-green"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-gray-400 uppercase">LinkedIn Profile Link</label>
                  <input
                    type="text"
                    value={profileForm.linkedin || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, linkedin: e.target.value })}
                    className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-cyber-green"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-gray-400 uppercase">X (Twitter) Profile Link</label>
                  <input
                    type="text"
                    value={profileForm.twitter || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, twitter: e.target.value })}
                    className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-cyber-green"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-gray-400 uppercase">Profile Photo File Path</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={profileForm.profileImageUrl || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, profileImageUrl: e.target.value })}
                      className="flex-grow bg-[#040a12] border border-white/10 rounded-lg px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-cyber-green"
                    />
                    <label className="btn-cyber flex items-center justify-center p-3 cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, (url) => setProfileForm({ ...profileForm, profileImageUrl: url }), "avatar")}
                      />
                      {uploadingFile === "avatar" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-gray-400 uppercase">Resume File Path (PDF)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={profileForm.resumeUrl || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, resumeUrl: e.target.value })}
                      className="flex-grow bg-[#040a12] border border-white/10 rounded-lg px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-cyber-green"
                    />
                    <label className="btn-cyber flex items-center justify-center p-3 cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, (url) => setProfileForm({ ...profileForm, resumeUrl: url }), "resume")}
                      />
                      {uploadingFile === "resume" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                    </label>
                  </div>
                </div>
              </div>

              {/* PROFILE IMAGE ADJUSTMENTS */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 border-t border-white/5 pt-6">
                <div className="md:col-span-4 flex flex-col items-center justify-center gap-3">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Live Photo Preview</span>
                  <div 
                    className="w-40 h-40 rounded-[20px] overflow-hidden border p-2 relative bg-black/30 animate-pulse"
                    style={{ 
                      borderColor: profileForm.profileImageBorderColor || '#00FF9D',
                      boxShadow: `0 0 15px ${profileForm.profileImageBorderColor || '#00FF9D'}`
                    }}
                  >
                    <img
                      src={profileForm.profileImageUrl || "/placeholder_profile.png"}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-[12px] transition-all duration-300"
                      style={{
                        filter: `grayscale(${profileForm.profileImageGrayscale || 100}%)`,
                        transform: `scale(${profileForm.profileImageScale || 1.0})`
                      }}
                    />
                  </div>
                </div>
                
                <div className="md:col-span-8 space-y-4">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Photo Adjustments</span>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono text-gray-400">
                      <span>Grayscale Tone Filter</span>
                      <span>{profileForm.profileImageGrayscale || 100}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={profileForm.profileImageGrayscale || 100}
                      onChange={(e) => setProfileForm({ ...profileForm, profileImageGrayscale: Number(e.target.value) })}
                      className="w-full accent-cyber-green bg-[#040a12] border border-white/10 rounded-lg h-2"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono text-gray-400">
                      <span>Zoom / Scale Factor</span>
                      <span>{profileForm.profileImageScale || 1.0}x</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="1.5"
                      step="0.05"
                      value={profileForm.profileImageScale || 1.0}
                      onChange={(e) => setProfileForm({ ...profileForm, profileImageScale: parseFloat(e.target.value) })}
                      className="w-full accent-cyber-green bg-[#040a12] border border-white/10 rounded-lg h-2"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-400 uppercase block">Border Glow Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={profileForm.profileImageBorderColor || "#00FF9D"}
                        onChange={(e) => setProfileForm({ ...profileForm, profileImageBorderColor: e.target.value })}
                        className="w-12 h-10 bg-transparent border border-white/10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={profileForm.profileImageBorderColor || "#00FF9D"}
                        onChange={(e) => setProfileForm({ ...profileForm, profileImageBorderColor: e.target.value })}
                        className="flex-grow bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {successMsg && (
                <div className="p-3 bg-cyber-green/10 border border-cyber-green/30 text-cyber-green text-xs font-mono rounded-lg">
                  {successMsg}
                </div>
              )}

              <button type="submit" disabled={saving} className="btn-cyber flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} COMMIT CHANGES
              </button>
            </form>
          </div>
        )}

        {/* TAB QUALIFICATIONS */}
        {activeTab === "qualifications" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-orbitron font-black text-xl text-white">QUALIFICATION_LIST // HISTORY</h2>
              <button
                onClick={() => {
                  setEditingItem({ degree: "", institution: "", duration: "", grade: "", description: "" });
                  setShowFormModal(true);
                }}
                className="btn-cyber flex items-center gap-1.5 px-4 py-2"
              >
                <Plus className="w-4 h-4" /> ADD QUALIFICATION
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {(data.education || []).map((edu: any) => (
                <div key={edu.id} className="glass-card p-5 flex items-center justify-between border-cyber-blue/20">
                  <div className="flex items-center gap-4">
                    <span className="cyber-tag text-[9px] border-cyber-blue/30 text-cyber-blue">{edu.duration}</span>
                    <div>
                      <h3 className="font-orbitron font-bold text-sm text-white">{edu.degree}</h3>
                      <p className="font-mono text-[10px] text-gray-500">{edu.institution} // GPA/Grade: {edu.grade}</p>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">{edu.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingItem(edu);
                        setShowFormModal(true);
                      }}
                      className="p-2 border border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/10 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteListItem("education", edu.id)}
                      className="p-2 border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB SKILLS */}
        {activeTab === "skills" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-orbitron font-black text-xl text-white">SKILL_GRID // MANAGEMENT</h2>
              <button
                onClick={() => {
                  setEditingItem({ name: "", logo: "Shield", progress: 80, category: "cybersecurity", displayOrder: 0, yearsOfExp: 1 });
                  setShowFormModal(true);
                }}
                className="btn-cyber flex items-center gap-1.5 px-4 py-2"
              >
                <Plus className="w-4 h-4" /> ADD SKILL NODE
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(data.skills || []).map((skill: any) => (
                <div key={skill.id} className="glass-card p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="cyber-tag text-[8px]">{skill.category}</span>
                    <div>
                      <h3 className="font-orbitron font-bold text-sm text-white">{skill.name}</h3>
                      <p className="font-mono text-[9px] text-gray-500">Progress: {skill.progress}% // Exp: {skill.yearsOfExp} years</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingItem(skill);
                        setShowFormModal(true);
                      }}
                      className="p-2 border border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/10 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteListItem("skills", skill.id)}
                      className="p-2 border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB PROJECTS */}
        {activeTab === "projects" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-orbitron font-black text-xl text-white">PROJECTS_LEDGER // DATA</h2>
              <button
                onClick={() => {
                  setEditingItem({
                    title: "", description: "", role: "", timeline: "", event: "", fullDescription: "",
                    githubUrl: "", liveUrl: "", imageUrl: "", status: "completed", category: "cybersecurity",
                    screenshots: [], tags: [], logs: [], challenges: [], solutions: []
                  });
                  setShowFormModal(true);
                }}
                className="btn-cyber flex items-center gap-1.5 px-4 py-2"
              >
                <Plus className="w-4 h-4" /> ADD PROJECT FILE
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {(data.projects || []).map((project: any) => (
                <div key={project.id} className="glass-card p-6 flex justify-between items-center gap-4">
                  <div>
                    <span className="cyber-tag text-[8.5px] border-cyber-blue/20 text-cyber-blue mr-2">{project.category.toUpperCase()}</span>
                    <h3 className="font-orbitron font-bold text-lg text-white inline-block">{project.title}</h3>
                    <p className="font-mono text-xs text-gray-500 mt-1 leading-snug">{project.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingItem(project);
                        setShowFormModal(true);
                      }}
                      className="p-2 border border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/10 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteListItem("projects", project.id)}
                      className="p-2 border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB CERTIFICATIONS */}
        {activeTab === "certifications" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-orbitron font-black text-xl text-white">CREDENTIALS // REGISTER</h2>
              <button
                onClick={() => {
                  setEditingItem({
                    title: "", issuer: "", year: "", category: "certification", description: "",
                    icon: "ShieldCheck", imageUrl: "", credentialId: "", verificationUrl: "",
                    longDescription: "", grade: "", skills: []
                  });
                  setShowFormModal(true);
                }}
                className="btn-cyber flex items-center gap-1.5 px-4 py-2"
              >
                <Plus className="w-4 h-4" /> ADD CERTIFICATION
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(data.certifications || []).map((cert: any) => (
                <div key={cert.id} className="glass-card p-5 flex items-center justify-between">
                  <div>
                    <span className="cyber-tag text-[8px] mr-2">{cert.category}</span>
                    <h3 className="font-orbitron font-bold text-sm text-white inline-block">{cert.title}</h3>
                    <p className="font-mono text-[9px] text-gray-500 mt-0.5">{cert.issuer} // {cert.year}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingItem(cert);
                        setShowFormModal(true);
                      }}
                      className="p-2 border border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/10 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteListItem("certifications", cert.id)}
                      className="p-2 border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB ARTICLES */}
        {activeTab === "articles" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-orbitron font-black text-xl text-white">RESEARCH_LOGS // ARTICLES</h2>
                <p className="font-mono text-xs text-gray-400">Manage engineering articles, research papers, and technical writeups.</p>
              </div>
              <button
                onClick={() => {
                  setEditingItem({
                    title: "",
                    excerpt: "",
                    category: "CYBERSECURITY",
                    readTime: "5 min read",
                    date: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
                    tags: [],
                    content: "",
                  });
                  setShowFormModal(true);
                }}
                className="btn-cyber flex items-center gap-1.5 px-4 py-2"
              >
                <Plus className="w-4 h-4" /> ADD ARTICLE
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(data.articles || []).map((art: any) => (
                <div key={art.id} className="glass-card p-5 flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="cyber-tag text-[8px] border-cyber-blue/30 text-cyber-blue">{art.category}</span>
                      <span className="text-gray-400">{art.readTime} // {art.date}</span>
                    </div>
                    <h3 className="font-orbitron font-bold text-sm text-white">{art.title}</h3>
                    <p className="text-xs text-gray-400 line-clamp-2">{art.excerpt}</p>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => {
                        setEditingItem(art);
                        setShowFormModal(true);
                      }}
                      className="p-2 border border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/10 rounded-lg flex items-center gap-1 text-xs font-mono"
                    >
                      <Edit className="w-4 h-4" /> EDIT
                    </button>
                    <button
                      onClick={() => deleteListItem("articles", art.id)}
                      className="p-2 border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 rounded-lg flex items-center gap-1 text-xs font-mono"
                    >
                      <Trash className="w-4 h-4" /> DELETE
                    </button>
                  </div>
                </div>
              ))}
              {(!data.articles || data.articles.length === 0) && (
                <div className="col-span-2 glass-card p-8 text-center text-gray-500 font-mono text-xs uppercase">
                  [!] No articles found in database. Click "ADD ARTICLE" to publish your first research paper.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB MESSAGES */}
        {activeTab === "messages" && (
          <div className="space-y-6">
            <h2 className="font-orbitron font-black text-xl text-white">INBOX_TICKET // VISITOR MESSAGES</h2>
            <div className="space-y-4">
              {data.messages?.length === 0 ? (
                <div className="glass-card p-8 text-center text-gray-500 font-mono text-xs uppercase">
                  [!] Communications queue empty. No messages logged.
                </div>
              ) : (
                data.messages?.map((msg: any) => (
                  <div key={msg.id} className="glass-card p-6 space-y-4 border-cyber-blue/10">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-orbitron font-bold text-sm text-white">{msg.name}</h3>
                        <p className="font-mono text-[10px] text-cyber-blue">{msg.email} // Subject: {msg.subject}</p>
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className="text-[10px] font-mono text-gray-500">{new Date(msg.createdAt).toLocaleString()}</span>
                        <button
                          onClick={() => deleteListItem("messages", msg.id)}
                          className="p-1.5 border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs font-mono bg-black/30 p-3 rounded-lg border border-white/5 text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {msg.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="font-orbitron font-black text-xl text-white">SETTINGS_GRID // SYSTEM CONFIG</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveSingular("settings", settingsForm);
                }}
                className="glass-card p-6 md:p-8 space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-gray-400 uppercase">Primary Custom Color</label>
                    <input
                      type="text"
                      value={settingsForm.primaryColor || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, primaryColor: e.target.value })}
                      className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-3 text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-gray-400 uppercase">Secondary Custom Color</label>
                    <input
                      type="text"
                      value={settingsForm.secondaryColor || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, secondaryColor: e.target.value })}
                      className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-3 text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-gray-400 uppercase">Boot Loader Style</label>
                    <select
                      value={settingsForm.loader || "default"}
                      onChange={(e) => setSettingsForm({ ...settingsForm, loader: e.target.value })}
                      className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-3 text-xs font-mono text-white focus:outline-none"
                    >
                      <option value="default">Default</option>
                      <option value="cyber">Cyber Diagnostics</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-gray-400 uppercase">Analytics tracking ID</label>
                    <input
                      type="text"
                      value={settingsForm.analyticsId || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, analyticsId: e.target.value })}
                      className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-3 text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-gray-400 uppercase">Custom Footer Text</label>
                  <input
                    type="text"
                    value={settingsForm.footerText || ""}
                    onChange={(e) => setSettingsForm({ ...settingsForm, footerText: e.target.value })}
                    className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-3 text-xs font-mono text-white focus:outline-none"
                  />
                </div>

                {successMsg && (
                  <div className="p-3 bg-cyber-green/10 border border-cyber-green/30 text-cyber-green text-xs font-mono rounded-lg">
                    {successMsg}
                  </div>
                )}

                <button type="submit" disabled={saving} className="btn-cyber flex items-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} COMMIT SETTINGS
                </button>
              </form>
            </div>

            {/* CHANGE ADMIN PASSWORD */}
            <div className="space-y-6">
              <h2 className="font-orbitron font-black text-xl text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-cyber-green" /> SECURITY_GRID // CHANGE ADMIN PASSWORD
              </h2>
              <form onSubmit={handleChangePassword} className="glass-card p-6 md:p-8 space-y-6 border-cyber-green/20">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                    Current Password (Verifies Authority)
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter your current password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-cyber-green"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="Minimum 6 characters"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-cyber-green"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Re-enter new password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-cyber-green"
                    />
                  </div>
                </div>

                {passwordStatus.type === "error" && (
                  <div className="p-3 bg-rose-950/40 border border-rose-500/40 text-rose-400 text-xs font-mono rounded-lg flex items-center gap-2">
                    <Lock className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{passwordStatus.text}</span>
                  </div>
                )}

                {passwordStatus.type === "success" && (
                  <div className="p-3 bg-cyber-green/10 border border-cyber-green/40 text-cyber-green text-xs font-mono rounded-lg flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyber-green shrink-0" />
                    <span>{passwordStatus.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={passwordStatus.type === "saving"}
                  className="btn-cyber flex items-center gap-2 border-cyber-green text-cyber-green font-bold"
                >
                  {passwordStatus.type === "saving" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Key className="w-4 h-4" />
                  )}{" "}
                  UPDATE SECURITY PASSWORD
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* CRUD MANAGEMENT OVERLAY MODAL */}
      <AnimatePresence>
        {showFormModal && editingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-2xl glass-card border-cyber-green/30 bg-[#07111F]/95 p-6 md:p-8 flex flex-col max-h-[90vh] overflow-y-auto relative hud-box"
            >
              <button
                onClick={() => {
                  setShowFormModal(false);
                  setEditingItem(null);
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="font-orbitron font-black text-lg text-white mb-6 uppercase">
                {editingItem.id ? `EDIT ${activeTab.toUpperCase()}` : `ADD NEW ${activeTab.toUpperCase()}`} RECORD
              </h2>

              {/* Qualifications Form */}
              {activeTab === "qualifications" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveListItem("education", editingItem);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Degree / Qualification</label>
                      <input
                        type="text"
                        required
                        value={editingItem.degree}
                        onChange={(e) => setEditingItem({ ...editingItem, degree: e.target.value })}
                        className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Institution / School</label>
                      <input
                        type="text"
                        required
                        value={editingItem.institution}
                        onChange={(e) => setEditingItem({ ...editingItem, institution: e.target.value })}
                        className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Timeline / Duration</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 2023 - 2027 (Expected)"
                        value={editingItem.duration}
                        onChange={(e) => setEditingItem({ ...editingItem, duration: e.target.value })}
                        className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Grade / GPA</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. GPA: 3.92 / 4.00"
                        value={editingItem.grade}
                        onChange={(e) => setEditingItem({ ...editingItem, grade: e.target.value })}
                        className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-gray-400 uppercase">Description</label>
                    <textarea
                      rows={4}
                      required
                      value={editingItem.description}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none resize-none"
                    />
                  </div>

                  <button type="submit" disabled={saving} className="btn-cyber flex items-center gap-2 mt-4">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} SAVE QUALIFICATION
                  </button>
                </form>
              )}

              {/* Skills Form */}
              {activeTab === "skills" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveListItem("skills", editingItem);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Skill Name</label>
                      <input
                        type="text"
                        required
                        value={editingItem.name}
                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                        className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Icon (Lucide name)</label>
                      <input
                        type="text"
                        value={editingItem.logo}
                        onChange={(e) => setEditingItem({ ...editingItem, logo: e.target.value })}
                        className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Progress %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        required
                        value={editingItem.progress}
                        onChange={(e) => setEditingItem({ ...editingItem, progress: Number(e.target.value) })}
                        className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Category</label>
                      <select
                        value={editingItem.category}
                        onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                        className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none"
                      >
                        <option value="cybersecurity">Cybersecurity</option>
                        <option value="programming">Programming</option>
                        <option value="frontend">Frontend</option>
                        <option value="backend">Backend</option>
                        <option value="networking">Networking</option>
                        <option value="cloud">Cloud</option>
                        <option value="os">OS</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Years Exp</label>
                      <input
                        type="number"
                        value={editingItem.yearsOfExp}
                        onChange={(e) => setEditingItem({ ...editingItem, yearsOfExp: Number(e.target.value) })}
                        className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={saving} className="btn-cyber flex items-center gap-2 w-full justify-center">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} SAVE SKILL NODE
                  </button>
                </form>
              )}

              {/* Certifications Form */}
              {activeTab === "certifications" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveListItem("certifications", editingItem);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Title</label>
                      <input
                        type="text"
                        required
                        value={editingItem.title}
                        onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                        className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Issuer</label>
                      <input
                        type="text"
                        required
                        value={editingItem.issuer}
                        onChange={(e) => setEditingItem({ ...editingItem, issuer: e.target.value })}
                        className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Year</label>
                      <input
                        type="text"
                        required
                        value={editingItem.year}
                        onChange={(e) => setEditingItem({ ...editingItem, year: e.target.value })}
                        className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Category</label>
                      <select
                        value={editingItem.category}
                        onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                        className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none"
                      >
                        <option value="certification">Certification</option>
                        <option value="ctf">CTF</option>
                        <option value="award">Award</option>
                        <option value="course">Course</option>
                        <option value="recognition">Recognition</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Icon</label>
                      <input
                        type="text"
                        value={editingItem.icon}
                        onChange={(e) => setEditingItem({ ...editingItem, icon: e.target.value })}
                        className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Credential ID</label>
                      <input
                        type="text"
                        value={editingItem.credentialId}
                        onChange={(e) => setEditingItem({ ...editingItem, credentialId: e.target.value })}
                        className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Verification URL</label>
                      <input
                        type="text"
                        value={editingItem.verificationUrl}
                        onChange={(e) => setEditingItem({ ...editingItem, verificationUrl: e.target.value })}
                        className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-gray-400 uppercase">Description</label>
                    <textarea
                      rows={2}
                      value={editingItem.description}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none resize-none"
                    />
                  </div>
                  <button type="submit" disabled={saving} className="btn-cyber flex items-center gap-2 w-full justify-center">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} SAVE CERTIFICATION
                  </button>
                </form>
              )}

              {/* Projects Form */}
              {activeTab === "projects" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveListItem("projects", editingItem);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Project Title</label>
                      <input
                        type="text"
                        required
                        value={editingItem.title}
                        onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                        className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Brief Description</label>
                      <input
                        type="text"
                        required
                        value={editingItem.description}
                        onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                        className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Role</label>
                      <input
                        type="text"
                        value={editingItem.role}
                        onChange={(e) => setEditingItem({ ...editingItem, role: e.target.value })}
                        className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Timeline</label>
                      <input
                        type="text"
                        value={editingItem.timeline}
                        onChange={(e) => setEditingItem({ ...editingItem, timeline: e.target.value })}
                        className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Platform / Event</label>
                      <input
                        type="text"
                        value={editingItem.event}
                        onChange={(e) => setEditingItem({ ...editingItem, event: e.target.value })}
                        className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">GitHub URL</label>
                      <input
                        type="text"
                        placeholder="https://github.com/..."
                        value={editingItem.githubUrl || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, githubUrl: e.target.value })}
                        className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyber-green"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase font-bold text-cyber-green">Deployed / Live URL</label>
                      <input
                        type="text"
                        placeholder="https://your-app.vercel.app"
                        value={editingItem.liveUrl || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, liveUrl: e.target.value })}
                        className="w-full bg-[#040a12] border border-cyber-green/40 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyber-green shadow-[0_0_10px_rgba(0,255,157,0.1)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Project Image File Path</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="/uploads/... or https://..."
                          value={editingItem.imageUrl || ""}
                          onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                          className="flex-grow bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyber-green"
                        />
                        <label className="btn-cyber flex items-center justify-center p-2.5 cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, (url) => setEditingItem({ ...editingItem, imageUrl: url }), "prj_img")}
                          />
                          {uploadingFile === "prj_img" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-gray-400 uppercase">Full Case Study / Description</label>
                    <textarea
                      rows={4}
                      value={editingItem.fullDescription}
                      onChange={(e) => setEditingItem({ ...editingItem, fullDescription: e.target.value })}
                      className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none resize-none"
                    />
                  </div>
                  <button type="submit" disabled={saving} className="btn-cyber flex items-center gap-2 w-full justify-center">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} SAVE PROJECT DOSSIER
                  </button>
                </form>
              )}

              {/* Articles Form */}
              {activeTab === "articles" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveListItem("articles", editingItem);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Article Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Zero-Trust Architecture in Serverless Environments"
                        value={editingItem.title || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                        className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyber-green"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Category</label>
                      <select
                        value={editingItem.category || "CYBERSECURITY"}
                        onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                        className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyber-green"
                      >
                        <option value="CYBERSECURITY">CYBERSECURITY</option>
                        <option value="ENGINEERING">ENGINEERING</option>
                        <option value="ARTIFICIAL INTELLIGENCE">ARTIFICIAL INTELLIGENCE</option>
                        <option value="SYSTEM ARCHITECTURE">SYSTEM ARCHITECTURE</option>
                        <option value="CLOUD & DEVOPS">CLOUD & DEVOPS</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Read Time</label>
                      <input
                        type="text"
                        placeholder="e.g. 6 min read"
                        value={editingItem.readTime || "5 min read"}
                        onChange={(e) => setEditingItem({ ...editingItem, readTime: e.target.value })}
                        className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyber-green"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Publication Date</label>
                      <input
                        type="text"
                        placeholder="e.g. July 2026"
                        value={editingItem.date || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                        className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyber-green"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Tags (comma-separated)</label>
                      <input
                        type="text"
                        placeholder="Zero-Trust, Next.js, App Sec"
                        value={Array.isArray(editingItem.tags) ? editingItem.tags.join(", ") : editingItem.tags || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, tags: e.target.value.split(",").map((t: string) => t.trim()).filter(Boolean) })}
                        className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyber-green"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-gray-400 uppercase">Brief Excerpt</label>
                    <input
                      type="text"
                      required
                      placeholder="Short summary of the article..."
                      value={editingItem.excerpt || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, excerpt: e.target.value })}
                      className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyber-green"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-gray-400 uppercase">Full Article Content / Research Paper</label>
                    <textarea
                      rows={6}
                      required
                      placeholder="Write full article content here..."
                      value={editingItem.content || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                      className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyber-green resize-none"
                    />
                  </div>

                  <button type="submit" disabled={saving} className="btn-cyber flex items-center gap-2 w-full justify-center">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} SAVE ARTICLE
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
