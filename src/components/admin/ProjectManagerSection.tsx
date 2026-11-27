"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  PROJECT_PHASES,
  type ProjectPhase,
} from "@/lib/admin/project-workflow";
import PmPipelineBoard from "@/components/admin/project-manager/PmPipelineBoard";
import { useProjectManager } from "@/components/admin/project-manager/useProjectManager";
import PmStats from "@/components/admin/project-manager/PmStats";
import PmProjectList from "@/components/admin/project-manager/PmProjectList";
import PmPhaseRail from "@/components/admin/project-manager/PmPhaseRail";
import PmTabBar from "@/components/admin/project-manager/PmTabBar";
import PmNewProjectModal from "@/components/admin/project-manager/PmNewProjectModal";
import PmClientUpdateModal from "@/components/admin/project-manager/PmClientUpdateModal";
import PmPhaseChangeModal from "@/components/admin/project-manager/PmPhaseChangeModal";
import PmWorkflowTab from "@/components/admin/project-manager/PmWorkflowTab";
import PmTeamTab from "@/components/admin/project-manager/PmTeamTab";
import PmOverviewTab from "@/components/admin/project-manager/PmOverviewTab";
import PmUpdatesTab from "@/components/admin/project-manager/PmUpdatesTab";
import PmTasksTab from "@/components/admin/project-manager/PmTasksTab";
import PmTimelineTab from "@/components/admin/project-manager/PmTimelineTab";
import PmNotesTab from "@/components/admin/project-manager/PmNotesTab";
import PmActivityTab from "@/components/admin/project-manager/PmActivityTab";
import {
  ProjectLogoMark,
  fadeUp,
  priorityStyle,
} from "@/components/admin/project-manager/pm-helpers";
import type { AdminProject } from "@/components/admin/project-manager/types";

export type { AdminProject };

type Props = {
  refreshKey?: number;
  onLoaded?: (count: number) => void;
  /** Jump to Client Invoices and open this billing invoice */
  onOpenClientInvoice?: (invoiceId: string) => void;
  /** Jump to Team Progress filtered to this project */
  onOpenTeamProgress?: (projectId: string) => void;
};

