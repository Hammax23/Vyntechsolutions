"use client";

import VynRankShell from "@/components/vynrank/VynRankShell";

export default function PagePlaceholder({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <VynRankShell>
      <div className="vr-cc-head" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="vr-cc-title">{title}</h1>
          {subtitle ? <p className="vr-cc-sub">{subtitle}</p> : null}
        </div>
      </div>
      <div className="vr-panel" style={{ padding: 28 }}>
        {children || (
          <p style={{ margin: 0, color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>
            This screen is being rebuilt to match Figma exactly.
          </p>
        )}
      </div>
    </VynRankShell>
  );
}
