"use client";

import { useEffect, useState } from "react";
import { seoFetch } from "@/lib/seopanel/client";
import { Badge, Btn, Modal, Input, Select, Textarea } from "./shared";

export default function TechnicalSection() {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", severity: "medium", category: "crawlability", status: "open", affectedUrl: "" });

  const load = () => seoFetch("/api/seopanel/technical").then(async (r) => {
    if (r.ok) { const d = await r.json(); setIssues(d.issues || []); }
    setLoading(false);
  });

  useEffect(() => { load(); }, []);

  const save = async () => {
    await seoFetch("/api/seopanel/technical", { method: "POST", body: JSON.stringify(form) });
    setModal(false);
    setForm({ title: "", description: "", severity: "medium", category: "crawlability", status: "open", affectedUrl: "" });
    load();
  };

  const updateStatus = async (id: string, status: string) => {
    await seoFetch("/api/seopanel/technical", { method: "PATCH", body: JSON.stringify({ id, status }) });
    load();
  };

  const grouped = issues.reduce((acc: Record<string, any[]>, i) => {
    (acc[i.category] = acc[i.category] || []).push(i);
    return acc;
  }, {});

  const openCount = issues.filter((i) => i.status === "open" || i.status === "in_progress").length;
  const resolvedCount = issues.filter((i) => i.status === "resolved").length;
  const score = issues.length ? Math.round((resolvedCount / issues.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Technical SEO</h2>
          <p className="text-slate-400 text-sm mt-1">Crawlability, performance, security & structured data</p>
        </div>
        <Btn onClick={() => setModal(true)}>+ Add Issue</Btn>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#12182b] border border-[#1e2a45] rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-white">{issues.length}</p><p className="text-slate-400 text-xs mt-1">Total Checks</p>
        </div>
        <div className="bg-[#12182b] border border-[#1e2a45] rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-red-400">{openCount}</p><p className="text-slate-400 text-xs mt-1">Open Issues</p>
        </div>
        <div className="bg-[#12182b] border border-[#1e2a45] rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-[#0d9488]">{score}%</p><p className="text-slate-400 text-xs mt-1">Health Score</p>
        </div>
      </div>

      {loading ? <p className="text-slate-400 animate-pulse">Loading...</p> : Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} className="bg-[#12182b] border border-[#1e2a45] rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-[#1e2a45] capitalize">
            <h3 className="text-white font-semibold text-sm">{cat.replace(/-/g, " ")}</h3>
          </div>
          <div className="divide-y divide-[#1e2a45]/50">
            {(items as any[]).map((issue) => (
              <div key={issue.id} className="px-5 py-4 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge status={issue.severity} label={issue.severity} />
                    <Badge status={issue.status} />
                  </div>
                  <p className="text-slate-200 text-sm font-medium">{issue.title}</p>
                  {issue.description && <p className="text-slate-500 text-xs mt-1">{issue.description}</p>}
                  {issue.affectedUrl && <code className="text-[#0d9488] text-xs mt-1 block">{issue.affectedUrl}</code>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {issue.status !== "resolved" && (
                    <Btn variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => updateStatus(issue.id, "in_progress")}>In Progress</Btn>
                  )}
                  {issue.status !== "resolved" && (
                    <Btn variant="ghost" className="!px-2 !py-1 text-xs !text-emerald-400" onClick={() => updateStatus(issue.id, "resolved")}>Resolve</Btn>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <Modal open={modal} onClose={() => setModal(false)} title="Add Technical Issue">
        <div className="space-y-4">
          <Input label="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              options={["crawlability", "performance", "mobile", "security", "structured-data", "on-page"].map((v) => ({ value: v, label: v }))} />
            <Select label="Severity" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}
              options={[{ value: "critical", label: "Critical" }, { value: "high", label: "High" }, { value: "medium", label: "Medium" }, { value: "low", label: "Low" }]} />
          </div>
          <Input label="Affected URL" value={form.affectedUrl} onChange={(e) => setForm({ ...form, affectedUrl: e.target.value })} />
          <Btn onClick={save}>Add Issue</Btn>
        </div>
      </Modal>
    </div>
  );
}