export default function ProjectManagerSection({
  refreshKey = 0,
  onLoaded,
  onOpenClientInvoice,
  onOpenTeamProgress,
}: Props) {
  const pm = useProjectManager({
    refreshKey,
    onLoaded,
    onOpenClientInvoice,
    onOpenTeamProgress,
  });

  const {
    reduceMotion,
    projects,
    selectedId,
    listViewMode,
    setListViewMode,
    stuckOnly,
    setStuckOnly,
    mobilePane,
    setMobilePane,
    projectTab,
    loading,
    message,
    motionDuration,
    stagger,
    selectProject,
    setShowNewProject,
    uploadingLogo,
    setMessage,
    updateCompanyLogo,
    openClientUpdateModal,
    startEditDetails,
    updatePriority,
    requestStatusChange,
    selectedProject,
    currentPhase,
    boardStats,
  } = pm;

  if (loading && projects.length === 0) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-16 rounded border border-white/10 bg-white/[0.03]" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px border border-white/10 rounded overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-white/[0.03]" />
          ))}
        </div>
        <div className="h-72 rounded border border-white/10 bg-white/[0.03]" />
      </div>
    );
  }

  return (
    <motion.div
      className="pm-shell w-full min-w-0"
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
    >
      <AnimatePresence>
        {message ? (
          <motion.div
            key="pm-message"
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: motionDuration }}
            className="mb-3 overflow-hidden"
          >
            <div className="px-3 py-2 rounded border border-white/15 bg-white/[0.04] text-white/80 text-sm">
              {message}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Page header — enterprise toolbar */}
      <motion.div
        variants={fadeUp}
        transition={{ duration: motionDuration }}
        className="pm-brand-hero mb-3 rounded border border-white/10 bg-white/[0.03]"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-3 sm:px-4 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="pm-brand-hero__title text-base font-semibold text-white tracking-tight">
                Project delivery
              </h2>
              <span className="pm-brand-hero__eyebrow text-[10px] font-medium uppercase tracking-wider text-white/40 border border-white/10 px-1.5 py-0.5 rounded">
                SDLC
              </span>
            </div>
            <p className="pm-brand-hero__sub text-white/45 text-xs mt-1 hidden sm:block">
              Discovery · Requirements · Design · Development · Testing · Deployment · Support ·
              SEO · Digital Marketing
            </p>
            <p className="pm-brand-hero__sub text-white/45 text-xs mt-1 sm:hidden">
              9-phase delivery pipeline · checklists · payments
            </p>
          </div>
          <motion.button
            type="button"
            whileHover={reduceMotion ? undefined : { scale: 1.02 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            onClick={() => setShowNewProject(true)}
            className="shrink-0 inline-flex items-center justify-center gap-1.5 w-full sm:w-auto px-3 py-2 sm:py-1.5 rounded border border-white/20 bg-white/[0.06] text-white text-xs font-medium hover:bg-white/[0.1] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New project
          </motion.button>
        </div>
      </motion.div>

      <PmStats pm={pm} />

      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="inline-flex rounded border border-white/15 overflow-hidden">
          <button
            type="button"
            onClick={() => setListViewMode("list")}
            className={`px-3 py-1.5 text-xs font-medium ${
              listViewMode === "list"
                ? "bg-white/15 text-white"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            List
          </button>
          <button
            type="button"
            onClick={() => setListViewMode("pipeline")}
            className={`px-3 py-1.5 text-xs font-medium border-l border-white/15 ${
              listViewMode === "pipeline"
                ? "bg-white/15 text-white"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            Pipeline
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/45">
          <span>
            Paid ${boardStats.paidSum.toLocaleString()} · Due/pending $
            {boardStats.unpaidSum.toLocaleString()}
          </span>
          {listViewMode === "pipeline" && (
            <button
              type="button"
              onClick={() => setStuckOnly((v) => !v)}
              className={`px-2 py-1 rounded border text-[10px] font-medium ${
                stuckOnly
                  ? "border-amber-400/40 bg-amber-500/15 text-amber-100"
                  : "border-white/15 text-white/50 hover:text-white/80"
              }`}
            >
              Stuck at gate only
            </button>
          )}
        </div>
      </div>

      {listViewMode === "pipeline" && (
        <div className="mb-3 min-w-0 max-w-full">
          <PmPipelineBoard
            projects={projects}
            selectedId={selectedId}
            stuckOnly={stuckOnly}
            onSelect={(id) => selectProject(id)}
          />
        </div>
      )}

      <PmNewProjectModal pm={pm} />

      <motion.div
        variants={fadeUp}
        transition={{ duration: motionDuration }}
        className={`grid gap-3 w-full min-w-0 max-w-full items-start ${
          listViewMode === "pipeline"
            ? "grid-cols-1"
            : "grid-cols-1 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,240px)_minmax(0,1fr)]"
        }`}
      >
        <div
          className={`bg-white/[0.02] border border-white/10 rounded overflow-hidden flex-col w-full lg:sticky lg:top-3 ${
            listViewMode === "pipeline"
              ? "hidden"
              : selectedProject && mobilePane === "detail"
                ? "hidden lg:flex"
                : "flex"
          }`}
        >
          <PmProjectList pm={pm} />
        </div>

        <div
          className={`min-w-0 w-full ${
            !selectedProject || mobilePane === "list" ? "hidden lg:block" : "block"
          }`}
        >
          <AnimatePresence mode="wait">
            {selectedProject ? (
              <motion.div
                key={selectedProject.id}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: 6 }}
                transition={{ duration: motionDuration }}
                className="pm-detail-panel border border-white/10 rounded overflow-hidden"
              >
                <div className="px-3 sm:px-4 py-3 border-b border-white/10">
                  <button
                    type="button"
                    onClick={() => setMobilePane("list")}
                    className="lg:hidden mb-2 inline-flex items-center gap-1 text-[11px] text-white/50 hover:text-white/80"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    All projects
                  </button>
                  <div className="flex flex-col gap-3 mb-3 min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <label
                        className={`relative shrink-0 cursor-pointer group ${
                          uploadingLogo ? "opacity-60 pointer-events-none" : ""
                        }`}
                        title="Upload company logo"
                      >
                        <ProjectLogoMark
                          name={selectedProject.companyName || selectedProject.projectName}
                          logo={selectedProject.companyLogo}
                          size="md"
                        />
                        <span className="pointer-events-none absolute inset-0 rounded bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px] font-medium text-white transition-opacity">
                          {uploadingLogo ? "…" : "Logo"}
                        </span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                          className="sr-only"
                          disabled={uploadingLogo}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = "";
                            if (!file) return;
                            if (file.size > 2 * 1024 * 1024) {
                              setMessage("Logo must be 2 MB or smaller");
                              return;
                            }
                            void updateCompanyLogo(file);
                          }}
                        />
                      </label>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-base font-semibold text-white truncate">
                          {selectedProject.projectName}
                        </h2>
                        <p className="text-white/45 text-xs truncate mt-0.5">
                          {selectedProject.clientName}
                          {selectedProject.companyName
                            ? ` · ${selectedProject.companyName}`
                            : ""}
                        </p>
                        <p className="text-white/30 text-[10px] mt-0.5 lg:hidden">
                          Tap logo to upload
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full min-w-0 flex-wrap">
                      <button
                        type="button"
                        onClick={() => void openClientUpdateModal()}
                        className="pm-action-btn text-xs"
                      >
                        Send client update
                      </button>
                      <button
                        type="button"
                        onClick={startEditDetails}
                        className="text-xs px-2.5 py-1.5 rounded border border-white/20 bg-white/[0.06] text-white font-medium hover:bg-white/[0.1]"
                      >
                        Edit
                      </button>
                      <select
                        value={selectedProject.priority}
                        onChange={(e) =>
                          updatePriority(e.target.value as AdminProject["priority"])
                        }
                        className={`min-w-0 max-w-full text-xs px-2 py-1.5 rounded border cursor-pointer outline-none bg-transparent ${priorityStyle(selectedProject.priority)}`}
                      >
                        <option value="low" className="bg-[#0a0a1a]">
                          Low
                        </option>
                        <option value="medium" className="bg-[#0a0a1a]">
                          Medium
                        </option>
                        <option value="high" className="bg-[#0a0a1a]">
                          High
                        </option>
                        <option value="critical" className="bg-[#0a0a1a]">
                          Critical
                        </option>
                      </select>
                      <select
                        value={currentPhase}
                        onChange={(e) =>
                          requestStatusChange(e.target.value as ProjectPhase)
                        }
                        title="Change phase (confirmation required)"
                        className="min-w-0 max-w-full bg-transparent border border-white/15 rounded px-2 py-1.5 text-white text-xs outline-none cursor-pointer"
                      >
                        {PROJECT_PHASES.map((p) => (
                          <option key={p.key} value={p.key} className="bg-[#0a0a1a]">
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <PmPhaseRail pm={pm} />
                </div>

                <PmTabBar pm={pm} />

                <div className="pm-detail-scroll p-3 sm:p-4 max-h-[min(70vh,640px)] lg:max-h-[calc(100vh-480px)] overflow-y-auto overscroll-contain">
                  <AnimatePresence mode="wait">
                    {projectTab === "workflow" && <PmWorkflowTab key="tab-workflow" pm={pm} />}
                    {projectTab === "team" && <PmTeamTab key="tab-team" pm={pm} />}
                    {projectTab === "overview" && <PmOverviewTab key="tab-overview" pm={pm} />}
                    {projectTab === "tasks" && <PmTasksTab key="tab-tasks" pm={pm} />}
                    {projectTab === "timeline" && <PmTimelineTab key="tab-timeline" pm={pm} />}
                    {projectTab === "notes" && <PmNotesTab key="tab-notes" pm={pm} />}
                    {projectTab === "activity" && <PmActivityTab key="tab-activity" pm={pm} />}
                    {projectTab === "updates" && <PmUpdatesTab key="tab-updates" pm={pm} />}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="pm-empty-detail"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pm-detail-panel border border-white/10 rounded min-h-[200px] flex items-center justify-center p-6 sm:p-8"
              >
                <div className="text-center max-w-sm">
                  <p className="text-white font-medium text-sm">No project selected</p>
                  <p className="text-white/40 text-xs mt-1.5 leading-relaxed">
                    Choose a record from the list, or create a new project.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <PmClientUpdateModal pm={pm} />
      <PmPhaseChangeModal pm={pm} />
    </motion.div>
  );
}
