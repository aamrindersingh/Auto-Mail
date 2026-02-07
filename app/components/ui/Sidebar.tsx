"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, LayoutDashboard, PenSquare, Settings, LogOut, Zap } from "lucide-react";
import { useAuth } from "@/app/lib/store";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/compose", label: "Compose", icon: PenSquare },
  { href: "/dashboard/jobs", label: "Jobs", icon: Zap },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const logout = useAuth((s) => s.logout);

  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] flex flex-col border-r border-[var(--border)] bg-[var(--bg-secondary)] z-50">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2.5 px-5 py-5 border-b border-[var(--border)]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c5cfc] to-[#c084fc] flex items-center justify-center">
          <Mail className="w-4 h-4 text-white" />
        </div>
        <span className="text-base font-bold gradient-text">AutoMail</span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} className="block relative">
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive ? "text-[var(--accent)] font-medium" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}>
                <Icon className="w-[18px] h-[18px]" />
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-[var(--border)]">
        <button
          onClick={() => { logout(); window.location.href = "/auth/login"; }}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/5 transition-colors"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Log out
        </button>
      </div>
    </aside>
  );
}
