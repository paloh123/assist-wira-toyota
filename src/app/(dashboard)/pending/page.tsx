"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Search, RefreshCw, Trash2, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate, getStatusVariant, cn } from "@/lib/utils";

type Tab = "wo" | "inv";

const STATUS_OPTIONS = ["", "PENDING", "PLANNED", "EXPORTED"];

interface WORow {
  id: number; outlet_code: string; wo_no: string; wo_date: string;
  chassis_no: string; operation_desc: string; operation_type: string;
  status: string; upload_date: string | null; created_at: string;
}
interface INVRow {
  id: number; outlet_code: string; wo_no: string; invoice_no: string;
  date: string; part_no: string; part_desc: string; qty: number;
  amount: number; status: string; upload_date: string | null;
}

export default function PendingPage() {
  const [tab, setTab] = useState<Tab>("wo");
  const [data, setData] = useState<WORow[] | INVRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const limit = 50;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page), limit: String(limit),
        ...(search ? { search } : {}),
        ...(status ? { status } : {}),
      });
      const res = await fetch(`/api/pending/${tab}?${params}`);
      const json = await res.json();
      setData(json.data || []);
      setTotal(json.total || 0);
      setSelected([]);
    } catch {
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [tab, page, search, status]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); setSearch(""); setStatus(""); }, [tab]);

  const toggleSelect = (id: number) =>
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const toggleAll = () =>
    setSelected(selected.length === data.length ? [] : data.map((d) => d.id));

  const handleDelete = async () => {
    if (!selected.length) return;
    if (!confirm(`Hapus ${selected.length} data? Tindakan ini tidak bisa dibatalkan.`)) return;
    await fetch(`/api/pending/${tab}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selected }),
    });
    toast.success(`${selected.length} data dihapus`);
    fetchData();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4 max-w-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold">Data Pending</h2>
          <p className="text-sm text-muted-foreground">{total} total records</p>
        </div>
        <div className="flex gap-2">
          {selected.length > 0 && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm hover:bg-red-500/20 transition-all"
            >
              <Trash2 className="w-4 h-4" /> Hapus ({selected.length})
            </button>
          )}
          <button
            onClick={fetchData}
            className="p-2 rounded-xl border border-border hover:bg-accent transition-all"
            title="Refresh"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
        {(["wo", "inv"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
              tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={`Cari ${tab.toUpperCase()}...`}
            className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none appearance-none"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s || "Semua Status"}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="p-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={selected.length === data.length && data.length > 0}
                    onChange={toggleAll}
                    className="rounded"
                  />
                </th>
                {tab === "wo" ? (
                  <>
                    <th className="p-3 text-left font-medium text-muted-foreground">Outlet</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">WO No</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Tanggal WO</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Chassis</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Deskripsi</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Type</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Upload Date</th>
                  </>
                ) : (
                  <>
                    <th className="p-3 text-left font-medium text-muted-foreground">Outlet</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">WO No</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Invoice No</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Tanggal</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Part No</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Deskripsi Part</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Qty</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Status</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground text-sm">
                    Tidak ada data
                  </td>
                </tr>
              ) : tab === "wo" ? (
                (data as WORow[]).map((row) => (
                  <tr key={row.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(row.id)}
                        onChange={() => toggleSelect(row.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="p-3 font-mono text-xs">{row.outlet_code}</td>
                    <td className="p-3 font-mono text-xs text-blue-400">{row.wo_no}</td>
                    <td className="p-3 text-xs">{formatDate(row.wo_date)}</td>
                    <td className="p-3 font-mono text-xs">{row.chassis_no}</td>
                    <td className="p-3 text-xs max-w-48 truncate" title={row.operation_desc}>{row.operation_desc}</td>
                    <td className="p-3">
                      <Badge variant={
                        row.operation_type === "SBE" ? "pending" :
                        row.operation_type === "SBI" ? "warning" :
                        row.operation_type === "OIL" ? "success" : "default"
                      }>
                        {row.operation_type || "-"}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant={getStatusVariant(row.status)}>{row.status}</Badge>
                    </td>
                    <td className="p-3 text-xs">{row.upload_date ? formatDate(row.upload_date) : "-"}</td>
                  </tr>
                ))
              ) : (
                (data as INVRow[]).map((row) => (
                  <tr key={row.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(row.id)}
                        onChange={() => toggleSelect(row.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="p-3 font-mono text-xs">{row.outlet_code}</td>
                    <td className="p-3 font-mono text-xs">{row.wo_no}</td>
                    <td className="p-3 font-mono text-xs text-violet-400">{row.invoice_no}</td>
                    <td className="p-3 text-xs">{formatDate(row.date)}</td>
                    <td className="p-3 font-mono text-xs">{row.part_no}</td>
                    <td className="p-3 text-xs max-w-48 truncate">{row.part_desc}</td>
                    <td className="p-3 text-xs text-right">{row.qty}</td>
                    <td className="p-3">
                      <Badge variant={getStatusVariant(row.status)}>{row.status}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Halaman {page} dari {totalPages} ({total} total)
            </p>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    "w-8 h-8 rounded-lg text-xs font-medium transition-all",
                    page === p ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
