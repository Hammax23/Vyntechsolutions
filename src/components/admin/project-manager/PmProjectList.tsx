"use client";

import { motion } from "framer-motion";
import {
  PIPELINE_PHASES,
  normalizeProjectStatus,
  phaseLabel,
} from "@/lib/admin/project-workflow";
import type { ProjectManagerApi } from "./useProjectManager";
import { ProjectLogoMark, phaseChipClass } from "./pm-helpers";

type Props = { pm: ProjectManagerApi };

export default function PmProjectList({ pm }: Props) {
  const {
    projects,
    selectedId,
    selectProject,
    reduceMotion,
    motionDuration,
    stagger,
  } = pm;

  return (
    <>
      <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-white font-medium text-xs uppercase tracking-wider">Projects</h3>
          <p className="text-white/35 text-[11px] mt-0.5">{projects.length} records</p>
        </div>
      </div>
      <div className="max-h-[min(40vh,280px)] lg:max-h-[calc(100vh-200px)] overflow-y-auto overscroll-contain">
        {projects.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-white/60 text-sm font-medium">No projects</p>
            <p className="text-white/35 text-xs mt-1 leading-relaxed">
              Use New project to open a delivery record
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {projects.map((proj, i) => {
              const active = selectedId === proj.id;
              const phaseIdx = PIPELINE_PHASES.indexOf(
                normalizeProjectStatus(proj.status) as (typeof PIPELINE_PHASES)[number]
              );
              return (
                <motion.button
                  key={proj.id}
                  type="button"
                  initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: motionDuration, delay: i * stagger }}
                  whileHover={reduceMotion ? undefined : { x: 2 }}
                  onClick={() => selectProject(proj.id)}
                  className={`w-full text-left px-3 py-2.5 transition-colors border-l-2 ${
                    active
                      ? "bg-white/[0.06] border-l-white"
                      : "bg-transparent border-l-transparent hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5">
                      <ProjectLogoMark
                        name={proj.companyName || proj.projectName}
                        logo={proj.companyLogo}
                        size="sm"
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className="pm-check-label font-semibold text-sm leading-snug line-clamp-2"
                          title={proj.projectName}
                        >
                          {proj.projectName}
                        </h4>
                        <span className="pm-check-num text-[10px] tabular-nums shrink-0 font-medium">
                          {proj.progress}%
                        </span>
                      </div>
                      <p className="pm-check-num text-xs truncate mt-0.5">{proj.clientName}</p>
                      <div className="flex items-center justify-between gap-2 mt-1.5">
                        <span className={phaseChipClass(proj.status)} title={phaseLabel(proj.status)}>
                          {phaseLabel(proj.status)}
                        </span>
                        <span className="pm-check-num text-[10px] tabular-nums font-medium">
                          Phase{" "}
                          {phaseIdx >= 0
                            ? `${phaseIdx + 1}/${PIPELINE_PHASES.length}`
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
