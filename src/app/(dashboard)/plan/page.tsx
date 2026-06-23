"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Calendar, Zap, TrendingUp, CheckCircle2, Loader2 } from "lucide-react";
import { formatNumber, formatDate, cn } from "@/lib/utils";

interface DailyPlan {
  id: number;
  plan_date: string;
  plan_count: number;
  actual_wo: number;
  actual_inv: number;
}

interface PlanResult {
  planned_wo: number;
  planned_inv: number;
  upload_date: string;
}

export default function PlanPage() {
  const [uploadDate, setUploadDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [count, setCount] = useState(85);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<DailyPlan[]>([]);
  const [lastResult, setLastResult] = useState<PlanResult | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    // Load daily plans and pending count
    Promise.all([
      fetch("/api/plan/generate").then((r) => r.json()),
      fetch("/api/pending/wo?status=PENDING&limit=1").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
    ]).then(([planData, pendingData, settingsData]) => {
      setPlans(planData.plans || []);
      setPendingCount(pendingData.total || 0);
      if (settingsData.settings?.plan_per_day) {
        setCount(settingsData.settings.plan_per_day);
      }
    });
  }, [lastResult]);

  const handleGenerate = async () => {
    if (!uploadDate) { toast.error("Pilih tanggal upload terlebih dahulu"); return; }
    if (count <= 0)  { toast.error("Jumlah plan harus lebih dari 0"); return; }
    if (pendingCount === 0) { toast.error("Tidak ada data PENDING tersedia"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upload_date: uploadDate, count }),
      });
      const data = await res.json();
      if (data.success) {
        setLastResult(data);
        toast.success(
          `Plan berhasil! ${data.planned_wo} WO dan ${data.planned_inv} INV diassign ke ${uploadDate}`
        );
      } else {
        toast.error(data.error || "Gagal generate plan");
      }
    } catch {
      toast.error("Koneksi error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-bold">Planning Upload</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Generate plan upload harian — sistem otomatis memilih data pending teratas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Generate form */}
        <div className="lg:col-span-1 bg-card border border-border rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-400" /> Generate Plan
          </h3>

          {/* Available pending */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
            <p className="text-xs text-muted-foreground">Data PENDING tersedia</p>
            <p className="text-2xl font-bold text-blue-400 mt-0.5">{formatNumber(pendingCount)}</p>
          </div>

          {/* Date picker */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Calendar className="w-4 h-4 inline mr-1.5 text-muted-foreground" />
              Tanggal Upload
            </label>
            <input
              type="date"
              value={uploadDate}
              onChange={(e) => setUploadDate(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          {/* Count */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <TrendingUp className="w-4 h-4 inline mr-1.5 text-muted-foreground" />
              Jumlah Data
            </label>
            <input
              type="number"
              min="1"
              max={pendingCount}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 0)}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Maks: {formatNumber(pendingCount)} data pending
            </p>
          </div>

          {/* Generate button */}
          <button
            id="btn-generate-plan"
            onClick={handleGenerate}
            disabled={loading || pendingCount === 0}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm transition-all shadow-lg shadow-blue-500/20"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {loading ? "Memproses..." : "Generate Plan"}
          </button>

          {/* Last result */}
          {lastResult && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">Berhasil!</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {lastResult.planned_wo} WO + {lastResult.planned_inv} INV → {lastResult.upload_date}
              </p>
            </div>
          )}
        </div>

        {/* Daily plan table */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-sm">Riwayat Plan Upload</h3>
            <p className="text-xs text-muted-foreground mt-0.5">60 rencana terbaru</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-3 text-left font-medium text-muted-foreground text-xs">Tanggal</th>
                  <th className="p-3 text-right font-medium text-muted-foreground text-xs">Plan</th>
                  <th className="p-3 text-right font-medium text-muted-foreground text-xs">Actual WO</th>
                  <th className="p-3 text-right font-medium text-muted-foreground text-xs">Actual INV</th>
                  <th className="p-3 text-left font-medium text-muted-foreground text-xs">Progress</th>
                </tr>
              </thead>
              <tbody>
                {plans.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground text-sm">
                      Belum ada plan
                    </td>
                  </tr>
                ) : (
                  plans.map((p) => {
                    const ratio = p.plan_count > 0 ? Math.round((p.actual_wo / p.plan_count) * 100) : 0;
                    const color = ratio >= 100 ? "bg-emerald-500" : ratio >= 80 ? "bg-amber-500" : "bg-red-500";
                    return (
                      <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-medium">{formatDate(p.plan_date)}</td>
                        <td className="p-3 text-right font-mono">{formatNumber(p.plan_count)}</td>
                        <td className="p-3 text-right font-mono text-emerald-400">{formatNumber(p.actual_wo)}</td>
                        <td className="p-3 text-right font-mono text-violet-400">{formatNumber(p.actual_inv)}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden w-20">
                              <div className={cn("h-1.5 rounded-full", color)} style={{ width: `${Math.min(ratio, 100)}%` }} />
                            </div>
                            <span className={cn("text-xs font-medium", ratio >= 100 ? "text-emerald-400" : ratio >= 80 ? "text-amber-400" : "text-red-400")}>
                              {ratio}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
