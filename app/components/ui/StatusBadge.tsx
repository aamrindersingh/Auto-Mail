"use client";

import { motion } from "framer-motion";

const statusConfig: Record<string, { color: string; bg: string; dot: string }> = {
  ACTIVE: { color: "text-emerald-400", bg: "bg-emerald-500/10", dot: "bg-emerald-400" },
  CONNECTED: { color: "text-emerald-400", bg: "bg-emerald-500/10", dot: "bg-emerald-400" },
  SUCCESS: { color: "text-emerald-400", bg: "bg-emerald-500/10", dot: "bg-emerald-400" },
  COMPLETED: { color: "text-blue-400", bg: "bg-blue-500/10", dot: "bg-blue-400" },
  PAUSED: { color: "text-amber-400", bg: "bg-amber-500/10", dot: "bg-amber-400" },
  QUEUED: { color: "text-sky-400", bg: "bg-sky-500/10", dot: "bg-sky-400" },
  PROCESSING: { color: "text-violet-400", bg: "bg-violet-500/10", dot: "bg-violet-400" },
  FAILED: { color: "text-red-400", bg: "bg-red-500/10", dot: "bg-red-400" },
  CANCELLED: { color: "text-gray-400", bg: "bg-gray-500/10", dot: "bg-gray-400" },
  DISCONNECTED: { color: "text-red-400", bg: "bg-red-500/10", dot: "bg-red-400" },
  RETRYING: { color: "text-amber-400", bg: "bg-amber-500/10", dot: "bg-amber-400" },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.CANCELLED;

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${
        ["ACTIVE", "PROCESSING", "CONNECTED"].includes(status) ? "pulse-dot" : ""
      }`} />
      {status}
    </motion.span>
  );
}
