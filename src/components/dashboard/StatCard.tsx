import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  gradient: string;
  iconBg: string;
  subtitle?: string;
  delta?: string;
}

export default function StatCard({ title, value, icon: Icon, gradient, iconBg, subtitle, delta }: StatCardProps) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-2xl p-5 text-white", gradient)}
      style={{ boxShadow: "0 6px 24px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.15)" }}
    >
      {/* Top highlight */}
      <div className="absolute top-0 inset-x-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)" }} />

      {/* Decorative circles */}
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full border-[20px] border-white/[0.08]" />
      <div className="absolute -bottom-8 -right-1 w-20 h-20 rounded-full border-[12px] border-white/[0.05]" />

      <div className="relative flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/55 mb-1.5">{title}</p>
          <p className="text-[32px] font-black tracking-tight leading-none tabular-nums">{value}</p>
          {subtitle && (
            <p className="text-[11px] text-white/45 mt-2 font-medium">{subtitle}</p>
          )}
          {delta && (
            <p className="text-[11px] text-white/70 mt-1 font-semibold">{delta}</p>
          )}
        </div>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", iconBg)}>
          <Icon className="w-[18px] h-[18px] text-white" strokeWidth={2.2} />
        </div>
      </div>
    </div>
  );
}
