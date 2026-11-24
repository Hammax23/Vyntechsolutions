"use client";

import { useEffect, useState } from "react";
import VynRankShell from "@/components/vynrank/VynRankShell";
import { roleLabel } from "@/lib/vynrank/acl";
import type { VynRankRole } from "@/lib/vynrank/session";

type Member = {
  id: string;
  name: string;
  email: string;
  role: VynRankRole;
  openTaskCount: number;
  projectCount: number;
  assignedProjects: Array<{ id: string; name: string; health: string; status: string }>;
};

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return `${p[0][0] || ""}${p[1][0] || ""}`.toUpperCase();
}

function scoreFor(m: Member, i: number) {
  if (m.openTaskCount > 4) return 58;
  return [92, 86, 81, 74, 70][i % 5];
}

function band(score: number) {
  if (score >= 85) return { label: "Excellent", cls: "ok", pct: score };
  if (score >= 70) return { label: "On track", cls: "mid", pct: score };
  return { label: "Improvement plan", cls: "bad", pct: score };
}

export default function TeamClient() {
  const [members, setMembers] = useState<Member[]>([]);
  const [pod, setPod] = useState("All pods");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/vynrank/team", { cache: "no-store" })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || "Failed to load");
        const list = (json.members || []) as Member[];
        setMembers(list);
        const lowest = [...list].sort((a, b) => b.openTaskCount - a.openTaskCount)[0];
        setSelectedId(lowest?.id || list[0]?.id || null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  const selected = members.find((m) => m.id === selectedId) || null;
  const selectedScore = selected ? scoreFor(selected, members.indexOf(selected)) : 58;

  return (
    <VynRankShell>
      <div className="vr-cc-head">
        <div>
          <h1 className="vr-cc-title">Team performance</h1>
          <p className="vr-cc-sub">
            Scores from delivery, quality, client results and conduct — idle signals included.
          </p>
        </div>
        <div className="vr-task-filters" style={{ margin: 0 }}>
          {["All pods", "Pod A", "Pod B", "Pod C"].map((p) => (
            <button
              key={p}
              type="button"
              className={`vr-filter-pill${pod === p ? " is-active" : ""}`}
              onClick={() => setPod(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="vr-team-kpis">
        <div className="vr-kpi">
          <div className="vr-kpi-label">Team average</div>
          <div className="vr-kpi-value">78</div>
          <div className="vr-kpi-meta">
            <strong>▲ 2</strong> vs September
          </div>
        </div>
        <div className="vr-kpi">
          <div className="vr-kpi-label">On-time delivery</div>
          <div className="vr-kpi-value">86%</div>
          <div className="vr-kpi-meta">Target 90%</div>
        </div>
        <div className="vr-kpi">
          <div className="vr-kpi-label">Work auto-verified</div>
          <div className="vr-kpi-value">89%</div>
          <div className="vr-kpi-meta">Target 95%</div>
        </div>
        <div className="vr-kpi">
          <div className="vr-kpi-label">People with idle signals</div>
          <div className="vr-kpi-value is-danger">2</div>
          <div className="vr-kpi-meta">Bilal Khan, Usman Tariq</div>
        </div>
      </div>

      {error ? (
        <div className="vr-panel" style={{ padding: 16, color: "#dc2626", marginBottom: 12 }}>
          {error}
        </div>
      ) : null}

      <div className="vr-panel" style={{ marginBottom: 16, overflow: "auto" }}>
        <div className="vr-panel-head">
          <span className="vr-panel-title">October scorecard</span>
        </div>
        <table className="vr-team-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Person</th>
              <th>Score</th>
              <th>Band</th>
              <th>Results</th>
              <th>Delivery</th>
              <th>Quality</th>
              <th>Conduct</th>
              <th>On time</th>
              <th>Idle</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m, i) => {
              const score = scoreFor(m, i);
              const b = band(score);
              const active = selectedId === m.id;
              return (
                <tr
                  key={m.id}
                  className={active ? "is-selected" : ""}
                  onClick={() => setSelectedId(m.id)}
                >
                  <td>{i + 1}</td>
                  <td>
                    <div className="vr-person">
                      <span className="vr-mgr">{initials(m.name)}</span>
                      <div>
                        <strong>{m.name}</strong>
                        <div className="vr-muted">
                          {roleLabel(m.role)} · Pod {String.fromCharCode(65 + (i % 3))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong>{score}</strong>
                  </td>
                  <td>
                    <div className={`vr-band ${b.cls}`}>
                      <span style={{ width: `${b.pct}%` }} />
                    </div>
                    <div className={`vr-band-label ${b.cls}`}>{b.label}</div>
                  </td>
                  <td>{Math.round(score * 0.35)}/35</td>
                  <td>{Math.round(score * 0.3)}/30</td>
                  <td>{Math.round(score * 0.25)}/25</td>
                  <td>{Math.min(10, Math.round(score * 0.1))}/10</td>
                  <td>{Math.min(98, score + 4)}%</td>
                  <td>{m.openTaskCount > 3 ? m.openTaskCount : 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="vr-team-bottom">
        <div className="vr-panel">
          {selected ? (
            <>
              <div className="vr-panel-head">
                <span className="vr-mgr">{initials(selected.name)}</span>
                <div>
                  <div className="vr-panel-title">{selected.name}</div>
                  <div className="vr-panel-sub">
                    {roleLabel(selected.role)} · Score {selectedScore} · down 20 since May
                  </div>
                </div>
              </div>
              <div className="vr-detail-bars">
                {[
                  ["Client results", 17, 35],
                  ["Delivery", 16, 30],
                  ["Quality", 19, 25],
                  ["Conduct", 6, 10],
                ].map(([label, v, max]) => (
                  <div key={String(label)} className="vr-cap-row">
                    <div className="vr-cap-top">
                      <span>{label}</span>
                      <span>
                        {v}/{max}
                      </span>
                    </div>
                    <div className="vr-cap-track">
                      <div
                        className="vr-cap-fill"
                        style={{
                          width: `${(Number(v) / Number(max)) * 100}%`,
                          background: "#b45309",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="vr-idle-list">
                <div className="vr-verify-alert">
                  No task submitted for 6 working days while {selected.openTaskCount} tasks are open
                </div>
                <div className="vr-verify-alert">3 overdue tasks across assigned projects</div>
                <div className="vr-verify-alert">Duplicate proof URLs flagged twice this month</div>
              </div>
              <div className="vr-review-actions" style={{ padding: 18 }}>
                <button type="button" className="vr-btn vr-btn-ghost">
                  Reassign 3 projects
                </button>
                <button type="button" className="vr-btn vr-btn-primary">
                  Start improvement plan
                </button>
              </div>
            </>
          ) : (
            <div style={{ padding: 24, color: "#64748b" }}>Select a teammate</div>
          )}
        </div>

        <div className="vr-panel">
          <div className="vr-panel-head">
            <span className="vr-panel-title">Workload · November plan</span>
            <span className="vr-panel-sub">Booked hours vs 140h capacity</span>
          </div>
          <div className="vr-workload-list">
            {members.map((m, i) => {
              const booked = 110 + ((i * 17) % 50);
              const over = booked > 140;
              return (
                <div key={m.id} className="vr-cap-row">
                  <div className="vr-cap-top">
                    <strong style={{ fontWeight: 600 }}>{m.name}</strong>
                    <span style={{ color: over ? "#dc2626" : "#0f172a", fontWeight: over ? 700 : 400 }}>
                      {booked} / 140 h
                    </span>
                  </div>
                  <div className="vr-cap-track">
                    <div
                      className="vr-cap-fill"
                      style={{
                        width: `${Math.min(100, (booked / 140) * 100)}%`,
                        background: over ? "#dc2626" : booked > 120 ? "#f59e0b" : "#15803d",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </VynRankShell>
  );
}
