"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Mail } from "lucide-react";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/lib/store";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hydrate = useAuth((s) => s.hydrate);

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (token) {
      // Store JWT and redirect to dashboard
      api.setToken(token);
      hydrate();

      // Short delay to show success animation
      setTimeout(() => {
        router.replace("/dashboard");
      }, 1500);
    } else {
      // No token — something went wrong
      router.replace("/auth/login?error=no_token");
    }
  }, [searchParams, router, hydrate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="glass rounded-2xl p-12 text-center glow max-w-sm"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </motion.div>

        <h2 className="text-xl font-bold mb-2">You&apos;re in!</h2>
        <p className="text-[var(--text-secondary)] text-sm mb-4">
          Gmail connected successfully. Redirecting to dashboard...
        </p>

        <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
          <Mail className="w-3.5 h-3.5" />
          {searchParams.get("email") || ""}
        </div>

        <div className="mt-6">
          <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </motion.div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
