"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend,
} from "recharts";
import {
  FileText, Database, CheckCircle2, TrendingUp, AlertTriangle, Target, Clock, Download, Activity, Gauge,
} from "lucide-react";
import { formatNumber, getRatioColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface DashboardStats {
  totalPendingWO: number;
  totalPendingINV: number;
  totalPlannedWO: number;
  totalPlannedINV: number;
  totalExportedWO: number;
  targetRequired: number;
  targetTAM: number;
  ratio: number;
  todayActual: number;
  todayTarget: number;
  chartData: { date: string; plan: number; actual: number }[];
}

const defaultStats: DashboardStats = {
  totalPendingWO: 0,
  totalPendingINV: 0,
  totalPlannedWO: 0,
  totalPlannedINV: 0,
  totalExportedWO: 0,
  targetRequired: 0,
  targetTAM: 0,
  ratio: 1.1,
  todayActual: 0,
  todayTarget: 0,
  chartData: [],
};

function normalizeStats(data: Partial<DashboardStats>): DashboardStats {
  return {
    ...defaultStats,
    ...data,
    chartData: Array.isArray(data.chartData) ? data.chartData : [],
  };
}

function StatCard({
  label, value, sub, icon: Icon, color,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: "blue" | "green" | "yellow" | "red" | "violet" | "slate";
}) {
  const colors = {
    blue:   "from-blue-400/20 via-cyan-400/10 to-white/[0.03] border-blue-300/20 text-blue-200",
    green:  "from-emerald-400/20 via-teal-400/10 to-white/[0.03] border-emerald-300/20 text-emerald-200",
    yellow: "from-amber-300/20 via-yellow-400/10 to-white/[0.03] border-amber-300/20 text-amber-200",
    red:    "from-red-400/20 via-rose-400/10 to-white/[0.03] border-red-300/20 text-red-200",
    violet: "from-violet-400/20 via-fuchsia-400/10 to-white/[0.03] border-violet-300/20 text-violet-200",
    slate:  "from-slate-400/20 via-slate-300/10 to-white/[0.03] border-slate-300/20 text-slate-200",
  };
  return (
    <div className={`premium-card group relative overflow-hidden rounded-[1.35rem] border bg-gradient-to-br ${colors[color]} p-5 animate-fade-in`}>
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-current/10 blur-2xl transition-transform duration-500 group-hover:scale-150" />
      <div className="relative flex items-start gap-4">
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-inner shadow-white/10">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight text-white">{formatNumber(Number(value))}</p>
        {sub && <p className="mt-2 text-xs text-slate-500">{sub}</p>}
      </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(async (r) => {
        if (!r.ok) {
          throw new Error("Failed to load dashboard stats");
        }
        return r.json();
      })
      .then((data) => {
        setStats(normalizeStats(data));
        setError(false);
      })
      .catch(() => {
        setStats(defaultStats);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border border-cyan-300/20 bg-cyan-300/10 blur-sm" />
          <div className="absolute inset-2 rounded-full border-4 border-blue-400/20 border-t-cyan-200 animate-spin" />
          <Activity className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-cyan-100" />
        </div>
      </div>
    );
  }

  if (!stats) return <p className="text-muted-foreground">Gagal memuat data.</p>;

  const ratioColor = getRatioColor(stats.todayActual, stats.todayTarget);
  const ratioPercent = stats.todayTarget > 0
    ? Math.round((stats.todayActual / stats.todayTarget) * 100)
    : 0;
  const chartData = stats.chartData;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {error && (
        <div className="rounded-2xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100 shadow-[0_0_28px_rgba(245,158,11,0.12)] backdrop-blur-xl">
          Data dashboard belum bisa dimuat. Periksa koneksi database atau API dashboard.
        </div>
      )}

      <section className="premium-hero relative overflow-hidden rounded-[1.75rem] border border-white/10 px-5 py-6 shadow-2xl shadow-black/30 sm:px-7">
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(16,185,129,1)]" />
              Enterprise Command Center
            </div>
            <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Wira Toyota Banjarmasin ASSIST Control Center
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Real-time orchestration for pending work orders, planning velocity, export readiness, and TAM target compliance.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-right">
            <div className="rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 backdrop-blur-xl">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Actual</p>
              <p className="mt-1 text-xl font-semibold text-white">{formatNumber(stats.todayActual)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 backdrop-blur-xl">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Target</p>
              <p className="mt-1 text-xl font-semibold text-cyan-100">{formatNumber(stats.todayTarget)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 backdrop-blur-xl">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Ratio</p>
              <p className="mt-1 text-xl font-semibold text-emerald-100">{ratioPercent}%</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="WO Pending" value={stats.totalPendingWO} icon={FileText} color="blue" sub="Menunggu diproses" />
        <StatCard label="INV Pending" value={stats.totalPendingINV} icon={Database} color="violet" sub="Menunggu diproses" />
        <StatCard label="Planned WO" value={stats.totalPlannedWO} icon={Clock} color="yellow" sub="Siap di-review" />
        <StatCard label="Exported" value={stats.totalExportedWO} icon={CheckCircle2} color="green" sub="Berhasil diexport" />
      </div>

      {/* Target + Today Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Target Card */}
        <div className="premium-card rounded-[1.35rem] border border-white/10 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-200" />
            <span className="text-sm font-medium text-white">Target Bulan Ini</span>
          </div>
          <div>
            <p className="text-4xl font-semibold tracking-tight text-white">{formatNumber(stats.targetRequired)}</p>
            <p className="text-xs text-slate-500 mt-2">
              {formatNumber(stats.targetTAM)} × {Math.round(stats.ratio * 100)}% = {formatNumber(stats.targetRequired)}
            </p>
          </div>
        </div>

        {/* Today ratio */}
        <div className={`premium-card rounded-[1.35rem] border p-5 space-y-3 ${
          ratioColor === "green" ? "border-emerald-300/30 card-glow-green" :
          ratioColor === "yellow" ? "border-amber-300/30 card-glow-yellow" :
          "border-red-300/30 card-glow-red"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-200" />
              <span className="text-sm font-medium text-white">Progress Hari Ini</span>
            </div>
            <Badge variant={ratioColor === "green" ? "success" : ratioColor === "yellow" ? "warning" : "danger"}>
              {ratioPercent}%
            </Badge>
          </div>
          <div>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-semibold tracking-tight text-white">{formatNumber(stats.todayActual)}</p>
              <p className="text-slate-500 text-sm mb-1">/ {formatNumber(stats.todayTarget)}</p>
            </div>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/[0.08] shadow-inner shadow-black/40">
              <div
                className={`h-2.5 rounded-full transition-all duration-1000 ${
                  ratioColor === "green" ? "bg-gradient-to-r from-emerald-400 to-cyan-300 shadow-[0_0_18px_rgba(16,185,129,0.7)]" :
                  ratioColor === "yellow" ? "bg-gradient-to-r from-amber-400 to-yellow-200 shadow-[0_0_18px_rgba(245,158,11,0.7)]" : "bg-gradient-to-r from-red-400 to-rose-300 shadow-[0_0_18px_rgba(248,113,113,0.7)]"
                }`}
                style={{ width: `${Math.min(ratioPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="premium-card rounded-[1.35rem] border border-white/10 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-200" />
            <span className="text-sm font-medium text-white">Status</span>
          </div>
          <div className="space-y-2">
            {stats.totalPendingWO > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-cyan-300 badge-live shadow-[0_0_12px_rgba(6,182,212,1)]" />
                <span className="text-slate-400">{formatNumber(stats.totalPendingWO)} WO belum diproses</span>
              </div>
            )}
            {stats.totalPlannedWO > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-violet-300 badge-live shadow-[0_0_12px_rgba(139,92,246,1)]" />
                <span className="text-slate-400">{formatNumber(stats.totalPlannedWO)} WO siap export</span>
              </div>
            )}
            {stats.totalPendingWO === 0 && stats.totalPlannedWO === 0 && (
              <p className="text-sm text-emerald-200">Semua data sudah diproses</p>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="premium-card rounded-[1.35rem] border border-white/10 p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-cyan-200" />
              <h3 className="font-semibold text-white">Grafik Upload Harian</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">Plan vs Actual - 30 hari terakhir</p>
          </div>
          <button className="rounded-2xl border border-white/10 bg-white/[0.055] p-2 text-slate-300 transition-all hover:border-cyan-300/30 hover:text-cyan-100">
            <Download className="w-4 h-4" />
          </button>
        </div>
        {chartData.length === 0 ? (
          <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.025] text-sm text-slate-500">
            Belum ada data chart
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} barGap={8}>
              <defs>
                <linearGradient id="planGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.22} />
                </linearGradient>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 7" stroke="rgba(148,163,184,0.16)" vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "rgba(148,163,184,0.72)" }}
                tickFormatter={(v) => v.slice(5)}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "rgba(148,163,184,0.72)" }} />
              <Tooltip
                contentStyle={{
                  background: "rgba(2, 6, 23, 0.88)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "16px",
                  fontSize: 12,
                  color: "#e5e7eb",
                  boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
                  backdropFilter: "blur(18px)",
                }}
                cursor={{ fill: "rgba(59,130,246,0.08)" }}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
              <Bar dataKey="plan" name="Plan" fill="url(#planGradient)" radius={[8, 8, 3, 3]} />
              <Bar dataKey="actual" name="Actual" fill="url(#actualGradient)" radius={[8, 8, 3, 3]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
