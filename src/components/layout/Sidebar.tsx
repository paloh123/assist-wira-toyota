"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import {
  LayoutDashboard,
  Upload,
  Database,
  Calendar,
  Table2,
  Download,
  BarChart3,
  Settings,
  History,
  ChevronRight,
  Zap,
  ShieldCheck,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { canWrite } from "@/lib/roles";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  writeOnly?: boolean;
};

const navItems: { group: string; items: NavItem[] }[] = [
  {
    group: "UTAMA",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/import", label: "Import TXT", icon: Upload, writeOnly: true },
    ],
  },
  {
    group: "PROSES",
    items: [
      { href: "/pending", label: "Data Pending", icon: Database },
      { href: "/plan", label: "Planning Upload", icon: Calendar, writeOnly: true },
      { href: "/fix", label: "Fix Sheet", icon: Table2, writeOnly: true },
    ],
  },
  {
    group: "OUTPUT",
    items: [
      { href: "/export", label: "Export TXT", icon: Download, writeOnly: true },
      { href: "/monitoring", label: "Monitoring", icon: BarChart3 },
      { href: "/history", label: "History Export", icon: History },
    ],
  },
  {
    group: "KONFIGURASI",
    items: [
      { href: "/settings", label: "Settings ASSIST", icon: Settings, writeOnly: true },
      { href: "/users", label: "User Login", icon: Users, writeOnly: true },
    ],
  },
];

export function Sidebar({ userRole }: { userRole?: string }) {
  const pathname = usePathname();
  const writable = canWrite(userRole);

  return (
    <aside className="relative z-20 flex min-h-screen w-[5.5rem] flex-shrink-0 p-2 sm:w-[18rem] sm:p-4">
      <div className="premium-sidebar flex min-h-full w-full flex-col">
      {/* Logo */}
      <div className="flex items-center justify-center gap-3 border-b border-white/10 px-3 py-5 sm:justify-start sm:px-5">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-cyan-300/30 bg-gradient-to-br from-cyan-400/30 via-blue-500/30 to-violet-500/30 shadow-[0_0_32px_rgba(6,182,212,0.35)]">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div className="hidden sm:block">
          <p className="text-[15px] font-semibold leading-none tracking-wide text-white">WEB ASSIST</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-cyan-200/70">Wira Toyota Banjarmasin</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {navItems.map((group) => (
          <div key={group.group}>
            <p className="mb-2 hidden px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 sm:block">
              {group.group}
            </p>
            <div className="space-y-0.5">
              {group.items.filter((item) => !item.writeOnly || writable).map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group relative flex items-center justify-center gap-3 overflow-hidden rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-300 sm:justify-start",
                      active
                        ? "border border-cyan-300/25 bg-cyan-400/[0.12] text-cyan-100 shadow-[0_0_28px_rgba(59,130,246,0.22)]"
                        : "border border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.07] hover:text-slate-100"
                    )}
                  >
                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-cyan-300/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <Icon
                      className={cn(
                        "relative z-10 h-4 w-4 flex-shrink-0 transition-colors",
                        active ? "text-cyan-200" : "text-slate-500 group-hover:text-cyan-200"
                      )}
                    />
                    <span className="relative z-10 hidden flex-1 sm:inline">{item.label}</span>
                    {active && (
                      <ChevronRight className="relative z-10 hidden h-3 w-3 text-cyan-200 opacity-80 sm:block" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="hidden border-t border-white/10 px-5 py-4 sm:block">
        <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/[0.08] px-3 py-3">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-100">
            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.9)]" />
            Control Layer Online
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-200/70" />
            Build 2026.1
          </div>
        </div>
      </div>
      </div>
    </aside>
  );
}
