"use client";

import { normalizeProjectStatus } from "@/lib/admin/project-workflow";
import type {
  ActivityLog,
  AdminProject,
  Milestone,
  Note,
  Payment,
  PhaseCheck,
  Task,
} from "./types";

export const WF_STATUS_LABEL: Record<string, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
  blocked: "On hold",
};

export const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export const fadeOnly = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

export function ProjectLogoMark({
  name,
  logo,
  size = "md",
}: {
  name: string;
  logo?: string | null;
  size?: "sm" | "md";
}) {
  const box =
    size === "sm"
      ? "h-7 w-7 text-[11px]"
      : "w-9 h-9 text-sm";
  if (logo) {
    return (
      <span
        className={`${box} shrink-0 rounded border border-white/15 bg-white overflow-hidden flex items-center justify-center`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} alt="" className="h-full w-full object-contain p-0.5" />
      </span>
    );
  }
  return (
    <span
      className={`${box} shrink-0 rounded border border-white/15 bg-white/[0.04] flex items-center justify-center font-semibold text-white/90`}
    >
      {(name || "?").charAt(0).toUpperCase()}
    </span>
  );
}

function toDateInputValue(value: unknown): string {
  if (!value) return "";
  const s = String(value);
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

export function formatProject(p: Record<string, unknown>): AdminProject {
  return {
    ...(p as AdminProject),
    status: normalizeProjectStatus(String(p.status || "discovery")),
    startDate: toDateInputValue(p.startDate),
    deadline: toDateInputValue(p.deadline),
    tasks: (p.tasks as Task[]) || [],
    milestones: (p.milestones as Milestone[]) || [],
    notes: (p.notes as Note[]) || [],
    activityLog: ((p.activityLogs || p.activityLog) as ActivityLog[]) || [],
    phaseChecks: (p.phaseChecks as PhaseCheck[]) || [],
    payments: ((p.payments as Payment[]) || []).map((pay) => ({
      ...pay,
      dueDate: pay.dueDate
        ? typeof pay.dueDate === "string"
          ? pay.dueDate
          : new Date(pay.dueDate as unknown as string).toISOString()
        : null,
      paidAt: pay.paidAt
        ? typeof pay.paidAt === "string"
          ? pay.paidAt
          : new Date(pay.paidAt as unknown as string).toISOString()
        : null,
      billingInvoice: pay.billingInvoice
        ? {
            ...pay.billingInvoice,
            paidAt: pay.billingInvoice.paidAt
              ? String(pay.billingInvoice.paidAt)
              : null,
            dueDate: pay.billingInvoice.dueDate
              ? String(pay.billingInvoice.dueDate)
              : null,
          }
        : pay.billingInvoice ?? null,
    })),
    phaseGates: p.phaseGates,
  };
}

export function phaseChipClass(status: string) {
  const key = normalizeProjectStatus(status);
  if (key === "completed") return "pm-status-chip pm-status-chip--paid";
  if (key === "on_hold") return "pm-status-chip pm-status-chip--due";
  return "pm-status-chip pm-status-chip--pending";
}

export function priorityStyle(priority: string) {
  const map: Record<string, string> = {
    low: "bg-transparent text-white/50 border-white/15",
    medium: "bg-transparent text-white/70 border-white/20",
    high: "bg-transparent text-slate-200 border-slate-400/40",
    critical: "bg-transparent text-white border-white/35",
  };
  return map[priority] || map.medium;
}

export function taskStatusStyle(status: string) {
  if (status === "completed") return "bg-emerald-50 text-emerald-900 border border-emerald-400";
  if (status === "in_progress") return "bg-amber-50 text-amber-900 border border-amber-400";
  return "bg-slate-100 text-slate-600 border border-slate-300";
}
