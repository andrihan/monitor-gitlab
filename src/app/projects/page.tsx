"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, GitFork, CircleDot, ExternalLink, Lock, Globe, Eye, Search, FolderGit2 } from "lucide-react";
import Header from "@/components/layout/Header";
import PipelineBadge from "@/components/ui/PipelineBadge";
import Pagination from "@/components/ui/Pagination";
import { timeAgo } from "@/lib/utils";
import type { GitLabProject, GitLabPipeline } from "@/types/gitlab";

type ProjectWithPipeline = GitLabProject & { latest_pipeline: GitLabPipeline | null };

const visibilityConfig = {
  private:  { icon: Lock,  label: "Privé",   color: "#F43F5E" },
  internal: { icon: Eye,   label: "Interne", color: "#D97706" },
  public:   { icon: Globe, label: "Public",  color: "#10B981" },
};

const projectGradients = [
  "linear-gradient(135deg, #8B5CF6, #6D28D9)",
  "linear-gradient(135deg, #3B82F6, #1D4ED8)",
  "linear-gradient(135deg, #10B981, #059669)",
  "linear-gradient(135deg, #F59E0B, #D97706)",
  "linear-gradient(135deg, #EC4899, #BE185D)",
  "linear-gradient(135deg, #14B8A6, #0D9488)",
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithPipeline[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchProjects = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/gitlab/projects?page=${p}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProjects(data.projects);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(page); }, [page, fetchProjects]);

  const filtered = search
    ? projects.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.namespace.full_path.toLowerCase().includes(search.toLowerCase())
      )
    : projects;

  return (
    <div>
      <Header
        title="Projets"
        subtitle={total > 0 ? `${total} projets dans le groupe` : "Projets de l'organisation"}
      >
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#8E89B8" }} />
          <input
            type="text"
            placeholder="Filtrer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white w-44 outline-none transition-all"
            style={{
              border: "1px solid #E5E2F5",
              boxShadow: "0 1px 3px rgba(26,21,51,0.06)",
              color: "#1A1533",
            }}
            onFocus={e => {
              e.target.style.borderColor = "#A78BFA";
              e.target.style.boxShadow = "0 0 0 3px rgba(167,139,250,0.2)";
            }}
            onBlur={e => {
              e.target.style.borderColor = "#E5E2F5";
              e.target.style.boxShadow = "0 1px 3px rgba(26,21,51,0.06)";
            }}
          />
        </div>
      </Header>

      {error && (
        <div className="mb-4 p-3 rounded-xl text-xs font-medium"
          style={{ background: "#FFF1F2", border: "1px solid #FECDD3", color: "#E11D48" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-36" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-white" style={{ border: "1px solid #E5E2F5" }}>
          <FolderGit2 className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: "#8E89B8" }} />
          <p className="font-semibold text-sm" style={{ color: "#4A4580" }}>Aucun projet trouvé</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((project, idx) => {
              const vis = visibilityConfig[project.visibility];
              const VisIcon = vis.icon;
              return (
                <div
                  key={project.id}
                  className="bg-white rounded-2xl p-5 card-lift transition-all"
                  style={{ border: "1px solid #E5E2F5", boxShadow: "0 1px 4px rgba(26,21,51,0.06)" }}
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {project.avatar_url ? (
                        <Image
                          src={project.avatar_url}
                          alt={project.name}
                          width={40}
                          height={40}
                          className="rounded-xl flex-shrink-0"
                          style={{ border: "1px solid #E5E2F5" }}
                        />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: projectGradients[idx % projectGradients.length], boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
                        >
                          <span className="text-white text-sm font-bold">{project.name[0].toUpperCase()}</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-sm truncate" style={{ color: "#1A1533" }}>
                            {project.name}
                          </h3>
                          <span title={vis.label}>
                            <VisIcon className="w-3 h-3 flex-shrink-0" style={{ color: vis.color }} />
                          </span>
                        </div>
                        <p className="text-xs truncate mt-0.5" style={{ color: "#8E89B8" }}>
                          {project.namespace.full_path}
                        </p>
                      </div>
                    </div>
                    <a
                      href={project.web_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors flex-shrink-0"
                      style={{ color: "#8E89B8" }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.color = "#7C3AED";
                        (e.currentTarget as HTMLElement).style.background = "#F5F3FF";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.color = "#8E89B8";
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                      }}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {project.description && (
                    <p className="mt-3 text-xs line-clamp-1 leading-relaxed" style={{ color: "#8E89B8" }}>
                      {project.description}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="mt-4 pt-3.5 flex items-center justify-between"
                    style={{ borderTop: "1px solid #EDEAF8" }}>
                    <div className="flex items-center gap-3 text-xs" style={{ color: "#8E89B8" }}>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" style={{ color: "#F59E0B" }} />
                        {project.star_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="w-3 h-3" />
                        {project.forks_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <CircleDot className="w-3 h-3" />
                        {project.open_issues_count}
                      </span>
                      <code className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                        style={{ background: "#F5F3FF", color: "#7C3AED", border: "1px solid #E5E2F5" }}>
                        {project.default_branch}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px]" style={{ color: "#8E89B8" }}>{timeAgo(project.last_activity_at)}</span>
                      {project.latest_pipeline && (
                        <Link href={`/commits?projectId=${project.id}&name=${encodeURIComponent(project.name)}`}>
                          <PipelineBadge status={project.latest_pipeline.status} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={20}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
