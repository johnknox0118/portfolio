"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, User, Code, Award, Folder, Settings, Mail,
  LogOut, Plus, Trash, Edit, Check, Loader2, FileText, Camera, X, Globe, ExternalLink, Key, Lock,
  ShieldAlert, Trophy, Eye, Clock, Users, CheckCircle2, ChevronRight, HelpCircle,
  Palette, Sparkles, RefreshCw, Layers,
  Activity, Radio, MapPin, Server, Smartphone, Monitor, Download, Search, AlertTriangle, Play, Pause, Compass
} from "lucide-react";
import { applyThemeToDocument, DEFAULT_THEME } from "@/components/ThemeProvider";

export interface CyberPreset {
  id: string;
  name: string;
  tag: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
}

export const INITIAL_CYBER_PRESETS: CyberPreset[] = [
  {
    id: "matrix-neon",
    name: "Matrix Neon",
    tag: "DEFAULT",
    primary: "#00FF9D",
    secondary: "#00C8FF",
    accent: "#00e5ff",
    background: "#040a12",
  },
  {
    id: "cyber-crimson",
    name: "Cyber Crimson",
    tag: "RED ALERT",
    primary: "#FF003C",
    secondary: "#E000FF",
    accent: "#00FFCC",
    background: "#0d0208",
  },
  {
    id: "synthwave-sunset",
    name: "Synthwave Sunset",
    tag: "RETRO",
    primary: "#FF007F",
    secondary: "#7928CA",
    accent: "#FF8000",
    background: "#0f0214",
  },
  {
    id: "toxic-amber",
    name: "Toxic Amber",
    tag: "BIOHAZARD",
    primary: "#FFB800",
    secondary: "#FF5500",
    accent: "#FF0055",
    background: "#0f0900",
  },
  {
    id: "phantom-violet",
    name: "Phantom Violet",
    tag: "STEALTH",
    primary: "#A855F7",
    secondary: "#3B82F6",
    accent: "#00FF9D",
    background: "#080414",
  },
  {
    id: "glacier-frost",
    name: "Glacier Frost",
    tag: "CRYOGENIC",
    primary: "#00F0FF",
    secondary: "#38BDF8",
    accent: "#A855F7",
    background: "#030914",
  },
  {
    id: "deep-cyber-navy",
    name: "Deep Cyber Navy",
    tag: "CLASSIC",
    primary: "#00FF9D",
    secondary: "#00C8FF",
    accent: "#00e5ff",
    background: "#07111F",
  },
  {
    id: "pure-oled-black",
    name: "Pure OLED Black",
    tag: "OLED",
    primary: "#00FF9D",
    secondary: "#00C8FF",
    accent: "#00e5ff",
    background: "#000000",
  },
];

// Broadcast synchronization across browser tabs and public portfolio
const broadcastSyncUpdate = (entity?: string) => {
  try {
    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel("portfolio_sync");
      channel.postMessage({ type: "data_updated", entity, timestamp: Date.now() });
      channel.close();
    }
  } catch (e) {}
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("portfolio_sync_timestamp", Date.now().toString());
    }
  } catch (e) {}
};

function formatTimeAgo(dateString: string | Date): string {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 45) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

