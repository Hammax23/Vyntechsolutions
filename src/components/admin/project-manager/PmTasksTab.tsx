"use client";

import { motion } from "framer-motion";
import type { Task } from "./types";
import { taskStatusStyle } from "./pm-helpers";
import type { ProjectManagerApi } from "./useProjectManager";
import { fadeOnly } from "./pm-helpers";

type Props = { pm: ProjectManagerApi };

export default function PmTasksTab({ pm }: Props) {
  const {
    reduceMotion,
    motionDuration,
    selectedProject,
    showAddTask,
    setShowAddTask,
    newTask,
    setNewTask,
    addTask,
    updateTaskStatus,
    deleteTask,
  } = pm;

  if (!selectedProject) return null;

  return (
    <motion.div
      key="tab-tasks"
      variants={fadeOnly}
      initial="hidden"
      animate="show"
      exit="hidden"
      transition={{ duration: motionDuration }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-white/40 text-xs uppercase tracking-wider font-medium">
            Internal tasks · {selectedProject.tasks.length}
          </p>
          <p className="pm-check-num text-[11px] mt-0.5">
            Project checklist items — not staff assignments. Need staff work? Assign
            from Team.
          </p>
        </div>
        <button
          onClick={() => setShowAddTask(true)}
          className="px-3 py-1.5 bg-[#0055FF] text-white text-xs font-medium rounded-lg"
        >
          Add Task
        </button>
      </div>
      {showAddTask && (
        <div className="bg-white/[0.05] border border-white/10 rounded-xl p-4 space-y-3">
          <input
            type="text"
            placeholder="Task title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="pm-field"
          />
          <textarea
            placeholder="Description (optional)"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            className="pm-field pm-field--area"
          />
          <div className="grid grid-cols-3 gap-3">
            <select
              value={newTask.priority}
              onChange={(e) =>
                setNewTask({
                  ...newTask,
                  priority: e.target.value as Task["priority"],
                })
              }
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none"
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
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none"
            />
            <input
              type="text"
              placeholder="Assignee"
              value={newTask.assignee}
              onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => void addTask()}
              className="px-4 py-2 bg-[#0055FF] text-white text-sm rounded-lg"
            >
              Add Task
            </button>
            <button
              onClick={() => setShowAddTask(false)}
              className="px-4 py-2 bg-white/10 text-white text-sm rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {selectedProject.tasks.length === 0 ? (
          <p className="text-white/40 text-sm text-center py-8">
            No internal tasks yet. For employee assignments, use the Team tab → Assign
            work.
          </p>
        ) : (
          selectedProject.tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white/[0.03] border border-white/10 rounded-lg p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() =>
                      void updateTaskStatus(
                        task.id,
                        task.status === "completed" ? "pending" : "completed"
                      )
                    }
                    className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center ${
                      task.status === "completed"
                        ? "bg-emerald-500 border-emerald-500"
                        : "border-white/30"
                    }`}
                  >
                    {task.status === "completed" ? (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : null}
                  </button>
                  <div className="min-w-0">
                    <h4
                      className={`text-sm font-medium ${
                        task.status === "completed"
                          ? "text-white/40 line-through"
                          : "text-white"
                      }`}
                    >
                      {task.title}
                    </h4>
                    {task.description ? (
                      <p className="text-white/40 text-xs mt-1">{task.description}</p>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={task.status}
                    onChange={(e) =>
                      void updateTaskStatus(
                        task.id,
                        e.target.value as Task["status"]
                      )
                    }
                    className={`text-[10px] px-2 py-1 rounded outline-none ${taskStatusStyle(task.status)}`}
                  >
                    <option value="pending" className="bg-[#0a0a1a]">
                      Pending
                    </option>
                    <option value="in_progress" className="bg-[#0a0a1a]">
                      In Progress
                    </option>
                    <option value="completed" className="bg-[#0a0a1a]">
                      Completed
                    </option>
                  </select>
                  <button
                    onClick={() => void deleteTask(task.id)}
                    className="p-1 text-white/30 hover:text-red-400"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
