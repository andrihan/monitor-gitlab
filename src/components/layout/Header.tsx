"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export default function Header({ title, subtitle, children }: HeaderProps) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 1200);
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-[22px] font-extrabold tracking-tight leading-tight" style={{ color: "#1A1533" }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm mt-0.5 font-medium" style={{ color: "#8E89B8" }}>{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {children}
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all duration-150"
          style={{
            background: "#fff",
            border: "1px solid #E5E2F5",
            color: "#8E89B8",
            boxShadow: "0 1px 3px rgba(26,21,51,0.06)",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = "#7C3AED";
            (e.currentTarget as HTMLElement).style.borderColor = "#C4B5FD";
            (e.currentTarget as HTMLElement).style.background = "#F5F3FF";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = "#8E89B8";
            (e.currentTarget as HTMLElement).style.borderColor = "#E5E2F5";
            (e.currentTarget as HTMLElement).style.background = "#fff";
          }}
        >
          <RefreshCw
            className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`}
            style={{ color: refreshing ? "#7C3AED" : "currentColor" }}
          />
          Actualiser
        </button>
      </div>
    </div>
  );
}
