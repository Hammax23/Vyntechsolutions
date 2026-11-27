"use client";

import { motion } from "framer-motion";
import type { ProjectManagerApi } from "./useProjectManager";
import { fadeOnly, WF_STATUS_LABEL } from "./pm-helpers";

type Props = { pm: ProjectManagerApi };

export default function PmTeamTab({ pm }: Props) {
  const {
    reduceMotion,
    motionDuration,
    selectedProject,
    openInTeamProgress,
    loadingTeam,
    teamDraftIds,
    setTeamDraftIds,
    savingTeam,
    saveProjectTeam,
    staffOptions,
    teamMemberIds,
    assignWork,
    setAssignWork,
    assignStaffChoices,
    assigningWork,
    assignProjectWork,
    linkedWfTasks,
  } = pm;

  if (!selectedProject) return null;

  return (
    <motion.div
      key="tab-team"
      variants={fadeOnly}
      initial="hidden"
      animate="show"
      exit="hidden"
      transition={{ duration: motionDuration }}
      className="space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <p className="pm-check-label text-xs font-semibold uppercase tracking-wider">
            Project team
          </p>
          <p className="pm-check-num text-[11px] mt-0.5">
            Roster for <span className="text-white/70">Assigned work</span> that goes
            to Team Progress / employee workflow. Quick checklist items live under
            Internal tasks.
          </p>
        </div>
        <button
          type="button"
          onClick={openInTeamProgress}
          className="shrink-0 px-2.5 py-1.5 rounded border border-white/20 bg-white/[0.06] text-white text-xs font-medium hover:bg-white/[0.1]"
        >
          Open in Team Progress
        </button>
      </div>
    
      {loadingTeam ? (
        <p className="pm-check-num text-sm">Loading team…</p>
      ) : (
        <>
          <div className="rounded border border-white/15 overflow-hidden">
            <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between gap-2">
              <p className="pm-check-label text-xs font-medium">
                Members ({teamDraftIds.length})
              </p>
              <button
                type="button"
                disabled={savingTeam}
                onClick={() => void saveProjectTeam()}
                className="pm-action-btn text-xs disabled:opacity-50"
              >
                {savingTeam ? "Saving…" : "Save team"}
              </button>
            </div>
            {staffOptions.length === 0 ? (
              <p className="pm-check-num text-sm px-3 py-5 text-center">
                No employees yet. Create accounts under Team Progress first.
              </p>
            ) : (
              <ul className="divide-y divide-white/5 max-h-56 overflow-y-auto">
                {staffOptions.map((s) => {
                  const checked = teamDraftIds.includes(s.id);
                  return (
                    <li key={s.id}>
                      <label className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-white/[0.03]">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setTeamDraftIds((prev) =>
                              checked
                                ? prev.filter((id) => id !== s.id)
                                : [...prev, s.id]
                            );
                          }}
                          className="rounded border-white/30"
                        />
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: s.color || "#64748b" }}
                        />
                        <span className="pm-check-label text-sm min-w-0 truncate">
                          {s.name}
                        </span>
                        <span className="pm-check-num text-[11px] truncate ml-auto">
                          {s.email}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
    
          {teamMemberIds.length === 0 ? (
            <p className="pm-check-num text-xs">
              Add team members so you can assign project work. Until then, assign
              form lists all active staff.
            </p>
          ) : null}
    
          <div className="rounded border border-white/15 p-3 sm:p-4 space-y-3">
            <div>
              <p className="pm-check-label text-xs font-semibold uppercase tracking-wider">
                Assign work
              </p>
              <p className="pm-check-num text-[11px] mt-0.5">
                Creates a Workflow task for the employee (calendar + /workflow)
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-white/40 text-[11px] mb-1">
                  Assignee *
                </label>
                <select
                  className="pm-field"
                  value={assignWork.assignedToId}
                  onChange={(e) =>
                    setAssignWork({ ...assignWork, assignedToId: e.target.value })
                  }
                >
                  <option value="" className="bg-[#0a0a1a]">
                    Select employee
                  </option>
                  {assignStaffChoices.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#0a0a1a]">
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white/40 text-[11px] mb-1">
                  Work date *
                </label>
                <input
                  type="date"
                  className="pm-field"
                  value={assignWork.workDate}
                  onChange={(e) =>
                    setAssignWork({ ...assignWork, workDate: e.target.value })
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-white/40 text-[11px] mb-1">
                  Title *
                </label>
                <input
                  className="pm-field"
                  value={assignWork.title}
                  onChange={(e) =>
                    setAssignWork({ ...assignWork, title: e.target.value })
                  }
                  placeholder="e.g. SARJ homepage wireframes"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-white/40 text-[11px] mb-1">Notes</label>
                <textarea
                  className="pm-field pm-field--area"
                  value={assignWork.description}
                  onChange={(e) =>
                    setAssignWork({ ...assignWork, description: e.target.value })
                  }
                  placeholder="Context for the employee…"
                />
              </div>
              <div>
                <label className="block text-white/40 text-[11px] mb-1">
                  Priority
                </label>
                <select
                  className="pm-field"
                  value={assignWork.priority}
                  onChange={(e) =>
                    setAssignWork({ ...assignWork, priority: e.target.value })
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
                </select>
              </div>
              <div>
                <label className="block text-white/40 text-[11px] mb-1">
                  Work link (optional)
                </label>
                <input
                  className="pm-field"
                  value={assignWork.workLink}
                  onChange={(e) =>
                    setAssignWork({ ...assignWork, workLink: e.target.value })
                  }
                  placeholder="https://…"
                />
              </div>
            </div>
            <button
              type="button"
              disabled={assigningWork}
              onClick={() => void assignProjectWork()}
              className="pm-action-btn text-xs disabled:opacity-50"
            >
              {assigningWork ? "Assigning…" : "Assign work"}
            </button>
          </div>
    
          <div className="rounded border border-white/15 overflow-hidden">
            <div className="px-3 py-2 border-b border-white/10">
              <p className="pm-check-label text-xs font-semibold uppercase tracking-wider">
                Assigned work
              </p>
              <p className="pm-check-num text-[11px] mt-0.5">
                Workflow tasks for this project · Internal tasks tab is CEO checklist only
              </p>
            </div>
            {linkedWfTasks.length === 0 ? (
              <p className="pm-check-num text-sm px-3 py-5 text-center">
                No assigned work yet. Use Assign work above, or open Team Progress for
                calendar detail.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-left">
                      <th className="pm-check-num font-medium px-3 py-2">Date</th>
                      <th className="pm-check-num font-medium px-3 py-2">Title</th>
                      <th className="pm-check-num font-medium px-3 py-2">Assignee</th>
                      <th className="pm-check-num font-medium px-3 py-2">Status</th>
                      <th className="pm-check-num font-medium px-3 py-2">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {linkedWfTasks.map((t) => (
                      <tr key={t.id}>
                        <td className="pm-check-num px-3 py-2 whitespace-nowrap tabular-nums">
                          {t.workDate}
                        </td>
                        <td className="pm-check-label px-3 py-2 font-medium max-w-[200px] truncate">
                          {t.title}
                        </td>
                        <td className="pm-check-num px-3 py-2 whitespace-nowrap">
                          {t.assignedTo?.name || "—"}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`pm-status-chip ${
                              t.status === "done"
                                ? "pm-status-chip--paid"
                                : t.status === "blocked"
                                  ? "pm-status-chip--due"
                                  : "pm-status-chip--pending"
                            }`}
                          >
                            {WF_STATUS_LABEL[t.status] || t.status}
                          </span>
                        </td>
                        <td className="pm-check-num px-3 py-2 capitalize">
                          {t.priority}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
