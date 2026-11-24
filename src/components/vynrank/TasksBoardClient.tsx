"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import VynRankShell from "@/components/vynrank/VynRankShell";
import { useVynRankAuth } from "@/components/vynrank/VynRankAuthContext";

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  description?: string | null;
  project: { id: string; name: string; clientName: string };
  assignee: { id: string; name: string } | null;
};

type ProjectOpt = { id: string; name: string };

const COLS = [
  { key: "in_progress", title: "In progress", map: ["todo", "in_progress"] },
  { key: "submitted", title: "Submitted", map: ["submitted"] },
  { key: "qa", title: "Auto-verified", map: ["qa"] },
  { key: "done", title: "Approved", map: ["done"] },
] as const;

const FILTERS = [
  "All people",
  "All projects",
  "Due this week",
  "Failed verification 3",
  "Overdue 17",
] as const;

function proofLabel(status: string) {
  if (status === "todo" || status === "in_progress") return "No proof yet";
  if (status === "submitted") return "Re-crawl running";
  if (status === "qa") return "Live, indexable, keyword found";
  return "Approved by manager";
}

export default function TasksBoardClient() {
  const { user } = useVynRankAuth();
  const canEdit = user?.role === "ceo" || user?.role === "seo_team";
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<ProjectOpt[]>([]);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All people");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [showNew, setShowNew] = useState(false);

  async function load() {
    const [tRes, pRes] = await Promise.all([
      fetch("/api/vynrank/tasks", { cache: "no-store" }),
      fetch("/api/vynrank/projects", { cache: "no-store" }),
    ]);
    const tJson = await tRes.json().catch(() => ({}));
    const pJson = await pRes.json().catch(() => ({}));
    if (!tRes.ok) throw new Error(tJson.error || "Failed to load tasks");
    setTasks(tJson.tasks || []);
    setProjects((pJson.projects || []).map((p: ProjectOpt) => ({ id: p.id, name: p.name })));
    if (!projectId && pJson.projects?.[0]?.id) setProjectId(pJson.projects[0].id);
    if (!selectedId && tJson.tasks?.[0]?.id) {
      const submitted = (tJson.tasks as Task[]).find((t) => t.status === "submitted");
      setSelectedId(submitted?.id || tJson.tasks[0].id);
    }
  }

  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = tasks.find((t) => t.id === selectedId) || null;
  const verifiedCount = tasks.filter((t) => t.status === "qa").length;

  const byCol = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const col of COLS) map[col.key] = [];
    for (const t of tasks) {
      const col = COLS.find((c) => (c.map as readonly string[]).includes(t.status));
      if (col) map[col.key].push(t);
    }
    return map;
  }, [tasks]);

  async function moveTask(id: string, status: string) {
    if (!canEdit) return;
    const res = await fetch("/api/vynrank/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error || "Update failed");
      return;
    }
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...json.task } : t)));
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!canEdit || !title.trim() || !projectId) return;
    const res = await fetch("/api/vynrank/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, projectId, status: "in_progress" }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error || "Create failed");
      return;
    }
    setTitle("");
    setShowNew(false);
    setTasks((prev) => [json.task, ...prev]);
  }

  return (
    <VynRankShell>
      <div className="vr-cc-head">
        <div>
          <h1 className="vr-cc-title">Tasks & QA</h1>
          <p className="vr-cc-sub">
            Nothing is done until proof is attached, checked by the system and approved by a
            manager.
          </p>
        </div>
        <div className="vr-cc-actions">
          <button
            type="button"
            className="vr-btn vr-btn-ghost"
            onClick={() => {
              const first = tasks.find((t) => t.status === "qa");
              if (first) void moveTask(first.id, "done");
            }}
          >
            ✓ Approve {verifiedCount || 11} verified
          </button>
          {canEdit ? (
            <button
              type="button"
              className="vr-btn vr-btn-primary"
              onClick={() => setShowNew((v) => !v)}
            >
              + New task
            </button>
          ) : null}
        </div>
      </div>

      <div className="vr-task-filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={`vr-filter-pill${filter === f ? " is-active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {error ? (
        <div className="vr-panel" style={{ padding: 12, color: "#dc2626", marginBottom: 12 }}>
          {error}
        </div>
      ) : null}

      {showNew && canEdit ? (
        <form onSubmit={onCreate} className="vr-panel vr-task-new">
          <input
            className="vr-login-input"
            placeholder="Task title…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <select
            className="vr-login-input"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            required
          >
            <option value="">Select project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button type="submit" className="vr-btn vr-btn-primary">
            Add task
          </button>
        </form>
      ) : null}

      <div className="vr-task-layout">
        <div className="vr-kanban">
          {COLS.map((col) => (
            <div key={col.key} className="vr-kanban-col">
              <div className="vr-kanban-head">
                {col.title}{" "}
                <span>({byCol[col.key]?.length || 0})</span>
              </div>
              <div className="vr-kanban-list">
                {(byCol[col.key] || []).map((t) => {
                  const active = selectedId === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`vr-task-card${active ? " is-active" : ""}`}
                      onClick={() => setSelectedId(t.id)}
                    >
                      <div className="vr-task-card-title">{t.title}</div>
                      <div className="vr-task-card-meta">{t.project.name}</div>
                      <div className="vr-task-card-tags">
                        <span className={`vr-proof ${col.key}`}>{proofLabel(t.status)}</span>
                        {col.key === "in_progress" ? (
                          <span className="vr-pill vr-pill-danger">Overdue</span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <aside className="vr-review">
          <div className="vr-review-head">
            <div>
              <div className="vr-panel-title">Review task</div>
              {selected ? (
                <p className="vr-cc-sub" style={{ marginTop: 4 }}>
                  {selected.project.name} · Off-page · due 26 Oct · submitted 26 Oct 18:20
                </p>
              ) : (
                <p className="vr-cc-sub" style={{ marginTop: 4 }}>
                  Select a task card to review proof
                </p>
              )}
            </div>
            <button
              type="button"
              className="vr-mini-btn"
              onClick={() => setSelectedId(null)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {selected ? (
            <div className="vr-review-body">
              <div className="vr-review-assignee">
                <span className="vr-mgr">
                  {(selected.assignee?.name || "SM")
                    .split(/\s+/)
                    .map((x) => x[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
                <div>
                  <strong>{selected.assignee?.name || "Unassigned"}</strong>
                  <div className="vr-muted">Score 92</div>
                </div>
                <span className="vr-pill" style={{ marginLeft: "auto", background: "#e7f6ec", color: "#15803d" }}>
                  Score 92
                </span>
              </div>

              <div className="vr-review-section">
                <div className="vr-review-label">Proof submitted</div>
                <a href="#" className="vr-proof-link">
                  https://propertyblog.example/guest-1
                </a>
                <a href="#" className="vr-proof-link">
                  https://homes.example/roundup
                </a>
                <a href="#" className="vr-proof-link">
                  https://estatewire.example/post
                </a>
              </div>

              <div className="vr-review-section">
                <div className="vr-review-label">Automatic verification</div>
                <ul className="vr-verify-list">
                  <li className="ok">Referring page 1 is live</li>
                  <li className="ok">Link found on referring page 1</li>
                  <li className="ok">Referring page 2 is live</li>
                  <li className="bad">Referring page 3: link to client not found</li>
                </ul>
                <div className="vr-verify-alert">
                  1 of 3 links failed. Approving counts 2 links toward the monthly deliverable and
                  leaves one open.
                </div>
              </div>

              <label className="vr-review-label" htmlFor="qa-note">
                Note for assignee (optional)
              </label>
              <textarea
                id="qa-note"
                className="vr-review-note"
                placeholder="Note for Sana (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />

              <div className="vr-review-actions">
                <button
                  type="button"
                  className="vr-btn vr-btn-ghost"
                  disabled={!canEdit}
                  onClick={() => void moveTask(selected.id, "in_progress")}
                >
                  Send back
                </button>
                <button
                  type="button"
                  className="vr-btn"
                  style={{ background: "#15803d", borderColor: "#15803d", color: "#fff" }}
                  disabled={!canEdit}
                  onClick={() => void moveTask(selected.id, "done")}
                >
                  ✓ Approve 2 of 3
                </button>
              </div>
              <Link href={`/vynrank/projects/${selected.project.id}`} className="vr-proof-link">
                Open project →
              </Link>
            </div>
          ) : null}
        </aside>
      </div>
    </VynRankShell>
  );
}
