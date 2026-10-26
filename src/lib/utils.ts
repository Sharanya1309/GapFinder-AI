import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ProficiencyStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function getStatusBadgeInfo(status: ProficiencyStatus) {
  switch (status) {
    case "weak":
      return {
        label: "Weak",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20",
        pillClass: "bg-rose-500",
        progressColor: "bg-rose-500",
        textColor: "text-rose-600",
        bgSubtle: "bg-rose-50/50",
        borderColor: "border-rose-200",
      };
    case "medium":
      return {
        label: "Medium",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20",
        pillClass: "bg-amber-500",
        progressColor: "bg-amber-500",
        textColor: "text-amber-600",
        bgSubtle: "bg-amber-50/50",
        borderColor: "border-amber-200",
      };
    case "strong":
      return {
        label: "Strong",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20",
        pillClass: "bg-emerald-500",
        progressColor: "bg-emerald-500",
        textColor: "text-emerald-600",
        bgSubtle: "bg-emerald-50/50",
        borderColor: "border-emerald-200",
      };
    case "insufficient_data":
    default:
      return {
        label: "Insufficient Data",
        badgeClass: "bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/10",
        pillClass: "bg-slate-400",
        progressColor: "bg-slate-400",
        textColor: "text-slate-500",
        bgSubtle: "bg-slate-50",
        borderColor: "border-slate-200",
      };
  }
}
