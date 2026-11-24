"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import VynRankShell from "@/components/vynrank/VynRankShell";
import HealthBadge from "@/components/vynrank/HealthBadge";
import { statusLabel } from "@/lib/vynrank/theme";
import { useVynRankAuth } from "@/components/vynrank/VynRankAuthContext";

const PHASES = [
  "onboarding",
  "audit",
  "strategy",
  "execution",
  "reporting",
  "optimization",
  "completed",
] as const;

type Project = {
  id: string;
  name: string;
  clientName: string;
  status: string;
  health: string;
  phase: string;
  goal: string | null;
  notes: string | null;
  monthlyRevenue: number;
  organicTraffic: number;
  keywordsTop10: number;
  organicLeads: number;
  clientRating: number | null;
  package: { id: string; name: string } | null;
  assignees: Array<{ id: string; name: string; role: string }>;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    assignee: { id: string; name: string } | null;
  }>;
};

export default function ProjectDetailClient({ projectId }: { projectId: string }) {
  const { user } = useVynRankAuth();
  const canEdit = user?.role === "ceo" || user?.role === "seo_team";
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch(`/api/vynrank/projects/${projectId}`, { cache: "no-store" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || "Failed to load");
    setProject(json.project);
  }

  useEffect(() => {
    let cancelled = false;
    load()
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function updatePhase(phase: string) {
    if (!canEdit || !project) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/vynrank/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase,
          status: phase === "completed" ? "completed" : project.status === "completed" ? "active" : project.status,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Update failed");
      setProject(json.project);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function updateHealth(health: string) {
    if (!canEdit) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/vynrank/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ health }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Update failed");
      setProject(json.project);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <VynRankShell>
      <div className="vr-cc-head">
        <div>
          <h1 className="vr-cc-title">{project?.name || "Project"}</h1>
          <p className="vr-cc-sub">
            {project ? `${project.clientName} · ${statusLabel(project.status)}` : "Loading…"}
          </p>
        </div>
        <div className="vr-cc-actions">
          <Link href="/vynrank/projects" className="vr-btn vr-btn-ghost">
            All projects
          </Link>
        </div>
      </div>
      {error ? (
        <div className="vr-panel" style={{ padding: 16, marginBottom: 16, color: "#dc2626" }}>
          {error}
        </div>
      ) : null}

      {!project ? (
        <div className="vr-panel" style={{ padding: 24, color: "#64748b" }}>
          Loading project…
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 12,
            }}
          >
            {[
              { label: "MRR", value: `$${project.monthlyRevenue.toLocaleString("en-CA")}` },
              { label: "Organic traffic", value: project.organicTraffic.toLocaleString("en-CA") },
              { label: "Keywords top 10", value: String(project.keywordsTop10) },
              { label: "Organic leads", value: String(project.organicLeads) },
              {
                label: "Client rating",
                value: project.clientRating != null ? `${project.clientRating}/5` : "—",
              },
            ].map((c) => (
              <div key={c.label} className="vynrank-card" style={{ padding: 14 }}>
                <div style={{ fontSize: 12, color: "var(--vr-muted)", fontWeight: 600 }}>
                  {c.label}
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>{c.value}</div>
              </div>
            ))}
          </div>

          <div className="vynrank-card" style={{ padding: 20 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 16,
              }}
            >
              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Lifecycle</div>
                <HealthBadge health={project.health} />
              </div>
              {canEdit ? (
                <div style={{ display: "flex", gap: 8 }}>
                  {(["healthy", "attention", "at_risk"] as const).map((h) => (
                    <button
                      key={h}
                      type="button"
                      className="vynrank-btn vynrank-btn-secondary"
                      style={{ height: 32, fontSize: 12 }}
                      disabled={saving}
                      onClick={() => void updateHealth(h)}
                    >
                      {h === "at_risk" ? "At risk" : h === "attention" ? "Attention" : "Healthy"}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {PHASES.map((phase) => {
                const active = project.phase === phase;
                const idx = PHASES.indexOf(project.phase as (typeof PHASES)[number]);
                const thisIdx = PHASES.indexOf(phase);
                const done = thisIdx < idx;
                return (
                  <button
                    key={phase}
                    type="button"
                    disabled={!canEdit || saving}
                    onClick={() => void updatePhase(phase)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 999,
                      border: active
                        ? "2px solid var(--vr-accent)"
                        : "1px solid var(--vr-border)",
                      background: active
                        ? "var(--vr-accent-soft)"
                        : done
                          ? "#ecfdf5"
                          : "#fff",
                      color: active ? "var(--vr-accent)" : "var(--vr-text)",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: canEdit ? "pointer" : "default",
                    }}
                  >
                    {statusLabel(phase)}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
              gap: 16,
            }}
            className="vynrank-cc-grid"
          >
            <div className="vynrank-card" style={{ padding: 20 }}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>Overview</div>
              <div style={{ fontSize: 14, lineHeight: 1.7, color: "var(--vr-text-secondary)" }}>
                <div>
                  <strong>Package:</strong> {project.package?.name || "—"}
                </div>
                <div>
                  <strong>Team:</strong>{" "}
                  {project.assignees.map((a) => a.name).join(", ") || "—"}
                </div>
                <div>
                  <strong>Goal:</strong> {project.goal || "—"}
                </div>
                {project.notes ? (
                  <div>
                    <strong>Notes:</strong> {project.notes}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="vynrank-card" style={{ padding: 20 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <div style={{ fontWeight: 700 }}>Tasks</div>
                <Link
                  href="/vynrank/tasks"
                  style={{ fontSize: 13, fontWeight: 600, color: "var(--vr-accent)" }}
                >
                  Board →
                </Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {project.tasks.slice(0, 8).map((t) => (
                  <div
                    key={t.id}
                    style={{
                      padding: 10,
                      borderRadius: 8,
                      border: "1px solid var(--vr-border)",
                      fontSize: 13,
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{t.title}</div>
                    <div style={{ color: "var(--vr-muted)", marginTop: 2 }}>
                      {statusLabel(t.status)}
                      {t.assignee ? ` · ${t.assignee.name}` : ""}
                    </div>
                  </div>
                ))}
                {project.tasks.length === 0 ? (
                  <div style={{ color: "var(--vr-muted)", fontSize: 13 }}>No tasks yet.</div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </VynRankShell>
  );
}
