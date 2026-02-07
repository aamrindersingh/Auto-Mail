"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, CheckCircle2, XCircle, Link2, Unlink, RefreshCw, Shield, Clock } from "lucide-react";
import { api } from "@/app/lib/api";
import StatusBadge from "@/app/components/ui/StatusBadge";

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" /></div>}>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const [oauthStatus, setOauthStatus] = useState<{
    connected: boolean;
    gmail_address: string | null;
    token_status: string | null;
    connected_at: string | null;
    last_successful_send_at: string | null;
    last_error: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    const oauthResult = searchParams.get("oauth");
    if (oauthResult === "success") setToast({ type: "success", message: "Gmail connected successfully!" });
    else if (oauthResult === "error") setToast({ type: "error", message: `Connection failed: ${searchParams.get("reason") || "unknown"}` });
    if (oauthResult) {
      const url = new URL(window.location.href);
      url.searchParams.delete("oauth");
      url.searchParams.delete("reason");
      window.history.replaceState({}, "", url.pathname);
    }
  }, [searchParams]);

  useEffect(() => {
    (async () => {
      try { setOauthStatus(await api.getOAuthStatus()); }
      catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleConnect = async () => {
    setActionLoading(true);
    try {
      const res = await api.getOAuthStart();
      window.location.href = res.redirect_url;
    } catch (err: unknown) {
      setToast({ type: "error", message: err instanceof Error ? err.message : "Failed to start OAuth" });
      setActionLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Disconnect Gmail? All active jobs will be paused.")) return;
    setActionLoading(true);
    try {
      const res = await api.disconnectGoogle();
      setToast({ type: "success", message: `Disconnected. ${res.jobs_paused} job(s) paused.` });
      setOauthStatus(await api.getOAuthStatus());
    } catch (err: unknown) {
      setToast({ type: "error", message: err instanceof Error ? err.message : "Failed to disconnect" });
    }
    setActionLoading(false);
  };

  const handleReconnect = async () => {
    setActionLoading(true);
    try {
      const res = await api.reconnectGoogle();
      window.location.href = res.redirect_url;
    } catch (err: unknown) {
      setToast({ type: "error", message: err instanceof Error ? err.message : "Failed to reconnect" });
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 shadow-xl ${
              toast.type === "success" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "bg-red-500/20 text-red-300 border border-red-500/30"
            }`}
          >
            {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-1">Settings</h1>
        <p className="text-[var(--text-secondary)] text-sm mb-8">Manage your Gmail connection and preferences</p>
      </motion.div>

      {/* Gmail Connection Card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6 glow"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
            <Mail className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="font-semibold">Gmail Connection</h2>
            <p className="text-xs text-[var(--text-secondary)]">Connect your Google account to send emails</p>
          </div>
        </div>

        {oauthStatus?.connected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-sm font-medium text-emerald-300">{oauthStatus.gmail_address}</p>
                  <p className="text-xs text-emerald-400/60">
                    Connected {oauthStatus.connected_at ? new Date(oauthStatus.connected_at).toLocaleDateString() : ""}
                  </p>
                </div>
              </div>
              <StatusBadge status="CONNECTED" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[var(--bg-secondary)]">
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-1">
                  <Clock className="w-3 h-3" /> Last Send
                </div>
                <p className="text-sm">
                  {oauthStatus.last_successful_send_at
                    ? new Date(oauthStatus.last_successful_send_at).toLocaleString()
                    : "Never"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-secondary)]">
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-1">
                  <Shield className="w-3 h-3" /> Scope
                </div>
                <p className="text-sm">gmail.send (send-only)</p>
              </div>
            </div>

            <button onClick={handleDisconnect} disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition disabled:opacity-50"
            >
              <Unlink className="w-4 h-4" /> Disconnect Gmail
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {oauthStatus?.token_status === "DISCONNECTED" && (
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-400" />
                  <p className="text-sm font-medium text-red-300">Connection Lost</p>
                </div>
                <p className="text-xs text-red-400/70">
                  {oauthStatus.last_error ? `Reason: ${oauthStatus.last_error}` : "Your Gmail connection was disconnected. Reconnect to resume jobs."}
                </p>
                <button onClick={handleReconnect} disabled={actionLoading}
                  className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                  Reconnect Gmail
                </button>
              </div>
            )}

            {!oauthStatus?.token_status && (
              <div>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  Connect your Gmail to start sending and scheduling emails. We only request <strong>send permission</strong> — we cannot read your inbox.
                </p>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  onClick={handleConnect} disabled={actionLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7c5cfc] to-[#9b7cfc] text-white font-medium text-sm hover:opacity-90 transition disabled:opacity-50"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                  Connect Gmail
                </motion.button>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Security info */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="mt-6 glass rounded-2xl p-6"
      >
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-[var(--accent)]" /> Security
        </h3>
        <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
          <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">&#10003;</span> Send-only scope — we cannot read your inbox</li>
          <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">&#10003;</span> Refresh token encrypted with AES-256-GCM</li>
          <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">&#10003;</span> Tokens never exposed to the frontend</li>
          <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">&#10003;</span> You can revoke access anytime from Google settings</li>
        </ul>
      </motion.div>
    </div>
  );
}
