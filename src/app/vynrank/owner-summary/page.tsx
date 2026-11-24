"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import VynRankShell from "@/components/vynrank/VynRankShell";
import { useVynRankAuth } from "@/components/vynrank/VynRankAuthContext";

type Lang = "en" | "ur";

const COPY = {
  ur: {
    title: "Aaj ka khulasa",
    fullDash: "Poora dashboard",
    ok: "Theek chal rahe hain",
    okMeta: "Score 75+",
    attention: "Tawajjo chahiye",
    attentionMeta: "Score 55 to 74",
    risk: "Khatray mein",
    riskMeta: "Score below 55",
    money: "Paise baqi",
    moneyMeta: "6 late invoices",
    askTitle: "Aaj manager se yeh 3 sawal poochein",
    results: "Is mahine ke nateejaay",
    leads: "Google se leads",
    leadsMeta: "61% last year se zyada",
    reports: "Reports waqt par",
    reportsMeta: "11 draft mein",
    impressions: "Google par dikhaye gaye",
    impressionsMeta: "Clients ki sites search mein kitni dafa dikhin",
    teamToday: "Team aaj",
    spot: "Is hafte ke spot-checks",
    moneyCard: "Paise",
    wa: "WhatsApp par bhejein",
  },
  en: {
    title: "Today's summary",
    fullDash: "Full dashboard",
    ok: "Doing well",
    okMeta: "Score 75+",
    attention: "Needs attention",
    attentionMeta: "Score 55 to 74",
    risk: "At risk",
    riskMeta: "Score below 55",
    money: "Outstanding",
    moneyMeta: "6 late invoices",
    askTitle: "Ask your managers these 3 questions today",
    results: "This month's results",
    leads: "Organic leads",
    leadsMeta: "61% vs last year",
    reports: "Reports on time",
    reportsMeta: "11 still in draft",
    impressions: "Search impressions",
    impressionsMeta: "How often clients appeared in Google",
    teamToday: "Team today",
    spot: "This week's spot-checks",
    moneyCard: "Money",
    wa: "Send on WhatsApp",
  },
} as const;

const QUESTIONS = {
  ur: [
    {
      title: "Lahore Furniture House",
      body: "Google traffic 27% gir gayi. Manager: Bilal Khan.",
      prompt: "Bilal, traffic kyun giri? Kaun se pages top-10 se bahar hue?",
      href: "/vynrank/projects",
    },
    {
      title: "Bilal Khan",
      body: "6 din se koi task submit nahi. 9 open, 4 late.",
      prompt: "Ahmed, Bilal ke saath kya masla hai? Workload shift karen?",
      href: "/vynrank/team",
    },
    {
      title: "Prime Real Estate",
      body: "1 backlink verification fail. Manager: Sana Malik.",
      prompt: "Sana, teesra link kahan hai? Client ko delay bataya?",
      href: "/vynrank/tasks",
    },
  ],
  en: [
    {
      title: "Lahore Furniture House",
      body: "Organic traffic down 27%. Manager: Bilal Khan.",
      prompt: "Bilal, why did traffic drop? Which pages left top-10?",
      href: "/vynrank/projects",
    },
    {
      title: "Bilal Khan",
      body: "No task submitted in 6 days. 9 open, 4 late.",
      prompt: "Ahmed, what's going on with Bilal? Should we rebalance?",
      href: "/vynrank/team",
    },
    {
      title: "Prime Real Estate",
      body: "1 backlink failed verification. Manager: Sana Malik.",
      prompt: "Sana, where is the third link? Did we tell the client?",
      href: "/vynrank/tasks",
    },
  ],
} as const;

