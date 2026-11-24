"use client";

import type { ReactNode } from "react";
import { useVynRankAuth } from "@/components/vynrank/VynRankAuthContext";

function initials(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

export default function VynRankTopbar({
  showMonth = true,
  onMenuClick,
  trailing,
}: {
  showMonth?: boolean;
  onMenuClick?: () => void;
  trailing?: ReactNode;
}) {
  const { user, roleLabel } = useVynRankAuth();
  const monthLabel = new Intl.DateTimeFormat("en-CA", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="vr-topbar" data-name="Top bar">
      <button type="button" className="vynrank-mobile-menu-btn" onClick={onMenuClick}>
        <span style={{ fontSize: 18, lineHeight: 1 }}>☰</span>
      </button>

      <div className="vr-top-search">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/vynrank/icons/top-search.svg" alt="" width={18} height={18} />
        <span className="vr-top-search-placeholder">Search projects, tasks, people</span>
        <span className="vr-top-kbd">Ctrl K</span>
      </div>

      <div className="vr-top-right">
        {trailing}
        {showMonth ? (
          <button type="button" className="vr-top-month">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/vynrank/icons/top-calendar.svg" alt="" width={16} height={16} />
            <span>{monthLabel}</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/vynrank/icons/top-chevron.svg" alt="" width={16} height={16} />
          </button>
        ) : null}

        <button type="button" className="vr-top-bell" aria-label="Notifications">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/vynrank/icons/top-bell.svg" alt="" width={18} height={18} />
          <span className="vr-top-bell-dot" />
        </button>

        <div className="vr-top-user">
          <div className="vr-top-avatar">{initials(user?.name)}</div>
          <div className="vr-top-user-meta">
            <div className="vr-top-user-name">{user?.name || "—"}</div>
            <div className="vr-top-user-role">{roleLabel || "—"}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
