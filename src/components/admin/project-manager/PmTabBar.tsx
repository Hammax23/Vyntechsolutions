"use client";

import { motion } from "framer-motion";
import type { ProjectManagerApi } from "./useProjectManager";

type Props = { pm: ProjectManagerApi };

export default function PmTabBar({ pm }: Props) {
  const {
    projectTab,
    setProjectTab,
    teamMemberIds,
    cuHistoryTotal,
    selectedProject,
    reduceMotion,
  } = pm;
  if (!selectedProject) return null;

  return (
    <div className="flex border-b border-white/10 px-1 overflow-x-auto overscroll-x-contain scrollbar-thin">
      {(
        [
          { id: "workflow" as const, label: "Workflow", count: null as number | null },
          {
            id: "team" as const,
            label: "Team",
            count: teamMemberIds.length,
          },
          { id: "overview" as const, label: "Overview", count: null },
          {
            id: "updates" as const,
            label: "Updates",
            count: cuHistoryTotal,
          },
          {
            id: "tasks" as const,
            label: "Internal tasks",
            count: selectedProject.tasks.length,
          },
          { id: "timeline" as const, label: "Timeline", count: null },
          {
            id: "notes" as const,
            label: "Notes",
            count: selectedProject.notes.length,
          },
          {
            id: "activity" as const,
            label: "Activity",
            count: selectedProject.activityLog.length,
          },
        ]
      ).map((tab) => (
        <button
          key={tab.id}
          onClick={() => setProjectTab(tab.id)}
          className={`relative inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors ${
            projectTab === tab.id
              ? "text-white"
              : "text-white/45 hover:text-white/75"
          }`}
        >
          {tab.label}
          {typeof tab.count === "number" ? (
            <motion.span
              key={`${tab.id}-${tab.count}`}
              initial={reduceMotion ? false : { scale: 0.85, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`pm-tab-count min-w-[1.25rem] h-5 px-1.5 inline-flex items-center justify-center rounded text-[10px] font-semibold tabular-nums border ${
                tab.count > 0
                  ? projectTab === tab.id
                    ? "bg-white/15 border-white/25 text-white"
                    : "bg-white/[0.06] border-white/15 text-white/70"
                  : "bg-transparent border-white/10 text-white/35"
              }`}
              title={`${tab.count} ${tab.label.toLowerCase()} saved`}
            >
              {tab.count}
            </motion.span>
          ) : null}
          {projectTab === tab.id ? (
            <motion.span
              layoutId="pm-tab-underline"
              className="absolute left-2 right-2 bottom-0 h-px bg-white"
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            />
          ) : null}
        </button>
      ))}
    </div>
  );
}
