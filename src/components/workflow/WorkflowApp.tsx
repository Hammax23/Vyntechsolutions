"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import VynTechLogo from "@/components/VynTechLogo";
import { heatmapTone, isWeekendKey, todayKey } from "@/lib/workflow-progress";
import { useWorkflowTheme, workflowUi } from "@/components/workflow/workflow-theme";
import { useLivePoll } from "@/hooks/useLivePoll";

type Staff = { id: string; name: string; email: string; role: string; color: string };
type WTask = {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done" | "blocked";
  priority: string;
  workDate: string;
  createdById: string;
  assignedToId: string;
  createdBy?: { id: string; name: string; color: string };
  assignedTo?: { id: string; name: string; color: string };
};

type Ui = ReturnType<typeof workflowUi>;

const STATUS_LABEL: Record<WTask["status"], string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
  blocked: "Blocked",
};

const COLUMNS: WTask["status"][] = ["todo", "in_progress", "done", "blocked"];

function statusChip(status: WTask["status"], isDark: boolean) {
  if (status === "todo") return isDark ? "bg-white/10 text-white/70" : "bg-slate-100 text-slate-600";
  if (status === "in_progress") return isDark ? "bg-sky-500/20 text-sky-300" : "bg-sky-100 text-sky-700";
  if (status === "done") return isDark ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-100 text-emerald-700";
  return isDark ? "bg-amber-500/20 text-amber-300" : "bg-amber-100 text-amber-800";
}

function priorityChip(priority: string, isDark: boolean) {
  const p = priority.toLowerCase();
  if (p === "high") {
    return isDark
      ? "bg-red-500/25 text-red-300 border-red-500/40"
      : "bg-red-100 text-red-700 border-red-300";
  }
  if (p === "low") {
    return isDark
      ? "bg-slate-500/25 text-slate-300 border-slate-500/40"
      : "bg-slate-100 text-slate-600 border-slate-300";
  }
  return isDark
    ? "bg-amber-500/25 text-amber-200 border-amber-500/40"
    : "bg-amber-100 text-amber-800 border-amber-300";
}

function cellClass(percent: number | null, isDark: boolean) {
  const tone = heatmapTone(percent);
  if (tone === "empty") return isDark ? "bg-white/[0.04] border-white/10" : "bg-slate-50 border-slate-200";
  if (tone === "zero") return isDark ? "bg-white/10 border-white/15" : "bg-slate-200 border-slate-300";
  if (tone === "low") return "bg-amber-400/40 border-amber-400/50";
  if (tone === "mid") return "bg-[#0055FF]/45 border-[#00B4FF]/50";
  return "bg-emerald-500/45 border-emerald-400/50";
}

function formatDay(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-CA", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function inboxKeep(t: WTask, userId: string) {
  return t.assignedToId === userId && t.createdById !== userId && t.status !== "done";
}

