"use client";

import { useCallback, useEffect, useState } from "react";

type Assistant = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  isOnline?: boolean;
  lastSeenAt?: string | null;
  lastLoginAt?: string | null;
  createdAt?: string;
};

type SessionRow = {
  id: string;
  loginAt: string;
  lastSeenAt: string;
  logoutAt: string | null;
  endedReason: string | null;
  durationMinutes: number;
  ip: string | null;
  isOnline: boolean;
};

export default function VirtualAssistantsSection() {
  const [list, setList] = useState<Assistant[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [isOnline, setIsOnline] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/virtual-assistants", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setList(data.assistants || []);
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    const res = await fetch(`/api/admin/virtual-assistants?id=${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    if (!res.ok) return;
    const data = await res.json();
    setIsOnline(Boolean(data.activity?.isOnline));
    setTodayMinutes(Number(data.activity?.todayMinutes) || 0);
    setSessions(data.activity?.sessions || []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!selectedId) return;
    void loadDetail(selectedId);
    const t = setInterval(() => void loadDetail(selectedId), 30_000);
    return () => clearInterval(t);
  }, [selectedId, loadDetail]);

  const create = async () => {
    setBusy(true);
    setMessage("");
    setTempPassword(null);
    try {
      const res = await fetch("/api/admin/virtual-assistants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Create failed");
      setTempPassword(data.temporaryPassword || null);
      setForm({ name: "", email: "", password: "" });
      setMessage("Virtual Assistant created — copy the password now");
      await load();
      if (data.assistant?.id) setSelectedId(data.assistant.id);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Create failed");
    } finally {
      setBusy(false);
    }
  };

  const patch = async (id: string, body: Record<string, unknown>) => {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/virtual-assistants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Update failed");
      if (data.temporaryPassword) {
        setTempPassword(data.temporaryPassword);
        setMessage("Password reset — copy the new password now");
      } else {
        setMessage("Updated");
      }
      await load();
      if (selectedId === id) await loadDetail(id);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {message ? (
        <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
          {message}
        </div>
      ) : null}
      {tempPassword ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          One-time password:{" "}
          <code className="font-mono text-amber-50 select-all">{tempPassword}</code>
          <button
            type="button"
            className="ml-3 text-xs underline"
            onClick={() => void navigator.clipboard.writeText(tempPassword)}
          >
            Copy
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
          <h3 className="text-white font-semibold text-sm">Create Virtual Assistant</h3>
          <p className="text-white/45 text-xs">
            They can log in at /admin with 2FA. Access: Quote Requests, Project Manager, Client
            Invoices only.
          </p>
          <input
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <input
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
            placeholder="Email (receives 2FA)"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <input
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
            placeholder="Password (optional — auto-generated if empty)"
            type="text"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => void create()}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[#0055FF] text-white disabled:opacity-50"
          >
            Create VA account
          </button>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
          <h3 className="text-white font-semibold text-sm">Accounts</h3>
          {list.length === 0 ? (
            <p className="text-white/40 text-sm">No virtual assistants yet.</p>
          ) : (
            <ul className="space-y-2 max-h-72 overflow-y-auto">
              {list.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(a.id)}
                    className={`w-full text-left rounded-lg border px-3 py-2 ${
                      selectedId === a.id
                        ? "border-[#00B4FF]/50 bg-[#0055FF]/10"
                        : "border-white/10 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-white text-sm font-medium">{a.name}</span>
                      <span
                        className={`text-[10px] uppercase tracking-wide ${
                          a.isOnline ? "text-emerald-400" : "text-white/35"
                        }`}
                      >
                        {a.isOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                    <p className="text-white/45 text-xs mt-0.5">{a.email}</p>
                    {!a.isActive ? (
                      <p className="text-amber-300/80 text-[11px] mt-1">Disabled</p>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {selectedId ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-white font-semibold text-sm">Activity</h3>
              <p className="text-white/45 text-xs mt-0.5">
                {isOnline ? "Currently online" : "Offline"} · Today ~{todayMinutes} min
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                className="px-3 py-1.5 text-xs rounded-md border border-white/15 text-white/80 hover:bg-white/5"
                onClick={() => void patch(selectedId, { resetPassword: true })}
              >
                Reset password
              </button>
              <button
                type="button"
                disabled={busy}
                className="px-3 py-1.5 text-xs rounded-md border border-amber-500/30 text-amber-200 hover:bg-amber-500/10"
                onClick={() => {
                  const a = list.find((x) => x.id === selectedId);
                  void patch(selectedId, { isActive: !a?.isActive });
                }}
              >
                {list.find((x) => x.id === selectedId)?.isActive ? "Disable" : "Enable"}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-white/40 uppercase tracking-wide">
                <tr>
                  <th className="py-2 pr-3">Login</th>
                  <th className="py-2 pr-3">Last seen</th>
                  <th className="py-2 pr-3">Duration</th>
                  <th className="py-2 pr-3">IP</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-t border-white/5 text-white/70">
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {new Date(s.loginAt).toLocaleString()}
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {new Date(s.lastSeenAt).toLocaleString()}
                    </td>
                    <td className="py-2 pr-3">{s.durationMinutes} min</td>
                    <td className="py-2 pr-3 font-mono">{s.ip || "—"}</td>
                    <td className="py-2">
                      {s.isOnline
                        ? "Online"
                        : s.endedReason || (s.logoutAt ? "Ended" : "Away")}
                    </td>
                  </tr>
                ))}
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-white/40">
                      No sessions yet
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
