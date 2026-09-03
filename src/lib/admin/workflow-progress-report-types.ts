export type ProgressReportMode = "day" | "range" | "month";

export type ProgressReportTask = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  workDate: string;
  createdByName: string;
};

export type ProgressReportDay = {
  date: string;
  total: number;
  done: number;
  inProgress: number;
  todo: number;
  blocked: number;
  percent: number | null;
  tasks: ProgressReportTask[];
};

export type ProgressReportData = {
  reportId: string;
  generatedAt: string;
  mode: ProgressReportMode;
  periodLabel: string;
  periodFrom: string;
  periodTo: string;
  employee: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  summary: {
    totalTasks: number;
    done: number;
    inProgress: number;
    todo: number;
    blocked: number;
    percent: number | null;
    activeDays: number;
    daysInPeriod: number;
  };
  days: ProgressReportDay[];
};

export function statusLabel(status: string): string {
  if (status === "in_progress") return "In progress";
  if (status === "todo") return "To do";
  if (status === "done") return "Done";
  if (status === "blocked") return "Blocked";
  return status;
}

export function priorityLabel(priority: string): string {
  const p = (priority || "medium").toLowerCase();
  return p.charAt(0).toUpperCase() + p.slice(1);
}

export function formatReportDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function monthPeriodLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleString("en-GB", { month: "long", year: "numeric" });
}
