import { isValidIsoDate, utcDay } from "@/lib/workflow-progress";
import { monthPeriodLabel, type ProgressReportMode } from "@/lib/admin/workflow-progress-report-types";

export type ResolvedProgressPeriod = {
  mode: ProgressReportMode;
  fromIso: string;
  toIso: string;
  periodLabel: string;
  rangeStart: Date;
  rangeEndExclusive: Date;
};

function daysBetweenInclusive(fromIso: string, toIso: string): number {
  const a = utcDay(fromIso).getTime();
  const b = utcDay(toIso).getTime();
  return Math.floor((b - a) / 86400000) + 1;
}

export function resolveProgressPeriod(body: {
  mode?: string;
  date?: string;
  from?: string;
  to?: string;
  year?: number;
  month?: number;
}): ResolvedProgressPeriod | { error: string; status: number } {
  const mode = String(body.mode || "month") as ProgressReportMode;
  if (!["day", "range", "month"].includes(mode)) {
    return { error: "Invalid period mode", status: 400 };
  }

  let fromIso = "";
  let toIso = "";
  let periodLabel = "";

  if (mode === "day") {
    const date = String(body.date || "").slice(0, 10);
    if (!isValidIsoDate(date)) {
      return { error: "Valid date required", status: 400 };
    }
    fromIso = date;
    toIso = date;
    periodLabel = `Day, ${date}`;
  } else if (mode === "range") {
    fromIso = String(body.from || "").slice(0, 10);
    toIso = String(body.to || "").slice(0, 10);
    if (!isValidIsoDate(fromIso) || !isValidIsoDate(toIso)) {
      return { error: "Valid from/to dates required", status: 400 };
    }
    if (fromIso > toIso) {
      return { error: "From date must be on or before to date", status: 400 };
    }
    const span = daysBetweenInclusive(fromIso, toIso);
    if (span > 93) {
      return { error: "Date range cannot exceed 93 days", status: 400 };
    }
    periodLabel = `Range, ${fromIso} to ${toIso}`;
  } else {
    const year = Number(body.year) || new Date().getFullYear();
    const month = Number(body.month) || new Date().getMonth() + 1;
    if (year < 2000 || year > 2100 || month < 1 || month > 12) {
      return { error: "Invalid year/month", status: 400 };
    }
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    fromIso = `${year}-${String(month).padStart(2, "0")}-01`;
    toIso = `${year}-${String(month).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;
    periodLabel = `Month, ${monthPeriodLabel(year, month)}`;
  }

  const rangeStart = utcDay(fromIso);
  const rangeEndExclusive = new Date(utcDay(toIso).getTime() + 86400000);

  return {
    mode,
    fromIso,
    toIso,
    periodLabel,
    rangeStart,
    rangeEndExclusive,
  };
}

export function daysInResolvedPeriod(period: ResolvedProgressPeriod): number {
  return daysBetweenInclusive(period.fromIso, period.toIso);
}
