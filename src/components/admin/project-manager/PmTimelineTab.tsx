"use client";

import { motion } from "framer-motion";
import type { ProjectManagerApi } from "./useProjectManager";
import { fadeOnly } from "./pm-helpers";

type Props = { pm: ProjectManagerApi };

export default function PmTimelineTab({ pm }: Props) {
  const {
    reduceMotion,
    motionDuration,
    selectedProject,
    showAddMilestone,
    setShowAddMilestone,
    newMilestone,
    setNewMilestone,
    addMilestone,
    toggleMilestone,
  } = pm;

  if (!selectedProject) return null;

  return (
    <motion.div
      key="tab-timeline"
      variants={fadeOnly}
      initial="hidden"
      animate="show"
      exit="hidden"
      transition={{ duration: motionDuration }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-white/40 text-xs uppercase tracking-wider font-medium">
          Milestones
        </p>
        <button
          onClick={() => setShowAddMilestone(true)}
          className="px-3 py-1.5 bg-[#0055FF] text-white text-xs font-medium rounded-lg"
        >
          Add Milestone
        </button>
      </div>
      {showAddMilestone && (
        <div className="bg-white/[0.05] border border-white/10 rounded-xl p-4 space-y-3">
          <input
            type="text"
            placeholder="Milestone title"
            value={newMilestone.title}
            onChange={(e) =>
              setNewMilestone({ ...newMilestone, title: e.target.value })
            }
            className="pm-field"
          />
          <input
            type="date"
            value={newMilestone.dueDate}
            onChange={(e) =>
              setNewMilestone({ ...newMilestone, dueDate: e.target.value })
            }
            className="pm-field"
          />
          <div className="flex gap-2">
            <button
              onClick={() => void addMilestone()}
              className="px-4 py-2 bg-[#0055FF] text-white text-sm rounded-lg"
            >
              Add
            </button>
            <button
              onClick={() => setShowAddMilestone(false)}
              className="px-4 py-2 bg-white/10 text-white text-sm rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {selectedProject.milestones.map((milestone) => (
          <div
            key={milestone.id}
            className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-lg p-3"
          >
            <button
              onClick={() => void toggleMilestone(milestone.id)}
              className={`w-5 h-5 rounded-full border-2 ${
                milestone.completed
                  ? "bg-emerald-500 border-emerald-500"
                  : "border-white/30"
              }`}
            />
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm ${
                  milestone.completed
                    ? "text-white/40 line-through"
                    : "text-white"
                }`}
              >
                {milestone.title}
              </p>
            </div>
            <span className="text-white/30 text-xs">
              {milestone.dueDate
                ? new Date(milestone.dueDate).toLocaleDateString()
                : "No date"}
            </span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
        <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
          <p className="text-white/40 text-[10px]">Start Date</p>
          <p className="text-white text-sm font-medium">
            {selectedProject.startDate
              ? new Date(selectedProject.startDate).toLocaleDateString()
              : "Not set"}
          </p>
        </div>
        <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
          <p className="text-white/40 text-[10px]">Deadline</p>
          <p className="text-white text-sm font-medium">
            {selectedProject.deadline
              ? new Date(selectedProject.deadline).toLocaleDateString()
              : "Not set"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
