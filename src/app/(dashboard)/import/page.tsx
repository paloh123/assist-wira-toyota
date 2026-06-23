"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import {
  Upload, FileText, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, X, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  duplicates: number;
  total: number;
  errors: string[];
}

function DropZone({
  label, type, onResult,
}: {
  label: string;
  type: "wo" | "inv";
  onResult: (result: ImportResult, fileName: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      if (!file.name.toLowerCase().endsWith(".txt")) {
        toast.error("Hanya file .TXT yang diterima");
        return;
      }

      setLoading(true);
      setProgress(10);

      const formData = new FormData();
      formData.append("file", file);

      try {
        setProgress(40);
        const res = await fetch(`/api/import/${type}`, {
          method: "POST",
          body: formData,
        });
        setProgress(80);
        const data = await res.json();
        setProgress(100);

        if (data.success) {
          toast.success(`Import ${type.toUpperCase()} berhasil — ${data.imported} data masuk`);
          onResult(data, file.name);
        } else {
          toast.error(data.error || "Gagal import");
        }
      } catch {
        toast.error("Koneksi error saat upload");
      } finally {
        setLoading(false);
        setTimeout(() => setProgress(0), 1000);
      }
    },
    [type, onResult]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/plain": [".txt"] },
    maxFiles: 1,
    disabled: loading,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all",
        isDragActive
          ? "border-blue-500 bg-blue-500/5"
          : "border-border hover:border-blue-400/50 hover:bg-accent/50",
        loading && "pointer-events-none opacity-70"
      )}
    >
      <input {...getInputProps()} id={`drop-${type}`} />
      <div className="flex flex-col items-center gap-3">
        {loading ? (
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        ) : (
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center",
            type === "wo" ? "bg-blue-500/10" : "bg-violet-500/10"
          )}>
            <Upload className={cn("w-7 h-7", type === "wo" ? "text-blue-500" : "text-violet-500")} />
          </div>
        )}
        <div>
          <p className="font-semibold text-foreground">{label}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {isDragActive ? "Lepaskan file di sini..." : "Drag & drop atau klik untuk pilih"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Format: TXT dengan delimiter ;</p>
        </div>
      </div>

      {/* Progress bar */}
      {progress > 0 && (
        <div className="mt-4 w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <div
            className="h-1.5 bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

function ResultCard({ result, fileName }: { result: ImportResult; fileName: string }) {
  const [showErrors, setShowErrors] = useState(false);

  return (
    <div className="bg-card border border-border rounded-2xl p-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="font-medium text-sm">{fileName}</p>
            <p className="text-xs text-muted-foreground">Import selesai</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mt-4">
        {[
          { label: "Total Baris", value: result.total, color: "text-foreground" },
          { label: "Berhasil", value: result.imported, color: "text-emerald-400" },
          { label: "Di-skip", value: result.skipped, color: "text-amber-400" },
          { label: "Duplikat", value: result.duplicates, color: "text-slate-400" },
        ].map((s) => (
          <div key={s.label} className="bg-muted rounded-xl p-3 text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {result.errors.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowErrors(!showErrors)}
            className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {result.errors.length} baris dilewati
            {showErrors ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showErrors && (
            <div className="mt-2 bg-muted rounded-xl p-3 max-h-48 overflow-y-auto">
              {result.errors.map((e, i) => (
                <p key={i} className="text-xs text-muted-foreground font-mono">{e}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ImportPage() {
  const [results, setResults] = useState<{ result: ImportResult; fileName: string }[]>([]);

  const handleResult = (result: ImportResult, fileName: string) => {
    setResults((prev) => [{ result, fileName }, ...prev.slice(0, 4)]);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold">Import File TXT</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload file WO dan INV dari sistem TAM. Data akan otomatis difilter, deduplikasi, dan dikoreksi.
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm">
        <p className="font-medium text-blue-400 mb-1">Auto Processing</p>
        <ul className="text-muted-foreground space-y-0.5 text-xs list-disc list-inside">
          <li>Filter: hanya <code className="bg-muted px-1 rounded">GW-</code> (WO) dan <code className="bg-muted px-1 rounded">GF-</code> (INV) yang diproses</li>
          <li>Auto-koreksi operation type: KM → SBE, 1000 KM → SBI, OLI → OIL, lainnya → GR</li>
          <li>Auto-fix part number: <code className="bg-muted px-1 rounded">00000000000</code> → <code className="bg-muted px-1 rounded">0</code></li>
          <li>Remove duplikat otomatis berdasarkan WO_No + Outlet + Tanggal</li>
        </ul>
      </div>

      {/* Drop zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DropZone label="Upload File WO" type="wo" onResult={handleResult} />
        <DropZone label="Upload File INV" type="inv" onResult={handleResult} />
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Hasil Import</h3>
            <button
              onClick={() => setResults([])}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Bersihkan
            </button>
          </div>
          {results.map((r, i) => (
            <ResultCard key={i} result={r.result} fileName={r.fileName} />
          ))}
        </div>
      )}
    </div>
  );
}
