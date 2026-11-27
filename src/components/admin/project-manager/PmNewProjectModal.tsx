"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ProjectManagerApi } from "./useProjectManager";
import type { AdminProject } from "./types";

type Props = { pm: ProjectManagerApi };

export default function PmNewProjectModal({ pm }: Props) {
  const {
    showNewProject,
    motionDuration,
    setShowNewProject,
    emptyNewProject,
    setNewProject,
    clearLogoPick,
    newProject,
    logoPreview,
    logoFile,
    pickLogoFile,
    setMessage,
    creating,
    createProject,
  } = pm;

  return (
    <AnimatePresence initial={false}>
      {showNewProject ? (
        <motion.div
          key="new-project-form"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: motionDuration }}
          className="mb-3 sm:mb-4 overflow-hidden"
        >
      <div className="rounded border border-white/15 bg-white/[0.03] p-3 sm:p-5 space-y-4">
        <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div>
            <h3 className="text-white font-semibold text-sm">New project</h3>
            <p className="text-white/40 text-xs mt-0.5">
              Opens in Discovery with phase checklist and payment milestones
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowNewProject(false);
              setNewProject(emptyNewProject);
              clearLogoPick();
            }}
            className="text-white/40 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/5"
          >
            Cancel
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="block text-white/40 text-[11px] mb-1">Project name *</label>
            <input
              className="pm-field"
              value={newProject.projectName}
              onChange={(e) => setNewProject({ ...newProject, projectName: e.target.value })}
              placeholder="e.g. Acme Website Redesign"
            />
          </div>
          <div className="md:col-span-2 rounded border border-white/10 bg-white/[0.02] p-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="shrink-0">
                {logoPreview ? (
                  <span className="flex h-14 w-14 items-center justify-center rounded border border-white/15 bg-white overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoPreview} alt="" className="h-full w-full object-contain p-1" />
                  </span>
                ) : (
                  <span className="flex h-14 w-14 items-center justify-center rounded border border-dashed border-white/20 text-white/35 text-[10px] text-center px-1">
                    Logo
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-xs font-medium">Company logo</p>
                <p className="text-white/40 text-[11px] mt-0.5">
                  PNG, JPG, WebP or SVG · max 2 MB · shown on project cards for both CEOs
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <label className="inline-flex cursor-pointer items-center px-2.5 py-1.5 rounded border border-white/20 bg-white/[0.06] text-white text-xs font-medium hover:bg-white/[0.1]">
                    Upload logo
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (!file) return;
                        if (file.size > 2 * 1024 * 1024) {
                          setMessage("Logo must be 2 MB or smaller");
                          e.target.value = "";
                          return;
                        }
                        pickLogoFile(file);
                      }}
                    />
                  </label>
                  {logoFile ? (
                    <button
                      type="button"
                      onClick={clearLogoPick}
                      className="px-2.5 py-1.5 rounded border border-white/10 text-white/55 text-xs"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-white/40 text-[11px] mb-1">Client name *</label>
            <input
              className="pm-field"
              value={newProject.clientName}
              onChange={(e) => setNewProject({ ...newProject, clientName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-white/40 text-[11px] mb-1">Company (optional)</label>
            <input
              className="pm-field"
              value={newProject.companyName}
              onChange={(e) => setNewProject({ ...newProject, companyName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-white/40 text-[11px] mb-1">Client email *</label>
            <input
              type="email"
              className="pm-field"
              value={newProject.clientEmail}
              onChange={(e) => setNewProject({ ...newProject, clientEmail: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-white/40 text-[11px] mb-1">Client phone *</label>
            <input
              className="pm-field"
              value={newProject.clientPhone}
              onChange={(e) => setNewProject({ ...newProject, clientPhone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-white/40 text-[11px] mb-1">Budget (CAD)</label>
            <input
              type="number"
              className="pm-field"
              value={newProject.budget}
              onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-white/40 text-[11px] mb-1">Priority</label>
            <select
              className="pm-field"
              value={newProject.priority}
              onChange={(e) =>
                setNewProject({
                  ...newProject,
                  priority: e.target.value as AdminProject["priority"],
                })
              }
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
          </div>
          <div>
            <label className="block text-white/40 text-[11px] mb-1">Start date</label>
            <input
              type="date"
              className="pm-field"
              value={newProject.startDate}
              onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-white/40 text-[11px] mb-1">Deadline</label>
            <input
              type="date"
              className="pm-field"
              value={newProject.deadline}
              onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-white/40 text-[11px] mb-1">
              Services <span className="text-white/25">(comma-separated)</span>
            </label>
            <input
              className="pm-field"
              value={newProject.services}
              onChange={(e) => setNewProject({ ...newProject, services: e.target.value })}
              placeholder="Web Development, SEO"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-white/40 text-[11px] mb-1">Description</label>
            <textarea
              className="pm-field pm-field--area"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              placeholder="Scope summary…"
            />
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-2">
          <button
            type="button"
            disabled={creating}
            onClick={() => void createProject()}
            className="px-4 py-2.5 bg-[#0055FF] text-white text-sm font-medium rounded-lg hover:bg-[#0066FF] disabled:opacity-50 w-full sm:w-auto"
          >
            {creating ? "Creating…" : "Create project"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowNewProject(false);
              setNewProject(emptyNewProject);
              clearLogoPick();
            }}
            className="px-4 py-2.5 bg-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/15 w-full sm:w-auto"
          >
            Cancel
          </button>
        </div>
      </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
