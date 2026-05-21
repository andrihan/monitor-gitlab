import {
  FolderGit2,
  Play,
  XCircle,
  CheckCircle2,
  GitMerge,
  CircleDot,
  Users,
  Activity,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import PipelineBadge from "@/components/ui/PipelineBadge";
import { getDashboardStats, getAllGroupProjects } from "@/lib/gitlab";
import type { PipelineStatus } from "@/types/gitlab";

export const metadata = { title: "Dashboard" };

async function DashboardContent() {
  const groupId = process.env.GITLAB_GROUP_ID;
  if (!groupId) {
    return (
      <div className="p-6 rounded-2xl" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: "#D97706" }} />
          <div>
            <p className="font-bold text-sm" style={{ color: "#92400E" }}>Configuration manquante</p>
            <p className="text-sm mt-0.5" style={{ color: "#B45309" }}>
              Renseignez <code className="font-mono px-1 py-0.5 rounded text-xs bg-amber-100">GITLAB_TOKEN</code> et{" "}
              <code className="font-mono px-1 py-0.5 rounded text-xs bg-amber-100">GITLAB_GROUP_ID</code> dans votre fichier{" "}
              <code className="font-mono px-1 py-0.5 rounded text-xs bg-amber-100">.env.local</code>, puis redémarrez le serveur.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const [stats, projects] = await Promise.all([
    getDashboardStats(groupId),
    getAllGroupProjects(groupId),
  ]);

  const recentProjects = projects.slice(0, 6);

  const statCards = [
    {
      title: "Projets",
      value: stats.totalProjects,
      icon: FolderGit2,
      gradient: "bg-gradient-to-br from-violet-600 to-purple-800",
      iconBg: "bg-white/15",
      subtitle: "Dans le groupe",
      href: "/projects",
    },
    {
      title: "En cours",
      value: stats.runningPipelines,
      icon: Play,
      gradient: "bg-gradient-to-br from-sky-500 to-blue-700",
      iconBg: "bg-white/20",
      subtitle: "Pipelines actifs",
      href: "/pipelines?status=running",
    },
    {
      title: "Échoués",
      value: stats.failedPipelines,
      icon: XCircle,
      gradient: "bg-gradient-to-br from-rose-500 to-red-700",
      iconBg: "bg-white/20",
      subtitle: "À corriger",
      href: "/pipelines?status=failed",
    },
    {
      title: "Succès",
      value: stats.successPipelines,
      icon: CheckCircle2,
      gradient: "bg-gradient-to-br from-emerald-500 to-teal-700",
      iconBg: "bg-white/20",
      subtitle: "Pipelines réussis",
      href: "/pipelines?status=success",
    },
    {
      title: "Merge Requests",
      value: stats.openMergeRequests,
      icon: GitMerge,
      gradient: "bg-gradient-to-br from-fuchsia-500 to-purple-700",
      iconBg: "bg-white/20",
      subtitle: "Ouvertes",
      href: "/merge-requests",
    },
    {
      title: "Issues",
      value: stats.openIssues,
      icon: CircleDot,
      gradient: "bg-gradient-to-br from-amber-500 to-orange-600",
      iconBg: "bg-white/20",
      subtitle: "Ouvertes",
      href: "/issues",
    },
    {
      title: "Membres",
      value: stats.totalMembers,
      icon: Users,
      gradient: "bg-gradient-to-br from-teal-500 to-cyan-700",
      iconBg: "bg-white/20",
      subtitle: "Dans le groupe",
      href: "/members",
    },
    {
      title: "Actifs 7j",
      value: stats.recentActivity,
      icon: Activity,
      gradient: "bg-gradient-to-br from-indigo-500 to-violet-700",
      iconBg: "bg-white/20",
      subtitle: "Projets avec activité",
      href: "/projects",
    },
  ];

  const total = stats.runningPipelines + stats.failedPipelines + stats.successPipelines;
  const bars = [
    { label: "Succès",   count: stats.successPipelines, color: "#10B981", bg: "#ECFDF5" },
    { label: "En cours", count: stats.runningPipelines,  color: "#3B82F6", bg: "#EFF6FF" },
    { label: "Échoués",  count: stats.failedPipelines,   color: "#F43F5E", bg: "#FFF1F2" },
  ];

  return (
    <>
      {/* Stat grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="block rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-400 transition-transform duration-150 hover:-translate-y-0.5"
          >
            <StatCard
              title={card.title}
              value={card.value}
              icon={card.icon}
              gradient={card.gradient}
              iconBg={card.iconBg}
              subtitle={card.subtitle}
            />
          </Link>
        ))}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Pipeline health */}
        <Card>
          <CardHeader>
            <CardTitle>Santé des pipelines</CardTitle>
            <TrendingUp className="w-3.5 h-3.5" style={{ color: "#8E89B8" }} />
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {bars.map(({ label, count, color, bg }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1.5 font-semibold" style={{ color: "#4A4580" }}>
                    <span>{label}</span>
                    <span className="tabular-nums" style={{ color: "#8E89B8" }}>{count} / {total || 0}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: bg }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: total > 0 ? `${(count / total) * 100}%` : "0%",
                        background: color,
                      }}
                    />
                  </div>
                </div>
              ))}
              {total === 0 && (
                <p className="text-xs text-center py-3" style={{ color: "#8E89B8" }}>Aucun pipeline récent</p>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Quick links */}
        <Card>
          <CardHeader>
            <CardTitle>Accès rapide</CardTitle>
          </CardHeader>
          <CardBody className="p-2">
            {[
              { href: "/pipelines?status=failed",  label: "Pipelines échoués",      iconBg: "bg-rose-50",   iconColor: "text-rose-500",   icon: XCircle  },
              { href: "/pipelines?status=running", label: "Pipelines en cours",      iconBg: "bg-blue-50",   iconColor: "text-blue-500",   icon: Play     },
              { href: "/merge-requests",           label: "Merge Requests ouvertes", iconBg: "bg-violet-50", iconColor: "text-violet-600", icon: GitMerge },
              { href: "/issues",                   label: "Issues ouvertes",         iconBg: "bg-amber-50",  iconColor: "text-amber-600",  icon: CircleDot},
            ].map(({ href, label, icon: Icon, iconBg, iconColor }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 p-2.5 rounded-xl transition-colors hover:bg-violet-50/60 group"
              >
                <span className={`w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 ${iconBg}`}>
                  <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
                </span>
                <span className="text-sm font-semibold text-[#4A4580] group-hover:text-violet-700 transition-colors">{label}</span>
              </Link>
            ))}
          </CardBody>
        </Card>

        {/* Recent projects */}
        <Card>
          <CardHeader>
            <CardTitle>Projets récents</CardTitle>
            <Link href="/projects" className="text-xs font-bold text-violet-600 hover:text-violet-800 transition-colors">
              Voir tout →
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            {recentProjects.map((project, i) => (
              <div
                key={project.id}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-violet-50/40 transition-colors"
                style={{ borderBottom: i < recentProjects.length - 1 ? "1px solid #EDEAF8" : "none" }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #8B5CF6, #6D28D9)" }}>
                    <span className="text-white text-[10px] font-bold">
                      {project.name[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs font-semibold truncate" style={{ color: "#4A4580" }}>
                    {project.name}
                  </span>
                </div>
                <Link href={`/commits?projectId=${project.id}&name=${encodeURIComponent(project.name)}`}>
                  <PipelineBadge
                    status={"success" as PipelineStatus}
                    className="text-[10px] px-1.5 py-0"
                  />
                </Link>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-48 rounded-2xl" />
        ))}
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-7">
        <h1 className="text-[22px] font-extrabold tracking-tight leading-tight" style={{ color: "#1A1533" }}>
          Dashboard
        </h1>
        <p className="text-sm mt-0.5 font-medium" style={{ color: "#8E89B8" }}>
          Vue d'ensemble de votre organisation GitLab
        </p>
      </div>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
