"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Send, Clock, Repeat, CheckCircle2, AlertTriangle, PauseCircle, Plus } from "lucide-react";
import { api, JobResponse } from "@/app/lib/api";
import StatusBadge from "@/app/components/ui/StatusBadge";

export default function DashboardPage() {
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [oauthStatus, setOauthStatus] = useState<{ connected: boolean; gmail_address: string | null }>({ connected: false, gmail_address: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [jobsRes, oauthRes] = await Promise.all([
          api.listJobs({ per_page: 5 }),
          api.getOAuthStatus(),
        ]);
        setJobs(jobsRes.jobs);
        setOauthStatus(oauthRes);
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  const stats = {
    active: jobs.filter((j) => j.status === "ACTIVE").length,
    paused: jobs.filter((j) => j.status === "PAUSED").length,
    completed: jobs.filter((j) => j.status === "COMPLETED").length,
    totalSent: jobs.reduce((acc, j) => acc + j.successful_runs, 0),
  };

  const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <motion.div {...fadeIn} transition={{ delay: 0 }}>
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-[var(--text-secondary)] text-sm mb-6">Overview of your email automation</p>
      </motion.div>

      {/* Gmail connection banner */}
      {!oauthStatus.connected && (
        <motion.div {...fadeIn} transition={{ delay: 0.05 }}
          className="mb-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-sm font-medium text-amber-300">Gmail not connected</p>
              <p className="text-xs text-amber-400/70">Connect your Gmail account to start sending emails</p>
            </div>
          </div>
          <Link href="/settings" className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-300 text-sm font-medium hover:bg-amber-500/30 transition">
            Connect Gmail
          </Link>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active Jobs", value: stats.active, icon: Repeat, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Paused", value: stats.paused, icon: PauseCircle, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Emails Sent", value: stats.totalSent, icon: Send, color: "text-violet-400", bg: "bg-violet-500/10" },
        ].map((stat, i) => (
          <motion.div key={stat.label} {...fadeIn} transition={{ delay: 0.1 + i * 0.05 }}
            className="glass rounded-xl p-4 hover:border-[var(--border-hover)] transition-colors"
          >
            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-[18px] h-[18px] ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent jobs */}
      <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Jobs</h2>
          <Link href="/dashboard/compose"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition"
          >
            <Plus className="w-3.5 h-3.5" /> New
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <Send className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
            <p className="text-[var(--text-secondary)] text-sm">No jobs yet. Create your first email job!</p>
            <Link href="/dashboard/compose"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition"
            >
              <Plus className="w-4 h-4" /> Create Job
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {jobs.map((job, i) => (
              <motion.div key={job.job_id} {...fadeIn} transition={{ delay: 0.35 + i * 0.05 }}>
                <Link href={`/dashboard/jobs?selected=${job.job_id}`}
                  className="glass rounded-xl p-4 flex items-center justify-between hover:border-[var(--border-hover)] transition-all group block"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      job.job_type === "SEND_NOW" ? "bg-violet-500/10" : job.job_type === "SEND_AT" ? "bg-blue-500/10" : "bg-emerald-500/10"
                    }`}>
                      {job.job_type === "SEND_NOW" ? <Send className="w-4 h-4 text-violet-400" /> :
                       job.job_type === "SEND_AT" ? <Clock className="w-4 h-4 text-blue-400" /> :
                       <Repeat className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-[var(--accent)] transition-colors">{job.subject}</p>
                      <p className="text-xs text-[var(--text-muted)] truncate">
                        {job.recipients.to.join(", ")} &middot; {job.successful_runs}/{job.total_runs} runs
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={job.status} />
                </Link>
              </motion.div>
            ))}
            {jobs.length >= 5 && (
              <Link href="/dashboard/jobs" className="block text-center text-sm text-[var(--accent)] hover:underline py-2">
                View all jobs
              </Link>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
