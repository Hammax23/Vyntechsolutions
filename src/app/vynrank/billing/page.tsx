"use client";

import VynRankShell from "@/components/vynrank/VynRankShell";

export default function Page() {
  return (
    <VynRankShell>
      <div className="vr-cc-head">
        <div>
          <h1 className="vr-cc-title">Billing and payments</h1>
          <p className="vr-cc-sub">
            Retainers, invoices and payment status for every client package.
          </p>
        </div>
        <div className="vr-cc-actions">
          <button type="button" className="vr-btn vr-btn-ghost">
            Export
          </button>
          <button type="button" className="vr-btn vr-btn-primary">
            + Create invoice
          </button>
        </div>
      </div>
      <div className="vr-proj-kpis">
        {[
          ["MRR", "PKR 3.57M", "Across 52 retainers"],
          ["Collected · Oct", "PKR 3.12M", "87% of billed"],
          ["Overdue", "PKR 410K", "6 invoices"],
          ["Upcoming renewals", "9", "Next 30 days"],
          ["Failed payments", "2", "Retry scheduled"],
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
          <span className="vr-panel-title">October invoices</span>
        </div>
        <table className="vr-proj-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Package</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Due</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {[
              ["NorthPeak Dental", "Local Growth", "PKR 65,000", "Paid", "5 Oct"],
              ["Harbor Freight SaaS", "Authority", "PKR 120,000", "Overdue", "12 Oct"],
              ["Maple Legal Group", "Enterprise", "PKR 210,000", "Sent", "28 Oct"],
            ].map((r) => (
              <tr key={r[0]}>
                <td>
                  <strong>{r[0]}</strong>
                </td>
                <td>{r[1]}</td>
                <td>{r[2]}</td>
                <td>
                  <span
                    className={`vr-pill ${
                      r[3] === "Paid"
                        ? "vr-pill-indigo"
                        : r[3] === "Overdue"
                          ? "vr-pill-danger"
                          : "vr-pill-warn"
                    }`}
                    style={
                      r[3] === "Paid"
                        ? { background: "#e7f6ec", color: "#15803d" }
                        : undefined
                    }
                  >
                    {r[3]}
                  </span>
                </td>
                <td className="vr-muted">{r[4]}</td>
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
