"use client";

import { motion } from "framer-motion";
import type { ProjectManagerApi } from "./useProjectManager";
import { fadeOnly } from "./pm-helpers";

type Props = { pm: ProjectManagerApi };

export default function PmActivityTab({ pm }: Props) {
  const { motionDuration, selectedProject } = pm;

  if (!selectedProject) return null;

  return (
    <motion.div
      key="tab-activity"
      variants={fadeOnly}
      initial="hidden"
      animate="show"
      exit="hidden"
      transition={{ duration: motionDuration }}
      className="space-y-2"
    >
      {selectedProject.activityLog
        .slice()
        .reverse()
        .map((activity) => (
          <div
            key={activity.id}
            className="bg-white/[0.02] border border-white/5 rounded-lg p-3"
          >
            <p className="text-white/70 text-sm">{activity.action}</p>
            <p className="text-white/30 text-xs mt-1">
              {activity.user} · {new Date(activity.timestamp).toLocaleString()}
            </p>
          </div>
        ))}
    </motion.div>
  );
}
