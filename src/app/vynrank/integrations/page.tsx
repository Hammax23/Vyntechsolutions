"use client";

import VynRankShell from "@/components/vynrank/VynRankShell";

const CONNECTORS = [
  { name: "Google Search Console", status: "Connected", meta: "52 properties synced 06:00" },
  { name: "Google Analytics 4", status: "Connected", meta: "48 properties · 4 need reconnect" },
  { name: "Google Business Profile", status: "Connected", meta: "31 locations" },
  { name: "Google Ads", status: "Action needed", meta: "2 accounts expired" },
  { name: "Meta Ads", status: "Connected", meta: "Read-only insights" },
  { name: "Slack", status: "Connected", meta: "#seo-desk alerts" },
];

export default function Page() {
  return (
    <VynRankShell>
      <div className="vr-cc-head">
        <div>
          <h1 className="vr-cc-title">Integrations & automation</h1>
          <p className="vr-cc-sub">
            Connect data by Google sign-in. No passwords are stored with Vyntech.
          </p>
        </div>
        <div className="vr-cc-actions">
          <button type="button" className="vr-btn vr-btn-primary">
            + Add connector
          </button>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 14,
        }}
      >
        {CONNECTORS.map((c) => (
          <div key={c.name} className="vr-panel" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <strong style={{ fontSize: 15 }}>{c.name}</strong>
              <span
                className={`vr-pill ${
                  c.status === "Connected" ? "vr-pill-indigo" : "vr-pill-warn"
                }`}
                style={
                  c.status === "Connected"
                    ? { background: "#e7f6ec", color: "#15803d" }
                    : undefined
                }
              >
                {c.status}
              </span>
            </div>
            <p className="vr-cc-sub" style={{ margin: "8px 0 14px" }}>
              {c.meta}
            </p>
            <button type="button" className="vr-btn vr-btn-ghost" style={{ height: 34 }}>
              Manage
            </button>
          </div>
        ))}
      </div>
    </VynRankShell>
  );
}
