"use client";

import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

const DEMO_PASSWORD = "VynRank!2026";

/** Actual product roles (CEO / SEO Team / Client) with seed credentials */
const PROTOTYPE_ROLES = [
  {
    key: "ceo",
    label: "CEO",
    detail: "Alex · sees everything",
    email: "ceo@vynrank.local",
    password: DEMO_PASSWORD,
  },
  {
    key: "seo_team",
    label: "SEO Team",
    detail: "Jordan · QA and reports",
    email: "seo@vynrank.local",
    password: DEMO_PASSWORD,
  },
  {
    key: "seo_team_2",
    label: "SEO Team",
    detail: "Sam · My Day",
    email: "seo2@vynrank.local",
    password: DEMO_PASSWORD,
  },
  {
    key: "client",
    label: "Client",
    detail: "Taylor · portal",
    email: "client@vynrank.local",
    password: DEMO_PASSWORD,
  },
] as const;

function LoginForm() {
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleHint, setGoogleHint] = useState(false);

  function goAfterAuth(data: { defaultPath?: string }) {
    const next = search.get("next");
    const dest =
      next && next.startsWith("/vynrank") ? next : String(data.defaultPath || "/vynrank");
    // Full navigation so AuthProvider remounts with the new session cookie
    window.location.assign(dest);
  }

  async function loginWithEmail(targetEmail: string, action: "demo" | "magic") {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/vynrank/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, email: targetEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(String(data.error || "Sign-in failed"));
        return;
      }
      goAfterAuth(data);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onMagicSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Enter your work email.");
      return;
    }
    await loginWithEmail(email.trim(), "magic");
  }

  return (
    <div className="vr-login">
      <aside className="vr-login-brand" aria-label="Vyntech SEO Desk">
        <div className="vr-login-brand-top">
          <div className="vr-login-mark" aria-hidden>
            V
          </div>
          <div>
            <div className="vr-login-brand-title">Vyntech SEO Desk</div>
            <div className="vr-login-brand-sub">Internal workspace</div>
          </div>
        </div>
        <h1 className="vr-login-headline">
          Every project on one lifecycle. Every task verified.
        </h1>
        <p className="vr-login-stats">52 projects · 10 people · last data sync 06:00</p>
      </aside>

      <section className="vr-login-panel">
        <div className="vr-login-card">
          <h2 className="vr-login-card-title">Sign in</h2>
          <p className="vr-login-card-sub">Use your Vyntech Google account.</p>

          <button
            type="button"
            className="vr-login-google"
            disabled={loading}
            onClick={() => setGoogleHint(true)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/vynrank/google-globe.svg" alt="" width={18} height={18} />
            Continue with Google
          </button>
          {googleHint ? (
            <p className="vr-login-hint">
              Google OAuth connects in Phase 3. Use a prototype role or work email below.
            </p>
          ) : null}

          <div className="vr-login-or" aria-hidden>
            <span />
            <em>or</em>
            <span />
          </div>

          <form onSubmit={onMagicSubmit} className="vr-login-form">
            <label className="vr-login-label" htmlFor="vr-work-email">
              Work email
            </label>
            <input
              id="vr-work-email"
              className="vr-login-input"
              type="email"
              autoComplete="username"
              placeholder="name@vyntech.pk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="vr-login-primary" disabled={loading}>
              {loading ? "Signing in…" : "Email me a sign-in link"}
            </button>
          </form>

          {error ? <div className="vr-login-error">{error}</div> : null}

          <div className="vr-login-proto">
            <div className="vr-login-proto-label">Prototype: open as</div>
            <div className="vr-login-proto-grid">
              {PROTOTYPE_ROLES.map((role) => (
                <button
                  key={role.key}
                  type="button"
                  className="vr-login-role"
                  disabled={loading}
                  onClick={() => void loginWithEmail(role.email, "demo")}
                >
                  <span className="vr-login-role-title">{role.label}</span>
                  <span className="vr-login-role-detail">{role.detail}</span>
                  <span className="vr-login-role-creds">
                    {role.email}
                    <br />
                    {role.password}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function VynRankLoginPage() {
  return (
    <div className="vynrank-root vr-login-root">
      <Suspense
        fallback={
          <div className="vr-login-panel" style={{ minHeight: "100vh" }}>
            <div className="vr-login-card" style={{ padding: 32 }}>
              Loading…
            </div>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
