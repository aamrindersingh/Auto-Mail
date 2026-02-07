"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "@/app/lib/store";
import dynamic from "next/dynamic";

const FloatingMail = dynamic(() => import("@/app/components/three/FloatingMail"), { ssr: false });

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuth((s) => s.login);
  const hydrate = useAuth((s) => s.hydrate);
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const router = useRouter();

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => { if (isAuthenticated) router.replace("/dashboard"); }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: 3D visual */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7c5cfc]/10 to-transparent" />
        <div className="w-full h-full max-w-lg max-h-lg">
          <Suspense fallback={null}>
            <FloatingMail />
          </Suspense>
        </div>
        <div className="absolute bottom-12 left-12 right-12">
          <h2 className="text-3xl font-bold text-white mb-2">Schedule emails with precision</h2>
          <p className="text-[var(--text-secondary)] text-base">Send at exact times, recurring intervals, or instantly — all from your Gmail.</p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:max-w-md lg:ml-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c5cfc] to-[#c084fc] flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">AutoMail</span>
          </div>

          <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
          <p className="text-[var(--text-secondary)] mb-8 text-sm">Sign in to manage your email schedules</p>

          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >{error}</motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required autoFocus />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              type="submit" disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#7c5cfc] to-[#9b7cfc] text-white font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Sign in <ArrowRight className="w-4 h-4" /></>}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-[var(--accent)] hover:underline font-medium">Sign up</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
