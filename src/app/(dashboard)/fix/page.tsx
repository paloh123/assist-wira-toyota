"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Save, RefreshCw, Calendar, Filter } from "lucide-react";
import { formatDate, formatDateTAM, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type Tab = "wo" | "inv";

const OP_TYPES = ["SBE", "SBI", "GR", "OIL"];
const STATUSES = ["PLANNED", "PENDING", "EXPORTED"];

const toDateInputValue = (value?: string | null) => value?.slice(0, 10) ?? "";

interface WORow {
  id: number; outlet_code: string; wo_no: string; wo_date: string;
  chassis_no: string; operation_desc: string; operation_type: string;
  status: string; upload_date: string | null; remark: string;
}
interface INVRow {
  id: number; outlet_code: string; wo_no: string; invoice_no: string;
  date: string; part_no: string; part_desc: string;
  qty: number; amount: number; status: string; upload_date: string | null;
}

type EditedWO  = Partial<WORow>  & { id: number };
type EditedINV = Partial<INVRow> & { id: number };

export default function FixPage() {
  const [tab, setTab]               = useState<Tab>("wo");
  const [data, setData]             = useState<WORow[] | INVRow[]>([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [editedWO, setEditedWO]     = useState<Record<number, EditedWO>>({});
  const [editedINV, setEditedINV]   = useState<Record<number, EditedINV>>({});
  const [filterDate, setFilterDate] = useState("");
  const [selected, setSelected]     = useState<number[]>([]);
  const [bulkDate, setBulkDate]     = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setEditedWO({}); setEditedINV({}); setSelected([]);
    try {
      const params = new URLSearchParams({ limit: "200" });
      if (filterDate) params.set("upload_date", filterDate);
      const res = await fetch(`/api/fix/${tab}?${params}`);
      const json = await res.json();
      setData(json.data || []);
      setTotal(json.total || 0);
    } catch {
      toast.error("Gagal memuat data Fix Sheet");
    } finally {
      setLoading(false);
    }
  }, [tab, filterDate]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setEditedWO({}); setEditedINV({}); setSelected([]); }, [tab]);

  const updateWO  = (id: number, field: keyof WORow,  val: string) =>
    setEditedWO((p)  => ({ ...p,  [id]: { ...p[id],  id, [field]: val } }));
  const updateINV = (id: number, field: keyof INVRow, val: string) =>
    setEditedINV((p) => ({ ...p, [id]: { ...p[id], id, [field]: val } }));

  const handleSave = async () => {
    const edits = tab === "wo" ? Object.values(editedWO) : Object.values(editedINV);
    if (!edits.length) { toast.info("Tidak ada perubahan"); return; }
    setSaving(true);
    try {
      await Promise.all(
        edits.map((edit) =>
          fetch(`/api/fix/${tab}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(edit),
          })
        )
      );
      toast.success(`${edits.length} baris berhasil disimpan`);
      setEditedWO({}); setEditedINV({});
      fetchData();
    } catch {
      toast.error("Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  };

  const handleBulkDate = async () => {
    if (!selected.length || !bulkDate) {
      toast.error("Pilih baris dan tanggal terlebih dahulu");
      return;
    }
    await fetch(`/api/fix/${tab}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selected, upload_date: bulkDate }),
    });
    toast.success(`Tanggal diubah untuk ${selected.length} baris`);
    fetchData();
  };

  const toggleSelect = (id: number) =>
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const toggleAll = () =>
    setSelected(selected.length === data.length ? [] : data.map((d) => d.id));

  const pendingEdits = tab === "wo" ? Object.keys(editedWO).length : Object.keys(editedINV).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold">Fix Sheet</h2>
          <p className="text-sm text-muted-foreground">{total} data PLANNED — edit inline lalu simpan</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {pendingEdits > 0 && (
            <span className="text-xs text-amber-400 self-center">{pendingEdits} perubahan belum disimpan</span>
          )}
          <button
            onClick={fetchData}
            className="p-2 rounded-xl border border-border hover:bg-accent transition-all"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          <button
            id="btn-save-fix"
            onClick={handleSave}
            disabled={saving || pendingEdits === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-all"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan ({pendingEdits})
          </button>
        </div>
      </div>

      {/* Tabs + Filters */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
          {(["wo", "inv"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}>{t.toUpperCase()}</button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
              className="pl-9 pr-3 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none"
              placeholder="Filter tanggal"
            />
          </div>
        </div>
      </div>

      {/* Bulk date change */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 animate-fade-in">
          <span className="text-sm font-medium text-blue-400">{selected.length} baris dipilih</span>
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <input type="date" value={bulkDate} onChange={(e) => setBulkDate(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none"
          />
          <button onClick={handleBulkDate}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-all">
            Ubah Semua Tanggal
          </button>
        </div>
      )}

      {/* Editable table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="p-3 w-10">
                  <input type="checkbox"
                    checked={selected.length === data.length && data.length > 0}
                    onChange={toggleAll} className="rounded" />
                </th>
                {tab === "wo" ? (
                  <>
                    <th className="p-3 text-left font-medium text-muted-foreground text-xs">Outlet</th>
                    <th className="p-3 text-left font-medium text-muted-foreground text-xs">WO No</th>
                    <th className="p-3 text-left font-medium text-muted-foreground text-xs">Tgl WO</th>
                    <th className="p-3 text-left font-medium text-muted-foreground text-xs">Deskripsi</th>
                    <th className="p-3 text-left font-medium text-muted-foreground text-xs">Type ✏️</th>
                    <th className="p-3 text-left font-medium text-muted-foreground text-xs">Upload Date ✏️</th>
                    <th className="p-3 text-left font-medium text-muted-foreground text-xs">Status ✏️</th>
                  </>
                ) : (
                  <>
                    <th className="p-3 text-left font-medium text-muted-foreground text-xs">Outlet</th>
                    <th className="p-3 text-left font-medium text-muted-foreground text-xs">WO No</th>
                    <th className="p-3 text-left font-medium text-muted-foreground text-xs">Invoice No</th>
                    <th className="p-3 text-left font-medium text-muted-foreground text-xs">Part No ✏️</th>
                    <th className="p-3 text-left font-medium text-muted-foreground text-xs">Deskripsi Part ✏️</th>
                    <th className="p-3 text-right font-medium text-muted-foreground text-xs">Qty ✏️</th>
                    <th className="p-3 text-left font-medium text-muted-foreground text-xs">Upload Date ✏️</th>
                    <th className="p-3 text-left font-medium text-muted-foreground text-xs">Status</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto" />
                </td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={9} className="p-8 text-center text-muted-foreground text-sm">
                  Tidak ada data PLANNED
                </td></tr>
              ) : tab === "wo" ? (
                (data as WORow[]).map((row) => {
                  const edited = editedWO[row.id] || {};
                  const isDirty = !!editedWO[row.id];
                  return (
                    <tr key={row.id} className={cn(
                      "border-b border-border/50 hover:bg-muted/30 transition-colors",
                      isDirty && "bg-amber-500/5"
                    )}>
                      <td className="p-3">
                        <input type="checkbox" checked={selected.includes(row.id)}
                          onChange={() => toggleSelect(row.id)} className="rounded" />
                      </td>
                      <td className="p-3 font-mono text-xs">{row.outlet_code}</td>
                      <td className="p-3 font-mono text-xs text-blue-400">{row.wo_no}</td>
                      <td className="p-3 text-xs">{formatDate(row.wo_date)}</td>
                      <td className="p-3 text-xs max-w-40 truncate text-muted-foreground" title={row.operation_desc}>
                        {row.operation_desc}
                      </td>
                      {/* Editable: Type */}
                      <td className="p-3">
                        <select
                          value={edited.operation_type ?? row.operation_type ?? ""}
                          onChange={(e) => updateWO(row.id, "operation_type", e.target.value)}
                          className="bg-background border border-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {OP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </td>
                      {/* Editable: Date */}
                      <td className="p-3 editable-cell">
                        <input
                          type="date"
                          value={toDateInputValue(edited.upload_date ?? row.upload_date)}
                          onChange={(e) => updateWO(row.id, "upload_date", e.target.value)}
                          className="bg-background border border-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      {/* Editable: Status */}
                      <td className="p-3">
                        <select
                          value={edited.status ?? row.status ?? ""}
                          onChange={(e) => updateWO(row.id, "status", e.target.value)}
                          className="bg-background border border-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  );
                })
              ) : (
                (data as INVRow[]).map((row) => {
                  const edited = editedINV[row.id] || {};
                  const isDirty = !!editedINV[row.id];
                  return (
                    <tr key={row.id} className={cn(
                      "border-b border-border/50 hover:bg-muted/30 transition-colors",
                      isDirty && "bg-amber-500/5"
                    )}>
                      <td className="p-3">
                        <input type="checkbox" checked={selected.includes(row.id)}
                          onChange={() => toggleSelect(row.id)} className="rounded" />
                      </td>
                      <td className="p-3 font-mono text-xs">{row.outlet_code}</td>
                      <td className="p-3 font-mono text-xs">{row.wo_no}</td>
                      <td className="p-3 font-mono text-xs text-violet-400">{row.invoice_no}</td>
                      {/* Editable: Part No */}
                      <td className="p-3">
                        <input
                          value={edited.part_no ?? row.part_no ?? ""}
                          onChange={(e) => updateINV(row.id, "part_no", e.target.value)}
                          className="w-28 bg-background border border-border rounded-lg px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      {/* Editable: Part Desc */}
                      <td className="p-3">
                        <input
                          value={edited.part_desc ?? row.part_desc ?? ""}
                          onChange={(e) => updateINV(row.id, "part_desc", e.target.value)}
                          className="w-36 bg-background border border-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      {/* Editable: Qty */}
                      <td className="p-3">
                        <input
                          type="number"
                          value={edited.qty ?? row.qty ?? 0}
                          onChange={(e) => updateINV(row.id, "qty", e.target.value)}
                          className="w-16 bg-background border border-border rounded-lg px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      {/* Editable: Upload Date */}
                      <td className="p-3">
                        <input
                          type="date"
                          value={toDateInputValue(edited.upload_date ?? row.upload_date)}
                          onChange={(e) => updateINV(row.id, "upload_date", e.target.value)}
                          className="bg-background border border-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-3">
                        <Badge variant="planned">{row.status}</Badge>
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
  );
}
