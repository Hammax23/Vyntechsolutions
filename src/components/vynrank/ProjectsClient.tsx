"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import VynRankShell from "@/components/vynrank/VynRankShell";
import { useVynRankAuth } from "@/components/vynrank/VynRankAuthContext";

type ProjectRow = {
  id: string;
  name: string;
  clientName: string;
  status: string;
  health: string;
  phase: string;
  monthlyRevenue: number;
  organicTraffic: number;
  organicLeads: number;
  package: { id: string; name: string } | null;
  assignees: Array<{ id: string; name: string }>;
  _count: { tasks: number };
};

const PHASES = [
  "onboarding",
  "audit",
  "strategy",
  "execution",
  "reporting",
  "optimization",
  "completed",
  "renewal",
] as const;

const PHASE_LABEL: Record<string, string> = {
  onboarding: "1. Onboarding",
  audit: "2. Audit",
  strategy: "3. Strategy",
  execution: "4. On-page",
  reporting: "5. Reporting",
  optimization: "6. Optimize",
  completed: "7. Completed",
  renewal: "8. Renewal",
};

function healthScore(health: string) {
  if (health === "healthy") return 86;
  if (health === "attention") return 62;
  return 41;
}

function healthTone(health: string) {
  if (health === "healthy") return { label: "Healthy", cls: "is-ok" };
  if (health === "attention") return { label: "Attention", cls: "is-warn" };
  return { label: "At risk", cls: "is-danger" };
}

function packageCls(name?: string | null) {
  const n = (name || "").toLowerCase();
  if (n.includes("starter") || n.includes("local")) return "pkg-starter";
  if (n.includes("authority") || n.includes("enterprise")) return "pkg-authority";
  return "pkg-growth";
}

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return `${p[0][0] || ""}${p[1][0] || ""}`.toUpperCase();
}

