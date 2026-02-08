"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Clock, Repeat, ArrowRight, Check, Sparkles, CalendarDays, CalendarClock } from "lucide-react";
import { api } from "@/app/lib/api";

const JOB_TYPES = [
  { value: "SEND_NOW", label: "Send Now", desc: "Send immediately", icon: Send, color: "from-violet-500 to-purple-600" },
  { value: "SEND_AT", label: "Schedule", desc: "Send at exact time", icon: Clock, color: "from-blue-500 to-cyan-500" },
  { value: "INTERVAL", label: "Recurring", desc: "Send on repeat", icon: Repeat, color: "from-emerald-500 to-teal-500" },
] as const;

const TIMEZONES = [
  "Asia/Kolkata", "America/New_York", "America/Chicago", "America/Denver",
  "America/Los_Angeles", "Europe/London", "Europe/Berlin", "Europe/Paris",
  "Asia/Tokyo", "Asia/Shanghai", "Australia/Sydney", "Pacific/Auckland",
  "UTC",
];

export default function ComposePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [jobType, setJobType] = useState<string>("SEND_NOW");
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [recurrence, setRecurrence] = useState<"ONCE" | "DAILY" | "WEEKLY">("ONCE");
  const [intervalMinutes, setIntervalMinutes] = useState(15);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const parseEmails = (s: string) => s.split(",").map((e) => e.trim()).filter(Boolean);

  const handleSubmit = async () => {
    setError("");
    const toList = parseEmails(to);
    if (toList.length === 0) { setError("At least one recipient is required"); return; }
    if (!subject.trim()) { setError("Subject is required"); return; }
    if (jobType === "SEND_AT" && !scheduleTime) { setError("Schedule time is required"); return; }

    setLoading(true);
    try {
      await api.createJob({
        job_type: jobType,
        recipients: { to: toList, cc: parseEmails(cc), bcc: parseEmails(bcc) },
        subject,
        body_text: bodyText || undefined,
        body_html: bodyHtml || undefined,
        schedule_time: jobType === "SEND_AT" ? scheduleTime : undefined,
        timezone: jobType === "SEND_AT" ? timezone : undefined,
        recurrence: jobType === "SEND_AT" ? recurrence : undefined,
        interval_minutes: jobType === "INTERVAL" ? intervalMinutes : undefined,
      });
      setSuccess(true);
      setTimeout(() => router.push("/dashboard/jobs"), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create job");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto pt-20">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="glass rounded-2xl p-12 text-center glow"
        >
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
            className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4"
          >
            <Check className="w-8 h-8 text-emerald-400" />
          </motion.div>
          <h2 className="text-xl font-bold mb-2">Job Created!</h2>
          <p className="text-[var(--text-secondary)] text-sm">
            {jobType === "SEND_NOW" ? "Your email is being sent..." :
             jobType === "SEND_AT" ? (recurrence === "ONCE" ? "Your email has been scheduled." : `Your ${recurrence.toLowerCase()} schedule is active.`) :
             "Your recurring job is active."}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          Compose <Sparkles className="w-5 h-5 text-[var(--accent)]" />
        </h1>
        <p className="text-[var(--text-secondary)] text-sm mb-6">Create a new email job</p>
      </motion.div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full text-xs font-medium flex items-center justify-center transition-colors ${
              step >= s ? "bg-[var(--accent)] text-white" : "bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border)]"
            }`}>{s}</div>
            {s < 3 && <div className={`w-8 h-px ${step > s ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`} />}
          </div>
        ))}
        <span className="text-xs text-[var(--text-muted)] ml-2">
          {step === 1 ? "Type" : step === 2 ? "Email" : "Schedule"}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Job Type */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {JOB_TYPES.map((type) => {
                const Icon = type.icon;
                const selected = jobType === type.value;
                return (
                  <button key={type.value} onClick={() => setJobType(type.value)}
                    className={`glass rounded-xl p-4 text-left transition-all relative overflow-hidden ${
                      selected ? "border-[var(--accent)] glow-sm" : "hover:border-[var(--border-hover)]"
                    }`}
                  >
                    {selected && <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-5`} />}
                    <div className="relative">
                      <Icon className={`w-5 h-5 mb-3 ${selected ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"}`} />
                      <p className="text-sm font-medium">{type.label}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{type.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <button onClick={() => setStep(2)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Step 2: Email Details */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">To (comma-separated)</label>
              <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="recipient@example.com" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">CC</label>
                <input value={cc} onChange={(e) => setCc(e.target.value)} placeholder="Optional" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">BCC</label>
                <input value={bcc} onChange={(e) => setBcc(e.target.value)} placeholder="Optional" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Subject</label>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Body (plain text)</label>
              <textarea value={bodyText} onChange={(e) => setBodyText(e.target.value)} placeholder="Your email body..." rows={5}
                className="w-full resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">HTML Body (optional)</label>
              <textarea value={bodyHtml} onChange={(e) => setBodyHtml(e.target.value)} placeholder="<p>Optional HTML version</p>" rows={3}
                className="w-full resize-none font-mono text-xs" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card)] transition">Back</button>
              <button onClick={() => { if (jobType === "SEND_NOW") { handleSubmit(); } else { setStep(3); } }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition"
              >
                {jobType === "SEND_NOW" ? "Send Now" : "Next"} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Schedule */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {jobType === "SEND_AT" && (
              <>
                {/* Frequency selector */}
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Frequency</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { value: "ONCE", label: "One-time", desc: "Send once", icon: Clock },
                      { value: "DAILY", label: "Daily", desc: "Same time daily", icon: CalendarDays },
                      { value: "WEEKLY", label: "Weekly", desc: "Same day & time", icon: CalendarClock },
                    ] as const).map((opt) => {
                      const Icon = opt.icon;
                      const selected = recurrence === opt.value;
                      return (
                        <button key={opt.value} type="button" onClick={() => setRecurrence(opt.value)}
                          className={`glass rounded-lg p-3 text-left transition-all ${
                            selected ? "border-[var(--accent)] glow-sm" : "hover:border-[var(--border-hover)]"
                          }`}
                        >
                          <Icon className={`w-4 h-4 mb-1.5 ${selected ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`} />
                          <p className="text-xs font-medium">{opt.label}</p>
                          <p className="text-[10px] text-[var(--text-muted)]">{opt.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                    {recurrence === "ONCE" ? "Date & Time" : recurrence === "DAILY" ? "Start Date & Time (repeats daily)" : "Start Date & Time (repeats weekly)"}
                  </label>
                  <input type="datetime-local" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
                  {recurrence === "DAILY" && (
                    <p className="text-xs text-[var(--text-muted)] mt-1">Email will be sent every day at this time.</p>
                  )}
                  {recurrence === "WEEKLY" && (
                    <p className="text-xs text-[var(--text-muted)] mt-1">Email will be sent every week on the same day at this time.</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Timezone</label>
                  <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full">
                    {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                </div>
              </>
            )}
            {jobType === "INTERVAL" && (
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Interval (minutes)</label>
                <input type="number" value={intervalMinutes} onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                  min={5} max={1440} />
                <p className="text-xs text-[var(--text-muted)] mt-1">Min 5 min, max 1440 min (24h). Email sends every {intervalMinutes} minutes.</p>
              </div>
            )}

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >{error}</motion.div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card)] transition">Back</button>
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={handleSubmit} disabled={loading}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-[#7c5cfc] to-[#9b7cfc] text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> :
                  <>{jobType === "SEND_AT" ? (recurrence === "ONCE" ? "Schedule Email" : `Start ${recurrence === "DAILY" ? "Daily" : "Weekly"} Schedule`) : "Start Recurring"} <ArrowRight className="w-4 h-4" /></>
                }
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
