"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./lib/store";

export default function Home() {
  const router = useRouter();
  const hydrate = useAuth((s) => s.hydrate);
  const isAuthenticated = useAuth((s) => s.isAuthenticated);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard");
    else router.replace("/auth/login");
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
