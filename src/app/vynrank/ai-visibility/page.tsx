"use client";

import VynRankShell from "@/components/vynrank/VynRankShell";

export default function Page() {
  return (
    <VynRankShell>
      <div className="vr-cc-head">
        <div>
          <h1 className="vr-cc-title">AI search visibility</h1>
          <p className="vr-cc-sub">
            Brand mentions and citations across ChatGPT, Perplexity and Google AI Overviews.
          </p>
        </div>
        <div className="vr-cc-actions">
          <button type="button" className="vr-btn vr-btn-primary">
            Run visibility scan
          </button>
        </div>
      </div>
      <div className="vr-proj-kpis" style={{ gridTemplateColumns: "repeat(4, minmax(0,1fr))" }}>
        {[
          ["Clients tracked", "18", "Enterprise + Authority"],
          ["Prompts monitored", "240", "Per weekly scan"],
          ["Cited this week", "63", "▲ 11 vs last week"],
          ["Share of voice", "27%", "Vs top 3 competitors"],
        ].map(([l, v, m]) => (
          <div key={l} className="vr-kpi">
            <div className="vr-kpi-label">{l}</div>
            <div className="vr-kpi-value">{v}</div>
            <div className="vr-kpi-meta">{m}</div>
          </div>
        ))}
      </div>
      <div className="vr-panel">
        <div className="vr-panel-head">
          <span className="vr-panel-title">Recent citations</span>
        </div>
        <table className="vr-proj-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Engine</th>
              <th>Prompt theme</th>
              <th>Cited</th>
              <th>Competitor also cited</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Maple Legal Group", "Perplexity", "Best corporate lawyers Toronto", "Yes", "2"],
              ["Harbor Freight SaaS", "ChatGPT", "Freight TMS software", "Yes", "3"],
              ["NorthPeak Dental", "AI Overviews", "Emergency dentist Mississauga", "No", "1"],
            ].map((r) => (
              <tr key={r[0] + r[1]}>
                <td>
                  <strong>{r[0]}</strong>
                </td>
                <td>{r[1]}</td>
                <td>{r[2]}</td>
                <td>{r[3]}</td>
                <td>{r[4]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </VynRankShell>
  );
}