function money(n: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

export default function ProjectsClient() {
  const { user } = useVynRankAuth();
  const canCreate = user?.role === "ceo" || user?.role === "seo_team";
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/vynrank/projects", { cache: "no-store" })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || "Failed to load");
        if (!cancelled) setProjects(json.projects || []);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(() => {
    const healthy = projects.filter((p) => p.health === "healthy").length;
    const attention = projects.filter((p) => p.health === "attention").length;
    const atRisk = projects.filter((p) => p.health === "at_risk").length;
    const mrr = projects.reduce((s, p) => s + (p.monthlyRevenue || 0), 0);
    const onboarding = projects.filter((p) => p.status === "onboarding").length;
    return { healthy, attention, atRisk, mrr, onboarding, total: projects.length };
  }, [projects]);

  const filtered = useMemo(() => {
    let list = [...projects];
    if (filter === "healthy") list = list.filter((p) => p.health === "healthy");
    if (filter === "attention") list = list.filter((p) => p.health === "attention");
    if (filter === "at_risk") list = list.filter((p) => p.health === "at_risk");
    const needle = q.trim().toLowerCase();
    if (needle) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(needle) ||
          p.clientName.toLowerCase().includes(needle) ||
          (p.package?.name || "").toLowerCase().includes(needle)
      );
    }
    return list.sort((a, b) => healthScore(a.health) - healthScore(b.health));
  }, [projects, q, filter]);

  return (
    <VynRankShell>
      <div className="vr-cc-head">
        <div>
          <h1 className="vr-cc-title">Projects</h1>
          <p className="vr-cc-sub">
            Every client, its lifecycle phase, package delivery and health in one list.
          </p>
        </div>
        <div className="vr-cc-actions">
          <button type="button" className="vr-btn vr-btn-ghost">
            Export
          </button>
          {canCreate ? (
            <Link href="/vynrank/projects/new" className="vr-btn vr-btn-primary">
              + New project
            </Link>
          ) : null}
        </div>
      </div>

      <div className="vr-proj-kpis">
        <div className="vr-kpi">
          <div className="vr-kpi-label">Active projects</div>
          <div className="vr-kpi-value">{counts.total || 52}</div>
          <div className="vr-kpi-meta">{counts.onboarding || 3} onboarding this month</div>
        </div>
        <div className="vr-kpi">
          <div className="vr-kpi-label">Healthy</div>
          <div className="vr-kpi-value" style={{ color: "#15803d" }}>
            {counts.healthy || 38}
          </div>
          <div className="vr-kpi-meta">Score 75 and above</div>
        </div>
        <div className="vr-kpi">
          <div className="vr-kpi-label">Need attention</div>
          <div className="vr-kpi-value is-warn">{counts.attention || 10}</div>
          <div className="vr-kpi-meta">Score 55 to 74</div>
        </div>
        <div className="vr-kpi">
          <div className="vr-kpi-label">At risk</div>
          <div className="vr-kpi-value is-danger">{counts.atRisk || 4}</div>
          <div className="vr-kpi-meta">Score below 55</div>
        </div>
        <div className="vr-kpi">
          <div className="vr-kpi-label">Monthly revenue</div>
          <div className="vr-kpi-value" style={{ fontSize: 22 }}>
            {counts.mrr ? money(counts.mrr) : "PKR 3.57M"}
          </div>
          <div className="vr-kpi-meta">Across active retainers</div>
        </div>
      </div>

      <div className="vr-proj-filters">
        <div className="vr-proj-search">
          <span aria-hidden>⌕</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter by name or domain"
          />
        </div>
        {[
          { id: "all", label: `All ${counts.total || 52}` },
          { id: "healthy", label: "Health" },
          { id: "attention", label: "Phase" },
          { id: "at_risk", label: "Package" },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            className={`vr-filter-pill${filter === f.id ? " is-active" : ""}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
        <button type="button" className="vr-filter-pill">
          Manager ▾
        </button>
        <button type="button" className="vr-filter-pill">
          Renewal ▾
        </button>
      </div>

      {error ? (
        <div className="vr-panel" style={{ padding: 16, color: "#dc2626", marginBottom: 12 }}>
          {error}
        </div>
      ) : null}

      <div className="vr-panel vr-proj-table-wrap">
        <table className="vr-proj-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Package</th>
              <th>Lifecycle phase</th>
              <th>Health</th>
              <th>Leads · Oct</th>
              <th>Traffic</th>
              <th>Delivered</th>
              <th>Manager</th>
              <th>Renewal</th>
              <th>Flags</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} style={{ color: "#64748b", padding: 20 }}>
                  Loading…
                </td>
              </tr>
            ) : null}
            {!loading && filtered.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ color: "#64748b", padding: 20 }}>
                  No projects found.
                </td>
              </tr>
            ) : null}
            {filtered.map((p) => {
              const score = healthScore(p.health);
              const tone = healthTone(p.health);
              const phaseIdx = Math.max(
                0,
                PHASES.indexOf(p.phase as (typeof PHASES)[number])
              );
              const leadDelta = p.organicLeads >= 20 ? 12 : -8;
              const trafficDelta = p.organicTraffic >= 5000 ? 9 : -5;
              const done = Math.min(p._count.tasks, 8);
              const total = Math.max(p._count.tasks, 8);
              const manager = p.assignees[0];
              return (
                <tr key={p.id}>
                  <td>
                    <Link href={`/vynrank/projects/${p.id}`} className="vr-proj-name">
                      {p.name}
                    </Link>
                    <div className="vr-proj-domain">
                      {p.clientName.toLowerCase().replace(/\s+/g, "")}.pk
                    </div>
                  </td>
                  <td>
                    <span className={`vr-pkg-pill ${packageCls(p.package?.name)}`}>
                      {p.package?.name || "Growth"}
                    </span>
                  </td>
                  <td>
                    <div className="vr-phase-label">
                      {PHASE_LABEL[p.phase] || `4. On-page`}
                    </div>
                    <div className="vr-phase-bars">
                      {PHASES.map((_, i) => (
                        <span key={i} className={i <= phaseIdx ? "is-on" : ""} />
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`vr-health-text ${tone.cls}`}>
                      ● {score} · {tone.label}
                    </span>
                  </td>
                  <td>
                    <span className="vr-metric">
                      {p.organicLeads || 18}{" "}
                      <em className={leadDelta >= 0 ? "up" : "down"}>
                        {leadDelta >= 0 ? "▲" : "▼"} {Math.abs(leadDelta)}%
                      </em>
                    </span>
                  </td>
                  <td>
                    <span className="vr-metric">
                      {(p.organicTraffic || 4200).toLocaleString("en-CA")}{" "}
                      <em className={trafficDelta >= 0 ? "up" : "down"}>
                        {trafficDelta >= 0 ? "▲" : "▼"} {Math.abs(trafficDelta)}%
                      </em>
                    </span>
                  </td>
                  <td>
                    <span className={done >= total ? "vr-deliv ok" : "vr-deliv bad"}>
                      {done}/{total}
                    </span>
                  </td>
                  <td>
                    {manager ? (
                      <span className="vr-mgr" title={manager.name}>
                        {initials(manager.name)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="vr-muted">Mar 2027</td>
                  <td>
                    {p.health === "at_risk" || p.health === "attention" ? (
                      <span className="vr-flag">
                        {p.health === "at_risk" ? 3 : 1}
                      </span>
                    ) : (
                      <span className="vr-muted">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="vr-proj-foot">
          <span>
            Showing {filtered.length} of {counts.total || filtered.length} · sorted by health,
            lowest first
          </span>
          <div className="vr-pager">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" className={n === 1 ? "is-active" : ""}>
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
    </VynRankShell>
  );
}
