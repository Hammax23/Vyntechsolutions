"use client";

import { useEffect, useState } from "react";
import { seoFetch } from "@/lib/seopanel/client";
import { Badge, Btn, Modal, Input, Select, Textarea, EmptyState } from "./shared";
import { SITE_URL } from "@/lib/seopanel/constants";

export default function PagesSection() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState<any>({});

  const load = () => {
    seoFetch("/api/seopanel/pages").then(async (r) => {
      if (r.ok) { const d = await r.json(); setPages(d.pages || []); }
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const openEdit = (p: any) => {
    setSelected(p);
    setForm({ ...p });
  };

  const save = async () => {
    const res = await seoFetch("/api/seopanel/pages", {
      method: "PATCH",
      body: JSON.stringify({ ...form, lastAuditedAt: new Date().toISOString() }),
    });
    if (res.ok) { setSelected(null); load(); }
  };

  const scoreColor = (s: number) => s >= 80 ? "text-emerald-400" : s >= 50 ? "text-amber-400" : "text-red-400";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">On-Page SEO</h2>
        <p className="text-slate-400 text-sm mt-1">Manage meta titles, descriptions, focus keywords & page scores</p>
      </div>

      {loading ? <p className="text-slate-400 animate-pulse">Loading pages...</p> : (
        <div className="grid gap-3">
          {pages.map((p) => (
            <div key={p.id} onClick={() => openEdit(p)}
              className="bg-[#12182b] border border-[#1e2a45] rounded-xl p-4 hover:border-[#0d9488]/40 cursor-pointer transition-colors flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <code className="text-[#0d9488] text-xs font-mono">{p.path}</code>
                  <Badge status={p.status} />
                  {p.indexStatus === "noindex" && <span className="text-red-400 text-xs">noindex</span>}
                </div>
                <p className="text-white text-sm font-medium truncate">{p.title || "No title set"}</p>
                {p.focusKeyword && <p className="text-slate-500 text-xs mt-0.5">Focus: {p.focusKeyword}</p>}
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-2xl font-bold ${scoreColor(p.seoScore)}`}>{p.seoScore}</p>
                <p className="text-slate-500 text-xs">SEO Score</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Edit: ${form.path || ""}`}>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <Input label="Page Title" value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea label="Meta Description" value={form.metaDescription || ""} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} rows={3} />
          <Input label="H1 Heading" value={form.h1 || ""} onChange={(e) => setForm({ ...form, h1: e.target.value })} />
          <Input label="Focus Keyword" value={form.focusKeyword || ""} onChange={(e) => setForm({ ...form, focusKeyword: e.target.value })} />
          <Input label="Canonical URL" value={form.canonicalUrl || ""} onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })} placeholder={`${SITE_URL}${form.path}`} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="OG Title" value={form.ogTitle || ""} onChange={(e) => setForm({ ...form, ogTitle: e.target.value })} />
            <Input label="OG Image URL" value={form.ogImage || ""} onChange={(e) => setForm({ ...form, ogImage: e.target.value })} />
          </div>
          <Textarea label="OG Description" value={form.ogDescription || ""} onChange={(e) => setForm({ ...form, ogDescription: e.target.value })} />
          <div className="grid grid-cols-3 gap-4">
            <Input label="SEO Score (0-100)" type="number" min={0} max={100} value={form.seoScore ?? 0} onChange={(e) => setForm({ ...form, seoScore: parseInt(e.target.value) || 0 })} />
            <Select label="Status" value={form.status || "needs_review"} onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={[{ value: "needs_review", label: "Needs Review" }, { value: "in_progress", label: "In Progress" }, { value: "optimized", label: "Optimized" }]} />
            <Select label="Index Status" value={form.indexStatus || "index"} onChange={(e) => setForm({ ...form, indexStatus: e.target.value })}
              options={[{ value: "index", label: "Index" }, { value: "noindex", label: "No Index" }]} />
          </div>
          <Textarea label="Notes" value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex gap-3">
            <Btn onClick={save}>Save Page SEO</Btn>
            <a href={`${SITE_URL}${form.path}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-sm text-[#0d9488] hover:underline">View Live →</a>
          </div>
        </div>
      </Modal>
    </div>
  );
}
