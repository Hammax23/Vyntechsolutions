export function getSeoToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("seoPanelToken");
}

export async function seoFetch(url: string, options: RequestInit = {}) {
  const token = getSeoToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    sessionStorage.removeItem("seoPanelToken");
    sessionStorage.removeItem("seoPanelAuth");
    window.location.reload();
  }
  return res;
}

export const statusColors: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  in_progress: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  completed: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  tracking: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  improving: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  ranked: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  dropped: "bg-red-500/20 text-red-300 border-red-500/30",
  optimized: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  needs_review: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  open: "bg-red-500/20 text-red-300 border-red-500/30",
  resolved: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  active: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  lost: "bg-red-500/20 text-red-300 border-red-500/30",
  draft: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  published: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  in_review: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  needs_update: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  ignored: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  critical: "bg-red-500/20 text-red-400 border-red-500/40",
  high: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  medium: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  low: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

export const priorityColors: Record<string, string> = {
  critical: "text-red-400",
  high: "text-orange-400",
  medium: "text-amber-400",
  low: "text-slate-400",
};
