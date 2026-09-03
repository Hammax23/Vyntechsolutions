export type WorkflowStatus = "todo" | "in_progress" | "done" | "blocked";

export type DayScore = {
  total: number;
  done: number;
  percent: number | null;
};

export function dateKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isValidIsoDate(isoDate: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return false;
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function utcDay(isoDate: string): Date {
  const [y, m, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(y, (m || 1) - 1, day || 1));
}

export function utcDayRange(isoDate: string): { gte: Date; lt: Date } {
  const start = utcDay(isoDate);
  return { gte: start, lt: new Date(start.getTime() + 86_400_000) };
}

export function isWeekendKey(isoDate: string): boolean {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dow = new Date(y, (m || 1) - 1, d || 1).getDay();
  return dow === 0 || dow === 6;
}

export function todayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function scoreTasks(statuses: string[]): DayScore {
  const total = statuses.length;
  const done = statuses.filter((s) => s === "done").length;
  return {
    total,
    done,
    percent: total === 0 ? null : Math.round((done / total) * 100),
  };
}

export function heatmapTone(percent: number | null): "empty" | "zero" | "low" | "mid" | "full" {
  if (percent === null) return "empty";
  if (percent === 0) return "zero";
  if (percent < 50) return "low";
  if (percent < 100) return "mid";
  return "full";
}

export function publicStaff(s: { id: string; name: string; email: string; role: string; isActive: boolean; color: string }) {
  return {
    id: s.id,
    name: s.name,
    email: s.email,
    role: s.role,
    isActive: s.isActive,
    color: s.color,
  };
}

export function mapTask(t: {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  workDate: Date;
  dueAt: Date | null;
  createdById: string;
  assignedToId: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: { id: string; name: string; color: string };
  assignedTo?: { id: string; name: string; color: string };
}) {
  return {
    id: t.id,
    title: t.title,
    description: t.description || "",
    status: t.status as WorkflowStatus,
    priority: t.priority,
    workDate: dateKey(t.workDate),
    dueAt: t.dueAt ? t.dueAt.toISOString() : null,
    createdById: t.createdById,
    assignedToId: t.assignedToId,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    createdBy: t.createdBy,
    assignedTo: t.assignedTo,
  };
}
