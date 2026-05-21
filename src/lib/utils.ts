import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";
import type { PipelineStatus } from "@/types/gitlab";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
}

export function formatDate(date: string): string {
  return format(new Date(date), "dd MMM yyyy HH:mm", { locale: fr });
}

export function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function pipelineStatusColor(status: PipelineStatus): string {
  const map: Record<PipelineStatus, string> = {
    running:              "text-blue-600 bg-blue-50 border-blue-200",
    success:              "text-emerald-600 bg-emerald-50 border-emerald-200",
    failed:               "text-rose-600 bg-rose-50 border-rose-200",
    canceled:             "text-slate-500 bg-slate-50 border-slate-200",
    pending:              "text-amber-600 bg-amber-50 border-amber-200",
    created:              "text-slate-500 bg-slate-50 border-slate-200",
    manual:               "text-violet-600 bg-violet-50 border-violet-200",
    scheduled:            "text-violet-500 bg-violet-50 border-violet-200",
    skipped:              "text-slate-400 bg-slate-50 border-slate-200",
    waiting_for_resource: "text-amber-500 bg-amber-50 border-amber-200",
    preparing:            "text-amber-500 bg-amber-50 border-amber-200",
  };
  return map[status] || "text-slate-500 bg-slate-50 border-slate-200";
}

export function pipelineStatusLabel(status: PipelineStatus): string {
  const map: Record<PipelineStatus, string> = {
    running: "En cours",
    success: "Succès",
    failed: "Échoué",
    canceled: "Annulé",
    pending: "En attente",
    created: "Créé",
    manual: "Manuel",
    scheduled: "Planifié",
    skipped: "Ignoré",
    waiting_for_resource: "Attente ressource",
    preparing: "Préparation",
  };
  return map[status] || status;
}

export function accessLevelLabel(level: number): string {
  if (level >= 50) return "Owner";
  if (level >= 40) return "Maintainer";
  if (level >= 30) return "Developer";
  if (level >= 20) return "Reporter";
  if (level >= 10) return "Guest";
  return "No access";
}

export function bytesToHuman(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}
