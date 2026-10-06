/**
 * Our Project Workflow (SDLC) — defaults from Our_Project_Workflow.pdf
 */

export type ProjectPhase =
  | "discovery"
  | "requirements"
  | "design"
  | "development"
  | "testing"
  | "deployment"
  | "support"
  | "seo"
  | "digital_marketing"
  | "completed"
  | "on_hold";

export type PhaseGate = {
  phase: string;
  signedOffAt: string;
  note?: string;
};

export const PROJECT_PHASES: {
  key: ProjectPhase;
  label: string;
  short: string;
  abbrev: string;
  inPipeline: boolean;
}[] = [
  { key: "discovery", label: "Discovery", short: "1", abbrev: "Disc", inPipeline: true },
  { key: "requirements", label: "Requirements", short: "2", abbrev: "Reqs", inPipeline: true },
  { key: "design", label: "Design", short: "3", abbrev: "Design", inPipeline: true },
  { key: "development", label: "Development", short: "4", abbrev: "Build", inPipeline: true },
  { key: "testing", label: "Testing / UAT", short: "5", abbrev: "UAT", inPipeline: true },
  { key: "deployment", label: "Deployment", short: "6", abbrev: "Deploy", inPipeline: true },
  { key: "support", label: "Support", short: "7", abbrev: "Support", inPipeline: true },
  { key: "seo", label: "SEO", short: "8", abbrev: "SEO", inPipeline: true },
  {
    key: "digital_marketing",
    label: "Digital Marketing",
    short: "9",
    abbrev: "Mktg",
    inPipeline: true,
  },
  { key: "completed", label: "Completed", short: "✓", abbrev: "Done", inPipeline: false },
  { key: "on_hold", label: "On Hold", short: "||", abbrev: "Hold", inPipeline: false },
];

export const PIPELINE_PHASES = PROJECT_PHASES.filter((p) => p.inPipeline).map((p) => p.key);

/** Phases that require explicit client/admin sign-off before advancing */
export const GATED_PHASES = new Set<ProjectPhase>(["requirements", "design", "testing"]);

export const DEFAULT_PHASE_CHECKS: Record<string, string[]> = {
  discovery: [
    "Kickoff / discovery meeting held",
    "Goals, budget, and deadline understood",
    "Project proposal & quote sent",
  ],
  requirements: [
    "Every feature listed in detail",
    "Scope agreed with client",
    "Requirement document signed",
    "Advance payment (40%) received",
  ],
  design: [
    "Wireframes shared",
    "UI screens reviewed",
    "Database / system plan documented",
    "Client approved design",
  ],
  development: [
    "Sprint plan agreed (2-week cycles)",
    "Working demo shown after latest sprint",
    "Client feedback captured and adjusted",
  ],
  testing: [
    "Functional testing complete",
    "Device / browser testing complete",
    "Bugs fixed from QA",
    "Client UAT sign-off received",
  ],
  deployment: [
    "Live server / app store launch done",
    "Access & files handed over",
    "Final payment (30%) received",
  ],
  support: [
    "30-day free bug-fix window started",
    "Maintenance plan offered",
    "Shared credentials stored in company accounts",
  ],
  seo: [
    "Keyword research and target URLs documented",
    "On-page SEO applied (titles, meta, headings, internal links)",
    "Technical SEO baseline complete (sitemap, robots, indexation)",
    "Search Console and analytics verified",
  ],
  digital_marketing: [
    "Channel plan agreed (ads, social, email, content)",
    "Campaign creatives and copy approved",
    "Tracking and conversion events verified",
    "Launch report / handover delivered to client",
  ],
};

export const DEFAULT_PAYMENTS: { label: string; percent: number }[] = [
  { label: "Advance after requirements signed", percent: 40 },
  { label: "Design approval / mid-development demo", percent: 30 },
  { label: "Final delivery (before source handover)", percent: 30 },
];

export function normalizeProjectStatus(status: string | null | undefined): ProjectPhase {
  const s = String(status || "discovery");
  if (s === "launch") return "deployment";
  if (PIPELINE_PHASES.includes(s as ProjectPhase) || s === "completed" || s === "on_hold") {
    return s as ProjectPhase;
  }
  return "discovery";
}

