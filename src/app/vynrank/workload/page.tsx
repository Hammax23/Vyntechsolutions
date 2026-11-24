"use client";

import VynRankShell from "@/components/vynrank/VynRankShell";

const PEOPLE = [
  ["Jordan Lee", 128],
  ["Sam Rivera", 152],
  ["Ahmed Raza", 118],
  ["Sana Malik", 101],
  ["Bilal Khan", 140],
];

export default function Page() {
  return (
    <VynRankShell>
      <div className="vr-cc-head">
        <div>
          <h1 className="vr-cc-title">Workload board</h1>
          <p className="vr-cc-sub">Booked hours vs 140h monthly capacity across SEO Team</p>
        </div>
      </div>
      <div className="vr-panel">
        <div className="vr-panel-head">
          <span className="vr-panel-title">November plan</span>
        </div>
        <div className="vr-workload-list">
          {PEOPLE.map(([name, hours]) => {
            const h = Number(hours);
            const over = h > 140;
            return (
              <div key={String(name)} className="vr-cap-row">
                <div className="vr-cap-top">
                  <strong style={{ fontWeight: 600 }}>{name}</strong>
                  <span style={{ color: over ? "#dc2626" : "#0f172a", fontWeight: over ? 700 : 400 }}>
                    {h} / 140 h
                  </span>
                </div>
                <div className="vr-cap-track">
                  <div
                    className="vr-cap-fill"
                    style={{
                      width: `${Math.min(100, (h / 140) * 100)}%`,
                      background: over ? "#dc2626" : h > 120 ? "#f59e0b" : "#15803d",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </VynRankShell>
  );
}
