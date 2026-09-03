"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { heatmapTone, isWeekendKey, todayKey } from "@/lib/workflow-progress";
import { useLivePoll } from "@/hooks/useLivePoll";

type StaffRow = { id: string; name: string; email: string; color: string; role: string };
type Score = { total: number; done: number; percent: number | null };
type Task = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdBy?: { name: string };
};

function cellClass(percent: number | null) {
  const tone = heatmapTone(percent);
  if (tone === "empty") return "bg-white/[0.04]";
  if (tone === "zero") return "bg-white/15";
  if (tone === "low") return "bg-amber-500/45";
  if (tone === "mid") return "bg-[#0055FF]/55";
  return "bg-emerald-500/55";
}

const STATUS_LABEL: Record<string, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
  blocked: "Blocked",
};

function statusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "done") return "bg-emerald-100 text-emerald-800 border-emerald-300";
  if (s === "in_progress") return "bg-sky-100 text-sky-800 border-sky-300";
  if (s === "blocked") return "bg-amber-100 text-amber-900 border-amber-300";
  return "bg-slate-200 text-slate-800 border-slate-300";
}

function priorityBadge(priority: string) {
  const p = (priority || "medium").toLowerCase();
  if (p === "high") return "bg-red-100 text-red-800 border-red-300";
  if (p === "low") return "bg-slate-100 text-slate-700 border-slate-300";
  return "bg-amber-100 text-amber-900 border-amber-300";
}

function statusDot(status: string) {
  if (status === "done") return "bg-emerald-600";
  if (status === "in_progress") return "bg-sky-600 animate-pulse";
  if (status === "blocked") return "bg-amber-600";
  return "bg-slate-600";
}

