"use client";

import { motion } from "framer-motion";
import type { ProjectManagerApi } from "./useProjectManager";
import { fadeOnly } from "./pm-helpers";

type Props = { pm: ProjectManagerApi };

export default function PmNotesTab({ pm }: Props) {
  const {
    reduceMotion,
    motionDuration,
    selectedProject,
    showAddNote,
    setShowAddNote,
    newNote,
    setNewNote,
    addNote,
    deleteNote,
  } = pm;

  if (!selectedProject) return null;

  return (
    <motion.div
      key="tab-notes"
      variants={fadeOnly}
      initial="hidden"
      animate="show"
      exit="hidden"
      transition={{ duration: motionDuration }}
      className="space-y-3"
    >
      <div className="flex items-start sm:items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="pm-check-label text-xs font-semibold uppercase tracking-wider">
            Shared notes{" "}
            <span className="text-white/50 font-medium normal-case tracking-normal">
              ({selectedProject.notes.length} saved)
            </span>
          </p>
          <p className="pm-check-num text-[11px] mt-0.5">
            Visible to both CEOs · author and timestamp on every entry
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddNote(true)}
          className="shrink-0 px-2.5 py-1.5 border border-white/20 bg-white/[0.06] text-white text-xs font-medium rounded hover:bg-white/[0.1]"
        >
          Add note
        </button>
      </div>
      {showAddNote && (
        <div className="border border-white/15 rounded p-3 space-y-3 bg-white/[0.02]">
          <textarea
            placeholder="Write a note for the other CEO to see…"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="pm-field pm-field--area"
          />
          <div className="flex flex-col-reverse sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => void addNote()}
              className="px-3 py-1.5 border border-white/20 bg-white/[0.08] text-white text-xs font-medium rounded"
            >
              Save note
            </button>
            <button
              type="button"
              onClick={() => setShowAddNote(false)}
              className="px-3 py-1.5 border border-white/10 text-white/60 text-xs rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <div className="border border-white/10 rounded overflow-hidden divide-y divide-white/5">
        {selectedProject.notes.length === 0 ? (
          <p className="pm-check-num text-sm px-3 py-6 text-center">
            No notes yet. Save the first one — count updates on the Notes tab.
          </p>
        ) : (
          [...selectedProject.notes]
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            .map((note, idx) => (
              <div key={note.id} className="px-3 py-3">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="pm-check-num text-[10px] font-medium tabular-nums">
                    #{selectedProject.notes.length - idx}
                  </span>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="pm-check-num text-[10px] truncate">
                      {note.author || "Admin"} ·{" "}
                      {new Date(note.createdAt).toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => void deleteNote(note.id)}
                      className="pm-action-btn pm-action-btn--danger text-[10px] shrink-0"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="pm-check-label text-sm whitespace-pre-wrap leading-relaxed">
                  {note.content}
                </p>
              </div>
            ))
        )}
      </div>
    </motion.div>
  );
}
