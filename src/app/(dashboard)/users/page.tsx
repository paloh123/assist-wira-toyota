"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, RefreshCw, ShieldCheck, UserPlus, Users } from "lucide-react";
import { getRoleLabel, roleOptions } from "@/lib/roles";
import { formatDate } from "@/lib/utils";

type UserRow = {
  id: number;
  username: string;
  name: string;
  role: string;
  is_active: boolean;
  created_at: string;
};

const initialForm = {
  username: "",
  name: "",
  password: "",
  role: "SERVICE_MANAGER",
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal memuat user");
        return;
      }
      setUsers(data.users || []);
    } catch {
      toast.error("Koneksi error saat memuat user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal membuat akun");
        return;
      }
      toast.success("Akun login berhasil dibuat");
      setForm(initialForm);
      setUsers((prev) => [data.user, ...prev]);
    } catch {
      toast.error("Koneksi error saat membuat akun");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (user: UserRow) => {
    setUpdatingId(user.id);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !user.is_active }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal update akun");
        return;
      }
      setUsers((prev) =>
        prev.map((item) => (item.id === user.id ? data.user : item))
      );
      toast.success("Status akun diperbarui");
    } catch {
      toast.error("Koneksi error saat update akun");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.08] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100">
            <ShieldCheck className="h-3.5 w-3.5" />
            Access Control
          </div>
          <h2 className="text-xl font-bold text-white">User Login</h2>
          <p className="text-sm text-slate-400">
            Kelola akun untuk Service Manager, Support Digital, dan Admin.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.055] px-4 text-sm font-medium text-slate-200 transition hover:border-cyan-300/35 hover:text-cyan-100 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        <input
          value={form.username}
          onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
          placeholder="Username"
          required
          className="h-11 rounded-xl border border-white/10 bg-slate-950/50 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/60"
        />
        <input
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          placeholder="Nama"
          required
          className="h-11 rounded-xl border border-white/10 bg-slate-950/50 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/60"
        />
        <input
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          placeholder="Password"
          type="password"
          required
          className="h-11 rounded-xl border border-white/10 bg-slate-950/50 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/60"
        />
        <select
          value={form.role}
          onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
          className="h-11 rounded-xl border border-white/10 bg-slate-950/50 px-3 text-sm text-white outline-none focus:border-cyan-300/60"
        >
          {roleOptions.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-cyan-500/15 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          Buat Akun
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045]">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-sm font-semibold text-white">
          <Users className="h-4 w-4 text-cyan-200" />
          Daftar Akun
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-white/[0.04] text-left text-xs uppercase tracking-[0.14em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Dibuat</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Memuat user...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Belum ada akun database.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="text-slate-300">
                    <td className="px-4 py-3 font-medium text-white">{user.username}</td>
                    <td className="px-4 py-3">{user.name}</td>
                    <td className="px-4 py-3">{getRoleLabel(user.role)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          user.is_active
                            ? "bg-emerald-400/10 text-emerald-200"
                            : "bg-red-400/10 text-red-200"
                        }`}
                      >
                        {user.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{formatDate(user.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => toggleStatus(user)}
                        disabled={updatingId === user.id}
                        className="inline-flex h-9 items-center justify-center rounded-xl border border-white/10 px-3 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/35 hover:text-cyan-100 disabled:opacity-60"
                      >
                        {updatingId === user.id
                          ? "Menyimpan..."
                          : user.is_active
                            ? "Nonaktifkan"
                            : "Aktifkan"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