export default function TeamProgressSection() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [staffList, setStaffList] = useState<
    { id: string; name: string; email: string; role: string; isActive: boolean; color: string }[]
  >([]);
  const [overview, setOverview] = useState<{
    daysInMonth: number;
    staff: StaffRow[];
    grid: Record<string, Record<string, Score>>;
    todayStrip: (StaffRow & Score & { idle: boolean })[];
    teamToday: Score;
  } | null>(null);
  const [selected, setSelected] = useState<{ staffId: string; date: string; name: string } | null>(null);
  const [dayTasks, setDayTasks] = useState<Task[]>([]);
  const [toast, setToast] = useState<{ text: string; kind: "success" | "error" | "info" } | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [resetId, setResetId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    assignedToId: "",
    workDate: todayKey(),
    priority: "medium",
  });
  const [reportMode, setReportMode] = useState<"day" | "range" | "month">("month");
  const [reportStaffId, setReportStaffId] = useState("");
  const [reportDate, setReportDate] = useState(todayKey());
  const [reportFrom, setReportFrom] = useState(todayKey());
  const [reportTo, setReportTo] = useState(todayKey());
  const [exporting, setExporting] = useState(false);
  const [purgeOpen, setPurgeOpen] = useState(false);
  const [purgeUnlocked, setPurgeUnlocked] = useState(false);
  const [purgeMode, setPurgeMode] = useState<"day" | "range" | "month">("month");
  const [purgeStaffId, setPurgeStaffId] = useState("");
  const [purgeDate, setPurgeDate] = useState(todayKey());
  const [purgeFrom, setPurgeFrom] = useState(todayKey());
  const [purgeTo, setPurgeTo] = useState(todayKey());
  const [purgeConfirmText, setPurgeConfirmText] = useState("");
  const [purging, setPurging] = useState(false);
  const stampRef = useRef("");
  const yearRef = useRef(year);
  const monthRef = useRef(month);
  const selectedRef = useRef(selected);
  const overviewSeq = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  yearRef.current = year;
  monthRef.current = month;
  selectedRef.current = selected;

  const showToast = useCallback((text: string, kind: "success" | "error" | "info" = "info") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ text, kind });
    toastTimer.current = setTimeout(() => setToast(null), kind === "error" ? 5500 : 3200);
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    []
  );

  const loadStaff = useCallback(async () => {
    const res = await fetch("/api/admin/staff", { cache: "no-store" });
    if (!res.ok) return false;
    const data = await res.json();
    setStaffList(data.staff || []);
    return true;
  }, []);

  const loadOverview = useCallback(async (y = yearRef.current, m = monthRef.current) => {
    const seq = ++overviewSeq.current;
    const res = await fetch(`/api/admin/workflow/overview?year=${y}&month=${m}`, { cache: "no-store" });
    if (!res.ok) return false;
    const data = await res.json();
    if (seq !== overviewSeq.current || y !== yearRef.current || m !== monthRef.current) return true;
    setOverview(data);
    return true;
  }, []);

  const loadDayTasks = useCallback(async (staffId: string, date: string) => {
    const res = await fetch(`/api/admin/workflow/tasks?staffId=${staffId}&date=${date}`, { cache: "no-store" });
    if (!res.ok) return false;
    const data = await res.json();
    const sel = selectedRef.current;
    if (sel && (sel.staffId !== staffId || sel.date !== date)) return true;
    setDayTasks(data.tasks || []);
    return true;
  }, []);

  const refreshLive = useCallback(async () => {
    const results = await Promise.all([loadStaff(), loadOverview()]);
    const sel = selectedRef.current;
    if (sel) results.push(await loadDayTasks(sel.staffId, sel.date));
    return results.every(Boolean);
  }, [loadStaff, loadOverview, loadDayTasks]);

  const checkSync = useCallback(async () => {
    const res = await fetch("/api/admin/workflow/sync", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    const next = String(data.stamp || "");
    if (!next || next === stampRef.current) return;
    const ok = await refreshLive();
    if (ok) stampRef.current = next;
  }, [refreshLive]);

  useLivePoll(checkSync, { intervalMs: 3000, enabled: true });

  useEffect(() => {
    void loadStaff();
  }, [loadStaff]);

  useEffect(() => {
    void loadOverview(year, month);
  }, [year, month, loadOverview]);

  const activeStaff = useMemo(() => staffList.filter((s) => s.isActive), [staffList]);

  useEffect(() => {
    if (!taskForm.assignedToId && activeStaff.length === 1) {
      setTaskForm((prev) => ({ ...prev, assignedToId: activeStaff[0].id }));
    }
    if (!reportStaffId && activeStaff.length === 1) {
      setReportStaffId(activeStaff[0].id);
    }
  }, [activeStaff, taskForm.assignedToId, reportStaffId]);

  const buildPeriodPayload = (
    source: "report" | "purge",
    override?: {
      mode?: "day" | "range" | "month";
      staffId?: string;
      date?: string;
      from?: string;
      to?: string;
      year?: number;
      month?: number;
    }
  ) => {
    const mode = override?.mode || (source === "purge" ? purgeMode : reportMode);
    const staffId = override?.staffId || (source === "purge" ? purgeStaffId : reportStaffId);
    const payload: Record<string, unknown> = { staffId, mode };
    if (mode === "day") {
      payload.date = override?.date || (source === "purge" ? purgeDate : reportDate);
    } else if (mode === "range") {
      payload.from = override?.from || (source === "purge" ? purgeFrom : reportFrom);
      payload.to = override?.to || (source === "purge" ? purgeTo : reportTo);
    } else {
      payload.year = override?.year ?? year;
      payload.month = override?.month ?? month;
    }
    return { staffId, payload };
  };

  const exportProgressPdf = async (override?: {
    mode?: "day" | "range" | "month";
    staffId?: string;
    date?: string;
    from?: string;
    to?: string;
    year?: number;
    month?: number;
  }) => {
    const { staffId, payload } = buildPeriodPayload("report", override);
    if (!staffId) {
      showToast("Select an employee for the report", "error");
      return;
    }

    setExporting(true);
    try {
      const res = await fetch("/api/admin/workflow/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Export failed");
      }
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition") || "";
      const match = cd.match(/filename="([^"]+)"/);
      const filename = match?.[1] || "VynTech-Progress-Report.pdf";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Progress report PDF downloaded", "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Export failed", "error");
    } finally {
      setExporting(false);
    }
  };

  const purgeProgress = async () => {
    if (!purgeUnlocked) {
      showToast("Unlock the danger zone first", "error");
      return;
    }
    const { staffId, payload } = buildPeriodPayload("purge");
    if (!staffId) {
      showToast("Select an employee to delete tasks", "error");
      return;
    }
    if (purgeConfirmText.trim().toUpperCase() !== "DELETE") {
      showToast('Type DELETE in the confirmation box to proceed', "error");
      return;
    }

    setPurging(true);
    try {
      const previewRes = await fetch("/api/admin/workflow/purge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, dryRun: true }),
      });
      const preview = await previewRes.json().catch(() => ({}));
      if (!previewRes.ok) throw new Error(preview.error || "Could not preview delete");

      const count = Number(preview.count || 0);
      const who = preview.employee?.name || "employee";
      const period = preview.periodLabel || "selected period";

      if (count === 0) {
        showToast(`No tasks to delete for ${who} (${period})`, "info");
        return;
      }

      const ok = window.confirm(
        `Final confirmation\n\nDelete ${count} task${count === 1 ? "" : "s"} for ${who}?\n${period}\n\nThis permanently removes records from the database and cannot be undone.`
      );
      if (!ok) return;

      const res = await fetch("/api/admin/workflow/purge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, confirm: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Delete failed");

      const deleted = Number(data.deleted || 0);
      showToast(`Deleted ${deleted} task${deleted === 1 ? "" : "s"} from database`, "success");
      setPurgeConfirmText("");
      setPurgeUnlocked(false);

      const liveOk = await refreshLive();
      if (liveOk) stampRef.current = "";

      const sel = selectedRef.current;
      if (sel && sel.staffId === staffId) {
        await loadDayTasks(sel.staffId, sel.date);
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Delete failed", "error");
    } finally {
      setPurging(false);
    }
  };

  const openDay = async (staffId: string, date: string, name: string) => {
    setSelected({ staffId, date, name });
    setTaskForm((prev) => ({ ...prev, assignedToId: staffId, workDate: date }));
    setReportStaffId(staffId);
    setReportDate(date);
    setReportMode("day");
    await loadDayTasks(staffId, date);
  };

  const assignTask = async () => {
    if (!taskForm.title.trim()) {
      showToast("Task title required", "error");
      return;
    }
    if (!taskForm.assignedToId) {
      showToast("Select an employee", "error");
      return;
    }
    setAssigning(true);
    try {
      const res = await fetch("/api/admin/workflow/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to assign");
      const who = activeStaff.find((s) => s.id === taskForm.assignedToId)?.name || "employee";
      showToast(`Assigned “${taskForm.title.trim()}” to ${who}`, "success");
      setTaskForm((prev) => ({ ...prev, title: "", description: "" }));
      const ok = await refreshLive();
      if (ok) stampRef.current = "";
      const sel = selectedRef.current;
      if (sel && sel.staffId === taskForm.assignedToId && sel.date === taskForm.workDate) {
        await loadDayTasks(sel.staffId, sel.date);
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to assign", "error");
    } finally {
      setAssigning(false);
    }
  };

  const createStaff = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role: "employee" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setForm({ name: "", email: "", password: "" });
      setShowCreatePassword(false);
      showToast("Employee created, they can sign in at /workflow", "success");
      const ok = await refreshLive();
      if (ok) stampRef.current = "";
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const resetStaffPassword = async () => {
    if (!resetId || resetPassword.length < 6) {
      showToast("New password must be 6+ characters", "error");
      return;
    }
    const res = await fetch("/api/admin/staff", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: resetId, password: resetPassword }),
    });
    if (res.ok) {
      showToast("Password updated", "success");
      setResetId(null);
      setResetPassword("");
    } else {
      showToast("Password update failed", "error");
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    const res = await fetch("/api/admin/staff", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive }),
    });
    if (!res.ok) {
      showToast("Could not update employee status", "error");
      return;
    }
    const ok = await refreshLive();
    if (ok) stampRef.current = "";
  };

  const days = overview?.daysInMonth || new Date(year, month, 0).getDate();
  const dayKeys = useMemo(
    () => Array.from({ length: days }, (_, i) => `${year}-${String(month).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`),
    [year, month, days]
  );

  const input =
    "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 outline-none focus:border-[#00B4FF]/50";

  const shiftMonth = (delta: number) => {
    const d = new Date(year, month - 1 + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
    setSelected(null);
  };

  return (
    <div className="space-y-6 relative">
      {toast ? (
        <div
          role="status"
          className={`admin-toast fixed top-20 right-4 z-[80] w-[min(100%-2rem,22rem)] rounded-xl border overflow-hidden ${
            toast.kind === "success"
              ? "admin-toast--success"
              : toast.kind === "error"
                ? "admin-toast--error"
                : "admin-toast--info"
          }`}
        >
          <div className="flex items-start gap-3 px-4 py-3.5">
            <span className="admin-toast__icon mt-0.5 shrink-0" aria-hidden>
              {toast.kind === "success" ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : toast.kind === "error" ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              )}
            </span>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="admin-toast__label text-[10px] font-semibold uppercase tracking-wider mb-0.5">
                {toast.kind === "success" ? "Success" : toast.kind === "error" ? "Error" : "Notice"}
              </p>
              <p className="admin-toast__text text-sm leading-snug break-words">{toast.text}</p>
            </div>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => {
                if (toastTimer.current) clearTimeout(toastTimer.current);
                setToast(null);
              }}
              className="admin-toast__close shrink-0 rounded-md p-1 -mr-1 -mt-0.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="admin-toast__progress" />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border border-emerald-500/40 text-emerald-700 bg-emerald-50 admin-live-pill">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live updates
        </span>
      </div>

      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-3">
        <div>
          <h3 className="text-white font-semibold text-sm">Assign task</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="md:col-span-2 xl:col-span-2">
            <label className="block text-white/40 text-[11px] mb-1">Task</label>
            <input
              className={input}
              placeholder="What needs to be done?"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  assignTask();
                }
              }}
            />
          </div>
          <div>
            <label className="block text-white/40 text-[11px] mb-1">Assign to</label>
            <select
              className={input}
              value={taskForm.assignedToId}
              onChange={(e) => setTaskForm({ ...taskForm, assignedToId: e.target.value })}
            >
              <option value="" className="bg-[#0a0a1a]">
                Select employee…
              </option>
              {activeStaff.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#0a0a1a]">
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-white/40 text-[11px] mb-1">Work date</label>
            <input
              className={input}
              type="date"
              value={taskForm.workDate}
              onChange={(e) => setTaskForm({ ...taskForm, workDate: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="block text-white/40 text-[11px] mb-1">Notes (optional)</label>
            <input
              className={input}
              placeholder="Context for the employee"
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-white/40 text-[11px] mb-1">Priority</label>
            <select
              className={input}
              value={taskForm.priority}
              onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
            >
              <option value="low" className="bg-[#0a0a1a]">
                Low
              </option>
              <option value="medium" className="bg-[#0a0a1a]">
                Medium
              </option>
              <option value="high" className="bg-[#0a0a1a]">
                High
              </option>
            </select>
          </div>
        </div>
        <button
          type="button"
          disabled={assigning || activeStaff.length === 0}
          onClick={assignTask}
          className="px-4 py-2 rounded-lg bg-[#0055FF] text-white text-sm disabled:opacity-50"
        >
          {assigning ? "Assigning…" : "Assign task"}
        </button>
        {activeStaff.length === 0 ? (
          <p className="text-amber-300/80 text-xs">Pehle niche se employee account banao.</p>
        ) : null}
      </div>

      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-3">
        <div>
          <h3 className="text-white font-semibold text-sm">Export progress report</h3>
          <p className="text-white/35 text-xs mt-0.5">
            Download a professional PDF with KPIs, daily completion, and task register
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { id: "month" as const, label: "Full month" },
              { id: "day" as const, label: "Selected day" },
              { id: "range" as const, label: "Date range" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setReportMode(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                reportMode === opt.id ? "bg-[#0055FF] text-white" : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="md:col-span-2 xl:col-span-2">
            <label className="block text-white/40 text-[11px] mb-1">Employee</label>
            <select
              className={input}
              value={reportStaffId}
              onChange={(e) => setReportStaffId(e.target.value)}
            >
              <option value="" className="bg-[#0a0a1a]">
                Select employee…
              </option>
              {activeStaff.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#0a0a1a]">
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {reportMode === "month" ? (
            <div className="md:col-span-2 xl:col-span-2 flex items-end">
              <p className="text-sm text-white/70 pb-2">
                Uses calendar month:{" "}
                <span className="text-white font-medium">
                  {new Date(year, month - 1, 1).toLocaleString("en-CA", { month: "long", year: "numeric" })}
                </span>
              </p>
            </div>
          ) : null}

          {reportMode === "day" ? (
            <div>
              <label className="block text-white/40 text-[11px] mb-1">Date</label>
              <input
                className={input}
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
              />
            </div>
          ) : null}

          {reportMode === "range" ? (
            <>
              <div>
                <label className="block text-white/40 text-[11px] mb-1">From</label>
                <input
                  className={input}
                  type="date"
                  value={reportFrom}
                  onChange={(e) => setReportFrom(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-white/40 text-[11px] mb-1">To</label>
                <input
                  className={input}
                  type="date"
                  value={reportTo}
                  onChange={(e) => setReportTo(e.target.value)}
                />
              </div>
            </>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={exporting || activeStaff.length === 0}
            onClick={() => void exportProgressPdf()}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#0055FF] to-[#00B4FF] text-white text-sm font-medium disabled:opacity-50"
          >
            {exporting ? "Generating PDF…" : "Download PDF report"}
          </button>
          {selected ? (
            <button
              type="button"
              disabled={exporting}
              onClick={() =>
                void exportProgressPdf({
                  mode: "day",
                  staffId: selected.staffId,
                  date: selected.date,
                })
              }
              className="px-3 py-2 rounded-lg border border-white/15 text-white/80 text-xs hover:bg-white/5 disabled:opacity-50"
            >
              Export selected day ({selected.name})
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
          <p className="text-white/40 text-xs">Team today</p>
          <p className="text-2xl font-bold text-[#00E1FF] mt-1">
            {overview?.teamToday.percent == null ? "N/A" : `${overview.teamToday.percent}%`}
          </p>
          <p className="text-white/35 text-xs mt-1">
            {overview?.teamToday.done || 0}/{overview?.teamToday.total || 0} tasks done
          </p>
        </div>
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
          <p className="text-white/40 text-xs">Active staff</p>
          <p className="text-2xl font-bold text-white mt-1">{overview?.staff.length || 0}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 col-span-2">
          <p className="text-white/40 text-xs mb-2">No tasks today</p>
          <p className="text-sm text-white/70">
            {(overview?.todayStrip.filter((s) => s.idle).map((s) => s.name) || []).join(", ") || "Everyone has work logged"}
          </p>
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-white font-semibold text-sm">Team calendar</h3>
            <p className="text-white/35 text-xs">One glance, click a cell for that day’s tasks</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              type="button"
              disabled={exporting || !reportStaffId}
              title={!reportStaffId ? "Select an employee in Export progress report" : "Export full month PDF"}
              onClick={() => void exportProgressPdf({ mode: "month", staffId: reportStaffId, year, month })}
              className="px-2.5 py-1 rounded-lg border border-white/15 text-[11px] text-white/75 hover:bg-white/5 disabled:opacity-40"
            >
              {exporting ? "PDF…" : "Month PDF"}
            </button>
            <button onClick={() => shiftMonth(-1)} className="px-2 py-1 bg-white/5 rounded-lg text-white/70">
              ‹
            </button>
            <span className="text-sm text-white min-w-[140px] text-center">
              {new Date(year, month - 1, 1).toLocaleString("en-CA", { month: "long", year: "numeric" })}
            </span>
            <button onClick={() => shiftMonth(1)} className="px-2 py-1 bg-white/5 rounded-lg text-white/70">
              ›
            </button>
          </div>
        </div>
        <div className="overflow-auto max-h-[min(420px,55vh)]">
          <table className="min-w-full text-xs">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className="sticky left-0 z-20 bg-[#0a0a1a] text-left text-white/40 font-medium px-3 py-2 min-w-[140px]">
                  Employee
                </th>
                {dayKeys.map((k) => (
                  <th key={k} className="bg-[#0a0a1a] text-white/30 font-normal px-0.5 py-2 w-7">
                    {Number(k.slice(8))}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(overview?.staff || []).map((s) => (
                <tr key={s.id} className="border-t border-white/5">
                  <td className="sticky left-0 bg-[#0a0a1a] px-3 py-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                      <span className="text-white truncate max-w-[120px]">{s.name}</span>
                    </div>
                  </td>
                  {dayKeys.map((k) => {
                    const cell = overview?.grid[s.id]?.[k];
                    return (
                      <td key={k} className="p-0.5">
                        <button
                          type="button"
                          title={`${s.name} ${k}${cell?.percent != null ? `, ${cell.percent}%` : ""}`}
                          onClick={() => openDay(s.id, k, s.name)}
                          className={`block w-6 h-6 mx-auto rounded-sm ${cellClass(cell?.percent ?? null)} ${
                            selected?.staffId === s.id && selected.date === k ? "ring-1 ring-white" : ""
                          } ${isWeekendKey(k) ? "opacity-60" : ""}`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
              {!overview?.staff.length ? (
                <tr>
                  <td colSpan={days + 1} className="px-3 py-8 text-center text-white/40">
                    Add employees below. They sign in at /workflow.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-white/10 flex flex-wrap gap-3 text-[11px] text-white/40">
          <span className="flex items-center gap-1.5">
            <i className="w-3 h-3 rounded-sm bg-white/[0.04] inline-block" /> Empty
          </span>
          <span className="flex items-center gap-1.5">
            <i className="w-3 h-3 rounded-sm bg-white/15 inline-block" /> 0%
          </span>
          <span className="flex items-center gap-1.5">
            <i className="w-3 h-3 rounded-sm bg-amber-500/45 inline-block" /> 1–49%
          </span>
          <span className="flex items-center gap-1.5">
            <i className="w-3 h-3 rounded-sm bg-[#0055FF]/55 inline-block" /> 50–99%
          </span>
          <span className="flex items-center gap-1.5">
            <i className="w-3 h-3 rounded-sm bg-emerald-500/55 inline-block" /> 100%
          </span>
        </div>
      </div>

      {selected ? (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 className="text-white font-semibold text-sm">
              {selected.name}, {selected.date}
            </h3>
            <button
              type="button"
              disabled={exporting}
              onClick={() =>
                void exportProgressPdf({
                  mode: "day",
                  staffId: selected.staffId,
                  date: selected.date,
                })
              }
              className="px-3 py-1.5 rounded-lg bg-[#0055FF] text-white text-xs font-medium disabled:opacity-50"
            >
              {exporting ? "Generating…" : "Export day PDF"}
            </button>
          </div>
          {dayTasks.length === 0 ? (
            <p className="text-white/40 text-sm">No tasks this day.</p>
          ) : (
            <ul className="space-y-2 max-h-[min(360px,50vh)] overflow-y-auto overscroll-contain pr-1">
              {dayTasks.map((t) => (
                <li
                  key={t.id}
                  className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-3"
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="text-white text-sm font-medium leading-snug break-words">{t.title}</p>
                    {t.description ? (
                      <p className="text-white/45 text-xs leading-relaxed line-clamp-2 break-words">{t.description}</p>
                    ) : null}
                    {t.createdBy ? <p className="text-white/35 text-[11px]">from {t.createdBy.name}</p> : null}
                  </div>
                  <div className="flex flex-wrap sm:flex-col sm:items-end gap-1.5 shrink-0">
                    <span
                      className={`admin-status-chip inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-md border ${statusBadge(t.status)}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot(t.status)}`} />
                      {STATUS_LABEL[t.status] || t.status.replace("_", " ")}
                    </span>
                    <span
                      className={`admin-priority-chip inline-flex text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md border ${priorityBadge(t.priority)}`}
                    >
                      {t.priority || "medium"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-3">
          <h3 className="text-white font-semibold text-sm">Add employee</h3>
          <input className={input} placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className={input} type="email" placeholder="Work email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <div className="relative">
            <input
              className={`${input} pr-12`}
              type={showCreatePassword ? "text" : "password"}
              placeholder="Temporary password (6+)"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowCreatePassword((v) => !v)}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-white/45 hover:text-white/80"
              title={showCreatePassword ? "Hide password" : "Show password"}
            >
              {showCreatePassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={createStaff}
            className="px-4 py-2 rounded-lg bg-[#0055FF] text-white text-sm disabled:opacity-50"
          >
            {saving ? "Saving…" : "Create account"}
          </button>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-white font-semibold text-sm">Staff directory</h3>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {staffList.map((s) => (
              <div key={s.id} className="px-4 py-3 border-b border-white/5 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-white text-sm">{s.name}</p>
                    <p className="text-white/40 text-xs">{s.email}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setResetId(s.id);
                        setResetPassword("");
                        setShowResetPassword(false);
                      }}
                      className="text-[10px] px-2 py-1 rounded bg-white/10 text-white/70"
                    >
                      Reset password
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleActive(s.id, !s.isActive)}
                      className={`text-[10px] px-2 py-1 rounded ${s.isActive ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"}`}
                    >
                      {s.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
                {resetId === s.id ? (
                  <div className="flex gap-2">
                    <div className="relative flex-1 min-w-0">
                      <input
                        className={`${input} pr-12`}
                        type={showResetPassword ? "text" : "password"}
                        placeholder="New password"
                        value={resetPassword}
                        onChange={(e) => setResetPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetPassword((v) => !v)}
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-white/45 hover:text-white/80"
                        title={showResetPassword ? "Hide password" : "Show password"}
                      >
                        {showResetPassword ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <button type="button" onClick={resetStaffPassword} className="px-3 py-2 bg-[#0055FF] text-white text-xs rounded-lg shrink-0">
                      Save
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
            {staffList.length === 0 ? <p className="p-4 text-white/40 text-sm">No employees yet</p> : null}
          </div>
        </div>
      </div>

      <div className="border border-red-500/25 rounded-xl overflow-hidden bg-red-500/[0.04]">
        <button
          type="button"
          onClick={() => {
            setPurgeOpen((v) => {
              if (v) {
                setPurgeUnlocked(false);
                setPurgeConfirmText("");
              }
              return !v;
            });
          }}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-red-500/5 transition"
        >
          <div>
            <p className="text-red-300 text-sm font-semibold">Danger zone, delete tasks</p>
            <p className="text-white/35 text-xs mt-0.5">
              Separate from export. Collapsed by default to prevent accidental deletes.
            </p>
          </div>
          <span className="text-red-300/80 text-xs shrink-0">{purgeOpen ? "Hide" : "Show"}</span>
        </button>

        {purgeOpen ? (
          <div className="px-4 pb-4 space-y-3 border-t border-red-500/20 pt-3">
            {!purgeUnlocked ? (
              <div className="space-y-3">
                <p className="text-sm text-white/70 leading-relaxed">
                  This permanently removes employee tasks from the database for a day, range, or full
                  month. Export a PDF first if you need a record.
                </p>
                <button
                  type="button"
                  onClick={() => setPurgeUnlocked(true)}
                  className="px-4 py-2 rounded-lg border border-red-400/50 text-red-200 text-sm hover:bg-red-500/15"
                >
                  I understand, unlock delete tools
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      { id: "month" as const, label: "Full month" },
                      { id: "day" as const, label: "Selected day" },
                      { id: "range" as const, label: "Date range" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPurgeMode(opt.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        purgeMode === opt.id
                          ? "bg-red-600 text-white"
                          : "bg-white/5 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                  <div className="md:col-span-2 xl:col-span-2">
                    <label className="block text-white/40 text-[11px] mb-1">Employee</label>
                    <select
                      className={input}
                      value={purgeStaffId}
                      onChange={(e) => setPurgeStaffId(e.target.value)}
                    >
                      <option value="" className="bg-[#0a0a1a]">
                        Select employee…
                      </option>
                      {activeStaff.map((s) => (
                        <option key={s.id} value={s.id} className="bg-[#0a0a1a]">
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {purgeMode === "month" ? (
                    <div className="md:col-span-2 xl:col-span-2 flex items-end">
                      <p className="text-sm text-white/70 pb-2">
                        Calendar month:{" "}
                        <span className="text-white font-medium">
                          {new Date(year, month - 1, 1).toLocaleString("en-CA", {
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </p>
                    </div>
                  ) : null}

                  {purgeMode === "day" ? (
                    <div>
                      <label className="block text-white/40 text-[11px] mb-1">Date</label>
                      <input
                        className={input}
                        type="date"
                        value={purgeDate}
                        onChange={(e) => setPurgeDate(e.target.value)}
                      />
                    </div>
                  ) : null}

                  {purgeMode === "range" ? (
                    <>
                      <div>
                        <label className="block text-white/40 text-[11px] mb-1">From</label>
                        <input
                          className={input}
                          type="date"
                          value={purgeFrom}
                          onChange={(e) => setPurgeFrom(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-white/40 text-[11px] mb-1">To</label>
                        <input
                          className={input}
                          type="date"
                          value={purgeTo}
                          onChange={(e) => setPurgeTo(e.target.value)}
                        />
                      </div>
                    </>
                  ) : null}
                </div>

                <div>
                  <label className="block text-white/40 text-[11px] mb-1">
                    Type DELETE to enable the delete button
                  </label>
                  <input
                    className={input}
                    value={purgeConfirmText}
                    onChange={(e) => setPurgeConfirmText(e.target.value)}
                    placeholder="DELETE"
                    autoComplete="off"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={
                      purging ||
                      activeStaff.length === 0 ||
                      purgeConfirmText.trim().toUpperCase() !== "DELETE"
                    }
                    onClick={() => void purgeProgress()}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-500 disabled:opacity-40"
                  >
                    {purging ? "Deleting…" : "Delete tasks from database"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPurgeUnlocked(false);
                      setPurgeConfirmText("");
                      setPurgeOpen(false);
                    }}
                    className="px-3 py-2 rounded-lg border border-white/15 text-white/60 text-xs hover:bg-white/5"
                  >
                    Lock &amp; close
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
