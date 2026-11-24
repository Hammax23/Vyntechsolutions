"use client";

import VynRankShell from "@/components/vynrank/VynRankShell";

export default function Page() {
  return (
    <VynRankShell>
      <div className="vr-cc-head">
        <div>
          <h1 className="vr-cc-title">Client reports</h1>
          <p className="vr-cc-sub">
            Draft, review and send white-label monthly reports to every client.
          </p>
        </div>
        <div className="vr-cc-actions">
          <button type="button" className="vr-btn vr-btn-ghost">
            Send ready reports
          </button>
          <button type="button" className="vr-btn vr-btn-primary">
            + New report
          </button>
        </div>
      </div>
      <div className="vr-proj-kpis" style={{ gridTemplateColumns: "repeat(4, minmax(0,1fr))" }}>
        {[
          ["Ready to send", "11", "Passed QA"],
          ["In draft", "7", "Needs metrics"],
          ["Sent · Oct", "41", "Of 52 clients"],
          ["Avg rating", "4.6", "From client portal"],
        ].map(([l, v, m]) => (
          <div key={l} className="vr-kpi">
            <div className="vr-kpi-label">{l}</div>
            <div className="vr-kpi-value">{v}</div>
            <div className="vr-kpi-meta">{m}</div>
          </div>
        ))}
      </div>
      <div className="vr-panel">
        <table className="vr-proj-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Month</th>
              <th>Status</th>
              <th>Owner</th>
              <th>Rating</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {[
              ["NorthPeak Dental", "October 2026", "Ready", "Jordan Lee", "—"],
              ["Harbor Freight SaaS", "October 2026", "Draft", "Sam Rivera", "—"],
              ["Smile Dental Clinic", "September 2026", "Sent", "Jordan Lee", "2/5"],
            ].map((r) => (
              <tr key={r[0]}>
                <td>
                  <strong>{r[0]}</strong>
                </td>
                <td>{r[1]}</td>
                <td>
                  <span className="vr-pill vr-pill-indigo">{r[2]}</span>
                </td>
                <td>{r[3]}</td>
                <td>{r[4]}</td>
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
