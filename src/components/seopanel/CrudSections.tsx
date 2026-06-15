"use client";

import { useEffect, useState } from "react";
import { seoFetch } from "@/lib/seopanel/client";
import { Badge, Btn, Modal, Input, Select, Textarea, EmptyState } from "./shared";

function CrudSection({ title, desc, endpoint, itemKey, fields, columns, arrayFields = [] }: {
  title: string; desc: string; endpoint: string; itemKey: string;
  fields: { key: string; label: string; type?: string; options?: { value: string; label: string }[] }[];
  columns: (item: any) => React.ReactNode;
  arrayFields?: string[];
}) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<any>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const load = () => seoFetch(endpoint).then(async (r) => {
    if (r.ok) { const d = await r.json(); setItems(d[itemKey] || d.content || []); }
    setLoading(false);
  });

  useEffect(() => { load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAdd = () => {
    setEdit(null);
    const init: Record<string, string> = {};
    fields.forEach((f) => { init[f.key] = ""; });
    setForm(init);
    setModal(true);
  };

  const openEdit = (item: any) => {
    setEdit(item);
    const init: Record<string, string> = {};
    fields.forEach((f) => {
      const val = item[f.key];
      if (arrayFields.includes(f.key) && Array.isArray(val)) {
        init[f.key] = val.join(", ");
      } else {
        init[f.key] = val?.toString() || "";
      }
    });
    setForm(init);
    setModal(true);
  };

  const save = async () => {
    const payload: any = { ...form };
    fields.forEach((f) => {
      if (f.type === "number" && payload[f.key]) payload[f.key] = parseInt(payload[f.key]);
      if (arrayFields.includes(f.key) && typeof payload[f.key] === "string") {
        payload[f.key] = payload[f.key].split(",").map((s: string) => s.trim()).filter(Boolean);
      }
    });
    if (edit) payload.id = edit.id;
    const res = await seoFetch(endpoint, { method: edit ? "PATCH" : "POST", body: JSON.stringify(payload) });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Save failed");
      return;
    }
    setModal(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete?")) return;
    await seoFetch(`${endpoint}?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-white">{title}</h2><p className="text-slate-400 text-sm mt-1">{desc}</p></div>
        <Btn onClick={openAdd}>+ Add New</Btn>
      </div>
      {loading ? <p className="text-slate-400 animate-pulse">Loading...</p> : items.length === 0 ? <EmptyState message="No items yet" /> : (
        <div className="space-y-3">{items.map((item) => (
          <div key={item.id} className="bg-[#12182b] border border-[#1e2a45] rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">{columns(item)}</div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => openEdit(item)} className="text-[#0d9488] text-xs font-semibold">Edit</button>
              <button onClick={() => remove(item.id)} className="text-red-400 text-xs font-semibold">Delete</button>
            </div>
          </div>
        ))}</div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title={edit ? "Edit" : "Add New"}>
        <div className="space-y-4">
          {fields.map((f) => f.options ? (
            <Select key={f.key} label={f.label} value={form[f.key] || ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} options={f.options} />
          ) : f.type === "textarea" ? (
            <Textarea key={f.key} label={f.label} value={form[f.key] || ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
          ) : (
            <Input key={f.key} label={f.label} type={f.type || "text"} value={form[f.key] || ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
          ))}
          <Btn onClick={save}>Save</Btn>
        </div>
      </Modal>
    </div>
  );
}

export function BacklinksSection() {
  return (
    <CrudSection title="Backlink Profile" desc="Monitor inbound links, domain authority & anchor text"
      endpoint="/api/seopanel/backlinks" itemKey="backlinks"
      fields={[
        { key: "sourceUrl", label: "Source URL *" },
        { key: "targetUrl", label: "Target URL *" },
        { key: "anchorText", label: "Anchor Text" },
        { key: "domainAuth", label: "Domain Authority", type: "number" },
        { key: "linkType", label: "Link Type", options: [{ value: "dofollow", label: "Dofollow" }, { value: "nofollow", label: "Nofollow" }, { value: "sponsored", label: "Sponsored" }] },
        { key: "status", label: "Status", options: [{ value: "active", label: "Active" }, { value: "lost", label: "Lost" }, { value: "pending", label: "Pending" }] },
        { key: "notes", label: "Notes", type: "textarea" },
      ]}
      columns={(b) => (
        <>
          <p className="text-white text-sm font-medium truncate">{b.sourceUrl}</p>
          <p className="text-slate-500 text-xs">→ {b.targetUrl}</p>
          <div className="flex gap-2 mt-1">
            {b.anchorText && <span className="text-slate-400 text-xs">&quot;{b.anchorText}&quot;</span>}
            {b.domainAuth && <span className="text-[#0d9488] text-xs">DA: {b.domainAuth}</span>}
            <Badge status={b.status} />
          </div>
        </>
      )}
    />
  );
}

export function ContentSection() {
  return (
    <CrudSection title="Content Strategy" desc="Content briefs, outlines & optimization plans"
      endpoint="/api/seopanel/content" itemKey="content"
      fields={[
        { key: "title", label: "Title *" },
        { key: "targetKeyword", label: "Target Keyword" },
        { key: "targetUrl", label: "Target URL" },
        { key: "wordCount", label: "Word Count", type: "number" },
        { key: "status", label: "Status", options: [{ value: "draft", label: "Draft" }, { value: "in_review", label: "In Review" }, { value: "published", label: "Published" }, { value: "needs_update", label: "Needs Update" }] },
        { key: "brief", label: "Content Brief", type: "textarea" },
        { key: "outline", label: "Outline", type: "textarea" },
        { key: "notes", label: "Notes", type: "textarea" },
      ]}
      columns={(c) => (
        <>
          <p className="text-white text-sm font-medium">{c.title}</p>
          {c.targetKeyword && <p className="text-slate-500 text-xs">Keyword: {c.targetKeyword}</p>}
          <Badge status={c.status} />
        </>
      )}
    />
  );
}

export function CompetitorsSection() {
  return (
    <CrudSection title="Competitor Analysis" desc="Track competitor domains, authority & keyword gaps"
      endpoint="/api/seopanel/competitors" itemKey="competitors"
      fields={[
        { key: "domain", label: "Domain *" },
        { key: "name", label: "Company Name" },
        { key: "domainAuth", label: "Domain Authority", type: "number" },
        { key: "topKeywords", label: "Top Keywords (comma-separated)" },
        { key: "strengths", label: "Strengths", type: "textarea" },
        { key: "weaknesses", label: "Weaknesses", type: "textarea" },
        { key: "notes", label: "Notes", type: "textarea" },
      ]}
      arrayFields={["topKeywords"]}
      columns={(c) => (
        <>
          <p className="text-white text-sm font-medium">{c.domain}</p>
          {c.name && <p className="text-slate-500 text-xs">{c.name}</p>}
          {c.domainAuth && <span className="text-[#0d9488] text-xs">DA: {c.domainAuth}</span>}
          {c.topKeywords?.length > 0 && (
            <p className="text-slate-500 text-xs mt-1">Keywords: {c.topKeywords.join(", ")}</p>
          )}
        </>
      )}
    />
  );
}

export function TasksSection() {
  return (
    <CrudSection title="SEO Tasks" desc="Workflow management for on-page, technical & link-building tasks"
      endpoint="/api/seopanel/tasks" itemKey="tasks"
      fields={[
        { key: "title", label: "Task Title *" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "category", label: "Category", options: [{ value: "on-page", label: "On-Page" }, { value: "technical", label: "Technical" }, { value: "content", label: "Content" }, { value: "link-building", label: "Link Building" }, { value: "general", label: "General" }] },
        { key: "priority", label: "Priority", options: [{ value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }, { value: "critical", label: "Critical" }] },
        { key: "status", label: "Status", options: [{ value: "pending", label: "Pending" }, { value: "in_progress", label: "In Progress" }, { value: "completed", label: "Completed" }] },
        { key: "dueDate", label: "Due Date", type: "date" },
      ]}
      columns={(t) => (
        <>
          <p className="text-white text-sm font-medium">{t.title}</p>
          <div className="flex gap-2 mt-1">
            <Badge status={t.status} />
            <span className="text-slate-500 text-xs capitalize">{t.category}</span>
            {t.dueDate && <span className="text-slate-500 text-xs">Due: {new Date(t.dueDate).toLocaleDateString()}</span>}
          </div>
        </>
      )}
    />
  );
}

export function AuditsSection() {
  return (
    <CrudSection title="SEO Audits" desc="Full site audits, scores & actionable recommendations"
      endpoint="/api/seopanel/audits" itemKey="audits"
      fields={[
        { key: "title", label: "Audit Title *" },
        { key: "auditType", label: "Type", options: [{ value: "full", label: "Full Audit" }, { value: "technical", label: "Technical" }, { value: "on-page", label: "On-Page" }, { value: "content", label: "Content" }] },
        { key: "score", label: "Score (0-100)", type: "number" },
        { key: "findings", label: "Findings", type: "textarea" },
        { key: "recommendations", label: "Recommendations", type: "textarea" },
      ]}
      columns={(a) => (
        <>
          <p className="text-white text-sm font-medium">{a.title}</p>
          <div className="flex gap-2 mt-1 items-center">
            <span className={`text-xl font-bold ${a.score >= 80 ? "text-emerald-400" : a.score >= 50 ? "text-amber-400" : "text-red-400"}`}>{a.score}</span>
            <span className="text-slate-500 text-xs capitalize">{a.auditType} · {new Date(a.auditedAt).toLocaleDateString()}</span>
          </div>
        </>
      )}
    />
  );
}

export function ReportsSection() {
  return (
    <CrudSection title="SEO Reports" desc="Monthly performance reports for stakeholders"
      endpoint="/api/seopanel/reports" itemKey="reports"
      fields={[
        { key: "title", label: "Report Title *" },
        { key: "period", label: "Period *" },
        { key: "reportType", label: "Type", options: [{ value: "monthly", label: "Monthly" }, { value: "weekly", label: "Weekly" }, { value: "quarterly", label: "Quarterly" }] },
        { key: "summary", label: "Executive Summary", type: "textarea" },
        { key: "highlights", label: "Highlights", type: "textarea" },
        { key: "challenges", label: "Challenges", type: "textarea" },
        { key: "nextSteps", label: "Next Steps", type: "textarea" },
        { key: "status", label: "Status", options: [{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }] },
      ]}
      columns={(r) => (
        <>
          <p className="text-white text-sm font-medium">{r.title}</p>
          <p className="text-slate-500 text-xs">{r.period} · <Badge status={r.status} /></p>
        </>
      )}
    />
  );
}
