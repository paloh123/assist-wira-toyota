"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowRight,
  Building2,
  CircleCheck,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  User,
} from "lucide-react";

function getSafeCallbackUrl(callbackUrl: string | null) {
  if (!callbackUrl || callbackUrl === "/" || callbackUrl.startsWith("/login")) {
    return "/dashboard";
  }

  if (!callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
    return "/dashboard";
  }

  return callbackUrl;
}

function LoginContent() {
  const params = useSearchParams();
  const callbackUrl = getSafeCallbackUrl(params.get("callbackUrl"));

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        username: username.trim(),
        password: password.trim(),
        callbackUrl,
        redirect: false,
      });
      if (res?.ok) {
        toast.success("Login berhasil! Selamat datang.");
        window.location.assign(res.url || callbackUrl);
      } else {
        toast.error("Username atau password salah.");
      }
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-fade-up relative z-10 w-full max-w-[27rem]">
      <div className="login-glass relative overflow-hidden rounded-[1.4rem] px-6 py-7 sm:px-8 sm:py-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.075] shadow-lg shadow-cyan-500/10 backdrop-blur-xl">
            <Building2 className="h-5 w-5 text-cyan-100" />
          </div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/18 bg-cyan-300/[0.075] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-cyan-100">
            <span className="login-pulse h-1.5 w-1.5 rounded-full bg-cyan-300" />
            Secure enterprise access
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Wira Toyota Banjarmasin
          </p>
          <h1 className="mt-2 text-[1.65rem] font-semibold leading-tight text-white">
            WEB ASSIST
          </h1>
          <p className="mx-auto mt-2 max-w-[20rem] text-sm leading-6 text-slate-300">
            Sign in to your modern operations workspace.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Username
            </label>
            <div className="group relative">
              <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-cyan-200" />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter corporate ID"
                required
                autoComplete="username"
                className="h-12 w-full rounded-xl border border-white/12 bg-slate-950/45 px-11 text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-600 focus:border-cyan-300/65 focus:bg-slate-950/70 focus:shadow-[0_0_0_4px_rgba(34,211,238,0.09),0_0_26px_rgba(14,165,233,0.12)]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Password
            </label>
            <div className="group relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-cyan-200" />
              <input
                id="password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                required
                autoComplete="current-password"
                className="h-12 w-full rounded-xl border border-white/12 bg-slate-950/45 px-11 pr-12 text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-600 focus:border-cyan-300/65 focus:bg-slate-950/70 focus:shadow-[0_0_0_4px_rgba(34,211,238,0.09),0_0_26px_rgba(14,165,233,0.12)]"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/10 hover:text-white"
              >
                {showPw ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 text-xs text-slate-400">
            <span className="inline-flex items-center gap-2">
              <CircleCheck className="h-3.5 w-3.5 text-cyan-200/80" />
              Protected enterprise environment
            </span>
            <span className="inline-flex items-center gap-1.5 text-cyan-100/80">
              <ShieldCheck className="h-3.5 w-3.5" />
              v1.0
            </span>
          </div>

          <button
            id="btn-login"
            type="submit"
            disabled={loading}
            className="group relative flex h-12 w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700 text-sm font-semibold text-white shadow-xl shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            <span className="absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[120%]" />
            <span className="relative">
              {loading ? "Authenticating..." : "Access Platform"}
            </span>
            {loading ? (
              <span className="relative h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="login-shell relative min-h-screen overflow-hidden text-white">
      <div className="pointer-events-none absolute left-1/2 top-[14%] h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/12 blur-[112px]" />
      <div className="pointer-events-none absolute right-[12%] top-[18%] h-64 w-64 rounded-full bg-blue-600/12 blur-[118px]" />
      <div className="pointer-events-none absolute bottom-[8%] left-[12%] h-64 w-64 rounded-full bg-sky-300/8 blur-[120px]" />

      <main className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="flex w-full justify-center">
          <Suspense fallback={<div className="text-white">Memuat...</div>}>
            <LoginContent />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