export function phaseLabel(status: string): string {
  const key = normalizeProjectStatus(status);
  return PROJECT_PHASES.find((p) => p.key === key)?.label || key;
}

export function phaseAbbrev(status: string): string {
  const key = normalizeProjectStatus(status);
  return PROJECT_PHASES.find((p) => p.key === key)?.abbrev || phaseLabel(status);
}

/** Checklist rows for phases that are missing on an existing project (lazy backfill). */
export function buildMissingPhaseCheckCreates(
  projectId: string,
  existingPhases: string[],
  startSortOrder = 0
) {
  const have = new Set(existingPhases);
  const rows: {
    projectId: string;
    phase: string;
    label: string;
    sortOrder: number;
  }[] = [];
  let order = startSortOrder;
  for (const phase of PIPELINE_PHASES) {
    if (have.has(phase)) continue;
    const labels = DEFAULT_PHASE_CHECKS[phase] || [];
    labels.forEach((label, i) => {
      rows.push({ projectId, phase, label, sortOrder: order + i });
    });
    order += labels.length + 10;
  }
  return rows;
}

export function parsePhaseGates(raw: unknown): PhaseGate[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((g) => {
      if (!g || typeof g !== "object") return null;
      const o = g as Record<string, unknown>;
      const phase = String(o.phase || "").trim();
      const signedOffAt = String(o.signedOffAt || "").trim();
      if (!phase || !signedOffAt) return null;
      return {
        phase,
        signedOffAt,
        note: o.note ? String(o.note) : undefined,
      };
    })
    .filter(Boolean) as PhaseGate[];
}

export function hasPhaseGate(gates: PhaseGate[], phase: string): boolean {
  return gates.some((g) => g.phase === phase && g.signedOffAt);
}

/**
 * Soft gate: when moving forward past a gated phase, that phase must be signed off
 * unless force=true. Moving to on_hold/completed or backward is always allowed.
 */
export function advanceGateError(
  fromStatus: string,
  toStatus: string,
  gates: PhaseGate[],
  force?: boolean
): string | null {
  if (force) return null;
  const from = normalizeProjectStatus(fromStatus);
  const to = normalizeProjectStatus(toStatus);
  if (to === "on_hold" || from === to) return null;

  const fromIdx = PIPELINE_PHASES.indexOf(from);
  const toIdx = PIPELINE_PHASES.indexOf(to);

  // Advancing along pipeline: every gated phase we're leaving or jumping past must be signed
  if (fromIdx >= 0 && toIdx > fromIdx) {
    for (let i = fromIdx; i < toIdx; i++) {
      const phase = PIPELINE_PHASES[i];
      if (GATED_PHASES.has(phase) && !hasPhaseGate(gates, phase)) {
        return `Sign off “${phaseLabel(phase)}” before advancing (or confirm to force).`;
      }
    }
  }

  // Jumping into development+ from anywhere without requirements sign-off
  if (
    [
      "development",
      "testing",
      "deployment",
      "support",
      "seo",
      "digital_marketing",
      "completed",
    ].includes(to) &&
    !hasPhaseGate(gates, "requirements")
  ) {
    return "Requirements must be signed off before development starts (or confirm to force).";
  }

  return null;
}

export function buildPhaseCheckCreates(projectId: string) {
  const rows: {
    projectId: string;
    phase: string;
    label: string;
    sortOrder: number;
  }[] = [];
  let order = 0;
  for (const phase of PIPELINE_PHASES) {
    const labels = DEFAULT_PHASE_CHECKS[phase] || [];
    labels.forEach((label, i) => {
      rows.push({ projectId, phase, label, sortOrder: order + i });
    });
    order += labels.length + 10;
  }
  return rows;
}

export function buildPaymentCreates(projectId: string, budget: number) {
  return DEFAULT_PAYMENTS.map((p, i) => ({
    projectId,
    label: p.label,
    percent: p.percent,
    amount: Math.round(((budget || 0) * p.percent) / 100 * 100) / 100,
    status: "pending" as const,
    sortOrder: i,
  }));
}

export function phaseCheckProgress(
  checks: { phase: string; done: boolean }[],
  phase: string
): { done: number; total: number; percent: number } {
  const list = checks.filter((c) => c.phase === phase);
  const done = list.filter((c) => c.done).length;
  const total = list.length;
  return {
    done,
    total,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
  };
}
