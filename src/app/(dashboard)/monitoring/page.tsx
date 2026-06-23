"use client";

import { useEffect, useState } from "react";
import { BarChart2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { formatNumber, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface MonitorRow {
  date: string; plan: number; actual_wo: number; actual_inv: number;
  ratio: number; status: string; selisih: number;
}
interface Summary {
  targetRequired: number; targetTAM: number; ratio: number;
  dailyTarget: number; totalActual: number; totalPlan: number; overallRatio: number;
}

export default function MonitoringPage() {
  const [rows, setRows]       = useState<MonitorRow[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/monitoring")
      .then((r) => r.json())
      .then((d) => { setRows(d.rows || []); setSummary(d.summary); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  const overallColor = !summary ? "green"
    : summary.overallRatio >= 100 ? "green"
    : summary.overallRatio >= 80  ? "yellow" : "red";

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-xl font-bold">Monitoring Target</h2>
        <p className="text-sm text-muted-foreground mt-1">Pantau pencapaian target upload harian dan bulanan.</p>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Target TAM", value: summary.targetTAM, sub: `× ${Math.round(summary.ratio * 100)}%`, color: "text-foreground" },
            { label: "Target Required", value: summary.targetRequired, sub: "Total wajib upload", color: "text-blue-400" },
            { label: "Total Actual", value: summary.totalActual, sub: "Sudah terupload", color: "text-emerald-400" },
            {
              label: "Overall Ratio",
              value: `${summary.overallRatio}%`,
              sub: summary.overallRatio >= 100 ? "✓ Target tercapai" : `Kurang ${100 - summary.overallRatio}%`,
              color: overallColor === "green" ? "text-emerald-400" : overallColor === "yellow" ? "text-amber-400" : "text-red-400",
            },
          ].map((c) => (
            <div key={c.label} className="bg-card border border-border rounded-2xl p-5">
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className={`text-2xl font-bold mt-1 ${c.color}`}>
                {typeof c.value === "number" ? formatNumber(c.value) : c.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      {rows.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-sm mb-4">Trend Ratio Upload (%)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} unit="%" domain={[0, 150]} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
              <ReferenceLine y={100} stroke="hsl(142 71% 45%)" strokeDasharray="4 4" label={{ value: "100%", fontSize: 10, fill: "hsl(142 71% 45%)" }} />
              <Line type="monotone" dataKey="ratio" name="Ratio %" stroke="hsl(220 85% 60%)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-sm">Detail Per Tanggal</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["Tanggal", "Plan", "Actual WO", "Actual INV", "Selisih", "Ratio", "Status"].map((h) => (
                  <th key={h} className="p-3 text-left font-medium text-muted-foreground text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground text-sm">
                  Belum ada data monitoring
                </td></tr>
              ) : rows.map((row) => (
                <tr key={row.date} className={cn(
                  "border-b border-border/50 transition-colors",
                  row.status === "TERCAPAI" ? "hover:bg-emerald-500/5" :
                  row.status === "HAMPIR"   ? "hover:bg-amber-500/5" : "hover:bg-red-500/5"
                )}>
                  <td className="p-3 font-medium">{row.date}</td>
                  <td className="p-3 font-mono">{formatNumber(row.plan)}</td>
                  <td className="p-3 font-mono text-emerald-400">{formatNumber(row.actual_wo)}</td>
                  <td className="p-3 font-mono text-violet-400">{formatNumber(row.actual_inv)}</td>
                  <td className="p-3">
                    <span className={cn("font-mono flex items-center gap-1", row.selisih > 0 ? "text-red-400" : "text-emerald-400")}>
                      {row.selisih > 0 ? <TrendingDown className="w-3.5 h-3.5" /> :
                       row.selisih < 0 ? <TrendingUp className="w-3.5 h-3.5" /> :
                       <Minus className="w-3.5 h-3.5" />}
                      {row.selisih}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-1.5 overflow-hidden">
                        <div className={cn("h-1.5 rounded-full",
                          row.status === "TERCAPAI" ? "bg-emerald-500" :
                          row.status === "HAMPIR"   ? "bg-amber-500" : "bg-red-500"
                        )} style={{ width: `${Math.min(row.ratio, 100)}%` }} />
                      </div>
                      <span className="text-xs font-medium">{row.ratio}%</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant={
                      row.status === "TERCAPAI" ? "success" :
                      row.status === "HAMPIR"   ? "warning" : "danger"
                    }>
                      {row.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
