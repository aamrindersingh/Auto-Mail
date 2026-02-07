"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/store";
import Sidebar from "@/app/components/ui/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const hydrate = useAuth((s) => s.hydrate);
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const router = useRouter();

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => {
    if (!isAuthenticated && typeof window !== "undefined" && !localStorage.getItem("token")) {
      router.replace("/auth/login");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-[220px] p-6 lg:p-8">{children}</main>
    </div>
  );
}
