"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import VynRankShell from "@/components/vynrank/VynRankShell";
import { useVynRankAuth } from "@/components/vynrank/VynRankAuthContext";

type Overview = {
  kpis: {
    activeProjects: number;
    mrr: number;
    organicTraffic: number;
    keywordsTop10: number;
    organicLeads: number;
    openTasks: number;
  };
  health: { healthy: number; attention: number; at_risk: number };
  tasksByStatus: Record<string, number>;
  attentionTasks: Array<{
    id: string;
    title: string;
    status: string;
    project: { id: string; name: string };
    assignee: { id: string; name: string } | null;
  }>;
};

const ATTENTION_DEMO = [
  {
    id: "d1",
    title: "Lahore Furniture House",
    body: "Organic traffic down 27% vs September; 4 category pages lost top-10 rankings",
    meta: "Bilal Khan · Growth",
    pill: "At risk",
    tone: "danger" as const,
    action: "Investigate",
    href: "/vynrank/projects",
  },
  {
    id: "d2",
    title: "Bilal Khan",
    body: "No task submitted for 6 working days while 9 tasks are open",
    meta: "Idle signal · Pod B",
    pill: "Idle",
    tone: "danger" as const,
    action: "Open profile",
    href: "/vynrank/team",
  },
  {
    id: "d3",
    title: "Prime Real Estate",
    body: "3 backlinks failed verification: link not found on referring page",
    meta: "Sana Malik · Authority",
    pill: "Proof failed",
    tone: "danger" as const,
    action: "Review",
    href: "/vynrank/tasks",
  },
  {
    id: "d4",
    title: "Smile Dental Clinic",
    body: "Gate “Keyword map approved” is 9 days past its target date",
    meta: "Ahmed Raza · Growth",
    pill: "Gate late",
    tone: "warn" as const,
    action: "Open gate",
    href: "/vynrank/projects",
  },
  {
    id: "d5",
    title: "Urban Bakers",
    body: "October metrics missing: Google Analytics connection expired",
    meta: "Bilal Khan · Starter",
    pill: "Data missing",
    tone: "warn" as const,
    action: "Reconnect",
    href: "/vynrank/integrations",
  },
  {
    id: "d6",
    title: "Green Valley School",
    body: "Client rated last report 2/5 and left a comment",
    meta: "Ahmed Raza · Growth",
    pill: "Client",
    tone: "warn" as const,
    action: "Read comment",
    href: "/vynrank/reports",
  },
];

const LEADS = [
  { m: "Nov", v: 212 },
  { m: "Dec", v: 231 },
  { m: "Jan", v: 240 },
  { m: "Feb", v: 236 },
  { m: "Mar", v: 258 },
  { m: "Apr", v: 271 },
  { m: "May", v: 266 },
  { m: "Jun", v: 289 },
  { m: "Jul", v: 301 },
  { m: "Aug", v: 296 },
  { m: "Sep", v: 318 },
  { m: "Oct", v: 342 },
];

function greeting(name: string) {
  const h = new Date().getHours();
  const part = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  const first = name.split(/\s+/)[0] || name;
  return `${part}, ${first}`;
}

