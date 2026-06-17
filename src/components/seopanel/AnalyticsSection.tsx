"use client";

import { useEffect, useState } from "react";
import { seoFetch } from "@/lib/seopanel/client";
import { Btn, Input, Textarea, PanelCard } from "./shared";
import { SITE_URL } from "@/lib/seopanel/constants";

export default function AnalyticsSection() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    seoFetch("/api/seopanel/settings").then(async (r) => {
      if (r.ok) { const d = await r.json(); setSettings(d.settings); }
    });
  }, []);

  const links = [
    { name: "Google Search Console", url: "https://search.google.com/search-console", desc: "Monitor search performance, indexing & queries", icon: "🔍" },
    { name: "Google Analytics 4", url: `https://analytics.google.com/analytics/web/#/p${settings?.gaPropertyId?.replace("G-", "") || ""}/reports`, desc: `Property: ${settings?.gaPropertyId || "G-KJSSQXW965"}`, icon: "📊" },
    { name: "Google PageSpeed Insights", url: `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(SITE_URL)}`, desc: "Core Web Vitals & performance audit", icon: "⚡" },
    { name: "Rich Results Test", url: `https://search.google.com/test/rich-results?url=${encodeURIComponent(SITE_URL)}`, desc: "Validate structured data & schema markup", icon: "🏷️" },
    { name: "Mobile-Friendly Test", url: `https://search.google.com/test/mobile-friendly?url=${encodeURIComponent(SITE_URL)}`, desc: "Check mobile usability", icon: "📱" },
    { name: "Bing Webmaster Tools", url: "https://www.bing.com/webmasters", desc: "Bing search performance & indexing", icon: "🌐" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Analytics & Tools</h2>
        <p className="text-slate-400 text-sm mt-1">Quick access to Google Search Console, Analytics & SEO tools</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((l) => (
          <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer"
            className="bg-[#12182b] border border-[#1e2a45] rounded-xl p-5 hover:border-[#0d9488]/40 transition-all group">
            <span className="text-2xl">{l.icon}</span>
            <h3 className="text-white font-semibold mt-3 group-hover:text-[#0d9488] transition-colors">{l.name}</h3>
            <p className="text-slate-500 text-xs mt-1">{l.desc}</p>
            <span className="text-[#0d9488] text-xs mt-2 inline-block">Open tool →</span>
          </a>
        ))}
      </div>

      <PanelCard title="Site Health Quick Check">
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          {[
            { label: "Site URL", value: settings?.siteUrl || SITE_URL },
            { label: "GA4 Property", value: settings?.gaPropertyId || "G-KJSSQXW965" },
            { label: "GSC Property", value: settings?.gscProperty || "Not configured" },
            { label: "Target Market", value: `${settings?.targetCountry || "CA"} — ${settings?.targetCities?.join(", ") || "Toronto, Vancouver, Montreal"}` },
            { label: "Monthly Traffic Goal", value: settings?.monthlyTrafficGoal?.toLocaleString() || "Not set" },
            { label: "Monthly Leads Goal", value: settings?.monthlyLeadsGoal?.toLocaleString() || "Not set" },
          ].map((item) => (
            <div key={item.label} className="bg-[#0a0f1a] rounded-lg p-3">
              <p className="text-slate-500 text-xs">{item.label}</p>
              <p className="text-slate-200 mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
      </PanelCard>
    </div>
  );
}

export function SettingsSection() {
  const [form, setForm] = useState<any>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    seoFetch("/api/seopanel/settings").then(async (r) => {
      if (r.ok) { const d = await r.json(); setForm(d.settings || {}); }
    });
  }, []);

  const save = async () => {
    const res = await seoFetch("/api/seopanel/settings", { method: "PATCH", body: JSON.stringify(form) });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
  };

  const markSitemapSubmitted = () => {
    setForm({ ...form, sitemapLastSubmitted: new Date().toISOString() });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Site Settings</h2>
        <p className="text-slate-400 text-sm mt-1">Configure site-wide SEO properties & goals</p>
      </div>

      <div className="bg-[#12182b] border border-[#1e2a45] rounded-xl p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Site URL" value={form.siteUrl || ""} onChange={(e) => setForm({ ...form, siteUrl: e.target.value })} />
          <Input label="Target Country" value={form.targetCountry || "CA"} onChange={(e) => setForm({ ...form, targetCountry: e.target.value })} />
          <Input label="Google Search Console Property" value={form.gscProperty || ""} onChange={(e) => setForm({ ...form, gscProperty: e.target.value })} placeholder="sc-domain:vyntechsolutions.ca" />
          <Input label="Google Analytics Property ID" value={form.gaPropertyId || ""} onChange={(e) => setForm({ ...form, gaPropertyId: e.target.value })} placeholder="G-XXXXXXXXXX" />
          <Input label="Google Site Verification Code" value={form.googleVerification || ""} onChange={(e) => setForm({ ...form, googleVerification: e.target.value })} />
          <Input label="Bing Site Verification Code" value={form.bingVerification || ""} onChange={(e) => setForm({ ...form, bingVerification: e.target.value })} />
          <Input label="Monthly Traffic Goal" type="number" value={form.monthlyTrafficGoal || ""} onChange={(e) => setForm({ ...form, monthlyTrafficGoal: parseInt(e.target.value) || null })} />
          <Input label="Monthly Leads Goal" type="number" value={form.monthlyLeadsGoal || ""} onChange={(e) => setForm({ ...form, monthlyLeadsGoal: parseInt(e.target.value) || null })} />
        </div>
        <Input label="Target Cities (comma-separated)" value={form.targetCities?.join(", ") || ""} onChange={(e) => setForm({ ...form, targetCities: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })} />
        <Textarea label="Default Meta Title" value={form.defaultTitle || ""} onChange={(e) => setForm({ ...form, defaultTitle: e.target.value })} />
        <Textarea label="Default Meta Description" value={form.defaultDescription || ""} onChange={(e) => setForm({ ...form, defaultDescription: e.target.value })} />
        <Textarea label="Robots.txt Notes" value={form.robotsTxtNotes || ""} onChange={(e) => setForm({ ...form, robotsTxtNotes: e.target.value })} />
        <Textarea label="General Notes" value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

        {form.sitemapLastSubmitted && (
          <p className="text-slate-500 text-xs">Last sitemap submitted: {new Date(form.sitemapLastSubmitted).toLocaleString()}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Btn onClick={save}>{saved ? "✓ Saved!" : "Save Settings"}</Btn>
          <Btn variant="secondary" onClick={markSitemapSubmitted}>Mark Sitemap Submitted</Btn>
          <a href={`${form.siteUrl || SITE_URL}/sitemap.xml`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-sm text-[#0d9488] hover:underline self-center">View Sitemap →</a>
        </div>
      </div>
    </div>
  );
}
