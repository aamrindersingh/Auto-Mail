"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Clock, Repeat, Play, Pause, X, Eye, ChevronLeft, ChevronRight, Plus, RefreshCw } from "lucide-react";
import { api, JobResponse, RunResponse } from "@/app/lib/api";
import StatusBadge from "@/app/components/ui/StatusBadge";
import { formatDistanceToNow } from "date-fns";

const FILTERS = ["ALL", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"];

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [selected, setSelected] = useState<JobResponse | null>(null);
  const [runs, setRuns] = useState<RunResponse[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.listJobs({
        status: filter === "ALL" ? undefined : filter,
        page,
        per_page: 15,
      });
      setJobs(res.jobs);
      setTotalPages(res.pagination.total_pages || 1);
    } catch { /* ignore */ }
    setLoading(false);
  }, [filter, page]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const selectJob = async (job: JobResponse) => {
    setSelected(job);
    try {
      const res = await api.getJobRuns(job.job_id);
      setRuns(res.runs);
    } catch { setRuns([]); }
  };

  const handleAction = async (jobId: string, action: "cancel" | "pause" | "resume") => {
    setActionLoading(jobId + action);
    try {
      if (action === "cancel") await api.cancelJob(jobId);
      else if (action === "pause") await api.pauseJob(jobId);
      else await api.resumeJob(jobId);
      await fetchJobs();
      if (selected?.job_id === jobId) {
        const updated = await api.getJob(jobId);
        setSelected(updated);
      }
    } catch { /* ignore */ }
    setActionLoading("");
  };

  const jobIcon = (type: string) => {
    if (type === "SEND_NOW") return <Send className="w-4 h-4 text-violet-400" />;
    if (type === "SEND_AT") return <Clock className="w-4 h-4 text-blue-400" />;
    return <Repeat className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Jobs</h1>
          <p className="text-[var(--text-secondary)] text-sm">Manage all your email jobs</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchJobs} className="p-2 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)] transition">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link href="/dashboard/compose"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition"
          >
            <Plus className="w-3.5 h-3.5" /> New Job
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1 mb-4 p-1 bg-[var(--bg-secondary)] rounded-lg w-fit">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => { setFilter(f); setPage(1); }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
              filter === f ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >{f}</button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Job list */}
        <div className="flex-1 space-y-2">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass rounded-xl p-4 shimmer h-[72px]" />
            ))
          ) : jobs.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center">
              <p className="text-[var(--text-secondary)] text-sm">No jobs found</p>
            </div>
          ) : (
            jobs.map((job) => (
              <motion.button key={job.job_id} layout
                onClick={() => selectJob(job)}
                className={`glass rounded-xl p-4 flex items-center justify-between w-full text-left transition-all ${
                  selected?.job_id === job.job_id ? "border-[var(--accent)]/50 glow-sm" : "hover:border-[var(--border-hover)]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center shrink-0">
                    {jobIcon(job.job_type)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{job.subject}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {job.recipients.to[0]}{job.recipients.to.length > 1 ? ` +${job.recipients.to.length - 1}` : ""}
                      {" "}&middot;{" "}
                      {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <StatusBadge status={job.status} />
              </motion.button>
            ))
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg border border-[var(--border)] disabled:opacity-30 hover:bg-[var(--bg-card)] transition"
              ><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-xs text-[var(--text-secondary)]">{page} / {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-[var(--border)] disabled:opacity-30 hover:bg-[var(--bg-card)] transition"
              ><ChevronRight className="w-4 h-4" /></button>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 360 }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              className="glass rounded-xl p-5 shrink-0 overflow-hidden"
              style={{ width: 360 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">Job Details</h3>
                <button onClick={() => setSelected(null)} className="p-1 rounded-md hover:bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-[var(--text-muted)] text-xs">Subject</span>
                  <p className="font-medium">{selected.subject}</p>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] text-xs">Type</span>
                  <p>{selected.job_type}</p>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] text-xs">Status</span>
                  <div className="mt-1"><StatusBadge status={selected.status} /></div>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] text-xs">Recipients</span>
                  <p className="text-xs">{selected.recipients.to.join(", ")}</p>
                </div>
                {selected.schedule_time_utc && (
                  <div>
                    <span className="text-[var(--text-muted)] text-xs">Scheduled For</span>
                    <p>{new Date(selected.schedule_time_utc).toLocaleString()} ({selected.schedule_timezone})</p>
                  </div>
                )}
                {selected.interval_minutes && (
                  <div>
                    <span className="text-[var(--text-muted)] text-xs">Interval</span>
                    <p>Every {selected.interval_minutes} minutes</p>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="glass rounded-lg p-2 text-center">
                    <p className="text-lg font-bold">{selected.total_runs}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Total</p>
                  </div>
                  <div className="glass rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-emerald-400">{selected.successful_runs}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Success</p>
                  </div>
                  <div className="glass rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-red-400">{selected.failed_runs}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Failed</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  {selected.status === "ACTIVE" && (
                    <button onClick={() => handleAction(selected.job_id, "pause")}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition"
                    ><Pause className="w-3 h-3" /> Pause</button>
                  )}
                  {selected.status === "PAUSED" && (
                    <button onClick={() => handleAction(selected.job_id, "resume")}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition"
                    ><Play className="w-3 h-3" /> Resume</button>
                  )}
                  {!["CANCELLED", "COMPLETED"].includes(selected.status) && (
                    <button onClick={() => handleAction(selected.job_id, "cancel")}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition"
                    ><X className="w-3 h-3" /> Cancel</button>
                  )}
                </div>

                {/* Runs */}
                {runs.length > 0 && (
                  <div className="pt-3 border-t border-[var(--border)]">
                    <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">Recent Runs</p>
                    <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                      {runs.map((run) => (
                        <div key={run.run_id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-[var(--bg-secondary)]">
                          <div>
                            <span className="text-[var(--text-muted)]">
                              {formatDistanceToNow(new Date(run.created_at), { addSuffix: true })}
                            </span>
                            {run.error_code && <span className="ml-2 text-red-400">{run.error_code}</span>}
                          </div>
                          <StatusBadge status={run.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
