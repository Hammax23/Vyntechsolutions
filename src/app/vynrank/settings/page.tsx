"use client";

import VynRankShell from "@/components/vynrank/VynRankShell";
import { useVynRankAuth } from "@/components/vynrank/VynRankAuthContext";

const ROLES = [
  {
    key: "ceo",
    label: "CEO",
    detail: "Sees everything · billing · settings · offboarding",
  },
  {
    key: "seo_team",
    label: "SEO Team",
    detail: "Assigned projects · Tasks & QA · My Day · reports",
  },
  {
    key: "client",
    label: "Client",
    detail: "Portal only · their project · reports · ratings",
  },
] as const;

export default function Page() {
  const { user, roleLabel } = useVynRankAuth();
  return (
    <VynRankShell showMonth={false}>
      <div className="vr-cc-head">
        <div>
          <h1 className="vr-cc-title">Settings</h1>
          <p className="vr-cc-sub">Roles, offboarding and workspace preferences</p>
        </div>
      </div>

      <div className="vr-panel" style={{ padding: 20, marginBottom: 16 }}>
        <div className="vr-panel-title" style={{ marginBottom: 8 }}>
          Signed in
        </div>
        <p className="vr-cc-sub" style={{ margin: 0 }}>
          {user?.name} · {user?.email} · {roleLabel}
        </p>
      </div>

      <div className="vr-panel" style={{ marginBottom: 16 }}>
        <div className="vr-panel-head">
          <span className="vr-panel-title">Roles</span>
          <span className="vr-panel-sub">Exactly three roles in this product</span>
        </div>
        <div className="vr-login-proto-grid" style={{ padding: 18 }}>
          {ROLES.map((r) => (
            <div
              key={r.key}
              className="vr-login-role"
              style={{
                borderColor: user?.role === r.key ? "#4f46e5" : "#e4e7ef",
                background: user?.role === r.key ? "#eef0ff" : "#fff",
                cursor: "default",
                height: "auto",
                minHeight: 64,
              }}
            >
              <span className="vr-login-role-title">{r.label}</span>
              <span className="vr-login-role-detail">{r.detail}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="vr-panel">
        <div className="vr-panel-head">
          <span className="vr-panel-title">Offboarding</span>
          <span className="vr-panel-sub">CEO only</span>
        </div>
        <div style={{ padding: 18 }}>
          <p className="vr-cc-sub" style={{ marginTop: 0 }}>
            Archive a client project, revoke portal access, and keep reports read-only for 90 days.
          </p>
          <button type="button" className="vr-btn vr-btn-ghost">
            Start offboarding…
          </button>
        </div>
      </div>
    </VynRankShell>
  );
}
