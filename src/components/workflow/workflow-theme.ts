"use client";

import { useEffect, useState } from "react";

export type WorkflowTheme = "dark" | "light";

const KEY = "vyntech-workflow-theme";

export function useWorkflowTheme() {
  const [theme, setTheme] = useState<WorkflowTheme>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    if (stored === "light" || stored === "dark") setTheme(stored);
    setReady(true);
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem(KEY, next);
      return next;
    });
  };

  return { theme, toggle, ready, isDark: theme === "dark" };
}

export function workflowUi(isDark: boolean) {
  if (isDark) {
    return {
      page: "bg-[#030014] text-white",
      header: "bg-[#030014]/90 border-white/10",
      muted: "text-white/45",
      faint: "text-white/30",
      card: "bg-white/[0.04] border-white/10",
      cardHover: "hover:border-[#00B4FF]/40 hover:bg-white/[0.07]",
      input:
        "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 outline-none focus:border-[#00B4FF]/60 focus:ring-2 focus:ring-[#00B4FF]/20 transition",
      option: "bg-[#0a0a1a]",
      btnGhost: "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white",
      progress: "bg-white/10",
      empty: "border-dashed border-white/15 bg-white/[0.02]",
      navIdle: "bg-white/5 text-white/55 hover:bg-white/10",
    };
  }
  return {
    page: "bg-slate-100 text-slate-900",
    header: "bg-white/90 border-slate-200",
    muted: "text-slate-500",
    faint: "text-slate-400",
    card: "bg-white border-slate-200 shadow-sm",
    cardHover: "hover:border-[#0055FF]/40 hover:shadow-md",
    input:
      "w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm placeholder-slate-400 outline-none focus:border-[#0055FF] focus:ring-2 focus:ring-[#0055FF]/15 transition",
    option: "bg-white",
    btnGhost: "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900",
    progress: "bg-slate-200",
    empty: "border-dashed border-slate-300 bg-white",
    navIdle: "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200",
  };
}