function getCountryFlagEmoji(countryCode?: string): string {
  if (!countryCode || countryCode.length !== 2) return "🌐";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // CTF Tab State & Participant Audit Modal
  const [ctfSubTab, setCtfSubTab] = useState<"questions" | "participants">("questions");
  const [viewingSubmission, setViewingSubmission] = useState<any>(null);
  const [ctfSearchQuery, setCtfSearchQuery] = useState("");
  const [ctfStatusFilter, setCtfStatusFilter] = useState<"all" | "completed" | "in_progress">("all");

  // Visitor Logs & Real-Time Intelligence State
  const [visitorLogs, setVisitorLogs] = useState<any[]>([]);
  const [visitorStats, setVisitorStats] = useState<any>(null);
  const [loadingVisitors, setLoadingVisitors] = useState(false);
  const [visitorSearch, setVisitorSearch] = useState("");
  const [visitorDeviceFilter, setVisitorDeviceFilter] = useState("all");
  const [visitorTimeframe, setVisitorTimeframe] = useState("all");
  const [visitorPageFilter, setVisitorPageFilter] = useState<"all" | "portfolio" | "admin">("all");
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [showClearLogsModal, setShowClearLogsModal] = useState(false);
  const [clearingLogs, setClearingLogs] = useState(false);
  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  // Load all aggregates
  const loadData = async () => {
    try {
      const res = await fetch("/api/public/data?t=" + Date.now());
      const result = await res.json();
      
      // Also load messages safely
      let messages: any[] = [];
      try {
        const msgRes = await fetch("/api/admin/messages?t=" + Date.now());
        if (msgRes.ok) {
          const parsed = await msgRes.json();
          if (Array.isArray(parsed)) {
            messages = parsed;
          }
        }
      } catch (msgErr) {
        console.warn("Could not load admin messages:", msgErr);
      }

      // Load CTF Questions
      let ctfQuestions: any[] = [];
      try {
        const qRes = await fetch("/api/admin/ctfQuestions?t=" + Date.now());
        if (qRes.ok) {
          const parsed = await qRes.json();
          if (Array.isArray(parsed)) {
            ctfQuestions = parsed;
          }
        }
      } catch (qErr) {
        console.warn("Could not load CTF questions:", qErr);
      }

      // Load CTF Participant Submissions
      let ctfSubmissions: any[] = [];
      try {
        const subRes = await fetch("/api/admin/ctfSubmissions?t=" + Date.now());
        if (subRes.ok) {
          const parsed = await subRes.json();
          if (Array.isArray(parsed)) {
            ctfSubmissions = parsed;
          }
        }
      } catch (subErr) {
        console.warn("Could not load CTF submissions:", subErr);
      }

      // Load Visitor Intelligence Stats for badge
      try {
        const vRes = await fetch("/api/admin/visitors?limit=1&t=" + Date.now());
        if (vRes.ok) {
          const vData = await vRes.json();
          setVisitorStats(vData.stats || null);
        }
      } catch (vErr) {
        console.warn("Could not load visitor stats:", vErr);
      }
      
      if (result?.settings) {
        applyThemeToDocument(result.settings.primaryColor, result.settings.secondaryColor, result.settings.accentColor, result.settings.theme);
      }
      setData({ ...result, messages, ctfQuestions, ctfSubmissions });
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

  const loadVisitorLogs = async () => {
    try {
      setLoadingVisitors(true);
      const params = new URLSearchParams();
      if (visitorSearch) params.set("search", visitorSearch);
      if (visitorDeviceFilter !== "all") params.set("device", visitorDeviceFilter);
      if (visitorTimeframe !== "all") params.set("timeframe", visitorTimeframe);
      params.set("t", Date.now().toString());

      const res = await fetch(`/api/admin/visitors?${params.toString()}`);
      if (res.ok) {
        const result = await res.json();
        setVisitorLogs(result.logs || []);
        setVisitorStats(result.stats || null);
      }
    } catch (err) {
      console.error("Failed to load visitor logs:", err);
    } finally {
      setLoadingVisitors(false);
    }
  };

  useEffect(() => {
    if (activeTab === "visitors") {
      loadVisitorLogs();
      if (isLiveStreaming) {
        const interval = setInterval(() => {
          loadVisitorLogs();
        }, 5000);
        return () => clearInterval(interval);
      }
    }
  }, [activeTab, visitorSearch, visitorDeviceFilter, visitorTimeframe, isLiveStreaming]);

  const handleCopyIp = (ip: string) => {
    if (!ip) return;
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  const handleExportVisitorsCsv = () => {
    const headers = [
      "Timestamp",
      "IP Address",
      "Country",
      "Country Code",
      "Region / State",
      "City / District",
      "Postal Code",
      "ISP / Network",
      "Device",
      "OS",
      "Browser",
      "Page Viewed",
      "Accuracy",
      "Visit Count",
      "Latitude",
      "Longitude",
    ];

    const targetList = visitorLogs.filter((v) => {
      if (visitorPageFilter === "portfolio") return v.page === "/" || !v.page?.startsWith("/admin");
      if (visitorPageFilter === "admin") return v.page?.startsWith("/admin");
      return true;
    });

    const rows = (targetList.length > 0 ? targetList : visitorLogs).map((v) => [
      `"${new Date(v.createdAt).toISOString()}"`,
      `"${v.ipAddress || ""}"`,
      `"${v.country || ""}"`,
      `"${v.countryCode || ""}"`,
      `"${v.region || ""}"`,
      `"${v.city || ""}"`,
      `"${v.postalCode || ""}"`,
      `"${(v.isp || "").replace(/"/g, '""')}"`,
      `"${v.device || ""}"`,
      `"${v.os || ""}"`,
      `"${v.browser || ""}"`,
      `"${v.page || ""}"`,
      `"${v.accuracy || ""}"`,
      v.visitCount || 1,
      v.latitude ?? "",
      v.longitude ?? "",
    ]);

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `visitor_telemetry_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleTestVisitorPing = async (type: "portfolio" | "admin" = "portfolio") => {
    try {
      await fetch("/api/public/track-visitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: type === "portfolio" ? "/" : "/admin/login",
          referer: "http://localhost:3000/manual-test",
        }),
      });
      loadVisitorLogs();
    } catch (e) {
      console.error("Test ping error:", e);
    }
  };

  const handleClearAllLogs = async () => {
    setClearingLogs(true);
    try {
      const res = await fetch("/api/admin/visitors", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear_all" }),
      });
      if (res.ok) {
        setVisitorLogs([]);
        setVisitorStats((prev: any) =>
          prev
            ? {
                ...prev,
                totalVisits: 0,
                uniqueIps: 0,
                activeNow: 0,
                totalPageViews: 0,
                topCountries: [],
              }
            : null
        );
        setShowClearLogsModal(false);
      }
    } catch (e) {
      console.error("Failed to clear logs:", e);
    } finally {
      setClearingLogs(false);
    }
  };

  // State managers for editing/creating items
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Singular models (Profile / Settings)
  const [profileForm, setProfileForm] = useState<any>({});
  const [settingsForm, setSettingsForm] = useState<any>({});

  // Preset Combinations CRUD State
  const [presets, setPresets] = useState<CyberPreset[]>(INITIAL_CYBER_PRESETS);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<CyberPreset | null>(null);
  const [presetFormData, setPresetFormData] = useState({
    id: "",
    name: "",
    tag: "CUSTOM",
    primary: "#00FF9D",
    secondary: "#00C8FF",
    accent: "#00e5ff",
    background: "#040a12",
  });

  // CRUD selection state
  const [editingItem, setEditingItem] = useState<any>(null); // For skills, projects, certs, internships, achievements, gallery
  const [showFormModal, setShowFormModal] = useState(false);

  useEffect(() => {
    if (data) {
      setProfileForm(data.profile);
      setSettingsForm(data.settings);

      // Load custom presets from database settings.loader or localStorage
      let loaded = false;
      if (data.settings?.loader && data.settings.loader.startsWith("[")) {
        try {
          const parsed = JSON.parse(data.settings.loader);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPresets(parsed);
            loaded = true;
          }
        } catch (e) {}
      }
      if (!loaded && typeof window !== "undefined") {
        try {
          const local = localStorage.getItem("cyber_presets_custom");
          if (local) {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setPresets(parsed);
            }
          }
        } catch (e) {}
      }
    }
  }, [data]);

  const handleColorChange = (key: "primaryColor" | "secondaryColor" | "accentColor" | "theme", value: string) => {
    const updated = { ...settingsForm, [key]: value };
    setSettingsForm(updated);
    applyThemeToDocument(
      key === "primaryColor" ? value : (settingsForm?.primaryColor || DEFAULT_THEME.primaryColor),
      key === "secondaryColor" ? value : (settingsForm?.secondaryColor || DEFAULT_THEME.secondaryColor),
      key === "accentColor" ? value : (settingsForm?.accentColor || DEFAULT_THEME.accentColor),
      key === "theme" ? value : (settingsForm?.theme || DEFAULT_THEME.backgroundColor)
    );
  };

  const handleSelectPreset = (preset: CyberPreset) => {
    const updated = {
      ...settingsForm,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
      theme: preset.background,
    };
    setSettingsForm(updated);
    applyThemeToDocument(preset.primary, preset.secondary, preset.accent, preset.background);
  };

  const persistPresets = async (updatedPresets: CyberPreset[]) => {
    setPresets(updatedPresets);
    try {
      localStorage.setItem("cyber_presets_custom", JSON.stringify(updatedPresets));
    } catch (e) {}

    const serialized = JSON.stringify(updatedPresets);
    const updatedSettings = { ...settingsForm, loader: serialized };
    setSettingsForm(updatedSettings);

    try {
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings),
      });
      broadcastSyncUpdate("settings");
    } catch (e) {
      console.error("Failed to persist presets:", e);
    }
  };

  const handleOpenAddModal = () => {
    setEditingPreset(null);
    setPresetFormData({
      id: "",
      name: "",
      tag: "CUSTOM",
      primary: settingsForm.primaryColor || "#00FF9D",
      secondary: settingsForm.secondaryColor || "#00C8FF",
      accent: settingsForm.accentColor || "#00e5ff",
      background: settingsForm.theme && settingsForm.theme.startsWith("#") ? settingsForm.theme : "#07111F",
    });
    setIsPresetModalOpen(true);
  };

  const handleSaveCurrentAsPreset = () => {
    setEditingPreset(null);
    setPresetFormData({
      id: "",
      name: `Preset ${presets.length + 1}`,
      tag: "CUSTOM",
      primary: settingsForm.primaryColor || "#00FF9D",
      secondary: settingsForm.secondaryColor || "#00C8FF",
      accent: settingsForm.accentColor || "#00e5ff",
      background: settingsForm.theme && settingsForm.theme.startsWith("#") ? settingsForm.theme : "#07111F",
    });
    setIsPresetModalOpen(true);
  };

  const handleEditPreset = (preset: CyberPreset) => {
    setEditingPreset(preset);
    setPresetFormData({
      id: preset.id,
      name: preset.name,
      tag: preset.tag,
      primary: preset.primary,
      secondary: preset.secondary,
      accent: preset.accent,
      background: preset.background,
    });
    setIsPresetModalOpen(true);
  };

  const handleSavePresetForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetFormData.name.trim()) return;

    let updated: CyberPreset[];
    if (editingPreset) {
      updated = presets.map((p) =>
        p.id === editingPreset.id
          ? {
              ...p,
              name: presetFormData.name.trim(),
              tag: (presetFormData.tag || "CUSTOM").toUpperCase().trim(),
              primary: presetFormData.primary,
              secondary: presetFormData.secondary,
              accent: presetFormData.accent,
              background: presetFormData.background,
            }
          : p
      );
    } else {
      const newPreset: CyberPreset = {
        id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: presetFormData.name.trim(),
        tag: (presetFormData.tag || "CUSTOM").toUpperCase().trim(),
        primary: presetFormData.primary,
        secondary: presetFormData.secondary,
        accent: presetFormData.accent,
        background: presetFormData.background,
      };
      updated = [...presets, newPreset];
    }

    persistPresets(updated);
    setIsPresetModalOpen(false);
    setEditingPreset(null);
    setSuccessMsg(editingPreset ? `Preset "${presetFormData.name}" updated.` : `Preset "${presetFormData.name}" added.`);
  };

  const handleDeletePreset = (preset: CyberPreset) => {
    if (confirm(`Are you sure you want to delete "${preset.name}"?`)) {
      const updated = presets.filter((p) => p.id !== preset.id);
      persistPresets(updated);
      setSuccessMsg(`Preset "${preset.name}" deleted.`);
    }
  };

  const handleResetToDefaults = () => {
    if (confirm("Reset all combinations to the 8 original cyber presets?")) {
      persistPresets(INITIAL_CYBER_PRESETS);
      setSuccessMsg("Restored factory cyber presets.");
    }
  };

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
        if (entity === "settings") {
          applyThemeToDocument(formState.primaryColor, formState.secondaryColor, formState.accentColor, formState.theme);
          try {
            localStorage.setItem("portfolio_custom_theme", JSON.stringify(formState));
            if (typeof BroadcastChannel !== "undefined") {
              const bc = new BroadcastChannel("portfolio_sync");
              bc.postMessage({ type: "THEME_UPDATED", theme: formState });
              bc.close();
            }
          } catch (e) {}
        }
        loadData();
        broadcastSyncUpdate(entity);
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
        broadcastSyncUpdate(entity);
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
        broadcastSyncUpdate(entity);
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
            onClick={() => setActiveTab("ctf")}
            className={`flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-lg text-left transition-all shrink-0 whitespace-nowrap ${
              activeTab === "ctf" ? "bg-cyber-green/10 text-cyber-green border-l-2 border-cyber-green" : "text-gray-400 hover:text-white"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-cyber-green" /> CTF CHALLENGE
            </span>
            {data?.ctfSubmissions && data.ctfSubmissions.length > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyber-green/20 text-cyber-green font-mono font-bold">
                {data.ctfSubmissions.length}
              </span>
            )}
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
            onClick={() => setActiveTab("visitors")}
            className={`flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-lg text-left transition-all shrink-0 whitespace-nowrap ${
              activeTab === "visitors" ? "bg-cyber-green/10 text-cyber-green border-l-2 border-cyber-green" : "text-gray-400 hover:text-white"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-cyber-green" /> VISITOR LOGS
            </span>
            {visitorStats?.activeNow > 0 ? (
              <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-cyber-green/20 text-cyber-green font-mono font-bold animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-green inline-block" />
                {visitorStats.activeNow}
              </span>
            ) : visitorStats?.totalVisits > 0 ? (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-gray-400 font-mono font-bold">
                {visitorStats.totalVisits}
              </span>
            ) : null}
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

        {/* TAB CTF CHALLENGES & PARTICIPANT AUDIT */}
        {activeTab === "ctf" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-cyber-green animate-pulse" />
                  <h2 className="font-orbitron font-black text-xl text-white">
                    CTF_GRID // SECURITY CHALLENGES &amp; AUDIT
                  </h2>
                </div>
                <p className="text-xs font-mono text-gray-400 mt-1">
                  Manage interactive CTF stages, inspect participant scores, and review recruiter telemetry.
                </p>
              </div>

              {/* Sub-tab switcher */}
              <div className="flex items-center gap-2 bg-[#040a12] p-1 rounded-xl border border-white/10 font-mono text-xs">
                <button
                  onClick={() => setCtfSubTab("questions")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    ctfSubTab === "questions"
                      ? "bg-cyber-green/20 text-cyber-green font-bold border border-cyber-green/40 shadow-[0_0_10px_rgba(0,255,157,0.2)]"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  STAGES ({data.ctfQuestions?.length || 0})
                </button>
                <button
                  onClick={() => setCtfSubTab("participants")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    ctfSubTab === "participants"
                      ? "bg-cyber-blue/20 text-cyber-blue font-bold border border-cyber-blue/40 shadow-[0_0_10px_rgba(0,200,255,0.2)]"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  PARTICIPANTS ({data.ctfSubmissions?.length || 0})
                </button>
              </div>
            </div>

            {/* SUB-TAB 1: QUESTIONS & STAGES */}
            {ctfSubTab === "questions" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-gray-400">
                    Active Security Stages: <strong className="text-white">{data.ctfQuestions?.length || 0}</strong>
                  </span>
                  <button
                    onClick={() => {
                      setEditingItem({
                        stageNumber: (data.ctfQuestions?.length || 0) + 1,
                        category: "CYBERSECURITY",
                        title: "",
                        description: "",
                        clue: "",
                        type: "text",
                        options: [
                          { id: "opt_a", text: "A) Option description" },
                          { id: "opt_b", text: "B) Option description" },
                        ],
                        answer: "",
                        hint: "",
                        points: 100,
                        displayOrder: (data.ctfQuestions?.length || 0) + 1,
                      });
                      setShowFormModal(true);
                    }}
                    className="btn-cyber flex items-center gap-1.5 px-4 py-2 text-xs"
                  >
                    <Plus className="w-4 h-4" /> ADD CTF STAGE
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(data.ctfQuestions || []).map((q: any) => (
                    <div key={q.id} className="glass-card p-5 flex flex-col justify-between gap-4 border-cyber-green/20">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="cyber-tag text-[9px] border-cyber-green/40 text-cyber-green font-bold">
                            STAGE {q.stageNumber} // {q.category}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue font-bold">
                            +{q.points || 100} PTS
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-orbitron font-bold text-sm text-white">{q.title}</h3>
                            <span className="text-[9px] font-mono text-gray-400 px-1.5 py-0.5 bg-black/40 rounded border border-white/10 uppercase">
                              {q.type === "multiple_choice" ? "CHOICE" : "TEXT FLAG"}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{q.description}</p>
                        </div>

                        {q.clue && (
                          <div className="p-2.5 bg-black/60 border border-cyber-green/20 rounded-lg text-cyber-green font-mono text-[11px] truncate">
                            {q.clue}
                          </div>
                        )}

                        <div className="p-2.5 bg-[#040a12] border border-white/10 rounded-lg text-[11px] font-mono space-y-1">
                          <div className="flex items-center justify-between text-gray-400">
                            <span>VERIFIED ANSWER / FLAG:</span>
                            <span className="text-cyber-green font-bold select-all">{q.answer}</span>
                          </div>
                          {q.hint && (
                            <div className="text-[10px] text-gray-500 truncate">
                              HINT: {q.hint}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                        <button
                          onClick={() => {
                            setEditingItem({
                              ...q,
                              options: Array.isArray(q.options)
                                ? q.options
                                : typeof q.options === "string"
                                ? JSON.parse(q.options || "[]")
                                : [],
                            });
                            setShowFormModal(true);
                          }}
                          className="p-2 border border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/10 rounded-lg flex items-center gap-1 text-xs font-mono"
                        >
                          <Edit className="w-4 h-4" /> EDIT
                        </button>
                        <button
                          onClick={() => deleteListItem("ctfQuestions", q.id)}
                          className="p-2 border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 rounded-lg flex items-center gap-1 text-xs font-mono"
                        >
                          <Trash className="w-4 h-4" /> DELETE
                        </button>
                      </div>
                    </div>
                  ))}

                  {(!data.ctfQuestions || data.ctfQuestions.length === 0) && (
                    <div className="col-span-2 glass-card p-8 text-center text-gray-500 font-mono text-xs uppercase">
                      [!] No CTF challenge stages found. Click &quot;ADD CTF STAGE&quot; to configure your first challenge.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUB-TAB 2: PARTICIPANTS & AUDIT LOGS */}
            {ctfSubTab === "participants" && (
              <div className="space-y-6">
                {/* 4 Summary Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="glass-card p-4 border-cyber-green/30">
                    <span className="font-mono text-[9px] text-gray-400 uppercase">Total Participants</span>
                    <div className="font-orbitron font-bold text-2xl text-white mt-1">
                      {data.ctfSubmissions?.length || 0}
                    </div>
                    <span className="text-[10px] font-mono text-gray-500">RECRUITERS &amp; VISITORS</span>
                  </div>
                  <div className="glass-card p-4 border-cyber-blue/30">
                    <span className="font-mono text-[9px] text-gray-400 uppercase">Completed Audits</span>
                    <div className="font-orbitron font-bold text-2xl text-cyber-green mt-1">
                      {(data.ctfSubmissions || []).filter((s: any) => s.status === "completed").length}
                    </div>
                    <span className="text-[10px] font-mono text-cyber-green">VERIFIED CRITICAL PASS</span>
                  </div>
                  <div className="glass-card p-4 border-cyber-cyan/30">
                    <span className="font-mono text-[9px] text-gray-400 uppercase">Average Score</span>
                    <div className="font-orbitron font-bold text-2xl text-cyber-blue mt-1">
                      {data.ctfSubmissions && data.ctfSubmissions.length > 0
                        ? Math.round(
                            data.ctfSubmissions.reduce((acc: number, s: any) => acc + (s.score || 0), 0) /
                              data.ctfSubmissions.length
                          )
                        : 0}{" "}
                      <span className="text-xs text-gray-400">PTS</span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-500">ACROSS ALL ATTEMPTS</span>
                  </div>
                  <div className="glass-card p-4 border-cyber-green/30">
                    <span className="font-mono text-[9px] text-gray-400 uppercase">Top Score Achieved</span>
                    <div className="font-orbitron font-bold text-2xl text-cyber-green mt-1">
                      {data.ctfSubmissions && data.ctfSubmissions.length > 0
                        ? Math.max(...data.ctfSubmissions.map((s: any) => s.score || 0))
                        : 0}{" "}
                      <span className="text-xs text-gray-400">PTS</span>
                    </div>
                    <span className="text-[10px] font-mono text-cyber-green">MAXIMUM UNLOCKED</span>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row justify-between gap-3">
                  <input
                    type="text"
                    placeholder="Search by participant name, email, or role..."
                    value={ctfSearchQuery}
                    onChange={(e) => setCtfSearchQuery(e.target.value)}
                    className="w-full sm:w-80 bg-[#040a12] border border-white/10 rounded-lg px-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyber-blue"
                  />
                  <div className="flex gap-2 font-mono text-xs">
                    {(["all", "completed", "in_progress"] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setCtfStatusFilter(filter)}
                        className={`px-3 py-1.5 rounded-lg uppercase text-[10px] font-bold transition-all cursor-pointer ${
                          ctfStatusFilter === filter
                            ? "bg-cyber-green/20 text-cyber-green border border-cyber-green/40"
                            : "bg-[#040a12] text-gray-400 hover:text-white border border-white/10"
                        }`}
                      >
                        {filter === "all" ? "ALL" : filter === "completed" ? "COMPLETED" : "IN PROGRESS"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Participants Table */}
                <div className="glass-card overflow-hidden border-white/10">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead className="bg-[#040a12] text-gray-400 text-[10px] uppercase border-b border-white/10">
                        <tr>
                          <th className="p-4">Participant / Callsign</th>
                          <th className="p-4">Role &amp; Affiliation</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Score</th>
                          <th className="p-4">Time</th>
                          <th className="p-4">Date</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-gray-300">
                        {(data.ctfSubmissions || [])
                          .filter((sub: any) => {
                            const matchQuery =
                              !ctfSearchQuery ||
                              (sub.userName || "").toLowerCase().includes(ctfSearchQuery.toLowerCase()) ||
                              (sub.email || "").toLowerCase().includes(ctfSearchQuery.toLowerCase()) ||
                              (sub.role || "").toLowerCase().includes(ctfSearchQuery.toLowerCase());
                            const matchStatus =
                              ctfStatusFilter === "all" || sub.status === ctfStatusFilter;
                            return matchQuery && matchStatus;
                          })
                          .map((sub: any) => (
                            <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="p-4 font-bold text-white">
                                <div className="flex items-center gap-2">
                                  <User className="w-3.5 h-3.5 text-cyber-green shrink-0" />
                                  <span>{sub.userName}</span>
                                </div>
                              </td>
                              <td className="p-4 text-gray-400">
                                <div>{sub.role || "Visitor"}</div>
                                {sub.email && <div className="text-[10px] text-gray-500">{sub.email}</div>}
                              </td>
                              <td className="p-4">
                                {sub.status === "completed" ? (
                                  <span className="px-2 py-0.5 rounded text-[9px] bg-cyber-green/10 border border-cyber-green/30 text-cyber-green font-bold inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> COMPLETED
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[9px] bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold inline-flex items-center gap-1">
                                    <Clock className="w-3 h-3 animate-pulse" /> IN PROGRESS
                                  </span>
                                )}
                              </td>
                              <td className="p-4 font-orbitron font-bold text-cyber-blue">
                                {sub.score || 0}{" "}
                                <span className="text-[10px] text-gray-500 font-mono">
                                  ({sub.stagesCompleted || 0}/{sub.totalStages || 3})
                                </span>
                              </td>
                              <td className="p-4 text-gray-400 text-[11px]">
                                {sub.timeSpentSec ? `${sub.timeSpentSec}s` : "--"}
                              </td>
                              <td className="p-4 text-gray-500 text-[10px]">
                                {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : "--"}
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => setViewingSubmission(sub)}
                                    className="px-2.5 py-1 rounded border border-cyber-blue/40 text-cyber-blue hover:bg-cyber-blue/10 flex items-center gap-1 text-[10px] cursor-pointer"
                                    title="View Detailed Participant Dossier"
                                  >
                                    <Eye className="w-3 h-3" /> DOSSIER
                                  </button>
                                  <button
                                    onClick={() => deleteListItem("ctfSubmissions", sub.id)}
                                    className="p-1.5 rounded border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                                    title="Delete Attempt Record"
                                  >
                                    <Trash className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        {(!data.ctfSubmissions || data.ctfSubmissions.length === 0) && (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-gray-500 font-mono text-xs">
                              [!] No participant submissions logged yet. When visitors attempt the CTF on your portfolio, their full audit dossiers will appear here.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB MESSAGES */}
        {activeTab === "messages" && (
          <div className="space-y-6">
            <h2 className="font-orbitron font-black text-xl text-white">INBOX_TICKET // VISITOR MESSAGES</h2>
            <div className="space-y-4">
              {!Array.isArray(data.messages) || data.messages.length === 0 ? (
                <div className="glass-card p-8 text-center text-gray-500 font-mono text-xs uppercase">
                  [!] Communications queue empty. No messages logged.
                </div>
              ) : (
                data.messages.map((msg: any) => (
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

        {/* TAB VISITOR LOGS (REAL-TIME INTELLIGENCE RADAR) */}
        {activeTab === "visitors" && (
          <div className="space-y-6">
            {/* Header with Title & Action Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-orbitron font-black text-xl text-white flex items-center gap-2.5">
                  <Activity className="w-5 h-5 text-cyber-green animate-pulse" />
                  VISITOR_INTEL // REAL-TIME NETWORK & GEOLOCATION RADAR
                </h2>
                <p className="text-xs font-mono text-gray-400 mt-1">
                  Live session telemetry, IP geolocation resolution, telecom carriers, and precision confidence index.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* 1. Live Polling Toggle */}
                <button
                  type="button"
                  onClick={() => setIsLiveStreaming(!isLiveStreaming)}
                  className={`px-3.5 py-2 rounded-lg border text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer select-none ${
                    isLiveStreaming
                      ? "border-cyber-green bg-cyber-green/15 text-cyber-green shadow-[0_0_15px_rgba(0,255,157,0.25)] hover:bg-cyber-green/25"
                      : "border-amber-500/60 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                  }`}
                  title={isLiveStreaming ? "Live auto-update every 5s. Click to pause." : "Stream is paused. Click to resume auto-polling."}
                >
                  {isLiveStreaming ? (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-cyber-green animate-ping inline-block" />
                      <Pause className="w-3.5 h-3.5" /> LIVE (5s)
                    </>
                  ) : (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                      <Play className="w-3.5 h-3.5 text-amber-400" /> RESUME LIVE
                    </>
                  )}
                </button>

                {/* 2. Manual Refresh Button */}
                <button
                  type="button"
                  onClick={() => loadVisitorLogs()}
                  disabled={loadingVisitors}
                  className="px-3.5 py-2 rounded-lg border border-cyber-blue/60 bg-cyber-blue/15 text-cyber-blue hover:bg-cyber-blue/25 hover:border-cyber-blue text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_12px_rgba(0,200,255,0.15)]"
                  title="Click to immediately pull latest visitor telemetry"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingVisitors ? "animate-spin" : ""}`} />
                  REFRESH
                </button>

                {/* 3. Export CSV Button */}
                <button
                  type="button"
                  onClick={handleExportVisitorsCsv}
                  className="px-3.5 py-2 rounded-lg border border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/50 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_10px_rgba(255,255,255,0.08)]"
                  title="Export all visitor logs to CSV / Excel spreadsheet"
                >
                  <Download className="w-3.5 h-3.5 text-cyber-green" />
                  EXPORT CSV
                </button>

                {/* 4. Clear Logs Button */}
                <button
                  type="button"
                  onClick={() => setShowClearLogsModal(true)}
                  className="px-3.5 py-2 rounded-lg border border-rose-500/60 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 hover:border-rose-500 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_12px_rgba(244,63,94,0.15)]"
                  title="Purge visitor logs from database"
                >
                  <Trash className="w-3.5 h-3.5" />
                  CLEAR
                </button>

                {/* 5. Quick Test Ping (Simulate Visit) */}
                <button
                  type="button"
                  onClick={() => handleTestVisitorPing("portfolio")}
                  className="px-3 py-2 rounded-lg border border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Simulate a live visitor to verify real-time table logging"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  + TEST VISIT
                </button>
              </div>
            </div>

            {/* 4 KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card p-4 border-cyber-green/30 flex flex-col justify-between">
                <span className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">Total Logged Visits</span>
                <div className="font-orbitron font-bold text-2xl text-white my-1">
                  {visitorStats?.totalVisits ?? visitorLogs.length}
                </div>
                <span className="text-[10px] font-mono text-gray-500">
                  {visitorStats?.totalPageViews ? `${visitorStats.totalPageViews} Total Pageviews` : "Recorded Impressions"}
                </span>
              </div>

              <div className="glass-card p-4 border-cyber-blue/30 flex flex-col justify-between">
                <span className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">Unique IP Nodes</span>
                <div className="font-orbitron font-bold text-2xl text-cyber-blue my-1">
                  {visitorStats?.uniqueIps ?? new Set(visitorLogs.map((l) => l.ipAddress)).size}
                </div>
                <span className="text-[10px] font-mono text-cyber-blue">DISTINCT CLIENT NODES</span>
              </div>

              <div className="glass-card p-4 border-cyber-cyan/30 flex flex-col justify-between">
                <span className="font-mono text-[9px] text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
                  Active Right Now
                </span>
                <div className="font-orbitron font-bold text-2xl text-cyber-green my-1">
                  {visitorStats?.activeNow ?? 0}
                </div>
                <span className="text-[10px] font-mono text-gray-500">LAST 10 MINUTES TELEMETRY</span>
              </div>

              <div className="glass-card p-4 border-cyber-green/30 flex flex-col justify-between">
                <span className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">Top Detected Territories</span>
                <div className="font-orbitron font-bold text-sm text-white my-1 truncate">
                  {visitorStats?.topCountries && visitorStats.topCountries.length > 0 ? (
                    visitorStats.topCountries
                      .slice(0, 2)
                      .map((c: any) => `${c.country} (${c.count})`)
                      .join(", ")
                  ) : (
                    "No Geo Data Yet"
                  )}
                </div>
                <span className="text-[10px] font-mono text-gray-500">RESOLVED REGIONS</span>
              </div>
            </div>

            {/* Traffic Type Segment Filter (Portfolio Main Page vs Admin Logins vs All) */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setVisitorPageFilter("all")}
                className={`px-3.5 py-1.5 rounded-lg font-orbitron text-[11px] font-bold tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                  visitorPageFilter === "all"
                    ? "bg-cyber-green text-black shadow-[0_0_15px_rgba(0,255,157,0.4)]"
                    : "bg-[#040a12] text-gray-400 border border-white/10 hover:text-white"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                ALL TRAFFIC ({visitorLogs.length})
              </button>
              <button
                type="button"
                onClick={() => setVisitorPageFilter("portfolio")}
                className={`px-3.5 py-1.5 rounded-lg font-orbitron text-[11px] font-bold tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                  visitorPageFilter === "portfolio"
                    ? "bg-cyber-blue text-black shadow-[0_0_15px_rgba(0,200,255,0.4)]"
                    : "bg-[#040a12] text-gray-400 border border-white/10 hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                PORTFOLIO MAIN PAGE ONLY ({visitorLogs.filter((v) => v.page === "/" || !v.page?.startsWith("/admin")).length})
              </button>
              <button
                type="button"
                onClick={() => setVisitorPageFilter("admin")}
                className={`px-3.5 py-1.5 rounded-lg font-orbitron text-[11px] font-bold tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                  visitorPageFilter === "admin"
                    ? "bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                    : "bg-[#040a12] text-gray-400 border border-white/10 hover:text-white"
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                ADMIN LOGINS ({visitorLogs.filter((v) => v.page?.startsWith("/admin")).length})
              </button>
            </div>

            {/* Filter, Search & Timeframe Bar */}
            <div className="glass-card p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search IP, city, state, country, ISP, device..."
                  value={visitorSearch}
                  onChange={(e) => setVisitorSearch(e.target.value)}
                  className="w-full bg-[#040a12] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-cyber-green transition-colors"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <select
                  value={visitorDeviceFilter}
                  onChange={(e) => setVisitorDeviceFilter(e.target.value)}
                  aria-label="Filter by device"
                  className="bg-[#040a12] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-gray-300 focus:outline-none focus:border-cyber-green"
                >
                  <option value="all">All Devices</option>
                  <option value="Desktop">Desktop</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Tablet">Tablet</option>
                </select>

                <select
                  value={visitorTimeframe}
                  onChange={(e) => setVisitorTimeframe(e.target.value)}
                  aria-label="Filter by timeframe"
                  className="bg-[#040a12] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-gray-300 focus:outline-none focus:border-cyber-green"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                </select>

                <span className="text-[11px] font-mono text-gray-400 whitespace-nowrap">
                  Showing {
                    visitorLogs.filter((v) => {
                      if (visitorPageFilter === "portfolio") return v.page === "/" || !v.page?.startsWith("/admin");
                      if (visitorPageFilter === "admin") return v.page?.startsWith("/admin");
                      return true;
                    }).length
                  } of {visitorLogs.length} records
                </span>
              </div>
            </div>

            {/* The Main High-Precision Visitor Table */}
            <div className="glass-card overflow-hidden border-cyber-green/20">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-[#040a12] text-[10px] text-gray-400 uppercase tracking-widest border-b border-white/10">
                    <tr>
                      <th className="p-3.5 whitespace-nowrap">Status & Time</th>
                      <th className="p-3.5 whitespace-nowrap">IP Address</th>
                      <th className="p-3.5 whitespace-nowrap">Location (Country / State / City)</th>
                      <th className="p-3.5 whitespace-nowrap">Postal / Area</th>
                      <th className="p-3.5 whitespace-nowrap">ISP / Network Provider</th>
                      <th className="p-3.5 whitespace-nowrap">Device / OS</th>
                      <th className="p-3.5 whitespace-nowrap">Target Page</th>
                      <th className="p-3.5 whitespace-nowrap">Accuracy & Confidence</th>
                      <th className="p-3.5 text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {visitorLogs
                      .filter((v) => {
                        if (visitorPageFilter === "portfolio") return v.page === "/" || !v.page?.startsWith("/admin");
                        if (visitorPageFilter === "admin") return v.page?.startsWith("/admin");
                        return true;
                      })
                      .map((log: any) => {
                        const isRecent = new Date(log.updatedAt).getTime() > Date.now() - 10 * 60 * 1000;
                        const isPortfolioPage = log.page === "/" || !log.page?.startsWith("/admin");
                        return (
                          <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                            {/* Status & Time */}
                            <td className="p-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                    isRecent
                                      ? "bg-cyber-green shadow-[0_0_8px_rgba(0,255,157,0.8)] animate-pulse"
                                      : "bg-gray-600"
                                  }`}
                                  title={isRecent ? "Active session (<10m)" : "Past session"}
                                />
                                <div>
                                  <div className="text-white font-semibold">
                                    {formatTimeAgo(log.updatedAt || log.createdAt)}
                                  </div>
                                  <div className="text-[10px] text-gray-500">
                                    {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* IP Address */}
                            <td className="p-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-cyber-blue font-bold text-xs select-all">
                                  {log.ipAddress}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyIp(log.ipAddress)}
                                  className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                                  title="Copy IP"
                                >
                                  {copiedIp === log.ipAddress ? (
                                    <Check className="w-3 h-3 text-cyber-green" />
                                  ) : (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded border border-white/15 hover:border-white/40 font-mono">
                                      COPY
                                    </span>
                                  )}
                                </button>
                              </div>
                              {log.isLocalhost && (
                                <span className="text-[9px] text-yellow-400/90 font-mono block mt-0.5">
                                  [Dev Localhost WAN]
                                </span>
                              )}
                              {log.isVpn && (
                                <span className="text-[9px] text-rose-400 font-mono block mt-0.5">
                                  ⚠️ [VPN / Proxy]
                                </span>
                              )}
                            </td>

                            {/* Location */}
                            <td className="p-3.5">
                              <div className="whitespace-nowrap flex items-center gap-1.5">
                                <span className="text-base" role="img" aria-label={log.country}>
                                  {getCountryFlagEmoji(log.countryCode)}
                                </span>
                                <span className="text-white font-bold">{log.country || "Unknown"}</span>
                              </div>
                              <div className="text-[11px] text-gray-400 truncate max-w-[200px] mt-0.5">
                                {[log.city, log.region].filter(Boolean).join(", ") || "Area not specified"}
                              </div>
                            </td>

                            {/* Postal / Area Code */}
                            <td className="p-3.5 whitespace-nowrap">
                              {log.postalCode ? (
                                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/15 text-cyber-green font-mono text-[11px] font-bold">
                                  {log.postalCode}
                                </span>
                              ) : (
                                <span className="text-gray-600 font-mono text-[11px]">—</span>
                              )}
                            </td>

                            {/* ISP / Network */}
                            <td className="p-3.5">
                              <div className="text-white font-medium text-xs truncate max-w-[200px]">
                                {log.isp || "Unknown Carrier"}
                              </div>
                              {log.org && log.org !== log.isp && (
                                <div className="text-[10px] text-gray-500 truncate max-w-[200px]">
                                  {log.org}
                                </div>
                              )}
                            </td>

                            {/* Device / OS */}
                            <td className="p-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 text-xs text-white">
                                {log.device === "Mobile" ? (
                                  <Smartphone className="w-3.5 h-3.5 text-cyber-blue shrink-0" />
                                ) : log.device === "Tablet" ? (
                                  <Smartphone className="w-3.5 h-3.5 text-cyber-cyan shrink-0" />
                                ) : (
                                  <Monitor className="w-3.5 h-3.5 text-cyber-green shrink-0" />
                                )}
                                <span>{log.device || "Desktop"}</span>
                              </div>
                              <div className="text-[10px] text-gray-400 mt-0.5">
                                {[log.os, log.browser].filter(Boolean).join(" // ") || "Unknown"}
                              </div>
                            </td>

                            {/* Target Page Viewed */}
                            <td className="p-3.5 whitespace-nowrap">
                              {isPortfolioPage ? (
                                <span className="px-2.5 py-1 rounded bg-cyber-green/15 border border-cyber-green/40 text-cyber-green text-[10px] font-bold font-mono tracking-wide">
                                  PORTFOLIO MAIN ( / )
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[10px] font-bold font-mono tracking-wide">
                                  🔒 ADMIN LOGIN
                                </span>
                              )}
                              {log.visitCount > 1 && (
                                <span className="text-[10px] text-gray-400 ml-1.5 font-mono">
                                  ({log.visitCount}x views)
                                </span>
                              )}
                            </td>

                            {/* Accuracy & Confidence */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-1.5 whitespace-nowrap">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                    log.postalCode
                                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                      : log.city
                                      ? "bg-cyber-blue/10 text-cyber-blue border-cyber-blue/30"
                                      : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                                  }`}
                                >
                                  {log.accuracy || "City/District Level"}
                                </span>
                              </div>
                              {log.latitude && log.longitude && (
                                <a
                                  href={`https://www.google.com/maps?q=${log.latitude},${log.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] text-gray-400 hover:text-cyber-green mt-1 transition-colors"
                                  title="View coordinates on Google Maps"
                                >
                                  <Compass className="w-3 h-3 text-cyber-green" />
                                  {log.latitude.toFixed(3)}, {log.longitude.toFixed(3)}
                                  <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                                </a>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="p-3.5 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await fetch("/api/admin/visitors", {
                                      method: "DELETE",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ id: log.id }),
                                    });
                                    setVisitorLogs((prev) => prev.filter((item) => item.id !== log.id));
                                  } catch (e) {
                                    console.error("Failed to delete log:", e);
                                  }
                                }}
                                className="p-1.5 rounded border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-colors"
                                title="Delete this record"
                              >
                                <Trash className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                    {visitorLogs.filter((v) => {
                      if (visitorPageFilter === "portfolio") return v.page === "/" || !v.page?.startsWith("/admin");
                      if (visitorPageFilter === "admin") return v.page?.startsWith("/admin");
                      return true;
                    }).length === 0 && (
                      <tr>
                        <td colSpan={9} className="p-12 text-center text-gray-500 font-mono text-xs">
                          {loadingVisitors ? (
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin text-cyber-green" />
                              <span>Scanning visitor telemetry...</span>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="text-gray-300 font-bold text-sm">
                                [!] No visitor records found for this view
                              </div>
                              <div className="text-[11px] text-gray-500 max-w-md mx-auto">
                                Open the portfolio homepage in a new tab or click <strong className="text-purple-300">+ TEST VISIT</strong> above to generate simulated real-time telemetry instantly!
                              </div>
                              <button
                                type="button"
                                onClick={() => handleTestVisitorPing(visitorPageFilter === "admin" ? "admin" : "portfolio")}
                                className="px-4 py-2 rounded-lg border border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 text-xs font-mono font-bold inline-flex items-center gap-2 cursor-pointer"
                              >
                                <Sparkles className="w-4 h-4" /> GENERATE TEST VISIT RECORD
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Clear All Logs Modal */}
            <AnimatePresence>
              {showClearLogsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="glass-card max-w-md w-full p-6 border-rose-500/40 space-y-4"
                  >
                    <div className="flex items-center gap-3 text-rose-500">
                      <AlertTriangle className="w-6 h-6 shrink-0" />
                      <h3 className="font-orbitron font-bold text-base text-white">PURGE_VISITOR_LOGS // CONFIRM</h3>
                    </div>

                    <p className="text-xs font-mono text-gray-300 leading-relaxed">
                      Are you sure you want to delete all recorded visitor logs? This action will wipe all IP, location, and telemetry data from the database and cannot be undone.
                    </p>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowClearLogsModal(false)}
                        className="px-4 py-2 rounded-lg border border-white/20 text-xs font-mono text-gray-300 hover:text-white"
                      >
                        CANCEL
                      </button>
                      <button
                        type="button"
                        onClick={handleClearAllLogs}
                        disabled={clearingLogs}
                        className="px-4 py-2 rounded-lg border border-rose-500 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-mono font-bold flex items-center gap-2"
                      >
                        {clearingLogs ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> PURGING...
                          </>
                        ) : (
                          <>
                            <Trash className="w-3.5 h-3.5" /> CONFIRM PURGE
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* TAB SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="font-orbitron font-black text-xl text-white flex items-center gap-3">
                    <Palette className="w-6 h-6 text-cyber-green" />
                    THEME_ENGINE // SYSTEM & DYNAMIC PALETTE CONFIG
                  </h2>
                  <p className="text-xs font-mono text-gray-400 mt-1">
                    Configure real-time website themes. Dynamically updates buttons, card luminous borders, 3D particles, and glowing headers.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectPreset(presets[0] || INITIAL_CYBER_PRESETS[0])}
                  className="px-3 py-1.5 border border-white/20 hover:border-cyber-green/50 text-gray-300 hover:text-white text-xs font-mono rounded flex items-center gap-2 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-cyber-green" />
                  Reset to Matrix Default
                </button>
              </div>

              {/* CYBER COLOR COMBINATIONS MANAGER (CRUD: ADD, MODIFY, DELETE) */}
              <div className="glass-card p-6 space-y-4 border-cyber-green/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-cyber-green" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                          Cyber Color Combinations
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyber-green/10 text-cyber-green border border-cyber-green/30 font-bold">
                          {presets.length} Active
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-gray-400 mt-0.5">
                        Click any palette to activate. Hover to edit or delete combinations.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveCurrentAsPreset}
                      className="px-2.5 py-1.5 text-[10px] font-mono rounded-lg border border-cyber-blue/40 bg-cyber-blue/10 text-cyber-blue hover:bg-cyber-blue/20 flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_10px_rgba(0,200,255,0.15)] font-bold uppercase"
                      title="Save your current 4 color channels below as a new combination"
                    >
                      <Plus className="w-3 h-3" /> Save Current as Preset
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenAddModal}
                      className="px-2.5 py-1.5 text-[10px] font-mono rounded-lg border border-cyber-green/40 bg-cyber-green/10 text-cyber-green hover:bg-cyber-green/20 flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_10px_rgba(0,255,157,0.15)] font-bold uppercase"
                    >
                      <Plus className="w-3 h-3" /> Add Combination
                    </button>
                    <button
                      type="button"
                      onClick={handleResetToDefaults}
                      className="px-2.5 py-1.5 text-[10px] font-mono rounded-lg border border-white/15 text-gray-400 hover:text-white hover:border-white/30 flex items-center gap-1 transition-all cursor-pointer"
                      title="Restore the 8 factory default cyber combinations"
                    >
                      <RefreshCw className="w-3 h-3" /> Factory Defaults
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {presets.map((preset) => {
                    const currentBg = settingsForm.theme && settingsForm.theme.startsWith("#") ? settingsForm.theme : "#07111F";
                    const isCurrent =
                      (settingsForm.primaryColor || "").toLowerCase() === preset.primary.toLowerCase() &&
                      (settingsForm.secondaryColor || "").toLowerCase() === preset.secondary.toLowerCase() &&
                      currentBg.toLowerCase() === preset.background.toLowerCase();

                    return (
                      <div
                        key={preset.id || preset.name}
                        onClick={() => handleSelectPreset(preset)}
                        className={`group relative p-3 rounded-xl border text-left transition-all overflow-hidden cursor-pointer ${
                          isCurrent
                            ? "border-cyber-green bg-cyber-green/10 shadow-[0_0_18px_rgba(0,255,157,0.22)] ring-1 ring-cyber-green/50"
                            : "border-white/10 hover:border-white/30 bg-[#040a12]/80 hover:bg-[#071220]"
                        }`}
                      >
                        {/* Hover Action Buttons: Modify & Delete */}
                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPreset(preset);
                            }}
                            className="p-1 rounded bg-black/80 hover:bg-cyber-blue/30 text-gray-300 hover:text-cyber-blue border border-white/20 hover:border-cyber-blue transition-all cursor-pointer"
                            title={`Modify "${preset.name}"`}
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePreset(preset);
                            }}
                            className="p-1 rounded bg-black/80 hover:bg-rose-500/30 text-gray-300 hover:text-rose-400 border border-white/20 hover:border-rose-500 transition-all cursor-pointer"
                            title={`Delete "${preset.name}"`}
                          >
                            <Trash className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest font-semibold">{preset.tag}</span>
                          {isCurrent && <Check className="w-3.5 h-3.5 text-cyber-green group-hover:hidden" />}
                        </div>
                        <p className="text-xs font-orbitron font-bold text-white mb-2 truncate pr-4">{preset.name}</p>
                        
                        {/* 4 Swatches */}
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-4 h-4 rounded-full border border-black/40 shadow-sm"
                            style={{ backgroundColor: preset.primary }}
                            title={`Primary: ${preset.primary}`}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-black/40 shadow-sm"
                            style={{ backgroundColor: preset.secondary }}
                            title={`Secondary: ${preset.secondary}`}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-black/40 shadow-sm"
                            style={{ backgroundColor: preset.accent }}
                            title={`Accent: ${preset.accent}`}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-white/40 shadow-sm"
                            style={{ backgroundColor: preset.background }}
                            title={`Background: ${preset.background}`}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {/* Add New Combination Card */}
                  <button
                    type="button"
                    onClick={handleOpenAddModal}
                    className="p-3 rounded-xl border border-dashed border-white/20 hover:border-cyber-green/60 bg-black/20 hover:bg-cyber-green/5 text-gray-400 hover:text-cyber-green transition-all flex flex-col items-center justify-center min-h-[92px] gap-1.5 group cursor-pointer"
                  >
                    <Plus className="w-5 h-5 transition-transform group-hover:scale-125 text-cyber-green" />
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider">+ Add Combination</span>
                  </button>
                </div>
              </div>

              {/* MAIN FORM */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveSingular("settings", settingsForm);
                }}
                className="glass-card p-6 md:p-8 space-y-6"
              >
                {/* 4 DYNAMIC COLOR CHANNELS */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyber-blue" />
                      Dynamic Color Channels
                    </label>
                    <span className="text-[10px] font-mono text-gray-400">Use native picker or enter hex codes</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* PRIMARY COLOR */}
                    <div className="p-4 rounded-xl bg-[#040a12] border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-mono text-gray-300 uppercase tracking-wider font-semibold">
                          Primary Theme Color
                        </label>
                        <span className="text-[9px] font-mono text-cyber-green px-1.5 py-0.5 rounded bg-cyber-green/10">
                          BRAND / LASERS
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={settingsForm.primaryColor || "#00FF9D"}
                          onChange={(e) => handleColorChange("primaryColor", e.target.value)}
                          className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border border-white/20 p-1 shrink-0"
                        />
                        <input
                          type="text"
                          value={settingsForm.primaryColor || ""}
                          onChange={(e) => handleColorChange("primaryColor", e.target.value)}
                          placeholder="#00FF9D"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyber-green uppercase"
                        />
                      </div>
                      <p className="text-[10px] font-mono text-gray-500 leading-tight">
                        Controls neon lasers, buttons, 3D name face, card borders & particles.
                      </p>
                    </div>

                    {/* SECONDARY COLOR */}
                    <div className="p-4 rounded-xl bg-[#040a12] border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-mono text-gray-300 uppercase tracking-wider font-semibold">
                          Secondary Theme Color
                        </label>
                        <span className="text-[9px] font-mono text-cyber-blue px-1.5 py-0.5 rounded bg-cyber-blue/10">
                          3D TEXT / GLOWS
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={settingsForm.secondaryColor || "#00C8FF"}
                          onChange={(e) => handleColorChange("secondaryColor", e.target.value)}
                          className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border border-white/20 p-1 shrink-0"
                        />
                        <input
                          type="text"
                          value={settingsForm.secondaryColor || ""}
                          onChange={(e) => handleColorChange("secondaryColor", e.target.value)}
                          placeholder="#00C8FF"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyber-blue uppercase"
                        />
                      </div>
                      <p className="text-[10px] font-mono text-gray-500 leading-tight">
                        Controls 3D name extrusion shadow, 3D globe network mesh & secondary badges.
                      </p>
                    </div>

                    {/* ACCENT COLOR */}
                    <div className="p-4 rounded-xl bg-[#040a12] border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-mono text-gray-300 uppercase tracking-wider font-semibold">
                          Accent Theme Color
                        </label>
                        <span className="text-[9px] font-mono text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-400/10">
                          CYBER TAGS / HUD
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={settingsForm.accentColor || "#00e5ff"}
                          onChange={(e) => handleColorChange("accentColor", e.target.value)}
                          className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border border-white/20 p-1 shrink-0"
                        />
                        <input
                          type="text"
                          value={settingsForm.accentColor || ""}
                          onChange={(e) => handleColorChange("accentColor", e.target.value)}
                          placeholder="#00E5FF"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400 uppercase"
                        />
                      </div>
                      <p className="text-[10px] font-mono text-gray-500 leading-tight">
                        Controls tertiary security tags, terminal scanlines & qualification chips.
                      </p>
                    </div>

                    {/* WEBSITE BACKGROUND COLOR */}
                    <div className="p-4 rounded-xl bg-[#040a12] border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-mono text-gray-300 uppercase tracking-wider font-semibold">
                          Website Background
                        </label>
                        <span className="text-[9px] font-mono text-fuchsia-400 px-1.5 py-0.5 rounded bg-fuchsia-400/10">
                          CANVAS NOIR
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={settingsForm.theme && settingsForm.theme.startsWith("#") ? settingsForm.theme : "#07111F"}
                          onChange={(e) => handleColorChange("theme", e.target.value)}
                          className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border border-white/20 p-1 shrink-0"
                        />
                        <input
                          type="text"
                          value={settingsForm.theme && settingsForm.theme.startsWith("#") ? settingsForm.theme : ""}
                          onChange={(e) => handleColorChange("theme", e.target.value)}
                          placeholder="#07111F"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-fuchsia-400 uppercase"
                        />
                      </div>
                      <p className="text-[10px] font-mono text-gray-500 leading-tight">
                        Controls whole website dark canvas tone (deep navy, obsidian, crimson noir, OLED black).
                      </p>
                    </div>
                  </div>
                </div>

                {/* LIVE THEME PREVIEW SANDBOX */}
                <div className="p-5 rounded-2xl bg-[#03070d] border border-white/15 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: settingsForm.primaryColor || "#00FF9D" }} />
                      Live Theme Sandbox Preview
                    </span>
                    <span className="text-[9px] font-mono text-gray-500">Live preview matches your public portfolio style</span>
                  </div>

                  <div
                    className="p-6 rounded-xl border relative overflow-hidden transition-all duration-300 space-y-5"
                    style={{
                      borderColor: `${settingsForm.primaryColor || "#00FF9D"}40`,
                      background: `radial-gradient(ellipse at top left, ${settingsForm.primaryColor || "#00FF9D"}18, transparent 60%), radial-gradient(ellipse at bottom right, ${settingsForm.secondaryColor || "#00C8FF"}18, transparent 60%), ${settingsForm.theme && settingsForm.theme.startsWith("#") ? settingsForm.theme : "#07111F"}`,
                      boxShadow: `0 0 25px ${settingsForm.primaryColor || "#00FF9D"}1a`,
                    }}
                  >
                    {/* Live 3D Name Typography Preview */}
                    <div className="p-4 rounded-lg bg-black/30 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <span className="text-[9px] font-mono uppercase text-gray-400 tracking-widest block mb-1">
                          HERO SECTION // 3D NAME PREVIEW
                        </span>
                        <div className="relative inline-block hero-3d-name-font font-orbitron font-black py-1 select-none">
                          <span
                            aria-hidden="true"
                            className="absolute inset-0 select-none pointer-events-none hero-3d-extrusion hero-3d-name-font font-orbitron text-2xl sm:text-3xl font-black"
                            style={{ transform: "translateZ(-1.5px)" }}
                          >
                            Johnknox Kalle
                          </span>
                          <span
                            className="relative inline-block hero-3d-text-front hero-3d-name-font font-orbitron text-2xl sm:text-3xl font-black"
                            style={{ transform: "translateZ(1.5px)" }}
                          >
                            Johnknox Kalle
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest font-bold rounded"
                          style={{
                            backgroundColor: `${settingsForm.primaryColor || "#00FF9D"}20`,
                            color: settingsForm.primaryColor || "#00FF9D",
                            border: `1px solid ${settingsForm.primaryColor || "#00FF9D"}50`,
                          }}
                        >
                          PRIMARY
                        </span>
                        <span
                          className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest font-bold rounded"
                          style={{
                            backgroundColor: `${settingsForm.secondaryColor || "#00C8FF"}20`,
                            color: settingsForm.secondaryColor || "#00C8FF",
                            border: `1px solid ${settingsForm.secondaryColor || "#00C8FF"}50`,
                          }}
                        >
                          SECONDARY
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest font-bold rounded"
                            style={{
                              backgroundColor: `${settingsForm.primaryColor || "#00FF9D"}20`,
                              color: settingsForm.primaryColor || "#00FF9D",
                              border: `1px solid ${settingsForm.primaryColor || "#00FF9D"}50`,
                            }}
                          >
                            SECURITY_SYS // ACTIVE
                          </span>
                          <span
                            className="px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest font-bold rounded"
                            style={{
                              backgroundColor: `${settingsForm.secondaryColor || "#00C8FF"}20`,
                              color: settingsForm.secondaryColor || "#00C8FF",
                              border: `1px solid ${settingsForm.secondaryColor || "#00C8FF"}50`,
                            }}
                          >
                            DEFENSE_LAYER // 01
                          </span>
                          <span
                            className="px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest font-bold rounded"
                            style={{
                              backgroundColor: `${settingsForm.accentColor || "#00e5ff"}20`,
                              color: settingsForm.accentColor || "#00e5ff",
                              border: `1px solid ${settingsForm.accentColor || "#00e5ff"}50`,
                            }}
                          >
                            TAG // ACCENT
                          </span>
                        </div>
                        <h3 className="font-orbitron font-bold text-lg text-white">
                          Sample Cyber Component Header
                        </h3>
                        <p className="text-xs font-mono text-gray-300">
                          This preview dynamically demonstrates how your 3D text, cards, background, glows, borders, and buttons respond to your palette.
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          type="button"
                          className="px-4 py-2 text-xs font-orbitron font-bold uppercase rounded-lg transition-all"
                          style={{
                            backgroundColor: `${settingsForm.primaryColor || "#00FF9D"}20`,
                            color: settingsForm.primaryColor || "#00FF9D",
                            border: `1px solid ${settingsForm.primaryColor || "#00FF9D"}`,
                            boxShadow: `0 0 15px ${settingsForm.primaryColor || "#00FF9D"}40`,
                          }}
                        >
                          [ Primary Button ]
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2 text-xs font-orbitron font-bold uppercase rounded-lg transition-all"
                          style={{
                            backgroundColor: `${settingsForm.secondaryColor || "#00C8FF"}20`,
                            color: settingsForm.secondaryColor || "#00C8FF",
                            border: `1px solid ${settingsForm.secondaryColor || "#00C8FF"}`,
                            boxShadow: `0 0 15px ${settingsForm.secondaryColor || "#00C8FF"}40`,
                          }}
                        >
                          [ Secondary Button ]
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* OTHER SYSTEM SETTINGS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
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
                      placeholder="G-XXXXXXXXXX"
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
                    placeholder="e.g. All operations verified."
                    className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-3 text-xs font-mono text-white focus:outline-none"
                  />
                </div>

                {successMsg && (
                  <div className="p-3 bg-cyber-green/10 border border-cyber-green/30 text-cyber-green text-xs font-mono rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-cyber-green" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-2">
                  <button type="submit" disabled={saving} className="btn-cyber flex items-center gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} COMMIT SETTINGS
                  </button>
                </div>
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

              {/* CTF Challenge Stage Form */}
              {activeTab === "ctf" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveListItem("ctfQuestions", editingItem);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Stage Number</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={editingItem.stageNumber || 1}
                        onChange={(e) => setEditingItem({ ...editingItem, stageNumber: parseInt(e.target.value) || 1 })}
                        className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyber-green"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Category Tag</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. ENCODING, JWT AUDIT, SECURE CODING"
                        value={editingItem.category || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value.toUpperCase() })}
                        className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyber-green"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Score Points</label>
                      <input
                        type="number"
                        min="10"
                        step="10"
                        required
                        value={editingItem.points || 100}
                        onChange={(e) => setEditingItem({ ...editingItem, points: parseInt(e.target.value) || 100 })}
                        className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyber-green"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-gray-400 uppercase">Challenge Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Decode Auth Token Payload"
                      value={editingItem.title || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                      className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyber-green"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-gray-400 uppercase">Challenge Type</label>
                    <select
                      value={editingItem.type || "text"}
                      onChange={(e) => {
                        const newType = e.target.value;
                        const defaultOpts = [
                          { id: "opt_a", text: "A) First choice description" },
                          { id: "opt_b", text: "B) Second choice description" },
                          { id: "opt_c", text: "C) Third choice description" },
                        ];
                        setEditingItem({
                          ...editingItem,
                          type: newType,
                          options: newType === "multiple_choice" && (!editingItem.options || editingItem.options.length === 0)
                            ? defaultOpts
                            : editingItem.options,
                        });
                      }}
                      className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyber-blue"
                    >
                      <option value="text">Text Input (Flag / Solution Match)</option>
                      <option value="multiple_choice">Multiple Choice (Select from Options)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-gray-400 uppercase">Mission Prompt / Description</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Explain the vulnerability or challenge mission..."
                      value={editingItem.description || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyber-green"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-gray-400 uppercase">Clue / Code Snippet / Payload (Optional)</label>
                    <textarea
                      rows={3}
                      placeholder="Inspectable payload or token snippet (e.g. a2FsbGUtY3liZXItc2Vj)"
                      value={editingItem.clue || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, clue: e.target.value })}
                      className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2 text-xs font-mono text-cyber-green focus:outline-none focus:border-cyber-green font-mono"
                    />
                  </div>

                  {/* Multiple Choice Options Builder */}
                  {editingItem.type === "multiple_choice" && (
                    <div className="space-y-3 p-4 bg-black/40 border border-white/10 rounded-xl">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-mono text-cyber-blue uppercase font-bold">
                          Multiple Choice Options ({Array.isArray(editingItem.options) ? editingItem.options.length : 0})
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const current = Array.isArray(editingItem.options) ? editingItem.options : [];
                            const letter = String.fromCharCode(65 + current.length);
                            setEditingItem({
                              ...editingItem,
                              options: [...current, { id: `opt_${Date.now()}`, text: `${letter}) ` }],
                            });
                          }}
                          className="text-[10px] font-mono text-cyber-green hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> ADD OPTION
                        </button>
                      </div>

                      {(Array.isArray(editingItem.options) ? editingItem.options : []).map((opt: any, optIdx: number) => (
                        <div key={optIdx} className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Choice ID (e.g. none, parametrized)"
                            value={opt.id}
                            onChange={(e) => {
                              const newOpts = [...editingItem.options];
                              newOpts[optIdx].id = e.target.value;
                              setEditingItem({ ...editingItem, options: newOpts });
                            }}
                            className="w-1/3 bg-[#040a12] border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-cyber-blue focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Option description text"
                            value={opt.text}
                            onChange={(e) => {
                              const newOpts = [...editingItem.options];
                              newOpts[optIdx].text = e.target.value;
                              setEditingItem({ ...editingItem, options: newOpts });
                            }}
                            className="w-full bg-[#040a12] border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newOpts = editingItem.options.filter((_: any, i: number) => i !== optIdx);
                              setEditingItem({ ...editingItem, options: newOpts });
                            }}
                            className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded cursor-pointer"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-cyber-green uppercase font-bold">
                        Correct Answer / Flag *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={editingItem.type === "multiple_choice" ? "Enter Choice ID (e.g. none)" : "Enter expected string (e.g. kalle-cyber-sec)"}
                        value={editingItem.answer || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, answer: e.target.value })}
                        className="w-full bg-[#040a12] border border-cyber-green/40 rounded-lg px-4 py-2.5 text-xs font-mono text-cyber-green font-bold focus:outline-none focus:border-cyber-green"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">
                        Hint (Shown to user after failed attempt)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Use Base64 decoding or inspect alg parameter"
                        value={editingItem.hint || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, hint: e.target.value })}
                        className="w-full bg-[#040a12] border border-white/10 rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyber-blue"
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={saving} className="btn-cyber flex items-center gap-2 w-full justify-center cursor-pointer">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} SAVE CTF STAGE
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PARTICIPANT AUDIT DOSSIER MODAL */}
      {viewingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-xl glass-card border-cyber-blue/40 bg-[#07111F]/95 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,200,255,0.2)] flex flex-col gap-5 relative hud-box max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-cyber-blue" />
                <span className="font-orbitron font-black text-xs text-white uppercase tracking-wider">
                  SECURITY_AUDIT_DOSSIER // #{viewingSubmission.id}
                </span>
              </div>
              <button
                onClick={() => setViewingSubmission(null)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Participant Profile Card */}
            <div className="p-4 bg-black/50 border border-white/10 rounded-xl space-y-3 font-mono text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-orbitron font-bold text-base text-white">{viewingSubmission.userName}</h3>
                  <p className="text-cyber-green text-xs">{viewingSubmission.role || "Visitor"}</p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                    viewingSubmission.status === "completed"
                      ? "bg-cyber-green/20 text-cyber-green border border-cyber-green/40"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  }`}
                >
                  {viewingSubmission.status === "completed" ? "AUDIT COMPLETED" : "IN PROGRESS"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-400 border-t border-white/5 pt-2">
                <div>
                  <span className="text-gray-500">EMAIL: </span>
                  <span className="text-white">{viewingSubmission.email || "Not provided"}</span>
                </div>
                <div>
                  <span className="text-gray-500">FINAL SCORE: </span>
                  <span className="text-cyber-blue font-bold font-orbitron">{viewingSubmission.score || 0} PTS</span>
                </div>
                <div>
                  <span className="text-gray-500">TIME ELAPSED: </span>
                  <span className="text-white">{viewingSubmission.timeSpentSec ? `${viewingSubmission.timeSpentSec} seconds` : "--"}</span>
                </div>
                <div>
                  <span className="text-gray-500">RECORDED: </span>
                  <span className="text-white">{viewingSubmission.createdAt ? new Date(viewingSubmission.createdAt).toLocaleString() : "--"}</span>
                </div>
                <div className="col-span-2 truncate">
                  <span className="text-gray-500">IP ADDRESS: </span>
                  <span className="text-white">{viewingSubmission.ipAddress || "127.0.0.1"}</span>
                </div>
                <div className="col-span-2 truncate text-[10px] text-gray-500">
                  USER AGENT: {viewingSubmission.userAgent || "Browser Client"}
                </div>
              </div>
            </div>

            {/* Stage-by-Stage Solved Log */}
            <div className="space-y-2">
              <h4 className="font-orbitron font-bold text-xs text-white uppercase tracking-wider">
                VERIFIED STAGE AUDIT TRAIL
              </h4>
              <div className="space-y-2 font-mono text-xs">
                {(() => {
                  let detailsArr: any[] = [];
                  try {
                    detailsArr = Array.isArray(viewingSubmission.details)
                      ? viewingSubmission.details
                      : JSON.parse(viewingSubmission.details || "[]");
                  } catch {}
                  if (detailsArr.length === 0) {
                    return (
                      <div className="p-4 bg-black/40 border border-white/10 rounded-xl text-center text-gray-500 text-xs">
                        No intermediate stage telemetry recorded for this attempt.
                      </div>
                    );
                  }
                  return detailsArr.map((d: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 bg-black/40 border border-cyber-green/20 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-cyber-green shrink-0" />
                        <div>
                          <div className="text-white font-bold">
                            Stage {d.stageNumber}: {d.title}
                          </div>
                          {d.passedAt && (
                            <div className="text-[9px] text-gray-500">
                              {new Date(d.passedAt).toLocaleTimeString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-cyber-green font-bold text-xs">
                        +{d.pointsAwarded || 100} PTS
                      </span>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setViewingSubmission(null)}
                className="btn-cyber px-4 py-2 text-xs cursor-pointer"
              >
                CLOSE DOSSIER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRESET MODAL: ADD OR MODIFY COLOR COMBINATION */}
      {isPresetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-card border-cyber-green/40 bg-[#07111F]/95 p-6 rounded-2xl relative space-y-5 shadow-[0_0_50px_rgba(0,255,157,0.15)] hud-box">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-orbitron font-bold text-sm text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-cyber-green" />
                {editingPreset ? "MODIFY COLOR COMBINATION" : "ADD NEW COLOR COMBINATION"}
              </h3>
              <button
                onClick={() => setIsPresetModalOpen(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePresetForm} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-gray-400 mb-1 text-[11px] uppercase tracking-wider">
                  Combination Name *
                </label>
                <input
                  type="text"
                  required
                  value={presetFormData.name}
                  onChange={(e) => setPresetFormData({ ...presetFormData, name: e.target.value })}
                  placeholder="e.g. Cyberpunk Sunrise"
                  className="w-full bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-white font-orbitron text-xs focus:outline-none focus:border-cyber-green"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 text-[11px] uppercase tracking-wider">
                  Badge / Tag (e.g. CUSTOM, RETRO, VIBRANT)
                </label>
                <input
                  type="text"
                  value={presetFormData.tag}
                  onChange={(e) => setPresetFormData({ ...presetFormData, tag: e.target.value })}
                  placeholder="CUSTOM"
                  className="w-full bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-white text-xs uppercase focus:outline-none focus:border-cyber-green"
                />
              </div>

              {/* 4 COLOR CONTROLS */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* PRIMARY */}
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/10 space-y-1.5">
                  <span className="text-[10px] text-cyber-green block font-semibold">PRIMARY</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={presetFormData.primary}
                      onChange={(e) => setPresetFormData({ ...presetFormData, primary: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer bg-transparent border border-white/20 p-0.5 shrink-0"
                    />
                    <input
                      type="text"
                      value={presetFormData.primary}
                      onChange={(e) => setPresetFormData({ ...presetFormData, primary: e.target.value })}
                      className="w-full bg-black/60 border border-white/10 rounded px-2 py-1 text-[11px] text-white uppercase"
                    />
                  </div>
                </div>

                {/* SECONDARY */}
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/10 space-y-1.5">
                  <span className="text-[10px] text-cyber-blue block font-semibold">SECONDARY</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={presetFormData.secondary}
                      onChange={(e) => setPresetFormData({ ...presetFormData, secondary: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer bg-transparent border border-white/20 p-0.5 shrink-0"
                    />
                    <input
                      type="text"
                      value={presetFormData.secondary}
                      onChange={(e) => setPresetFormData({ ...presetFormData, secondary: e.target.value })}
                      className="w-full bg-black/60 border border-white/10 rounded px-2 py-1 text-[11px] text-white uppercase"
                    />
                  </div>
                </div>

                {/* ACCENT */}
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/10 space-y-1.5">
                  <span className="text-[10px] text-cyan-400 block font-semibold">ACCENT</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={presetFormData.accent}
                      onChange={(e) => setPresetFormData({ ...presetFormData, accent: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer bg-transparent border border-white/20 p-0.5 shrink-0"
                    />
                    <input
                      type="text"
                      value={presetFormData.accent}
                      onChange={(e) => setPresetFormData({ ...presetFormData, accent: e.target.value })}
                      className="w-full bg-black/60 border border-white/10 rounded px-2 py-1 text-[11px] text-white uppercase"
                    />
                  </div>
                </div>

                {/* BACKGROUND */}
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/10 space-y-1.5">
                  <span className="text-[10px] text-fuchsia-400 block font-semibold">BACKGROUND</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={presetFormData.background}
                      onChange={(e) => setPresetFormData({ ...presetFormData, background: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer bg-transparent border border-white/20 p-0.5 shrink-0"
                    />
                    <input
                      type="text"
                      value={presetFormData.background}
                      onChange={(e) => setPresetFormData({ ...presetFormData, background: e.target.value })}
                      className="w-full bg-black/60 border border-white/10 rounded px-2 py-1 text-[11px] text-white uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* MINI LIVE PREVIEW SWATCH */}
              <div
                className="p-3 rounded-lg border flex items-center justify-between gap-2 transition-all"
                style={{
                  backgroundColor: presetFormData.background,
                  borderColor: `${presetFormData.primary}50`,
                }}
              >
                <span className="text-xs font-orbitron font-bold" style={{ color: presetFormData.primary }}>
                  {presetFormData.name || "Combination Preview"}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full border border-black/40" style={{ backgroundColor: presetFormData.primary }} />
                  <span className="w-4 h-4 rounded-full border border-black/40" style={{ backgroundColor: presetFormData.secondary }} />
                  <span className="w-4 h-4 rounded-full border border-black/40" style={{ backgroundColor: presetFormData.accent }} />
                  <span className="w-4 h-4 rounded-full border border-white/40" style={{ backgroundColor: presetFormData.background }} />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPresetFormData({
                      ...presetFormData,
                      primary: settingsForm.primaryColor || "#00FF9D",
                      secondary: settingsForm.secondaryColor || "#00C8FF",
                      accent: settingsForm.accentColor || "#00e5ff",
                      background: settingsForm.theme && settingsForm.theme.startsWith("#") ? settingsForm.theme : "#07111F",
                    });
                  }}
                  className="text-[10px] text-cyber-blue hover:underline cursor-pointer"
                >
                  Load from current pickers
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPresetModalOpen(false)}
                    className="px-3 py-1.5 rounded border border-white/15 text-gray-400 hover:text-white text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded bg-cyber-green text-black font-bold text-xs hover:bg-cyber-green/90 shadow-[0_0_15px_rgba(0,255,157,0.3)] cursor-pointer"
                  >
                    {editingPreset ? "Update Combination" : "Save Combination"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
