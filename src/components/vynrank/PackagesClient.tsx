"use client";

import { useEffect, useState } from "react";
import VynRankShell from "@/components/vynrank/VynRankShell";

type Pkg = {
  id: string;
  name: string;
  priceCad: number;
  description: string | null;
  features: unknown;
  _count: { projects: number };
};

const FALLBACK = [
  {
    id: "starter",
    name: "Starter",
    priceCad: 35000,
    badge: "For local businesses",
    features: ["25 tracked keywords", "4 pages optimized", "2 blog posts", "GBP + citations"],
    hours: "8.5 h",
    clients: "18",
    margin: "54%",
  },
  {
    id: "growth",
    name: "Growth",
    priceCad: 65000,
    badge: "Most popular",
    features: ["60 tracked keywords", "8 pages optimized", "4 blog posts", "8 quality backlinks"],
    hours: "16.2 h",
    clients: "22",
    margin: "61%",
    popular: true,
  },
  {
    id: "authority",
    name: "Authority",
    priceCad: 120000,
    badge: "Competitive industries",
    features: ["120 tracked keywords", "16 pages optimized", "8 blog posts", "Digital PR"],
    hours: "28 h",
    clients: "12",
    margin: "58%",
  },
];

export default function PackagesClient() {
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [selected, setSelected] = useState("Growth");

  useEffect(() => {
    fetch("/api/vynrank/packages", { cache: "no-store" })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (res.ok) setPackages(json.packages || []);
      })
      .catch(() => {});
  }, []);

  const cards =
    packages.length > 0
      ? packages.map((p, i) => ({
          id: p.id,
          name: p.name,
          priceCad: p.priceCad,
          badge: FALLBACK[i]?.badge || p.description || "Package",
          features: Array.isArray(p.features) ? (p.features as string[]) : FALLBACK[i]?.features || [],
          hours: FALLBACK[i]?.hours || "12 h",
          clients: String(p._count.projects || FALLBACK[i]?.clients || 0),
          margin: FALLBACK[i]?.margin || "55%",
          popular: p.name.toLowerCase().includes("growth") || p.name.toLowerCase().includes("authority"),
        }))
      : FALLBACK;

  const active = cards.find((c) => c.name === selected) || cards[1] || cards[0];

  return (
    <VynRankShell>
      <div className="vr-cc-head">
        <div>
          <h1 className="vr-cc-title">Packages</h1>
          <p className="vr-cc-sub">
            What you sell is exactly what gets scheduled, verified and reported. Example pricing;
            replace with your own.
          </p>
        </div>
        <div className="vr-cc-actions">
          <button type="button" className="vr-btn vr-btn-primary">
            + New package
          </button>
        </div>
      </div>

      <div className="vr-pkg-grid">
        {cards.map((pkg) => (
          <div
            key={pkg.id}
            className={`vr-pkg-card${selected === pkg.name ? " is-selected" : ""}`}
          >
            <div className="vr-pkg-badge">{pkg.badge}</div>
            <div className="vr-pkg-name">{pkg.name}</div>
            <div className="vr-pkg-price">
              PKR {pkg.priceCad.toLocaleString("en-PK")}
              <span>/month</span>
            </div>
            <ul className="vr-pkg-features">
              {pkg.features.map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>
            <div className="vr-pkg-stats">
              <div>
                <strong>{pkg.hours}</strong>
                <span>Team hours</span>
              </div>
              <div>
                <strong>{pkg.clients}</strong>
                <span>Clients</span>
              </div>
              <div>
                <strong>{pkg.margin}</strong>
                <span>Avg margin</span>
              </div>
            </div>
            <button
              type="button"
              className="vr-btn vr-btn-ghost"
              style={{ width: "100%" }}
              onClick={() => setSelected(pkg.name)}
            >
              Edit package
            </button>
          </div>
        ))}
      </div>

      <div className="vr-pkg-edit">
        <div className="vr-panel">
          <div className="vr-panel-head">
            <span className="vr-panel-title">Edit: {active?.name} package</span>
            <span className="vr-panel-sub">Deliverables scheduled every month</span>
            <button type="button" className="vr-btn vr-btn-ghost" style={{ marginLeft: "auto", height: 32 }}>
              + Add deliverable
            </button>
          </div>
          <table className="vr-pkg-table">
            <thead>
              <tr>
                <th>Deliverable</th>
                <th>Type</th>
                <th>Per month</th>
                <th>Effort</th>
                <th>Lifecycle phase</th>
                <th>Proof</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Blog posts", "Content", "4", "6.0 h", "Content", "URL live"],
                ["Pages optimized", "On-page", "8", "4.5 h", "On-page", "Diff + crawl"],
                ["Quality backlinks", "Off-page", "8", "3.2 h", "Off-page", "Referring URL"],
                ["GBP posts", "Local", "8", "1.5 h", "Local", "Screenshot"],
              ].map((row) => (
                <tr key={row[0]}>
                  <td>{row[0]}</td>
                  <td>
                    <span className="vr-pkg-pill pkg-growth">{row[1]}</span>
                  </td>
                  <td>
                    <span className="vr-stepper">
                      <button type="button">−</button>
                      {row[2]}
                      <button type="button">+</button>
                    </span>
                  </td>
                  <td>{row[3]}</td>
                  <td>{row[4]}</td>
                  <td>{row[5]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="vr-panel vr-pkg-margin">
          <div className="vr-panel-head">
            <span className="vr-panel-title">Pricing and margin</span>
          </div>
          <div className="vr-margin-list">
            {[
              ["Monthly price", `PKR ${(active?.priceCad || 65000).toLocaleString("en-PK")}`],
              ["Setup fee", "PKR 25,000"],
              ["Minimum contract", "6 months"],
              ["Team hours", active?.hours || "16.2 h"],
              ["Est. payroll cost", "PKR 24,800"],
              ["Gross margin", active?.margin || "61%"],
            ].map(([k, v]) => (
              <div key={k} className="vr-margin-row">
                <span>{k}</span>
                <strong>{v}</strong>
              </div>
            ))}
          </div>
          <div className="vr-review-label" style={{ padding: "12px 18px 0" }}>
            Add-ons
          </div>
          <div className="vr-margin-list">
            {[
              ["Extra blog post", "PKR 8,000"],
              ["Extra backlink", "PKR 4,500"],
              ["Landing page", "PKR 18,000"],
              ["Site migration", "PKR 85,000"],
            ].map(([k, v]) => (
              <div key={k} className="vr-margin-row">
                <span>{k}</span>
                <strong>{v}</strong>
              </div>
            ))}
          </div>
          <div style={{ padding: 18 }}>
            <button type="button" className="vr-btn vr-btn-primary" style={{ width: "100%" }}>
              Save package
            </button>
          </div>
        </div>
      </div>
    </VynRankShell>
  );
}
