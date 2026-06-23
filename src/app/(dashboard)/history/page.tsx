"use client";

import { useEffect, useState } from "react";
import { formatDate, cn } from "@/lib/utils";
import { History, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HistoryRow {
  id: number; file_name: string; file_type: string; total_data: number;
  skipped: number; duplicates: number; upload_date: string; user: string; created_at: string;
}

const FILE_TYPE_COLORS: Record<string, "pending" | "planned" | "exported" | "success" | "warning"> = {
  WO:         "pending",
  INV:        "planned",
  WO_EXPORT:  "success",
  INV_EXPORT: "exported",
};

export default function HistoryPage() {
  const [data, setData]   = useState<HistoryRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage]   = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = 20;

  const fetchData = async (p = page) => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/history?page=${p}&limit=${limit}`);
      const json = await res.json();
      setData(json.data || []);
      setTotal(json.total || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(page); }, [page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">History Export</h2>
          <p className="text-sm text-muted-foreground">{total} total records import & export</p>
        </div>
        <button
          onClick={() => fetchData(page)}
          className="p-2 rounded-xl border border-border hover:bg-accent transition-all"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["#", "File Name", "Tipe", "Total Data", "Dilewati", "Duplikat", "Upload Date", "User", "Dibuat"].map((h) => (
                  <th key={h} className="p-3 text-left font-medium text-muted-foreground text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="p-8 text-center">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                </td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={9} className="p-8 text-center text-muted-foreground text-sm">
                  Belum ada history
                </td></tr>
              ) : data.map((row, i) => (
                <tr key={row.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-muted-foreground text-xs">{(page - 1) * limit + i + 1}</td>
                  <td className="p-3 font-mono text-xs max-w-48 truncate" title={row.file_name}>{row.file_name}</td>
                  <td className="p-3">
                    <Badge variant={FILE_TYPE_COLORS[row.file_type] || "default"}>
                      {row.file_type}
                    </Badge>
                  </td>
                  <td className="p-3 font-mono font-medium text-emerald-400">{row.total_data}</td>
                  <td className="p-3 font-mono text-amber-400">{row.skipped}</td>
                  <td className="p-3 font-mono text-slate-400">{row.duplicates}</td>
                  <td className="p-3 text-xs">{formatDate(row.upload_date)}</td>
                  <td className="p-3 text-xs">{row.user}</td>
                  <td className="p-3 text-xs text-muted-foreground">{formatDate(row.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">Halaman {page} dari {totalPages}</p>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={cn("w-8 h-8 rounded-lg text-xs font-medium transition-all",
                    page === p ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground"
                  )}>{p}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
