"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Download, FileText, Filter, Eye, Loader2 } from "lucide-react";
import { formatNumber, formatDate } from "@/lib/utils";

interface PreviewData {
  wo: number;
  inv: number;
}

export default function ExportPage() {
  const [uploadDate, setUploadDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [exporting, setExporting] = useState<"wo" | "inv" | null>(null);

  const fetchPreview = async () => {
    if (!uploadDate) return;
    setLoadingPreview(true);
    try {
      const [woRes, invRes] = await Promise.all([
        fetch(`/api/pending/wo?status=PLANNED&limit=1${uploadDate ? `&upload_date=${uploadDate}` : ""}`),
        fetch(`/api/pending/inv?status=PLANNED&limit=1${uploadDate ? `&upload_date=${uploadDate}` : ""}`),
      ]);
      // Simplified: just count from plan API
      const woData  = await woRes.json();
      const invData = await invRes.json();
      setPreview({ wo: woData.total || 0, inv: invData.total || 0 });
    } catch {
      toast.error("Gagal memuat preview");
    } finally {
      setLoadingPreview(false);
    }
  };

  useEffect(() => { fetchPreview(); }, [uploadDate]);

  const handleExport = async (type: "wo" | "inv") => {
    setExporting(type);
    try {
      const params = uploadDate ? `?upload_date=${uploadDate}` : "";
      const res = await fetch(`/api/export/${type}${params}`);

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Gagal export");
        return;
      }

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      const dateStr = uploadDate.replace(/-/g, "");
      a.href     = url;
      a.download = `${type.toUpperCase()}_EXPORT_${dateStr}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`Export ${type.toUpperCase()} berhasil — file terunduh`);
      fetchPreview();
    } catch {
      toast.error("Koneksi error saat export");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold">Export TXT</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Generate file TXT siap upload ke Web TAM. Format sama persis dengan sumber, delimiter semicolon (;).
        </p>
      </div>

      {/* Date filter */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <h3 className="font-semibold flex items-center gap-2 text-sm">
          <Filter className="w-4 h-4 text-muted-foreground" /> Filter Tanggal Upload
        </h3>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={uploadDate}
            onChange={(e) => setUploadDate(e.target.value)}
            className="bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
          <button
            onClick={fetchPreview}
            className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-xl text-sm hover:bg-accent transition-all"
          >
            <Eye className="w-4 h-4" />
            Preview
            {loadingPreview && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          </button>
        </div>

        {/* Preview counts */}
        {preview && (
          <div className="grid grid-cols-2 gap-3 animate-fade-in">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-blue-400">{formatNumber(preview.wo)}</p>
              <p className="text-xs text-muted-foreground mt-1">WO siap export</p>
            </div>
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-violet-400">{formatNumber(preview.inv)}</p>
              <p className="text-xs text-muted-foreground mt-1">INV siap export</p>
            </div>
          </div>
        )}
      </div>

      {/* Export buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* WO Export */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="font-semibold">Export WO</p>
              <p className="text-xs text-muted-foreground">Work Order TXT</p>
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-muted rounded-lg p-2 font-mono">
            FORMAT: outlet;wo_no;date;chassis;desc;type;...
          </div>

          {preview && preview.wo === 0 && (
            <p className="text-xs text-amber-400">⚠ Tidak ada data WO PLANNED untuk tanggal ini</p>
          )}

          <button
            id="btn-export-wo"
            onClick={() => handleExport("wo")}
            disabled={!!exporting || (preview?.wo === 0)}
            className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm transition-all shadow-lg shadow-blue-500/20"
          >
            {exporting === "wo" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {exporting === "wo" ? "Mengexport..." : `Export WO TXT (${preview?.wo ?? "?"} data)`}
          </button>
        </div>

        {/* INV Export */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <p className="font-semibold">Export INV</p>
              <p className="text-xs text-muted-foreground">Invoice TXT</p>
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-muted rounded-lg p-2 font-mono">
            FORMAT: outlet;wo_no;inv_no;date;part_no;desc;...
          </div>

          {preview && preview.inv === 0 && (
            <p className="text-xs text-amber-400">⚠ Tidak ada data INV PLANNED untuk tanggal ini</p>
          )}

          <button
            id="btn-export-inv"
            onClick={() => handleExport("inv")}
            disabled={!!exporting || (preview?.inv === 0)}
            className="flex items-center justify-center gap-2 w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm transition-all shadow-lg shadow-violet-500/20"
          >
            {exporting === "inv" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {exporting === "inv" ? "Mengexport..." : `Export INV TXT (${preview?.inv ?? "?"} data)`}
          </button>
        </div>
      </div>

      {/* Format note */}
      <div className="bg-muted/50 border border-border rounded-xl p-4 text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">📋 Catatan Format Export</p>
        <p>• Delimiter: titik koma (;) — sama persis dengan format TAM</p>
        <p>• Line ending: CRLF (Windows)</p>
        <p>• Tanggal menggunakan format upload date yang dipilih (bukan tanggal WO asli)</p>
        <p>• Setelah export, status data otomatis berubah ke EXPORTED</p>
      </div>
    </div>
  );
}
