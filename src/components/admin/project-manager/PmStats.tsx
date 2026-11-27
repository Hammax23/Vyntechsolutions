"use client";

import { motion } from "framer-motion";
import type { ProjectManagerApi } from "./useProjectManager";
import { fadeUp } from "./pm-helpers";

type Props = { pm: ProjectManagerApi };

export default function PmStats({ pm }: Props) {
  const { stats, reduceMotion, motionDuration, stagger } = pm;
  return (
    <motion.div
      variants={fadeUp}
      transition={{ duration: motionDuration }}
      className="pm-kpi-strip grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px mb-3 sm:mb-4 rounded border border-white/10 overflow-hidden bg-white/10"
    >
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          className="pm-stat-card px-3 sm:px-4 py-2.5 sm:py-3"
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: motionDuration, delay: i * stagger }}
        >
          <p className="text-white/40 text-[10px] font-medium uppercase tracking-wider">
            {stat.label}
          </p>
          <p className="text-lg sm:text-xl font-semibold text-white mt-1 tabular-nums tracking-tight">
            {stat.value}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}
