"use client";

import {
  PIPELINE_PHASES,
  normalizeProjectStatus,
  phaseLabel,
  type ProjectPhase,
} from "@/lib/admin/project-workflow";
import type { ProjectManagerApi } from "./useProjectManager";

type Props = { pm: ProjectManagerApi };

export default function PmPhaseChangeModal({ pm }: Props) {
  const {
    selectedProject,
    pendingPhaseChange,
    confirmingPhase,
    cancelPendingStatusChange,
    confirmPendingStatusChange,
  } = pm;

  if (!selectedProject || !pendingPhaseChange) return null;

  const current = normalizeProjectStatus(selectedProject.status);
  const target = pendingPhaseChange as ProjectPhase;
  const curIdx = PIPELINE_PHASES.indexOf(current as (typeof PIPELINE_PHASES)[number]);
  const nextIdx = PIPELINE_PHASES.indexOf(target as (typeof PIPELINE_PHASES)[number]);
  const isBackward = curIdx >= 0 && nextIdx >= 0 && nextIdx < curIdx;
  const skipCount =
    curIdx >= 0 && nextIdx > curIdx + 1 ? nextIdx - curIdx - 1 : 0;

  return (
    <div
      className="pm-phase-change-overlay fixed inset-0 z-[85] flex items-end sm:items-center justify-center p-0 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pm-phase-change-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        aria-label="Dismiss"
        disabled={confirmingPhase}
        onClick={cancelPendingStatusChange}
      />
      <div className="pm-phase-change relative z-10 w-full sm:max-w-md rounded-t-xl sm:rounded-xl border border-slate-200 bg-white shadow-2xl p-5 space-y-4">
        <div>
          <h3
            id="pm-phase-change-title"
            className="text-slate-900 font-semibold text-base"
          >
            Change project phase?
          </h3>
          <p className="text-slate-600 text-sm mt-1.5 leading-relaxed">
            Confirm before updating the active SDLC stage. Accidental clicks will
            not change status.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 space-y-2.5">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-slate-500">Current</span>
            <span className="text-slate-800 font-medium">{phaseLabel(current)}</span>
          </div>
          <div className="border-t border-slate-200" />
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-slate-500">Move to</span>
            <span className="text-slate-900 font-semibold">{phaseLabel(target)}</span>
          </div>
        </div>

        {isBackward ? (
          <p className="text-sm leading-relaxed text-amber-950 bg-amber-50 border border-amber-300 rounded-lg px-3.5 py-2.5">
            You are moving <strong className="font-semibold">backward</strong> in
            the pipeline. Checklist focus and gates will follow{" "}
            {phaseLabel(target)}.
          </p>
        ) : null}
        {skipCount > 0 ? (
          <p className="text-sm leading-relaxed text-sky-950 bg-sky-50 border border-sky-300 rounded-lg px-3.5 py-2.5">
            You are skipping {skipCount} phase
            {skipCount === 1 ? "" : "s"}. Gate / checklist rules may still block
            this unless you force advance.
          </p>
        ) : null}

        <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-1">
          <button
            type="button"
            disabled={confirmingPhase}
            onClick={cancelPendingStatusChange}
            className="flex-1 px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={confirmingPhase}
            onClick={() => void confirmPendingStatusChange()}
            className="flex-1 px-3 py-2.5 rounded-lg border border-[#0044CC] bg-[#0055FF] text-white text-sm font-semibold hover:bg-[#0044CC] disabled:opacity-50"
          >
            {confirmingPhase ? "Updating…" : "Confirm phase change"}
          </button>
        </div>
      </div>
    </div>
  );
}
