"use client";

import { useEffect, useState } from "react";
import { seoFetch, priorityColors } from "@/lib/seopanel/client";
import { Badge, Btn, Modal, Input, Select, Textarea, EmptyState } from "./shared";

export default function KeywordsSection() {
  const [keywords, setKeywords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<any>(null);
  const [form, setForm] = useState({ keyword: "", targetUrl: "", currentRank: "", searchVolume: "", difficulty: "", priority: "medium", status: "tracking", country: "CA", notes: "" });

  const load = () => {
    seoFetch("/api/seopanel/keywords").then(async (r) => {
      if (r.ok) { const d = await r.json(); setKeywords(d.keywords || []); }
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEdit(null);
    setForm({ keyword: "", targetUrl: "", currentRank: "", searchVolume: "", difficulty: "", priority: "medium", status: "tracking", country: "CA", notes: "" });
    setModal(true);
  };

  const openEdit = (k: any) => {
    setEdit(k);
    setForm({
      keyword: k.keyword, targetUrl: k.targetUrl || "", currentRank: k.currentRank?.toString() || "",
      searchVolume: k.searchVolume?.toString() || "", difficulty: k.difficulty?.toString() || "",
      priority: k.priority, status: k.status, country: k.country, notes: k.notes || "",
    });
    setModal(true);
  };

  const save = async () => {
    const payload = {
      ...form,
      currentRank: form.currentRank ? parseInt(form.currentRank) : null,
      searchVolume: form.searchVolume ? parseInt(form.searchVolume) : null,
      difficulty: form.difficulty ? parseInt(form.difficulty) : null,
      ...(edit ? { id: edit.id } : {}),
    };
    const res = await seoFetch("/api/seopanel/keywords", {
      method: edit ? "PATCH" : "POST",
      body: JSON.stringify(payload),
    });
    if (res.ok) { setModal(false); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this keyword?")) return;
    await seoFetch(`/api/seopanel/keywords?id=${id}`, { method: "DELETE" });
    load();
  };

  const rankChange = (k: any) => {
    if (!k.previousRank || !k.currentRank) return null;
    const diff = k.previousRank - k.currentRank;
    if (diff > 0) return <span className="text-emerald-400 text-xs">↑{diff}</span>;
    if (diff < 0) return <span className="text-red-400 text-xs">↓{Math.abs(diff)}</span>;
    return <span className="text-slate-500 text-xs">—</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Keyword Tracking</h2>
          <p className="text-slate-400 text-sm mt-1">Monitor rankings, volume & priority keywords</p>
        </div>
        <Btn onClick={openAdd}>+ Add Keyword</Btn>
      </div>

      {loading ? <p className="text-slate-400 animate-pulse">Loading...</p> : keywords.length === 0 ? (
        <EmptyState message="No keywords tracked yet. Add your target keywords to get started." />
      ) : (
        <div className="bg-[#12182b] border border-[#1e2a45] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e2a45] text-slate-400 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3">Keyword</th>
                  <th className="text-left px-5 py-3">Rank</th>
                  <th className="text-left px-5 py-3">Change</th>
                  <th className="text-left px-5 py-3">Volume</th>
                  <th className="text-left px-5 py-3">Difficulty</th>
                  <th className="text-left px-5 py-3">Priority</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {keywords.map((k) => (
                  <tr key={k.id} className="border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/20">
                    <td className="px-5 py-3">
                      <p className="text-white font-medium">{k.keyword}</p>
                      {k.targetUrl && <p className="text-slate-500 text-xs truncate max-w-[200px]">{k.targetUrl}</p>}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[#0d9488] font-bold text-lg">{k.currentRank ? `#${k.currentRank}` : "—"}</span>
                      {k.bestRank && <p className="text-slate-500 text-xs">Best: #{k.bestRank}</p>}
                    </td>
                    <td className="px-5 py-3">{rankChange(k)}</td>
                    <td className="px-5 py-3 text-slate-300">{k.searchVolume?.toLocaleString() || "—"}</td>
                    <td className="px-5 py-3">
                      {k.difficulty != null ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-[#1e2a45] rounded-full overflow-hidden">
                            <div className="h-full bg-[#0d9488] rounded-full" style={{ width: `${k.difficulty}%` }} />
                          </div>
                          <span className="text-slate-400 text-xs">{k.difficulty}</span>
                        </div>
                      ) : "—"}
                    </td>
                    <td className={`px-5 py-3 font-semibold capitalize ${priorityColors[k.priority]}`}>{k.priority}</td>
                    <td className="px-5 py-3"><Badge status={k.status} /></td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => openEdit(k)} className="text-[#0d9488] hover:text-[#14b8a6] text-xs font-semibold mr-3">Edit</button>
                      <button onClick={() => remove(k.id)} className="text-red-400 hover:text-red-300 text-xs font-semibold">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={edit ? "Edit Keyword" : "Add Keyword"}>
        <div className="space-y-4">
          <Input label="Keyword *" value={form.keyword} onChange={(e) => setForm({ ...form, keyword: e.target.value })} placeholder="web development Canada" />
          <Input label="Target URL" value={form.targetUrl} onChange={(e) => setForm({ ...form, targetUrl: e.target.value })} placeholder="/services/web-development" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Current Rank" type="number" value={form.currentRank} onChange={(e) => setForm({ ...form, currentRank: e.target.value })} />
            <Input label="Search Volume" type="number" value={form.searchVolume} onChange={(e) => setForm({ ...form, searchVolume: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Difficulty (0-100)" type="number" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} />
            <Select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
              options={[{ value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }, { value: "critical", label: "Critical" }]} />
          </div>
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={[{ value: "tracking", label: "Tracking" }, { value: "improving", label: "Improving" }, { value: "ranked", label: "Ranked" }, { value: "dropped", label: "Dropped" }]} />
          <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <Btn onClick={save}>{edit ? "Save Changes" : "Add Keyword"}</Btn>
            <Btn variant="secondary" onClick={() => setModal(false)}>Cancel</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
