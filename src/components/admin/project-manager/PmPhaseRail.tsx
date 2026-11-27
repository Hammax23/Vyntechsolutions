"use client";

import { motion } from "framer-motion";
import {
  GATED_PHASES,
  PIPELINE_PHASES,
  hasPhaseGate,
  phaseAbbrev,
  phaseLabel,
} from "@/lib/admin/project-workflow";
import type { ProjectManagerApi } from "./useProjectManager";

type Props = { pm: ProjectManagerApi };

export default function PmPhaseRail({ pm }: Props) {
  const {
    selectedProject,
    currentPhase,
    gates,
    requestStatusChange,
    pendingPhaseChange,
    reduceMotion,
  } = pm;
  if (!selectedProject) return null;

  return (
    <>
      <div className="pm-phase-scroll -mx-3 sm:mx-0 px-3 sm:px-0 mb-3 overflow-x-auto overscroll-x-contain">
        <div className="flex w-max min-w-full sm:w-full sm:flex-wrap border border-white/10 rounded overflow-hidden">
          {PIPELINE_PHASES.map((phase, idx) => {
            const curIdx = PIPELINE_PHASES.indexOf(currentPhase);
            const active = currentPhase === phase;
            const pending = pendingPhaseChange === phase;
            const done =
              (curIdx > idx && curIdx >= 0) ||
              currentPhase === "completed" ||
              (GATED_PHASES.has(phase) && hasPhaseGate(gates, phase));
            return (
              <button
                key={phase}
                type="button"
                onClick={() => {
                  if (active) return;
                  requestStatusChange(phase);
                }}
                aria-current={active ? "step" : undefined}
                aria-pressed={pending}
                className={`px-2.5 py-1.5 text-[10px] font-medium border-r border-white/10 last:border-r-0 transition-colors whitespace-nowrap ${
                  active
                    ? "bg-white/15 text-white cursor-default"
                    : pending
                      ? "bg-[#0055FF]/25 text-white ring-1 ring-inset ring-[#00B4FF]/50"
                      : done
                        ? "bg-white/[0.04] text-white/70 hover:text-white/85 hover:bg-white/[0.06]"
                        : "bg-transparent text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
                }`}
                title={
                  active
                    ? `Current phase: ${phaseLabel(phase)}`
                    : `Request move to ${phaseLabel(phase)} (confirmation required)`
                }
              >
                <span className="text-white/30 mr-1">{idx + 1}</span>
                <span className="sm:hidden">{phaseAbbrev(phase)}</span>
                <span className="hidden sm:inline">{phaseLabel(phase)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-1 bg-white/10 overflow-hidden">
          <motion.div
            className="h-full bg-white/70"
            initial={false}
            animate={{ width: `${selectedProject.progress}%` }}
            transition={{ duration: reduceMotion ? 0 : 0.45, ease: "easeOut" }}
          />
        </div>
        <span className="text-white/50 font-medium text-xs tabular-nums">
          {selectedProject.progress}%
        </span>
      </div>
    </>
  );
}
