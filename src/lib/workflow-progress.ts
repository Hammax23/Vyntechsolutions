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

export type TaskTimingFields = {
  status: string;
  statusChangedAt: Date;
  cycleStartedAt?: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  firstBlockedAt: Date | null;
  todoMs: number;
  inProgressMs: number;
  blockedMs: number;
  createdAt: Date;
};

export type TaskTimingSummary = {
  todoMs: number;
  inProgressMs: number;
  blockedMs: number;
  activeMs: number;
  blockedTotalMs: number;
  currentSegmentMs: number;
  elapsedMs: number;
  timeToBlockedMs: number | null;
  cycleMs: number | null;
  statusChangedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  firstBlockedAt: string | null;
};

/** Human-readable duration for UI / PDF (no seconds flicker). */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms));
  if (total < 60_000) return "< 1 min";
  const minutes = Math.floor(total / 60_000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remMin = minutes % 60;
  if (hours < 48) return remMin ? `${hours}h ${remMin}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  const remH = hours % 24;
  return remH ? `${days}d ${remH}h` : `${days}d`;
}

function statusMsKey(status: string): "todoMs" | "inProgressMs" | "blockedMs" | null {
  if (status === "todo") return "todoMs";
  if (status === "in_progress") return "inProgressMs";
  if (status === "blocked") return "blockedMs";
  return null;
}

/**
 * Close the previous status segment and open the next one.
 * Idempotent when status is unchanged.
 */
export function buildStatusTransition(
  existing: TaskTimingFields,
  nextStatus: string,
  now = new Date()
): Partial<{
  status: string;
  statusChangedAt: Date;
  cycleStartedAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  firstBlockedAt: Date | null;
  todoMs: number;
  inProgressMs: number;
  blockedMs: number;
}> {
  if (nextStatus === existing.status) return {};

  // Reopening Done starts a fresh To do → Done attempt
  if (existing.status === "done") {
    return {
      status: nextStatus,
      statusChangedAt: now,
      cycleStartedAt: now,
      startedAt: nextStatus === "in_progress" ? now : null,
      completedAt: null,
      firstBlockedAt: nextStatus === "blocked" ? now : null,
      todoMs: 0,
      inProgressMs: 0,
      blockedMs: 0,
    };
  }

  const changedAt = existing.statusChangedAt instanceof Date ? existing.statusChangedAt : new Date(existing.statusChangedAt);
  const elapsed = Math.max(0, now.getTime() - changedAt.getTime());
  const data: Record<string, unknown> = {
    status: nextStatus,
    statusChangedAt: now,
  };

  const prevKey = statusMsKey(existing.status);
  if (prevKey) {
    data[prevKey] = (existing[prevKey] || 0) + elapsed;
  }

  if (nextStatus === "in_progress" && !existing.startedAt) {
    data.startedAt = now;
  }
  if (nextStatus === "blocked" && !existing.firstBlockedAt) {
    data.firstBlockedAt = now;
  }
  if (nextStatus === "done") {
    data.completedAt = now;
  }

  return data;
}

export function computeTaskTiming(t: TaskTimingFields, now = new Date()): TaskTimingSummary {
  const changedAt = t.statusChangedAt instanceof Date ? t.statusChangedAt : new Date(t.statusChangedAt);
  const createdAt = t.createdAt instanceof Date ? t.createdAt : new Date(t.createdAt);
  const cycleStartedAt = t.cycleStartedAt
    ? t.cycleStartedAt instanceof Date
      ? t.cycleStartedAt
      : new Date(t.cycleStartedAt)
    : createdAt;
  const currentSegmentMs = Math.max(0, now.getTime() - changedAt.getTime());
  const todoMs = t.todoMs || 0;
  const inProgressMs = t.inProgressMs || 0;
  const blockedMs = t.blockedMs || 0;

  const activeMs = inProgressMs + (t.status === "in_progress" ? currentSegmentMs : 0);
  const blockedTotalMs = blockedMs + (t.status === "blocked" ? currentSegmentMs : 0);
  const endAt = t.completedAt ? (t.completedAt instanceof Date ? t.completedAt : new Date(t.completedAt)) : now;
  const elapsedMs = Math.max(0, endAt.getTime() - cycleStartedAt.getTime());

  let timeToBlockedMs: number | null = null;
  if (t.firstBlockedAt) {
    const blockedAt = t.firstBlockedAt instanceof Date ? t.firstBlockedAt : new Date(t.firstBlockedAt);
    timeToBlockedMs = Math.max(0, blockedAt.getTime() - cycleStartedAt.getTime());
  }

  let cycleMs: number | null = null;
  if (t.completedAt) {
    const completedAt = t.completedAt instanceof Date ? t.completedAt : new Date(t.completedAt);
    cycleMs = Math.max(0, completedAt.getTime() - cycleStartedAt.getTime());
  }

  return {
    todoMs: todoMs + (t.status === "todo" ? currentSegmentMs : 0),
    inProgressMs: activeMs,
    blockedMs: blockedTotalMs,
    activeMs,
    blockedTotalMs,
    currentSegmentMs,
    elapsedMs,
    timeToBlockedMs,
    cycleMs,
    statusChangedAt: changedAt.toISOString(),
    startedAt: t.startedAt ? new Date(t.startedAt).toISOString() : null,
    completedAt: t.completedAt ? new Date(t.completedAt).toISOString() : null,
    firstBlockedAt: t.firstBlockedAt ? new Date(t.firstBlockedAt).toISOString() : null,
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
  statusChangedAt?: Date;
  cycleStartedAt?: Date;
  startedAt?: Date | null;
  completedAt?: Date | null;
  firstBlockedAt?: Date | null;
  todoMs?: number;
  inProgressMs?: number;
  blockedMs?: number;
  createdBy?: { id: string; name: string; color: string };
  assignedTo?: { id: string; name: string; color: string };
}) {
  const statusChangedAt = t.statusChangedAt || t.createdAt;
  const cycleStartedAt = t.cycleStartedAt || t.createdAt;
  const timing = computeTaskTiming({
    status: t.status,
    statusChangedAt,
    cycleStartedAt,
    startedAt: t.startedAt ?? null,
    completedAt: t.completedAt ?? null,
    firstBlockedAt: t.firstBlockedAt ?? null,
    todoMs: t.todoMs ?? 0,
    inProgressMs: t.inProgressMs ?? 0,
    blockedMs: t.blockedMs ?? 0,
    createdAt: t.createdAt,
  });

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
    statusChangedAt: timing.statusChangedAt,
    cycleStartedAt: cycleStartedAt.toISOString(),
    startedAt: timing.startedAt,
    completedAt: timing.completedAt,
    firstBlockedAt: timing.firstBlockedAt,
    todoMs: t.todoMs ?? 0,
    inProgressMs: t.inProgressMs ?? 0,
    blockedMs: t.blockedMs ?? 0,
    timing,
    createdBy: t.createdBy,
    assignedTo: t.assignedTo,
  };
}
