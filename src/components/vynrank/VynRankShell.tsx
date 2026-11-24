"use client";

import { useState, type ReactNode } from "react";
import VynRankSidebar from "@/components/vynrank/VynRankSidebar";
import VynRankTopbar from "@/components/vynrank/VynRankTopbar";

export default function VynRankShell({
  children,
  showMonth = true,
  contentClassName,
}: {
  /** @deprecated Figma topbar has no page title — kept for call-site compat */
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  showMonth?: boolean;
  contentClassName?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="vynrank-root vr-app">
      <div className="vynrank-desktop-sidebar">
        <VynRankSidebar />
      </div>

      {mobileOpen ? (
        <>
          <div className="vynrank-drawer-backdrop" onClick={() => setMobileOpen(false)} />
          <div className="vynrank-drawer">
            <VynRankSidebar onClose={() => setMobileOpen(false)} />
          </div>
        </>
      ) : null}

      <div className="vynrank-main">
        <VynRankTopbar showMonth={showMonth} onMenuClick={() => setMobileOpen(true)} />
        <main className={contentClassName || "vr-page"}>{children}</main>
      </div>
    </div>
  );
}
