"use client";

import VynRankShell from "@/components/vynrank/VynRankShell";
import { useVynRankAuth } from "@/components/vynrank/VynRankAuthContext";

export default function Page() {
  const { user } = useVynRankAuth();
  const first = user?.name?.split(/\s+/)[0] || "there";
  return (
    <VynRankShell>
      <div className="vr-cc-head">
        <div>
          <h1 className="vr-cc-title">My Day</h1>
          <p className="vr-cc-sub">
            Focus queue for {first} — due today, waiting on you, and blocked items.
          </p>
        </div>
      </div>
      <div className="vr-cc-mid">
        <div className="vr-panel">
          <div className="vr-panel-head">
            <span className="vr-panel-title">Due today</span>
            <span className="vr-panel-sub">6 tasks</span>
          </div>
          {[
            "Refresh service page schema · NorthPeak Dental",
            "Guest post outreach batch · Harbor Freight",
            "QA: GBP photo pass · NorthPeak Dental",
          ].map((t) => (
            <div key={t} className="vr-attn-row" style={{ gridTemplateColumns: "1fr" }}>
              <div>
                <p className="vr-attn-title">{t}</p>
                <p className="vr-attn-meta">Due today · high priority</p>
              </div>
            </div>
          ))}
        </div>
        <div className="vr-stack">
          <div className="vr-panel">
            <div className="vr-panel-head">
              <span className="vr-panel-title">Waiting on you</span>
            </div>
            <div className="vr-attn-row" style={{ gridTemplateColumns: "1fr" }}>
              <div>
                <p className="vr-attn-title">Approve 4 auto-verified tasks</p>
                <p className="vr-attn-meta">Tasks & QA</p>
              </div>
            </div>
          </div>
          <div className="vr-panel">
            <div className="vr-panel-head">
              <span className="vr-panel-title">Blocked</span>
            </div>
            <div className="vr-attn-row" style={{ gridTemplateColumns: "1fr" }}>
              <div>
                <p className="vr-attn-title">GA4 reconnect · Urban Bakers</p>
                <p className="vr-attn-meta">Waiting on client access</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </VynRankShell>
  );
}
