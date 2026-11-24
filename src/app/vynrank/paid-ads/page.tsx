"use client";

import VynRankShell from "@/components/vynrank/VynRankShell";

export default function Page() {
  return (
    <VynRankShell>
      <div className="vr-cc-head">
        <div>
          <h1 className="vr-cc-title">Paid ads overview</h1>
          <p className="vr-cc-sub">
            Google Ads and Meta performance nested under SEO Desk for the same clients.
          </p>
        </div>
        <div className="vr-cc-actions">
          <button type="button" className="vr-btn vr-btn-primary">
            + Link ad account
          </button>
        </div>
      </div>
      <div className="vr-proj-kpis">
        {[
          ["Ad spend · Oct", "PKR 1.84M", "Google + Meta"],
          ["Leads from ads", "612", "▲ 14% vs Sep"],
          ["Cost / lead", "PKR 3,007", "Target PKR 3,500"],
          ["Accounts needing attention", "2", "Budget exhausted"],
          ["ROAS blended", "3.4×", "Across active accounts"],
        ].map(([l, v, m]) => (
          <div key={l} className="vr-kpi">
            <div className="vr-kpi-label">{l}</div>
            <div className="vr-kpi-value" style={{ fontSize: 22 }}>
              {v}
            </div>
            <div className="vr-kpi-meta">{m}</div>
          </div>
        ))}
      </div>
      <div className="vr-panel">
        <div className="vr-panel-head">
          <span className="vr-panel-title">Accounts</span>
        </div>
        <table className="vr-proj-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Channel</th>
              <th>Spend</th>
              <th>Leads</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {[
              ["NorthPeak Dental", "Google Ads", "PKR 185K", "74", "Healthy"],
              ["Harbor Freight SaaS", "Google + Meta", "PKR 420K", "91", "Attention"],
              ["Urban Bakers", "Meta Ads", "PKR 62K", "18", "Budget out"],
            ].map((r) => (
              <tr key={r[0]}>
                <td>
                  <strong>{r[0]}</strong>
                </td>
                <td>{r[1]}</td>
                <td>{r[2]}</td>
                <td>{r[3]}</td>
                <td>
                  <span
                    className={`vr-pill ${
                      r[4] === "Healthy"
                        ? "vr-pill-indigo"
                        : r[4] === "Attention"
                          ? "vr-pill-warn"
                          : "vr-pill-danger"
                    }`}
                    style={
                      r[4] === "Healthy"
                        ? { background: "#e7f6ec", color: "#15803d" }
                        : undefined
                    }
                  >
                    {r[4]}
                  </span>
                </td>
                <td>
                  <button type="button" className="vr-mini-btn">
                    Open
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </VynRankShell>
  );
}
