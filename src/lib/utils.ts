import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function getScoreColor(score: number) {
  if (score >= 90) return "text-emerald-accent";
  if (score >= 70) return "text-cyan-accent";
  if (score >= 50) return "text-amber-accent";
  return "text-red-accent";
}

export function getRiskBadgeClass(level: string) {
  const base = "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border";
  switch (level?.toLowerCase()) {
    case 'critical': return `${base} bg-red-500/10 text-red-500 border-red-500/20`;
    case 'high': return `${base} bg-amber-500/10 text-amber-500 border-amber-500/20`;
    case 'medium': return `${base} bg-cyan-500/10 text-cyan-500 border-cyan-500/20`;
    case 'low': return `${base} bg-emerald-500/10 text-emerald-500 border-emerald-500/20`;
    default: return `${base} bg-slate-500/10 text-slate-500 border-slate-500/20`;
  }
}
