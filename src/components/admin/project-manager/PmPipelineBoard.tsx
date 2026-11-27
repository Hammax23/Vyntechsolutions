"use client";

import { useRef } from "react";
import {
  GATED_PHASES,
  PIPELINE_PHASES,
  hasPhaseGate,
  parsePhaseGates,
  phaseLabel,
  type ProjectPhase,
} from "@/lib/admin/project-workflow";
import type { AdminProject } from "./types";

const BOARD_COLUMNS: ProjectPhase[] = [
  ...PIPELINE_PHASES,
  "on_hold",
  "completed",
];

function isStuck(p: AdminProject): boolean {
  if (!GATED_PHASES.has(p.status)) return false;
  return !hasPhaseGate(parsePhaseGates(p.phaseGates), p.status);
}

function hasOverduePayment(p: AdminProject): boolean {
  const now = Date.now();
  return (p.payments || []).some((pay) => {
    if (pay.status === "paid") return false;
    if (!pay.dueDate) return false;
    const t = new Date(pay.dueDate).getTime();
    return Number.isFinite(t) && t < now;
  });
}

type Props = {
  projects: AdminProject[];
  selectedId: string | null;
  stuckOnly: boolean;
  onSelect: (id: string) => void;
};

export default function PmPipelineBoard({
  projects,
  selectedId,
  stuckOnly,
  onSelect,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const visible = stuckOnly ? projects.filter(isStuck) : projects;

  const scrollByCols = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 180, behavior: "smooth" });
  };

  return (
    <div className="pm-pipeline-wrap w-full min-w-0 max-w-full block">
      <div className="mb-2 flex items-center justify-between gap-2 min-w-0">
        <p className="text-[11px] text-white/45 truncate min-w-0">
          Scroll → for On Hold &amp; Completed
        </p>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => scrollByCols(-1)}
            className="pm-pipeline-nav-btn"
            aria-label="Scroll pipeline left"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scrollByCols(1)}
            className="pm-pipeline-nav-btn"
            aria-label="Scroll pipeline right"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="pm-pipeline-board w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="inline-flex gap-2 pb-2" style={{ width: "max-content" }}>
          {BOARD_COLUMNS.map((col) => {
            const cards = visible.filter((p) => p.status === col);
            return (
              <div
                key={col}
                className="pm-pipeline-col w-[140px] shrink-0 rounded-lg border border-white/10 bg-white/[0.03]"
              >
                <div className="px-2.5 py-2 border-b border-white/10 flex items-center justify-between gap-1">
                  <span className="text-[11px] font-semibold text-white/80 truncate">
                    {phaseLabel(col)}
                  </span>
                  <span className="text-[10px] text-white/40 tabular-nums">{cards.length}</span>
                </div>
                <div className="p-1.5 space-y-1.5 max-h-[360px] overflow-y-auto">
                  {cards.length === 0 && (
                    <p className="text-[10px] text-white/30 px-1 py-3 text-center">Empty</p>
                  )}
                  {cards.map((p) => {
                    const stuck = isStuck(p);
                    const overdue = hasOverduePayment(p);
                    const active = selectedId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => onSelect(p.id)}
                        className={`w-full text-left rounded-md border px-2 py-1.5 transition-colors ${
                          active
                            ? "border-[#00B4FF]/60 bg-[#0055FF]/20"
                            : "border-white/10 bg-black/20 hover:border-white/25"
                        }`}
                      >
                        <p className="text-[11px] font-medium text-white truncate">
                          {p.projectName}
                        </p>
                        <p className="text-[10px] text-white/45 truncate mt-0.5">{p.clientName}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-1">
                          <span className="text-[10px] tabular-nums text-white/60">
                            {p.progress}%
                          </span>
                          {stuck && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-400 font-semibold">
                              Stuck
                            </span>
                          )}
                          {overdue && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-200 border border-rose-500/30">
                              Overdue $
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function computePmBoardStats(projects: AdminProject[]) {
  let stuck = 0;
  let paidSum = 0;
  let unpaidSum = 0;
  for (const p of projects) {
    if (isStuck(p)) stuck += 1;
    for (const pay of p.payments || []) {
      const amt = Number(pay.amount) || 0;
      if (pay.status === "paid") paidSum += amt;
      else unpaidSum += amt;
    }
  }
  return { stuck, paidSum, unpaidSum };
}
