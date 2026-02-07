"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/app/lib/store";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const register = useAuth((s) => s.register);
  const hydrate = useAuth((s) => s.hydrate);
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const router = useRouter();

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => { if (isAuthenticated) router.replace("/dashboard"); }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      await register(email, password, name || undefined);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c5cfc] to-[#c084fc] flex items-center justify-center">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">AutoMail</span>
        </div>

        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">Create account <Sparkles className="w-5 h-5 text-[var(--accent)]" /></h1>
        <p className="text-[var(--text-secondary)] mb-8 text-sm">Start scheduling emails in minutes</p>

        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
          >{error}</motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Name (optional)</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoFocus />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#7c5cfc] to-[#9b7cfc] text-white font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Create account <ArrowRight className="w-4 h-4" /></>}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
          Already have an account? <Link href="/auth/login" className="text-[var(--accent)] hover:underline font-medium">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
