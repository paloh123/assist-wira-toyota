"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Settings2, Save, Calculator, Loader2 } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface SettingsData {
  month: string; ratio: number; target_tam: number; hk: number; plan_per_day: number;
}

const defaultSettings: SettingsData = {
  month: "",
  ratio: 1.1,
  target_tam: 0,
  hk: 0,
  plan_per_day: 0,
};

export default function SettingsPage() {
  const [form, setForm] = useState<SettingsData>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) setForm({ ...defaultSettings, ...d.settings });
        setLoaded(true);
      });
  }, []);

  const targetRequired   = Math.ceil((form.target_tam || 0) * (form.ratio || 1));
  const autoPerDay       = form.hk > 0 ? Math.ceil(targetRequired / form.hk) : 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Settings berhasil disimpan");
      } else {
        toast.error(data.error || "Gagal menyimpan");
      }
    } catch {
      toast.error("Koneksi error");
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, key: keyof SettingsData, type = "number", placeholder = "") => (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <input
        type={type}
        value={(form[key] ?? defaultSettings[key]) as string | number}
        onChange={(e) => setForm((p) => ({ ...p, [key]: type === "number" ? parseFloat(e.target.value) || 0 : e.target.value }))}
        placeholder={placeholder}
        step={key === "ratio" ? "0.01" : "1"}
        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
      />
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold">Settings ASSIST</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Konfigurasi target, ratio, dan rencana upload bulanan.
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <h3 className="font-semibold flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-muted-foreground" /> Konfigurasi Bulan
        </h3>

        {field("Bulan (contoh: 2026-05)", "month", "text", "2026-05")}
        {field("Target TAM (unit)", "target_tam")}
        {field("Ratio Target (contoh: 1.10 = 110%)", "ratio")}
        {field("Hari Kerja (HK)", "hk")}
        {field("Plan Per Hari (manual override)", "plan_per_day")}
      </div>

      {/* Auto calculation */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 space-y-3">
        <h3 className="font-semibold flex items-center gap-2 text-sm">
          <Calculator className="w-4 h-4 text-blue-400" /> Kalkulasi Otomatis
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-background rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">Target TAM</p>
            <p className="text-xl font-bold mt-1">{formatNumber(form.target_tam)}</p>
          </div>
          <div className="flex items-center justify-center text-muted-foreground text-lg font-bold">×{Math.round((form.ratio || 1) * 100)}%</div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">Target Required</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">{formatNumber(targetRequired)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 pt-1">
          <div className="flex-1 bg-background rounded-xl p-3">
            <p className="text-xs text-muted-foreground">HK</p>
            <p className="font-bold">{form.hk} hari</p>
          </div>
          <div className="text-muted-foreground font-bold">÷</div>
          <div className="flex-1 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
            <p className="text-xs text-muted-foreground">Auto Per Hari</p>
            <p className="font-bold text-blue-400">{formatNumber(autoPerDay)} / hari</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Gunakan nilai ini untuk Plan Per Hari di atas (atau override manual).
        </p>
        <button
          onClick={() => setForm((p) => ({ ...p, plan_per_day: autoPerDay }))}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          → Pakai nilai auto ({formatNumber(autoPerDay)}/hari)
        </button>
      </div>

      <button
        id="btn-save-settings"
        onClick={handleSave}
        disabled={saving || !loaded}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? "Menyimpan..." : "Simpan Settings"}
      </button>
    </div>
  );
}
