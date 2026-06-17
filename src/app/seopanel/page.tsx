"use client";

import { useEffect, useState } from "react";
import SeoLogin from "@/components/seopanel/SeoLogin";
import DashboardSection from "@/components/seopanel/DashboardSection";
import KeywordsSection from "@/components/seopanel/KeywordsSection";
import PagesSection from "@/components/seopanel/PagesSection";
import TechnicalSection from "@/components/seopanel/TechnicalSection";
import {
  BacklinksSection,
  ContentSection,
  CompetitorsSection,
  TasksSection,
  AuditsSection,
  ReportsSection,
} from "@/components/seopanel/CrudSections";
import AnalyticsSection, { SettingsSection } from "@/components/seopanel/AnalyticsSection";
import { SEO_PANEL_SECTIONS, type SeoSectionId } from "@/lib/seopanel/constants";
import { seoFetch } from "@/lib/seopanel/client";
import AnimatedLogo from "@/components/AnimatedLogo";

export default function SeoPanelPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<SeoSectionId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("seoPanelToken");
    const auth = sessionStorage.getItem("seoPanelAuth");
    if (!token || auth !== "authenticated") {
      setLoading(false);
      return;
    }
    seoFetch("/api/seopanel/dashboard").then((r) => {
      if (r.ok) setAuthenticated(true);
      else {
        sessionStorage.removeItem("seoPanelToken");
        sessionStorage.removeItem("seoPanelAuth");
      }
      setLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    const token = sessionStorage.getItem("seoPanelToken");
    if (token) {
      await seoFetch("/api/seopanel/auth", {
        method: "POST",
        body: JSON.stringify({ step: "logout" }),
      });
    }
    sessionStorage.removeItem("seoPanelToken");
    sessionStorage.removeItem("seoPanelAuth");
    setAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#0d9488] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return <SeoLogin onAuthenticated={() => setAuthenticated(true)} />;
  }

  const renderSection = () => {
    switch (section) {
      case "dashboard": return <DashboardSection />;
      case "keywords": return <KeywordsSection />;
      case "pages": return <PagesSection />;
      case "technical": return <TechnicalSection />;
      case "backlinks": return <BacklinksSection />;
      case "content": return <ContentSection />;
      case "competitors": return <CompetitorsSection />;
      case "tasks": return <TasksSection />;
      case "audits": return <AuditsSection />;
      case "reports": return <ReportsSection />;
      case "analytics": return <AnalyticsSection />;
      case "settings": return <SettingsSection />;
      default: return <DashboardSection />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-0"} flex-shrink-0 bg-[#0a0f1a] border-r border-[#1e2a45] transition-all duration-300 overflow-hidden flex flex-col`}>
        <div className="p-5 border-b border-[#1e2a45]">
          <AnimatedLogo className="mb-3 cursor-default scale-75 origin-left" />
          <p className="text-[#0d9488] text-xs font-bold uppercase tracking-widest">SEO Command Center</p>
          <p className="text-slate-500 text-xs mt-0.5">vyntechsolutions.ca</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {SEO_PANEL_SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                section === s.id
                  ? "bg-gradient-to-r from-[#0d9488]/20 to-[#0055FF]/10 text-white border border-[#0d9488]/30"
                  : "text-slate-400 hover:text-white hover:bg-[#1e2a45]/50"
              }`}
            >
              <span className="text-base">{s.icon}</span>
              {s.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-[#1e2a45]">
          <button type="button" onClick={handleLogout} className="w-full text-left text-slate-500 hover:text-red-400 text-sm transition-colors">
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-[#1e2a45] bg-[#0a0f1a]/80 backdrop-blur flex items-center justify-between px-6 flex-shrink-0">
          <button type="button" onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-400 hover:text-white text-sm">
            {sidebarOpen ? "◀" : "▶"} Menu
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400 text-xs">SEO Expert Session Active</span>
            </div>
            <a href="https://vyntechsolutions.ca" target="_blank" rel="noopener noreferrer" className="text-[#0d9488] text-xs font-semibold hover:underline">
              View Site →
            </a>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
