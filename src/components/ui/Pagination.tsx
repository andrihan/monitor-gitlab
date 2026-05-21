"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, total, pageSize, onPageChange }: PaginationProps) {
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  if (totalPages <= 1) return null;

  const navBtn = (disabled: boolean, onClick: () => void, children: React.ReactNode) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "p-1.5 rounded-lg border transition-all duration-150",
        disabled
          ? "opacity-30 cursor-not-allowed border-[#E5E2F5] text-[#8E89B8]"
          : "border-[#E5E2F5] text-[#8E89B8] hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50"
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="flex items-center justify-between mt-5 px-1">
      <span className="text-xs font-medium" style={{ color: "#8E89B8" }}>
        {from}–{to} <span style={{ color: "#CBC6F0" }}>sur</span> {total}
      </span>
      <div className="flex items-center gap-1">
        {navBtn(page === 1, () => onPageChange(page - 1), <ChevronLeft className="w-3.5 h-3.5" />)}
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let p = i + 1;
          if (totalPages > 5) {
            if (page <= 3) p = i + 1;
            else if (page >= totalPages - 2) p = totalPages - 4 + i;
            else p = page - 2 + i;
          }
          const isActive = p === page;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className="w-7 h-7 text-xs rounded-lg border transition-all duration-150 font-semibold"
              style={isActive ? {
                background: "linear-gradient(135deg, #8B5CF6, #6D28D9)",
                color: "#fff",
                border: "1px solid #6D28D9",
                boxShadow: "0 2px 8px rgba(109,40,217,0.35)",
              } : {
                background: "#fff",
                color: "#8E89B8",
                border: "1px solid #E5E2F5",
              }}
              onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.color = "#7C3AED"; (e.currentTarget as HTMLElement).style.borderColor = "#C4B5FD"; } }}
              onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.color = "#8E89B8"; (e.currentTarget as HTMLElement).style.borderColor = "#E5E2F5"; } }}
            >
              {p}
            </button>
          );
        })}
        {navBtn(page === totalPages, () => onPageChange(page + 1), <ChevronRight className="w-3.5 h-3.5" />)}
      </div>
    </div>
  );
}
