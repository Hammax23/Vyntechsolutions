"use client";

import { motion } from "framer-motion";
import type { ProjectManagerApi } from "./useProjectManager";
import { fadeOnly } from "./pm-helpers";

type Props = { pm: ProjectManagerApi };

export default function PmUpdatesTab({ pm }: Props) {
  const {
    reduceMotion,
    motionDuration,
    selectedProject,
    cuHistoryTotal,
    openClientUpdateModal,
    cuHistory,
    openClientUpdateRecord,
  } = pm;

  if (!selectedProject) return null;

  return (
    <motion.div
      key="tab-updates"
      variants={fadeOnly}
      initial="hidden"
      animate="show"
      exit="hidden"
      transition={{ duration: motionDuration }}
      className="space-y-3"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <p className="text-white/80 text-sm font-medium">Client update emails</p>
          <p className="text-white/40 text-xs mt-0.5">
            Full send record for this project
            {cuHistoryTotal > 0 ? ` · ${cuHistoryTotal} total` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void openClientUpdateModal()}
          className="pm-action-btn text-xs shrink-0"
        >
          Compose update
        </button>
      </div>
    
      {cuHistory.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-6 text-center">
          <p className="text-white/45 text-sm">No client emails sent yet.</p>
          <p className="text-white/30 text-xs mt-1">
            Send an update from Compose — every send is logged here.
          </p>
        </div>
      ) : (
        <div className="border border-white/10 rounded-lg overflow-hidden">
          <div className="hidden sm:grid grid-cols-[1fr_140px_90px_90px_72px] gap-2 px-3 py-2 border-b border-white/10 text-[10px] uppercase tracking-wide text-white/35">
            <span>Subject / recipient</span>
            <span>When</span>
            <span>Kind</span>
            <span>Status</span>
            <span />
          </div>
          <ul className="divide-y divide-white/5">
            {cuHistory.map((row) => (
              <li
                key={row.id}
                className="px-3 py-3 sm:grid sm:grid-cols-[1fr_140px_90px_90px_72px] sm:gap-2 sm:items-center"
              >
                <div className="min-w-0">
                  <p className="text-white/80 text-sm truncate">{row.subject}</p>
                  <p className="text-white/35 text-[11px] mt-0.5 truncate">
                    To {row.sentTo}
                    {row.bccTo ? ` · BCC ${row.bccTo}` : ""}
                    {row.sentBy ? ` · ${row.sentBy}` : ""}
                  </p>
                  {row.errorMessage ? (
                    <p className="text-red-300/70 text-[10px] mt-1 truncate">
                      {row.errorMessage}
                    </p>
                  ) : null}
                </div>
                <p className="text-white/40 text-[11px] mt-1.5 sm:mt-0">
                  {new Date(row.createdAt).toLocaleString()}
                </p>
                <p className="text-white/45 text-[11px] mt-1 sm:mt-0 capitalize">
                  {row.kind === "test" ? "Test" : "Client"}
                </p>
                <p
                  className={`text-[11px] mt-1 sm:mt-0 ${
                    row.status === "failed"
                      ? "text-red-300/80"
                      : "text-emerald-300/70"
                  }`}
                >
                  {row.status === "failed" ? "Failed" : "Sent"}
                </p>
                <div className="flex items-center gap-2 mt-2 sm:mt-0 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => void openClientUpdateRecord(row.id)}
                    className="text-[11px] text-white/70 hover:text-white"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void openClientUpdateModal({
                        subject: row.subject,
                        note: row.messageNote || "",
                        to: row.kind === "client" ? row.sentTo : undefined,
                      })
                    }
                    className="text-[11px] text-white/40 hover:text-white/70"
                  >
                    Reuse
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {cuHistoryTotal > cuHistory.length ? (
            <p className="px-3 py-2 text-[10px] text-white/30 border-t border-white/5">
              Showing latest {cuHistory.length} of {cuHistoryTotal}
            </p>
          ) : null}
        </div>
      )}
    </motion.div>
  );
}