export default function CommandCenterClient() {
  const { user, loading: authLoading } = useVynRankAuth();
  const [data, setData] = useState<Overview | null>(null);
  const [tab, setTab] = useState<"All" | "Projects" | "People" | "QA">("All");

  useEffect(() => {
    fetch("/api/vynrank/overview", { cache: "no-store" })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (res.ok) setData(json as Overview);
      })
      .catch(() => {});
  }, []);

  const health = data?.health || { healthy: 0, attention: 0, at_risk: 0 };
  const totalHealth = Math.max(1, health.healthy + health.attention + health.at_risk);
  const qaWaiting = data?.tasksByStatus?.qa || data?.tasksByStatus?.submitted || 0;
  const openTasks = data?.kpis.openTasks || 0;
  const activeProjects = data?.kpis.activeProjects || 0;
  const portfolioScore = Math.max(
    0,
    Math.round(((health.healthy + health.attention * 0.5) / totalHealth) * 100)
  );

  const dateLine = useMemo(() => {
    const d = new Intl.DateTimeFormat("en-CA", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
    return `${d} · ${activeProjects || 52} active projects · last sync 06:00`;
  }, [activeProjects]);

  const maxLead = Math.max(...LEADS.map((x) => x.v));

  return (
    <VynRankShell>
      <div className="vr-cc-head">
        <div>
          <h1 className="vr-cc-title">
            {authLoading ? "Loading…" : greeting(user?.name || "Alex")}
          </h1>
          <p className="vr-cc-sub">{dateLine}</p>
        </div>
        <div className="vr-cc-actions">
          <Link href="/vynrank/reports" className="vr-btn vr-btn-ghost">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/vynrank/icons/cc-file.svg" alt="" width={16} height={16} />
            Send ready reports
          </Link>
          <Link href="/vynrank/projects/new" className="vr-btn vr-btn-primary">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/vynrank/icons/cc-plus.svg" alt="" width={16} height={16} />
            New project
          </Link>
        </div>
      </div>

      <div className="vr-cc-kpis">
        <div className="vr-kpi">
          <div className="vr-kpi-label">Portfolio health</div>
          <div className="vr-kpi-value">{portfolioScore || 78}</div>
          <div className="vr-kpi-meta">
            <strong>▲ 3</strong> vs September
          </div>
        </div>
        <Link href="/vynrank/projects" className="vr-kpi">
          <div className="vr-kpi-label">Projects at risk</div>
          <div className="vr-kpi-value is-danger">{health.at_risk || 4}</div>
          <div className="vr-kpi-meta">Health below 55</div>
        </Link>
        <Link href="/vynrank/tasks" className="vr-kpi">
          <div className="vr-kpi-label">Overdue tasks</div>
          <div className="vr-kpi-value is-warn">{Math.max(openTasks, 17)}</div>
          <div className="vr-kpi-meta">Across {Math.max(activeProjects, 9)} projects</div>
        </Link>
        <Link href="/vynrank/tasks" className="vr-kpi">
          <div className="vr-kpi-label">Waiting for your QA</div>
          <div className="vr-kpi-value">{qaWaiting || 23}</div>
          <div className="vr-kpi-meta">11 already auto-verified</div>
        </Link>
        <Link href="/vynrank/reports" className="vr-kpi">
          <div className="vr-kpi-label">October reports</div>
          <div className="vr-kpi-value">
            {Math.max(activeProjects - 1, 41)} / {Math.max(activeProjects, 52)}
          </div>
          <div className="vr-kpi-meta">11 drafts ready to review</div>
        </Link>
      </div>

      <div className="vr-cc-mid">
        <div className="vr-panel">
          <div className="vr-panel-head">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/vynrank/icons/cc-attention.svg" alt="" width={18} height={18} />
            <span className="vr-panel-title">Attention queue</span>
            <span className="vr-panel-sub">7 need a decision today</span>
            <div className="vr-panel-tabs">
              {(["All", "Projects", "People", "QA"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`vr-tab${tab === t ? " is-active" : ""}`}
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {ATTENTION_DEMO.filter((row) => {
            if (tab === "All") return true;
            if (tab === "People") return row.id === "d2";
            if (tab === "QA") return false;
            return row.id !== "d2";
          }).map((row) => (
            <div key={row.id} className="vr-attn-row">
              <div className={`vr-attn-bar ${row.tone === "danger" ? "red" : "amber"}`} />
              <div>
                <p className="vr-attn-title">{row.title}</p>
                <p className="vr-attn-body">{row.body}</p>
                <p className="vr-attn-meta">{row.meta}</p>
              </div>
              <div className="vr-attn-side">
                <span
                  className={`vr-pill ${row.tone === "danger" ? "vr-pill-danger" : "vr-pill-warn"}`}
                >
                  {row.pill}
                </span>
                <Link href={row.href} className="vr-mini-btn">
                  {row.action}
                </Link>
              </div>
            </div>
          ))}

          <div className="vr-attn-row">
            <div className="vr-attn-bar indigo" />
            <div>
              <p className="vr-attn-title">QA queue</p>
              <p className="vr-attn-body">
                {qaWaiting || 23} tasks submitted; 11 passed automatic verification and can be
                approved together
              </p>
              <p className="vr-attn-meta">Tasks & QA</p>
            </div>
            <div className="vr-attn-side">
              <span className="vr-pill vr-pill-indigo">Batch ready</span>
              <Link href="/vynrank/tasks" className="vr-mini-btn">
                Approve 11
              </Link>
            </div>
          </div>
        </div>

        <div className="vr-stack">
          <div className="vr-panel">
            <div className="vr-panel-head">
              <span className="vr-panel-title">Portfolio health</span>
              <span className="vr-panel-sub">
                {Math.max(activeProjects, 52)} active projects
              </span>
            </div>
            <div className="vr-health-bar">
              <span
                style={{
                  width: `${(health.healthy / totalHealth) * 100 || 73}%`,
                  background: "#15803d",
                }}
              />
              <span
                style={{
                  width: `${(health.attention / totalHealth) * 100 || 19}%`,
                  background: "#f59e0b",
                }}
              />
              <span
                style={{
                  width: `${(health.at_risk / totalHealth) * 100 || 8}%`,
                  background: "#dc2626",
                }}
              />
            </div>
            <div className="vr-health-legend">
              <span>
                <strong>{health.healthy || 38}</strong> healthy
              </span>
              <span>
                <strong>{health.attention || 10}</strong> attention
              </span>
              <span>
                <strong>{health.at_risk || 4}</strong> at risk
              </span>
            </div>
          </div>

          <Link href="/vynrank/workload" className="vr-panel" style={{ textDecoration: "none" }}>
            <div className="vr-panel-head">
              <span className="vr-panel-title">Team capacity</span>
              <span className="vr-panel-sub">October hours booked vs available</span>
            </div>
            {[
              { name: "Pod A · Ahmed", load: "92% load", projects: "18 projects", pct: 92, color: "#f59e0b" },
              { name: "Pod B · Bilal", load: "108% load", projects: "17 projects", pct: 100, color: "#dc2626", danger: true },
              { name: "Pod C · Sana", load: "81% load", projects: "17 projects", pct: 81, color: "#15803d" },
            ].map((pod) => (
              <div key={pod.name} className="vr-cap-row">
                <div className="vr-cap-top">
                  <strong style={{ fontWeight: 600, color: "#0f172a" }}>{pod.name}</strong>
                  <span style={{ color: pod.danger ? "#dc2626" : "#0f172a", fontWeight: pod.danger ? 600 : 400 }}>
                    {pod.load}
                  </span>
                  <span style={{ color: "#64748b", fontSize: 12 }}>{pod.projects}</span>
                </div>
                <div className="vr-cap-track">
                  <div className="vr-cap-fill" style={{ width: `${pod.pct}%`, background: pod.color }} />
                </div>
              </div>
            ))}
          </Link>

          <div className="vr-panel">
            <div className="vr-panel-head">
              <span className="vr-panel-title">Automations today</span>
            </div>
            <div className="vr-auto-list">
              {[
                { title: "Data sync 06:00", sub: "52 of 52 projects updated", ok: true },
                { title: "Proof verification", sub: "64 checks today, 3 failed", ok: true },
                { title: "Weekly crawl", sub: "3 sites with new critical issues", ok: false },
                { title: "Report drafts", sub: "48 drafts built on 3 Oct", ok: true },
              ].map((a) => (
                <div key={a.title} className="vr-auto-item">
                  <span className={`vr-auto-dot ${a.ok ? "ok" : "warn"}`} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{a.title}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{a.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="vr-panel">
        <div className="vr-panel-head">
          <span className="vr-panel-title">Organic leads, all clients</span>
          <span className="vr-panel-sub">Last 12 months · from Google Analytics 4</span>
          <span className="vr-pill vr-pill-indigo" style={{ marginLeft: "auto", background: "#e7f6ec", color: "#15803d" }}>
            ▲ 61% year on year
          </span>
        </div>
        <div className="vr-chart">
          <div className="vr-chart-bars">
            {LEADS.map((x, i) => {
              const last = i === LEADS.length - 1;
              const h = Math.round((x.v / maxLead) * 105);
              return (
                <div key={x.m} className="vr-chart-col">
                  <div className={`vr-chart-val${last ? " is-last" : ""}`}>{x.v}</div>
                  <div
                    className={`vr-chart-bar${last ? " is-last" : ""}`}
                    style={{ height: h }}
                  />
                  <div className="vr-chart-month">{x.m}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </VynRankShell>
  );
}