const TaskCard = memo(function TaskCard({
  t,
  showDate,
  user,
  staff,
  ui,
  isDark,
  onPatch,
  onRemove,
}: {
  t: WTask;
  showDate?: boolean;
  user: Staff;
  staff: Staff[];
  ui: Ui;
  isDark: boolean;
  onPatch: (id: string, body: Record<string, unknown>) => void;
  onRemove: (id: string) => void;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <div className={`${ui.card} border rounded-xl p-3 space-y-2 ${ui.cardHover} transition-colors`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug break-words min-w-0">{t.title}</p>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded ${statusChip(t.status, isDark)}`}>
            {STATUS_LABEL[t.status]}
          </span>
          <span
            className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md border ${priorityChip(t.priority, isDark)}`}
          >
            {t.priority || "medium"}
          </span>
        </div>
      </div>
      {t.description ? <p className={`${ui.muted} text-xs leading-relaxed line-clamp-3 break-words`}>{t.description}</p> : null}
      <div className={`flex flex-wrap items-center gap-2 text-[11px] ${ui.muted}`}>
        {showDate ? <span>{t.workDate}</span> : null}
        {t.createdBy && t.createdById !== user.id ? <span>from {t.createdBy.name}</span> : null}
        <button
          type="button"
          onClick={() => setDetailsOpen((v) => !v)}
          className="text-[10px] text-[#0055FF] hover:underline ml-auto"
        >
          {detailsOpen ? "Hide" : "Date / assign"}
        </button>
      </div>
      {detailsOpen ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className={`block ${ui.faint} text-[10px] mb-1`}>Work date</label>
            <input
              type="date"
              className={ui.input}
              value={t.workDate}
              onChange={(e) => {
                if (e.target.value) onPatch(t.id, { workDate: e.target.value });
              }}
            />
          </div>
          <div>
            <label className={`block ${ui.faint} text-[10px] mb-1`}>Assign to</label>
            <select className={ui.input} value={t.assignedToId} onChange={(e) => onPatch(t.id, { assignedToId: e.target.value })}>
              {(staff.length ? staff : [user]).map((s) => (
                <option key={s.id} value={s.id} className={ui.option}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <select
          className={`${ui.input} text-[11px] py-1.5 sm:hidden grow min-w-0`}
          value={t.status}
          aria-label="Status"
          onChange={(e) => onPatch(t.id, { status: e.target.value })}
        >
          {COLUMNS.map((s) => (
            <option key={s} value={s} className={ui.option}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <div className="hidden sm:flex flex-wrap gap-1.5">
          {COLUMNS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onPatch(t.id, { status: s })}
              className={`text-[10px] px-2 py-1 rounded-md transition ${
                t.status === s ? "bg-[#0055FF] text-white shadow-sm" : `${ui.btnGhost}`
              }`}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onRemove(t.id)}
          className="text-[10px] px-2 py-1 rounded-md text-red-500/80 hover:bg-red-500/10 ml-auto shrink-0"
        >
          Delete
        </button>
      </div>
    </div>
  );
});

export default function WorkflowApp({ user }: { user: Staff }) {
  const { isDark, toggle, ready: themeReady } = useWorkflowTheme();
  const ui = workflowUi(isDark);
  const titleRef = useRef<HTMLInputElement>(null);
  const [date, setDate] = useState(todayKey());
  const [tab, setTab] = useState<"board" | "inbox">("board");
  const [focusCol, setFocusCol] = useState<WTask["status"]>("todo");
  const [tasks, setTasks] = useState<WTask[]>([]);
  const [inbox, setInbox] = useState<WTask[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [monthDays, setMonthDays] = useState<Record<string, { percent: number | null; total: number }>>({});
  const [cursor, setCursor] = useState(() => {
    const [y, m] = todayKey().split("-").map(Number);
    return { year: y, month: m };
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    assignedToId: user.id,
  });
  const stampRef = useRef("");
  const dateRef = useRef(date);
  const cursorRef = useRef(cursor);
  const boardSeq = useRef(0);
  const calSeq = useRef(0);
  const knownInboxIds = useRef<Set<string> | null>(null);
  const tabRef = useRef(tab);
  dateRef.current = date;
  cursorRef.current = cursor;
  tabRef.current = tab;
  const [inboxPulse, setInboxPulse] = useState(false);
  const seenStorageKey = `vyntech-workflow-inbox-seen:${user.id}`;
  const [seenInboxIds, setSeenInboxIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = localStorage.getItem(`vyntech-workflow-inbox-seen:${user.id}`);
      if (!raw) return new Set();
      const arr = JSON.parse(raw) as string[];
      return new Set(Array.isArray(arr) ? arr : []);
    } catch {
      return new Set();
    }
  });

  const unreadCount = useMemo(
    () => inbox.filter((t) => !seenInboxIds.has(t.id)).length,
    [inbox, seenInboxIds]
  );

  const markInboxSeen = useCallback(
    (list: WTask[]) => {
      if (list.length === 0) return;
      setSeenInboxIds((prev) => {
        const next = new Set(prev);
        for (const t of list) next.add(t.id);
        try {
          localStorage.setItem(seenStorageKey, JSON.stringify([...next]));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [seenStorageKey]
  );

  const openInbox = useCallback(() => {
    setTab("inbox");
    setInboxPulse(false);
    markInboxSeen(inbox);
  }, [inbox, markInboxSeen]);

  const forceLogout = useCallback(async () => {
    try {
      await fetch("/api/workflow/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "logout" }),
      });
    } finally {
      window.location.reload();
    }
  }, []);

  const handleAuth = useCallback(
    async (res: Response) => {
      if (res.status === 401) {
        await forceLogout();
        return false;
      }
      return true;
    },
    [forceLogout]
  );

  const loadStaff = useCallback(async () => {
    const res = await fetch("/api/workflow/staff", { cache: "no-store" });
    if (!(await handleAuth(res))) return false;
    if (!res.ok) return false;
    const data = await res.json();
    setStaff(data.staff || []);
    return true;
  }, [handleAuth]);

  const loadBoard = useCallback(
    async (d: string) => {
      const seq = ++boardSeq.current;
      const res = await fetch(`/api/workflow/tasks?date=${encodeURIComponent(d)}`, { cache: "no-store" });
      if (!(await handleAuth(res))) return false;
      if (!res.ok) return false;
      const data = await res.json();
      if (seq !== boardSeq.current || d !== dateRef.current) return true;
      setTasks(data.tasks || []);
      return true;
    },
    [handleAuth]
  );

  const loadInbox = useCallback(async () => {
    const res = await fetch("/api/workflow/tasks?inbox=1", { cache: "no-store" });
    if (!(await handleAuth(res))) return false;
    if (!res.ok) return false;
    const data = await res.json();
    const next = (data.tasks || []) as WTask[];

    if (knownInboxIds.current === null) {
      knownInboxIds.current = new Set(next.map((t) => t.id));
    } else {
      const fresh = next.filter((t) => !knownInboxIds.current!.has(t.id));
      if (fresh.length > 0) {
        const first = fresh[0];
        const from = first.createdBy?.name || "teammate";
        setMessage(
          fresh.length === 1
            ? `New task from ${from}: “${first.title}”`
            : `${fresh.length} new tasks in Inbox (latest from ${from})`
        );
        if (tabRef.current !== "inbox") setInboxPulse(true);
      }
      knownInboxIds.current = new Set(next.map((t) => t.id));
    }

    setInbox(next);
    return true;
  }, [handleAuth]);

  const loadCalendar = useCallback(
    async (year: number, month: number) => {
      const seq = ++calSeq.current;
      const res = await fetch(`/api/workflow/calendar?year=${year}&month=${month}`, { cache: "no-store" });
      if (!(await handleAuth(res))) return false;
      if (!res.ok) return false;
      const data = await res.json();
      if (seq !== calSeq.current || year !== cursorRef.current.year || month !== cursorRef.current.month) return true;
      setMonthDays(data.days || {});
      return true;
    },
    [handleAuth]
  );

  const refreshAll = useCallback(async () => {
    const d = dateRef.current;
    const c = cursorRef.current;
    const results = await Promise.all([loadBoard(d), loadInbox(), loadCalendar(c.year, c.month), loadStaff()]);
    return results.every(Boolean);
  }, [loadBoard, loadInbox, loadCalendar, loadStaff]);

  const checkSync = useCallback(async () => {
    const res = await fetch("/api/workflow/sync", { cache: "no-store" });
    if (!(await handleAuth(res))) return;
    if (!res.ok) return;
    const data = await res.json();
    const next = String(data.stamp || "");
    if (!next || next === stampRef.current) return;
    const ok = await refreshAll();
    if (ok) stampRef.current = next;
  }, [handleAuth, refreshAll]);

  useLivePoll(checkSync, { intervalMs: 3000, enabled: true });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await refreshAll();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshAll]);

  useEffect(() => {
    void loadBoard(date);
    const [y, m] = date.split("-").map(Number);
    setCursor((c) => (c.year === y && c.month === m ? c : { year: y, month: m }));
  }, [date, loadBoard]);

  useEffect(() => {
    void loadCalendar(cursor.year, cursor.month);
  }, [cursor.year, cursor.month, loadCalendar]);

  useEffect(() => {
    if (tab === "inbox") {
      markInboxSeen(inbox);
      setInboxPulse(false);
    }
  }, [tab, inbox, markInboxSeen]);

  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(() => setMessage(""), 2800);
    return () => window.clearTimeout(t);
  }, [message]);

  const logout = async () => {
    await forceLogout();
  };

  const createTask = async () => {
    if (saving) return;
    if (!form.title.trim()) {
      setMessage("Task title is required");
      titleRef.current?.focus();
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/workflow/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, workDate: date }),
      });
      if (!(await handleAuth(res))) return;
      if (!res.ok) throw new Error();
      const data = await res.json();
      const task = data.task as WTask | undefined;
      if (task) {
        if (task.workDate === date && (task.assignedToId === user.id || task.createdById === user.id)) {
          setTasks((prev) => [task, ...prev.filter((x) => x.id !== task.id)]);
        }
        if (inboxKeep(task, user.id)) {
          setInbox((prev) => [task, ...prev.filter((x) => x.id !== task.id)]);
        }
      }
      setForm({ title: "", description: "", priority: "medium", assignedToId: user.id });
      const ok = await refreshAll();
      if (ok) stampRef.current = "";
      setMessage("Task created");
      titleRef.current?.focus();
    } catch {
      setMessage("Could not create task");
    } finally {
      setSaving(false);
    }
  };

  const patch = async (id: string, body: Record<string, unknown>) => {
    if (typeof body.status === "string" && COLUMNS.includes(body.status as WTask["status"])) {
      setFocusCol(body.status as WTask["status"]);
    }
    setTasks((prev) => prev.map((t) => (t.id === id ? ({ ...t, ...body } as WTask) : t)));
    setInbox((prev) =>
      prev
        .map((t) => (t.id === id ? ({ ...t, ...body } as WTask) : t))
        .filter((t) => inboxKeep(t, user.id))
    );
    const res = await fetch("/api/workflow/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    });
    if (!(await handleAuth(res))) return;
    const ok = await refreshAll();
    if (ok) stampRef.current = "";
    if (!res.ok) setMessage("Update failed, refreshed");
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    const prevTasks = tasks;
    const prevInbox = inbox;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setInbox((prev) => prev.filter((t) => t.id !== id));
    const res = await fetch(`/api/workflow/tasks?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!(await handleAuth(res))) return;
    if (!res.ok) {
      setTasks(prevTasks);
      setInbox(prevInbox);
      setMessage("Could not delete task");
      return;
    }
    const ok = await refreshAll();
    if (ok) stampRef.current = "";
  };

  const daysInMonth = new Date(cursor.year, cursor.month, 0).getDate();
  const firstDow = new Date(cursor.year, cursor.month - 1, 1).getDay();
  const cells = useMemo(() => {
    const list: (string | null)[] = [];
    for (let i = 0; i < firstDow; i++) list.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      list.push(`${cursor.year}-${String(cursor.month).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    }
    return list;
  }, [cursor.year, cursor.month, daysInMonth, firstDow]);

  const mine = useMemo(() => tasks.filter((t) => t.assignedToId === user.id), [tasks, user.id]);
  const created = useMemo(
    () => tasks.filter((t) => t.createdById === user.id && t.assignedToId !== user.id),
    [tasks, user.id]
  );
  const byColumn = useMemo(() => {
    const map: Record<WTask["status"], WTask[]> = {
      todo: [],
      in_progress: [],
      done: [],
      blocked: [],
    };
    for (const t of mine) {
      if (map[t.status]) map[t.status].push(t);
      else map.todo.push(t);
    }
    return map;
  }, [mine]);
  const done = byColumn.done.length;
  const percent = mine.length ? Math.round((done / mine.length) * 100) : null;

  if (!themeReady) {
    return (
      <div className={`min-h-screen flex items-center justify-center text-sm ${ui.page} ${ui.muted}`}>
        Loading…
      </div>
    );
  }

  return (
    <div className={`min-h-screen xl:h-screen xl:overflow-hidden flex flex-col transition-colors duration-300 ${ui.page}`}>
      <header className={`shrink-0 z-30 backdrop-blur-xl border-b px-5 lg:px-8 py-3 ${ui.header}`}>
        <div className="flex items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-4">
            <VynTechLogo className="scale-90 cursor-default" darkText={!isDark} />
            <div className="hidden sm:block">
              <p className="text-sm font-semibold">Daily Progress</p>
              <p className={`text-[11px] ${ui.muted}`}>Workflow, {user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`hidden sm:inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-full border ${
                isDark
                  ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10"
                  : "border-emerald-500/40 text-emerald-700 bg-emerald-50"
              }`}
              title="Live sync, new tasks appear automatically"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
            <span className={`hidden md:inline text-xs ${ui.muted}`}>{user.email}</span>
            <button
              type="button"
              onClick={toggle}
              title={isDark ? "Switch to light theme" : "Switch to dark theme"}
              className={`px-3 py-1.5 text-xs rounded-lg border transition ${ui.btnGhost}`}
            >
              {isDark ? "Light" : "Dark"}
            </button>
            <button onClick={logout} className={`px-3 py-1.5 text-xs rounded-lg border transition ${ui.btnGhost}`}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[minmax(240px,280px)_minmax(0,1fr)_minmax(260px,320px)] gap-3 sm:gap-4 p-3 sm:p-4 lg:p-5 xl:overflow-hidden overflow-y-auto">
        <aside className="min-h-0 flex flex-col gap-3 sm:gap-4 xl:overflow-y-auto order-2 xl:order-1">
          <div className={`${ui.card} border rounded-xl p-3 sm:p-4`}>
            <div className="flex items-center justify-between mb-3">
              <button
                className={`${ui.muted} hover:opacity-100 text-lg px-2 rounded-md ${ui.btnGhost}`}
                onClick={() =>
                  setCursor((c) => (c.month === 1 ? { year: c.year - 1, month: 12 } : { year: c.year, month: c.month - 1 }))
                }
              >
                ‹
              </button>
              <p className="text-sm font-medium">
                {new Date(cursor.year, cursor.month - 1, 1).toLocaleString("en-CA", { month: "long", year: "numeric" })}
              </p>
              <button
                className={`${ui.muted} text-lg px-2 rounded-md ${ui.btnGhost}`}
                onClick={() =>
                  setCursor((c) => (c.month === 12 ? { year: c.year + 1, month: 1 } : { year: c.year, month: c.month + 1 }))
                }
              >
                ›
              </button>
            </div>
            <div className={`grid grid-cols-7 gap-1 text-[10px] ${ui.faint} mb-1`}>
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <div key={i} className="text-center">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((key, i) =>
                key ? (
                  <button
                    key={key}
                    type="button"
                    title={formatDay(key)}
                    onClick={() => {
                      setDate(key);
                      setTab("board");
                    }}
                    className={`h-9 sm:h-10 rounded-md text-[11px] border ${cellClass(
                      monthDays[key]?.percent ?? null,
                      isDark
                    )} ${date === key ? "ring-2 ring-[#00B4FF]" : ""} ${isWeekendKey(key) ? "opacity-70" : ""}`}
                  >
                    {Number(key.slice(8))}
                    {monthDays[key]?.total ? (
                      <span className={`block text-[8px] leading-none ${ui.muted}`}>{monthDays[key].total}</span>
                    ) : null}
                  </button>
                ) : (
                  <div key={`e-${i}`} />
                )
              )}
            </div>
          </div>

          <div className="bg-[#0055FF]/12 border border-[#00B4FF]/25 rounded-xl p-3 sm:p-4 text-sm space-y-2">
            <p className={`text-xs uppercase tracking-wide ${ui.muted}`}>Selected day</p>
            <p className="font-semibold leading-snug text-sm sm:text-base">{formatDay(date)}</p>
            <div className={`h-2 rounded-full overflow-hidden ${ui.progress}`}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#0055FF] to-[#00B4FF] transition-all duration-500"
                style={{ width: `${percent ?? 0}%` }}
              />
            </div>
            <p className="text-[#0055FF] text-lg font-bold">{percent === null ? "No tasks yet" : `${percent}%`}</p>
            <p className={`text-xs ${ui.muted}`}>
              {done}/{mine.length} assigned complete
            </p>
          </div>
        </aside>

        <section className="min-h-0 min-w-0 flex flex-col gap-3 xl:overflow-hidden order-1 xl:order-2">
          {message ? (
            <div
              className={`shrink-0 rounded-lg px-3 py-2.5 text-sm border ${
                message.startsWith("New task") || message.includes("new tasks in Inbox")
                  ? isDark
                    ? "bg-[#0055FF]/20 border-[#00B4FF]/40 text-white"
                    : "bg-sky-50 border-sky-300 text-sky-900"
                  : `${ui.card} border`
              }`}
            >
              {message}
              {(message.startsWith("New task") || message.includes("new tasks in Inbox")) && tab !== "inbox" ? (
                <button
                  type="button"
                  className="ml-2 underline font-medium"
                  onClick={() => {
                    openInbox();
                  }}
                >
                  Open Inbox
                </button>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 items-center shrink-0 pt-0.5">
            <button
              onClick={() => setTab("board")}
              className={`px-3 py-2 text-sm rounded-lg transition ${tab === "board" ? "bg-[#0055FF] text-white shadow" : ui.navIdle}`}
            >
              Day board
            </button>
            <button
              onClick={openInbox}
              className={`relative px-3 py-2 text-sm rounded-lg transition ${
                tab === "inbox"
                  ? "bg-[#0055FF] text-white shadow"
                  : unreadCount > 0
                    ? `${ui.navIdle} border-2 border-[#00B4FF]`
                    : ui.navIdle
              }`}
            >
              Inbox
              {unreadCount > 0 ? (
                <span
                  className={`ml-1.5 inline-flex min-w-[1.25rem] justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    tab === "inbox" ? "bg-white/25 text-white" : "bg-[#0055FF] text-white animate-pulse"
                  }`}
                >
                  {unreadCount}
                </span>
              ) : null}
            </button>
            <button onClick={() => setDate(todayKey())} className={`ml-auto px-3 py-2 text-xs rounded-lg border transition ${ui.btnGhost}`}>
              Today
            </button>
          </div>

          {loading ? (
            <div className={`${ui.empty} border rounded-2xl flex-1 min-h-[240px] flex items-center justify-center ${ui.muted} text-sm`}>
              Loading board…
            </div>
          ) : tab === "inbox" ? (
            <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
              {inbox.length === 0 ? (
                <div className={`${ui.empty} border rounded-2xl h-full min-h-[280px] flex items-center justify-center ${ui.muted} text-sm`}>
                  Inbox is clear. Assigned work from admin/teammates will land here live.
                </div>
              ) : (
                inbox.map((t) => (
                  <div key={t.id} className="space-y-1">
                    <button
                      type="button"
                      className="text-[11px] text-[#0055FF] hover:underline"
                      onClick={() => {
                        setDate(t.workDate);
                        setTab("board");
                      }}
                    >
                      Open {formatDay(t.workDate)}
                    </button>
                    <TaskCard t={t} showDate user={user} staff={staff} ui={ui} isDark={isDark} onPatch={patch} onRemove={remove} />
                  </div>
                ))
              )}
            </div>
          ) : mine.length === 0 && created.length === 0 ? (
            <div className={`${ui.empty} border rounded-2xl flex-1 min-h-[220px] sm:min-h-[280px] flex flex-col items-center justify-center px-6 text-center space-y-3`}>
              <p className="font-medium text-lg">Nothing on this day yet</p>
              <p className={`text-sm ${ui.muted}`}>Add a task, or pick another date on the calendar.</p>
              <button
                type="button"
                onClick={() => titleRef.current?.focus()}
                className="inline-flex px-4 py-2 rounded-lg bg-gradient-to-r from-[#0055FF] to-[#00B4FF] text-white text-sm"
              >
                Create a task
              </button>
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col gap-3 xl:overflow-hidden">
              {/* Phone / tablet: one status list at a time */}
              <div className="xl:hidden flex flex-col gap-2 min-h-[min(420px,62vh)] max-h-[70vh]">
                <div className="flex gap-1 overflow-x-auto pb-1 shrink-0 -mx-0.5 px-0.5">
                  {COLUMNS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setFocusCol(col)}
                      className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition ${
                        focusCol === col ? "bg-[#0055FF] text-white" : ui.navIdle
                      }`}
                    >
                      {STATUS_LABEL[col]} ({byColumn[col].length})
                    </button>
                  ))}
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto space-y-2 overscroll-contain pr-0.5">
                  {byColumn[focusCol].length === 0 ? (
                    <p className={`text-xs ${ui.faint} py-10 text-center`}>No tasks in {STATUS_LABEL[focusCol].toLowerCase()}</p>
                  ) : (
                    byColumn[focusCol].map((t) => (
                      <TaskCard key={t.id} t={t} user={user} staff={staff} ui={ui} isDark={isDark} onPatch={patch} onRemove={remove} />
                    ))
                  )}
                </div>
              </div>

              {/* Desktop: 4 scrolling columns */}
              <div className="hidden xl:grid flex-1 min-h-0 grid-cols-4 gap-3">
                {COLUMNS.map((col) => {
                  const list = byColumn[col];
                  return (
                    <div key={col} className={`${ui.card} border rounded-xl p-3 min-h-0 flex flex-col`}>
                      <div className="flex items-center justify-between mb-2 shrink-0">
                        <h3 className={`text-[11px] uppercase tracking-wide ${ui.muted}`}>{STATUS_LABEL[col]}</h3>
                        <span className={`text-[11px] ${ui.faint}`}>{list.length}</span>
                      </div>
                      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 overscroll-contain pr-0.5">
                        {list.length === 0 ? (
                          <p className={`text-xs ${ui.faint} py-8 text-center`}>Empty</p>
                        ) : (
                          list.map((t) => (
                            <TaskCard key={t.id} t={t} user={user} staff={staff} ui={ui} isDark={isDark} onPatch={patch} onRemove={remove} />
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {created.length > 0 && (
                <div className="shrink-0 max-h-40 sm:max-h-48 overflow-y-auto overscroll-contain border-t border-transparent pt-1">
                  <h3 className={`text-xs uppercase tracking-wide ${ui.muted} mb-2`}>Assigned to others ({created.length})</h3>
                  <div className="space-y-2">
                    {created.map((t) => (
                      <TaskCard key={t.id} t={t} user={user} staff={staff} ui={ui} isDark={isDark} onPatch={patch} onRemove={remove} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <aside className={`${ui.card} border rounded-xl p-3 sm:p-4 space-y-3 min-h-0 xl:overflow-y-auto order-3`}>
          <h3 className="text-sm font-semibold">New task</h3>
          <input
            ref={titleRef}
            className={ui.input}
            placeholder="What needs to be done?"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void createTask();
              }
            }}
          />
          <textarea
            className={`${ui.input} min-h-[80px] resize-y`}
            placeholder="Notes (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div>
            <label className={`block ${ui.muted} text-xs mb-1`}>Work date</label>
            <input type="date" className={ui.input} value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />
          </div>
          <div>
            <label className={`block ${ui.muted} text-xs mb-1`}>Priority</label>
            <select className={ui.input} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="low" className={ui.option}>
                Low
              </option>
              <option value="medium" className={ui.option}>
                Medium
              </option>
              <option value="high" className={ui.option}>
                High
              </option>
            </select>
          </div>
          <div>
            <label className={`block ${ui.muted} text-xs mb-1`}>Assign to</label>
            <select className={ui.input} value={form.assignedToId} onChange={(e) => setForm({ ...form, assignedToId: e.target.value })}>
              {(staff.length ? staff : [user]).map((s) => (
                <option key={s.id} value={s.id} className={ui.option}>
                  {s.name}
                  {s.id === user.id ? " (me)" : ""}
                </option>
              ))}
            </select>
          </div>
          <p className={`text-[11px] ${ui.faint}`}>Saves on the selected calendar day. Assigned teammates see it in Inbox live.</p>
          <button
            type="button"
            disabled={saving}
            onClick={() => void createTask()}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#0055FF] to-[#00B4FF] text-white text-sm font-medium disabled:opacity-50 hover:opacity-95 hover:shadow-lg hover:shadow-blue-500/20 transition"
          >
            {saving ? "Saving…" : "Create task"}
          </button>
        </aside>
      </div>
    </div>
  );
}
