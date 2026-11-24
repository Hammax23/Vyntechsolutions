"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useVynRankAuth } from "@/components/vynrank/VynRankAuthContext";
import { VYNRANK_NAV_ITEMS } from "@/components/vynrank/nav-config";

function isActive(pathname: string, href: string) {
  if (href === "/vynrank") return pathname === "/vynrank" || pathname === "/vynrank/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

type BadgeCounts = { projects: number; ads: number; tasks: number };

export default function VynRankSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname() || "/vynrank";
  const { navKeys, logout } = useVynRankAuth();
  const allowed = new Set(navKeys);
  const [badges, setBadges] = useState<BadgeCounts>({ projects: 0, ads: 2, tasks: 0 });

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/vynrank/projects", { cache: "no-store" }).then((r) =>
        r.ok ? r.json() : { projects: [] }
      ),
      fetch("/api/vynrank/tasks", { cache: "no-store" }).then((r) =>
        r.ok ? r.json() : { tasks: [] }
      ),
    ])
      .then(([p, t]) => {
        if (cancelled) return;
        const projects = Array.isArray(p.projects) ? p.projects.length : 0;
        const tasks = Array.isArray(t.tasks)
          ? t.tasks.filter((x: { status: string }) =>
              ["submitted", "qa", "todo", "in_progress"].includes(x.status)
            ).length
          : 0;
        setBadges({ projects, ads: 2, tasks });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const ceo = VYNRANK_NAV_ITEMS.filter((i) => i.section === "ceo" && allowed.has(i.key));
  const workspace = VYNRANK_NAV_ITEMS.filter(
    (i) => i.section === "workspace" && allowed.has(i.key)
  );
  const setup = VYNRANK_NAV_ITEMS.filter((i) => i.section === "setup" && allowed.has(i.key));

  const renderItems = (items: typeof workspace) =>
    items.map((item) => {
      const active = isActive(pathname, item.href);
      const count =
        item.badgeKey === "projects"
          ? badges.projects
          : item.badgeKey === "ads"
            ? badges.ads
            : item.badgeKey === "tasks"
              ? badges.tasks
              : 0;
      const showBadge = item.badge && count > 0;
      return (
        <Link
          key={item.key}
          href={item.href}
          onClick={onClose}
          className={`vr-side-link${active ? " is-active" : ""}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.icon}
            alt=""
            width={18}
            height={18}
            className={`vr-side-icon${active ? " is-active" : ""}`}
          />
          <span className="vr-side-label">{item.label}</span>
          {showBadge ? (
            <span className={`vr-side-badge${item.badge === "alert" ? " is-alert" : ""}`}>
              {count}
            </span>
          ) : null}
        </Link>
      );
    });

  return (
    <aside className="vr-sidebar" data-name="Sidebar">
      <div className="vr-side-brand">
        <div className="vr-side-mark">V</div>
        <div>
          <div className="vr-side-brand-title">Vyntech</div>
          <div className="vr-side-brand-sub">SEO Desk</div>
        </div>
      </div>

      <nav className="vr-side-nav">
        {ceo.length ? (
          <div className="vr-side-group">
            <div className="vr-side-group-label">CEO</div>
            {renderItems(ceo)}
          </div>
        ) : null}
        {workspace.length ? (
          <div className="vr-side-group">
            <div className="vr-side-group-label">Workspace</div>
            {renderItems(workspace)}
          </div>
        ) : null}
        {setup.length ? (
          <div className="vr-side-group">
            <div className="vr-side-group-label">Setup</div>
            {renderItems(setup)}
          </div>
        ) : null}
      </nav>

      <button type="button" className="vr-side-org" onClick={() => void logout()} title="Sign out">
        <div className="vr-side-org-avatar">VD</div>
        <div className="vr-side-org-meta">
          <div className="vr-side-org-name">Vyntech Digital</div>
          <div className="vr-side-org-sub">
            {badges.projects || 0} projects · 10 people
          </div>
        </div>
      </button>
    </aside>
  );
}
