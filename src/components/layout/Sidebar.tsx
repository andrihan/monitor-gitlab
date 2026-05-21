"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FolderGit2, GitBranch,
  GitCommitHorizontal, GitMerge, CircleDot,
  Users, Settings, PanelLeftClose, PanelLeftOpen, Zap,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/",               icon: LayoutDashboard,    label: "Dashboard" },
  { href: "/projects",       icon: FolderGit2,          label: "Projets" },
  { href: "/pipelines",      icon: GitBranch,           label: "Pipelines" },
  { href: "/commits",        icon: GitCommitHorizontal, label: "Commits" },
  { href: "/merge-requests", icon: GitMerge,            label: "Merge Requests" },
  { href: "/issues",         icon: CircleDot,           label: "Issues" },
  { href: "/members",        icon: Users,               label: "Membres" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className="relative flex flex-col h-screen flex-shrink-0 transition-[width] duration-300 ease-[cubic-bezier(.25,.46,.45,.94)]"
      style={{
        width: collapsed ? 64 : 232,
        background: "linear-gradient(180deg, #1B1040 0%, #100A2E 60%, #0C0720 100%)",
      }}
    >
      {/* Subtle top glow */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.4), transparent)" }} />

      {/* Ambient violet glow behind logo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, transparent 70%)" }} />

      {/* ── Logo ─────────────────────────────────── */}
      <div className="relative flex items-center h-[64px] px-4 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(167,139,250,0.12)" }}>
        {!collapsed ? (
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <Logo />
            <div className="min-w-0">
              <span className="font-extrabold text-white text-[15px] tracking-tight block leading-tight">
                GitLab Monitor
              </span>
              <span className="text-[10px] font-medium" style={{ color: "rgba(167,139,250,0.6)" }}>
                Dashboard
              </span>
            </div>
          </div>
        ) : (
          <div className="mx-auto"><Logo /></div>
        )}
      </div>

      {/* ── Navigation ───────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-0.5">
        {!collapsed && (
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] px-2 mb-2"
            style={{ color: "rgba(167,139,250,0.4)" }}>
            Navigation
          </p>
        )}
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "relative flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150 outline-none group",
                collapsed ? "px-0 py-3 justify-center" : "px-3 py-2.5",
                active ? "text-white" : "hover:text-white"
              )}
              style={active ? {
                background: "linear-gradient(135deg, rgba(124,58,237,0.35) 0%, rgba(109,40,217,0.2) 100%)",
                boxShadow: "inset 0 0 0 1px rgba(167,139,250,0.25)",
              } : undefined}
            >
              {/* Active left bar */}
              {active && !collapsed && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                  style={{ background: "linear-gradient(180deg, #A78BFA, #7C3AED)" }} />
              )}

              <Icon
                size={16}
                className={cn(
                  "flex-shrink-0 transition-colors",
                  active ? "text-violet-300" : "text-white/30 group-hover:text-white/70"
                )}
              />
              {!collapsed && (
                <span className={cn(
                  "truncate transition-colors",
                  active ? "text-white" : "text-white/40 group-hover:text-white/80"
                )}>
                  {label}
                </span>
              )}

              {/* Active dot for collapsed */}
              {active && collapsed && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-violet-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ───────────────────────────────── */}
      <div className="px-2.5 pb-4 pt-2 space-y-0.5"
        style={{ borderTop: "1px solid rgba(167,139,250,0.10)" }}>
        <Link
          href="/settings"
          title={collapsed ? "Paramètres" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-xl text-sm font-medium transition-all group",
            pathname === "/settings" ? "text-white" : "",
            collapsed ? "px-0 py-3 justify-center" : "px-3 py-2.5"
          )}
          style={pathname === "/settings" ? {
            background: "rgba(124,58,237,0.2)",
            boxShadow: "inset 0 0 0 1px rgba(167,139,250,0.2)",
          } : undefined}
        >
          <Settings
            size={16}
            className={cn(
              "flex-shrink-0",
              pathname === "/settings"
                ? "text-violet-300"
                : "text-white/30 group-hover:text-white/70"
            )}
          />
          {!collapsed && (
            <span className={cn(
              pathname === "/settings"
                ? "text-white"
                : "text-white/40 group-hover:text-white/80"
            )}>
              Paramètres
            </span>
          )}
        </Link>

        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Agrandir" : "Réduire"}
          className={cn(
            "w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all group",
            "text-white/20 hover:text-white/50 hover:bg-white/5",
            collapsed ? "px-0 py-3 justify-center" : "px-3 py-2.5"
          )}
        >
          {collapsed
            ? <PanelLeftOpen size={16} className="flex-shrink-0" />
            : <><PanelLeftClose size={16} className="flex-shrink-0" /><span>Réduire</span></>
          }
        </button>
      </div>
    </aside>
  );
}

function Logo() {
  return (
    <div
      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{
        background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
        boxShadow: "0 2px 12px rgba(109,40,217,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
      }}
    >
      <Zap size={14} className="text-white" fill="white" />
    </div>
  );
}
