"use client";

import { motion } from "framer-motion";
import type { AdminProject } from "./types";
import type { ProjectManagerApi } from "./useProjectManager";
import { fadeOnly } from "./pm-helpers";

type Props = { pm: ProjectManagerApi };

export default function PmOverviewTab({ pm }: Props) {
  const {
    reduceMotion,
    motionDuration,
    selectedProject,
    editingDetails,
    setEditingDetails,
    startEditDetails,
    editForm,
    setEditForm,
    savingDetails,
    saveProjectDetails,
    paidSumForProject,
    syncSpentFromPayments,
    deleteProject,
  } = pm;

  if (!selectedProject) return null;

  return (
    <motion.div
      key="tab-overview"
      variants={fadeOnly}
      initial="hidden"
      animate="show"
      exit="hidden"
      transition={{ duration: motionDuration }}
      className="space-y-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="pm-check-label text-xs font-semibold uppercase tracking-wider">
            Project details
          </p>
          <p className="pm-check-num text-[11px] mt-0.5">
            Edit client, budget, services, and description anytime
          </p>
        </div>
        {!editingDetails ? (
          <button
            type="button"
            onClick={startEditDetails}
            className="shrink-0 px-2.5 py-1.5 rounded border border-white/20 bg-white/[0.06] text-white text-xs font-medium hover:bg-white/[0.1]"
          >
            Edit details
          </button>
        ) : null}
      </div>
    
      {editingDetails ? (
        <div className="pm-edit-panel rounded border border-white/20 bg-white/[0.02] p-3 sm:p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="block text-white/40 text-[11px] mb-1">
                Project name *
              </label>
              <input
                className="pm-field"
                value={editForm.projectName}
                onChange={(e) =>
                  setEditForm({ ...editForm, projectName: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-white/40 text-[11px] mb-1">
                Client name *
              </label>
              <input
                className="pm-field"
                value={editForm.clientName}
                onChange={(e) =>
                  setEditForm({ ...editForm, clientName: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-white/40 text-[11px] mb-1">Company</label>
              <input
                className="pm-field"
                value={editForm.companyName}
                onChange={(e) =>
                  setEditForm({ ...editForm, companyName: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-white/40 text-[11px] mb-1">
                Client email *
              </label>
              <input
                type="email"
                className="pm-field"
                value={editForm.clientEmail}
                onChange={(e) =>
                  setEditForm({ ...editForm, clientEmail: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-white/40 text-[11px] mb-1">
                Client phone *
              </label>
              <input
                className="pm-field"
                value={editForm.clientPhone}
                onChange={(e) =>
                  setEditForm({ ...editForm, clientPhone: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-white/40 text-[11px] mb-1">
                Budget (CAD)
              </label>
              <input
                type="number"
                className="pm-field"
                value={editForm.budget}
                onChange={(e) =>
                  setEditForm({ ...editForm, budget: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-white/40 text-[11px] mb-1">Spent (CAD)</label>
              <input
                type="number"
                className="pm-field"
                value={editForm.spent}
                onChange={(e) =>
                  setEditForm({ ...editForm, spent: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-white/40 text-[11px] mb-1">Start date</label>
              <input
                type="date"
                className="pm-field"
                value={editForm.startDate}
                onChange={(e) =>
                  setEditForm({ ...editForm, startDate: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-white/40 text-[11px] mb-1">Deadline</label>
              <input
                type="date"
                className="pm-field"
                value={editForm.deadline}
                onChange={(e) =>
                  setEditForm({ ...editForm, deadline: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-white/40 text-[11px] mb-1">Priority</label>
              <select
                className="pm-field"
                value={editForm.priority}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
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
            <div className="md:col-span-2">
              <label className="block text-white/40 text-[11px] mb-1">
                Services (comma-separated)
              </label>
              <input
                className="pm-field"
                value={editForm.services}
                onChange={(e) =>
                  setEditForm({ ...editForm, services: e.target.value })
                }
                placeholder="Web Development, SEO"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-white/40 text-[11px] mb-1">
                Description
              </label>
              <textarea
                className="pm-field pm-field--area"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                placeholder="Scope summary…"
              />
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
            <button
              type="button"
              disabled={savingDetails}
              onClick={() => void saveProjectDetails()}
              className="px-3 py-2 rounded border border-white/20 bg-white/[0.08] text-white text-xs font-medium disabled:opacity-50"
            >
              {savingDetails ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              disabled={savingDetails}
              onClick={() => setEditingDetails(false)}
              className="px-3 py-2 rounded border border-white/10 text-white/60 text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <a
              href={`mailto:${selectedProject.clientEmail}`}
              className="flex items-center gap-3 border border-white/10 rounded p-3"
            >
              <div className="min-w-0">
                <p className="text-white/40 text-[10px]">Email</p>
                <p className="pm-check-label text-xs font-medium truncate">
                  {selectedProject.clientEmail}
                </p>
              </div>
            </a>
            <a
              href={`tel:${selectedProject.clientPhone}`}
              className="flex items-center gap-3 border border-white/10 rounded p-3"
            >
              <div className="min-w-0">
                <p className="text-white/40 text-[10px]">Phone</p>
                <p className="pm-check-label text-xs font-medium">
                  {selectedProject.clientPhone}
                </p>
              </div>
            </a>
            <div className="flex items-center gap-3 border border-white/10 rounded p-3">
              <div className="min-w-0">
                <p className="text-white/40 text-[10px]">Deadline</p>
                <p className="pm-check-label text-xs font-medium">
                  {selectedProject.deadline
                    ? new Date(selectedProject.deadline).toLocaleDateString()
                    : "Not set"}
                </p>
              </div>
            </div>
          </div>
    
          <div className="border border-white/10 rounded p-3 sm:p-4">
            <p className="text-white/40 text-xs uppercase tracking-wider font-medium mb-3">
              Budget overview
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-white/40 text-[10px] mb-1">Total budget</p>
                <p className="pm-check-label text-xl font-semibold tabular-nums">
                  ${Number(selectedProject.budget || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-white/40 text-[10px] mb-1">Spent</p>
                <p className="pm-check-label text-xl font-semibold tabular-nums text-white/80">
                  ${Number(selectedProject.spent || 0).toLocaleString()}
                </p>
                <p className="pm-check-num text-[10px] mt-1">
                  Paid milestones: ${paidSumForProject.toLocaleString()}
                </p>
                <button
                  type="button"
                  onClick={() => void syncSpentFromPayments()}
                  className="pm-action-btn text-[10px] mt-2"
                >
                  Sync spent
                </button>
              </div>
            </div>
          </div>
    
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider font-medium mb-2">
              Services
            </p>
            <div className="flex flex-wrap gap-2">
              {(selectedProject.services || []).length === 0 ? (
                <p className="pm-check-num text-xs">No services listed</p>
              ) : (
                selectedProject.services.map((service, i) => (
                  <span
                    key={i}
                    className="border border-white/15 text-white/70 px-2.5 py-1 rounded text-xs font-medium"
                  >
                    {service}
                  </span>
                ))
              )}
            </div>
          </div>
    
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider font-medium mb-2">
              Project description
            </p>
            <div className="border border-white/10 rounded p-3">
              <p className="pm-check-label text-sm whitespace-pre-wrap">
                {selectedProject.description || "No description provided"}
              </p>
            </div>
          </div>
        </>
      )}
    
      <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => void deleteProject(selectedProject.id)}
          className="text-red-400 text-xs hover:text-red-300 transition-colors"
        >
          Delete project
        </button>
        {!editingDetails ? (
          <button
            type="button"
            onClick={startEditDetails}
            className="text-xs text-white/50 hover:text-white underline-offset-2 hover:underline"
          >
            Edit project details
          </button>
        ) : null}
      </div>
    </motion.div>
  );
}
