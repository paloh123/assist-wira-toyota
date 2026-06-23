import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("id-ID").format(n);
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

export function formatDate(d: Date | string | null): string {
  if (!d) return "-";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatDateTAM(d: Date | null): string {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}/${m}/${day}`;
}

export function getRatioColor(
  actual: number,
  target: number
): "green" | "yellow" | "red" {
  if (target === 0) return "green";
  const ratio = actual / target;
  if (ratio >= 1.0) return "green";
  if (ratio >= 0.8) return "yellow";
  return "red";
}

export function getStatusVariant(
  status: string
): "pending" | "planned" | "exported" | "default" {
  switch (status.toUpperCase()) {
    case "PENDING": return "pending";
    case "PLANNED": return "planned";
    case "EXPORTED": return "exported";
    default: return "default";
  }
}
