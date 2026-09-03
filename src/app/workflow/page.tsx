"use client";

import { useEffect, useState } from "react";
import VynTechLogo from "@/components/VynTechLogo";
import WorkflowApp from "@/components/workflow/WorkflowApp";
import { useWorkflowTheme, workflowUi } from "@/components/workflow/workflow-theme";

type Staff = { id: string; name: string; email: string; role: string; color: string };

export default function WorkflowPage() {
  const { isDark, toggle, ready: themeReady } = useWorkflowTheme();
  const ui = workflowUi(isDark);
  const [user, setUser] = useState<Staff | null>(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/workflow/auth")
      .then((r) => r.json())
      .then((d) => {
        setUser(d.user || null);
        setReady(true);
      })
      .catch(() => setReady(true));
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/workflow/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "login", email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      setUser(data.user);
    } catch {
      setError("Login failed");
    } finally {
      setBusy(false);
    }
  };

  if (!ready || !themeReady) {
    return (
      <div className={`min-h-screen flex items-center justify-center text-sm ${ui.page} ${ui.muted}`}>
        Loading workflow…
      </div>
    );
  }

  if (user) return <WorkflowApp user={user} />;

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 transition-colors ${ui.page}`}>
      <button
        type="button"
        onClick={toggle}
        className={`absolute top-5 right-5 px-3 py-1.5 text-xs rounded-lg border ${ui.btnGhost}`}
      >
        {isDark ? "Light" : "Dark"}
      </button>
      <div className={`w-full max-w-md ${ui.card} border rounded-2xl p-8 shadow-2xl`}>
        <div className="flex justify-center mb-6">
          <VynTechLogo className="cursor-default" darkText={!isDark} />
        </div>
        <h1 className="text-xl font-semibold text-center mb-1">Daily Progress</h1>
        <p className={`${ui.muted} text-sm text-center mb-6`}>Sign in with the account your admin created</p>
        <form onSubmit={login} className="space-y-4">
          <div>
            <label className={`block ${ui.muted} text-xs mb-1.5`}>Work email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={ui.input}
            />
          </div>
          <div>
            <label className={`block ${ui.muted} text-xs mb-1.5`}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={ui.input}
            />
          </div>
          {error ? <p className="text-red-500 text-sm">{error}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#0055FF] to-[#00B4FF] text-white text-sm font-medium disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
