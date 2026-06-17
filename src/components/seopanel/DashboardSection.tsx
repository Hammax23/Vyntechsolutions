"use client";

import { useEffect, useState } from "react";
import { seoFetch } from "@/lib/seopanel/client";
import { StatCard, PanelCard, Badge, EmptyState } from "./shared";

export default function DashboardSection() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seoFetch("/api/seopanel/dashboard").then(async (r) => {
      if (r.ok) setData(await r.json());
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-slate-400 text-sm animate-pulse">Loading dashboard...</div>;
  if (!data) return <EmptyState message="Failed to load dashboard" />;

  const { stats, recentActivity, topKeywords } = data;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-slate-400 text-sm mt-1">vyntechsolutions.ca — SEO performance overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Keywords Tracked" value={stats.keywordCount} accent="text-[#0d9488]" />
        <StatCard label="Top 10 Rankings" value={stats.rankedKeywords} sub={`Avg rank: #${stats.avgRank || "—"}`} accent="text-[#00B4FF]" />
        <StatCard label="Active Backlinks" value={stats.backlinkCount} accent="text-purple-400" />
        <StatCard label="Page Optimization" value={`${stats.optimizationRate}%`} sub={`${stats.optimizedPages}/${stats.pageCount} pages`} accent="text-amber-400" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Open Tasks" value={stats.openTasks} sub={`${stats.taskCount} total`} />
        <StatCard label="Technical Issues" value={stats.openIssues} accent={stats.openIssues > 0 ? "text-red-400" : "text-emerald-400"} />
        <StatCard label="Competitors" value={stats.competitorCount} />
        <StatCard label="Pages Monitored" value={stats.pageCount} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <PanelCard title="Recent Activity">
          {recentActivity?.length ? (
            <div className="space-y-3">
              {recentActivity.map((a: any) => (
                <div key={a.id} className="flex items-start gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0d9488] mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-slate-200">{a.action}</p>
                    <p className="text-slate-500 text-xs">{a.module} · {new Date(a.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <EmptyState message="No activity yet" />}
        </PanelCard>

        <PanelCard title="Keyword Snapshot">
          {topKeywords?.length ? (
            <div className="space-y-2">
              {topKeywords.map((k: any) => (
                <div key={k.id} className="flex items-center justify-between py-2 border-b border-[#1e2a45] last:border-0">
                  <span className="text-slate-200 text-sm truncate flex-1 mr-2">{k.keyword}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {k.currentRank && <span className="text-[#0d9488] font-bold text-sm">#{k.currentRank}</span>}
                    <Badge status={k.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : <EmptyState message="Add keywords to start tracking" />}
        </PanelCard>
      </div>
    </div>
  );
}