export default function Page() {
  const { user, loading } = useVynRankAuth();
  const [lang, setLang] = useState<Lang>("ur");
  const t = COPY[lang];
  const questions = QUESTIONS[lang];

  const dateLine = useMemo(() => {
    return new Intl.DateTimeFormat(lang === "ur" ? "en-CA" : "en-CA", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
  }, [lang]);

  return (
    <VynRankShell>
      <div className="vr-cc-head">
        <div>
          <h1 className="vr-cc-title">{t.title}</h1>
          <p className="vr-cc-sub">
            {loading ? "…" : user?.name || "CEO"} · {dateLine}
          </p>
        </div>
        <div className="vr-cc-actions">
          <div className="vr-lang-toggle">
            <button
              type="button"
              className={lang === "en" ? "is-active" : ""}
              onClick={() => setLang("en")}
            >
              English
            </button>
            <button
              type="button"
              className={lang === "ur" ? "is-active" : ""}
              onClick={() => setLang("ur")}
            >
              Roman Urdu
            </button>
          </div>
          <Link href="/vynrank" className="vr-btn vr-btn-primary">
            {t.fullDash}
          </Link>
        </div>
      </div>

      <div className="vr-ceo-kpis">
        <div className="vr-kpi">
          <div className="vr-kpi-label">{t.ok}</div>
          <div className="vr-kpi-value" style={{ color: "#15803d" }}>
            38
          </div>
          <div className="vr-kpi-meta">{t.okMeta}</div>
        </div>
        <div className="vr-kpi">
          <div className="vr-kpi-label">{t.attention}</div>
          <div className="vr-kpi-value is-warn">10</div>
          <div className="vr-kpi-meta">{t.attentionMeta}</div>
        </div>
        <div className="vr-kpi">
          <div className="vr-kpi-label">{t.risk}</div>
          <div className="vr-kpi-value is-danger">4</div>
          <div className="vr-kpi-meta">{t.riskMeta}</div>
        </div>
        <div className="vr-kpi">
          <div className="vr-kpi-label">{t.money}</div>
          <div className="vr-kpi-value" style={{ fontSize: 22 }}>
            PKR 2.95L
          </div>
          <div className="vr-kpi-meta">{t.moneyMeta}</div>
        </div>
      </div>

      <div className="vr-ceo-layout">
        <div className="vr-stack">
          <div className="vr-panel">
            <div className="vr-panel-head">
              <span className="vr-panel-title">{t.askTitle}</span>
            </div>
            {questions.map((q) => (
              <div key={q.title} className="vr-ceo-ask">
                <div>
                  <div className="vr-attn-title">{q.title}</div>
                  <p className="vr-attn-body">{q.body}</p>
                  <p className="vr-ceo-prompt">“{q.prompt}”</p>
                </div>
                <div className="vr-ceo-ask-actions">
                  <a
                    className="vr-btn vr-btn-ghost"
                    style={{ height: 34, fontSize: 12 }}
                    href={`https://wa.me/?text=${encodeURIComponent(q.prompt)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t.wa}
                  </a>
                  <Link href={q.href} className="vr-mini-btn">
                    Open
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="vr-panel">
            <div className="vr-panel-head">
              <span className="vr-panel-title">{t.results}</span>
            </div>
            <div className="vr-ceo-results">
              <div>
                <div className="vr-kpi-label">{t.leads}</div>
                <div className="vr-kpi-value">342</div>
                <div className="vr-kpi-meta">{t.leadsMeta}</div>
              </div>
              <div>
                <div className="vr-kpi-label">{t.reports}</div>
                <div className="vr-kpi-value">41/52</div>
                <div className="vr-kpi-meta">{t.reportsMeta}</div>
              </div>
              <div>
                <div className="vr-kpi-label">{t.impressions}</div>
                <div className="vr-kpi-value" style={{ fontSize: 24 }}>
                  1.9M
                </div>
                <div className="vr-kpi-meta">{t.impressionsMeta}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="vr-stack">
          <div className="vr-panel">
            <div className="vr-panel-head">
              <span className="vr-panel-title">{t.teamToday}</span>
            </div>
            <div className="vr-ceo-team">
              {[
                ["Sana Malik", 92],
                ["Ahmed Raza", 86],
                ["Usman Tariq", 77],
                ["Bilal Khan", 58],
              ].map(([name, score]) => (
                <div key={String(name)} className="vr-ceo-team-row">
                  <span className="vr-mgr">
                    {String(name)
                      .split(/\s+/)
                      .map((x) => x[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                  <strong>{name}</strong>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontWeight: 700,
                      color: Number(score) < 70 ? "#dc2626" : "#15803d",
                    }}
                  >
                    {score}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="vr-panel">
            <div className="vr-panel-head">
              <span className="vr-panel-title">{t.spot}</span>
            </div>
            <div style={{ padding: "12px 18px 18px", fontSize: 14, lineHeight: 1.7 }}>
              <div>
                <strong style={{ color: "#15803d" }}>12</strong> correct
              </div>
              <div>
                <strong style={{ color: "#dc2626" }}>1</strong> wrong
              </div>
              <div>
                <strong style={{ color: "#b45309" }}>1</strong> pending
              </div>
            </div>
          </div>

          <div className="vr-panel">
            <div className="vr-panel-head">
              <span className="vr-panel-title">{t.moneyCard}</span>
            </div>
            <div className="vr-margin-list">
              {[
                ["Urban Bakers", "PKR 70,000 · 44 days"],
                ["Royal Banquets", "PKR 60,000 · 14 days"],
                ["Lahore Furniture House", "PKR 65,000 · 14 days"],
              ].map(([k, v]) => (
                <div key={k} className="vr-margin-row">
                  <span>{k}</span>
                  <strong style={{ color: "#dc2626" }}>{v}</strong>
                </div>
              ))}
            </div>
            <div style={{ padding: "0 18px 18px" }}>
              <Link href="/vynrank/billing" className="vr-btn vr-btn-ghost" style={{ width: "100%" }}>
                Open billing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </VynRankShell>
  );
}
