"use client";

import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  Bell,
  LogOut,
  User,
  ChevronDown,
  Search,
  Activity,
  Cpu,
} from "lucide-react";
import { useState } from "react";
import { getRoleLabel, canWrite } from "@/lib/roles";

const pageLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/import": "Import TXT",
  "/pending": "Data Pending",
  "/plan": "Planning Upload",
  "/fix": "Fix Sheet",
  "/export": "Export TXT",
  "/monitoring": "Monitoring Target",
  "/history": "History Export",
  "/settings": "Settings ASSIST",
  "/users": "User Login",
};

export function Topbar({
  userName,
  userRole,
}: {
  userName?: string;
  userRole?: string;
}) {
  const pathname = usePathname();
  const [showUser, setShowUser] = useState(false);
  const roleLabel = getRoleLabel(userRole);

  const pageTitle = Object.entries(pageLabels).find(([key]) =>
    pathname.startsWith(key)
  )?.[1] || "Dashboard";

  return (
    <header className="sticky top-0 z-20 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="premium-topbar flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-5">
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-100">
              Enterprise Ops
            </span>
            <span className="hidden items-center gap-1.5 text-[11px] text-emerald-200/80 sm:flex">
              <Activity className="h-3.5 w-3.5" />
              Live telemetry
            </span>
          </div>
          <h1 className="mt-1 text-base font-semibold tracking-wide text-white">{pageTitle}</h1>
          <p className="hidden text-xs text-slate-400 sm:block">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="hidden min-w-[18rem] max-w-md flex-1 items-center rounded-2xl border border-white/10 bg-white/[0.055] px-3 py-2 text-slate-400 shadow-inner shadow-white/5 backdrop-blur-xl md:flex">
        <Search className="h-4 w-4 text-cyan-200/70" />
        <span className="ml-2 flex-1 text-sm">Search ASSIST operations, exports, and monitoring...</span>
        <Activity className="h-4 w-4 text-violet-200/80" />
      </div>

      <div className="flex items-center gap-2">
        <button
          className="hidden rounded-2xl border border-white/10 bg-white/[0.055] p-2 text-slate-300 transition-all hover:border-cyan-300/30 hover:text-cyan-100 hover:shadow-[0_0_24px_rgba(6,182,212,0.18)] sm:block"
          title="System compute status"
        >
          <Cpu className="h-4 w-4" />
        </button>
        {/* Notifications */}
        <button
          id="btn-notifications"
          className="relative rounded-2xl border border-white/10 bg-white/[0.055] p-2 text-slate-300 transition-all hover:border-blue-300/30 hover:text-blue-100 hover:shadow-[0_0_24px_rgba(59,130,246,0.18)]"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(6,182,212,1)]" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            id="btn-user-menu"
            onClick={() => setShowUser(!showUser)}
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.055] py-1.5 pl-2 pr-2 transition-all hover:border-cyan-300/25 hover:bg-white/[0.08]"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 shadow-[0_0_20px_rgba(59,130,246,0.35)]">
              <User className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="hidden text-sm font-medium text-white sm:block">
              {userName || "Admin"}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showUser && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUser(false)}
              />
              <div className="absolute right-0 z-20 mt-2 w-52 animate-fade-in rounded-2xl border border-white/[0.12] bg-slate-950/85 py-1 shadow-2xl shadow-black/40 backdrop-blur-2xl">
                <div className="border-b border-white/10 px-3 py-2">
                  <p className="text-xs font-medium text-white">{userName || "Admin"}</p>
                  <p className="text-xs text-slate-500">
                    {roleLabel}
                    {!canWrite(userRole) ? " - Only View" : ""}
                  </p>
                </div>
                <button
                  id="btn-logout"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-300 transition-all hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      </div>
    </header>
  );
}
