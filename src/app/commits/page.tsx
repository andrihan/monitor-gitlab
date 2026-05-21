"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ExternalLink, ChevronLeft, GitCommitHorizontal } from "lucide-react";
import Header from "@/components/layout/Header";
import Pagination from "@/components/ui/Pagination";
import { formatDate, timeAgo } from "@/lib/utils";
import type { GitLabCommit } from "@/types/gitlab";

const authorGradients = [
  "linear-gradient(135deg, #8B5CF6, #6D28D9)",
  "linear-gradient(135deg, #3B82F6, #1D4ED8)",
  "linear-gradient(135deg, #10B981, #059669)",
  "linear-gradient(135deg, #F59E0B, #D97706)",
  "linear-gradient(135deg, #EC4899, #BE185D)",
  "linear-gradient(135deg, #14B8A6, #0D9488)",
];

function CommitsContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const projectName = searchParams.get("name") || "Projet";
  const [commits, setCommits] = useState<GitLabCommit[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommits = useCallback(async (p: number) => {
    if (!projectId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/gitlab/commits?projectId=${projectId}&page=${p}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCommits(data.commits);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchCommits(page); }, [page, fetchCommits]);

  if (!projectId) {
    return (
      <div>
        <Header title="Commits" subtitle="Sélectionnez un projet" />
        <div className="text-center py-16 bg-white rounded-2xl" style={{ border: "1px solid #E5E2F5" }}>
          <GitCommitHorizontal className="w-10 h-10 mx-auto mb-3" style={{ color: "#CBC6F0" }} />
          <p className="font-semibold text-sm mb-4" style={{ color: "#4A4580" }}>Aucun projet sélectionné</p>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl text-white transition-all"
            style={{ background: "linear-gradient(135deg, #8B5CF6, #6D28D9)", boxShadow: "0 4px 16px rgba(109,40,217,0.35)" }}
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Choisir un projet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5 text-xs font-semibold">
        <Link
          href="/projects"
          className="flex items-center gap-1 transition-colors"
          style={{ color: "#8E89B8" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#7C3AED"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#8E89B8"}
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Projets
        </Link>
        <span style={{ color: "#CBC6F0" }}>/</span>
        <span className="font-bold" style={{ color: "#4A4580" }}>{projectName}</span>
      </div>

      <Header title="Commits" subtitle={total > 0 ? `${total} commits` : "Historique"} />

      {error && (
        <div className="mb-4 p-3 rounded-xl text-xs font-medium"
          style={{ background: "#FFF1F2", border: "1px solid #FECDD3", color: "#E11D48" }}>{error}</div>
      )}

      <div className="bg-white rounded-2xl overflow-hidden"
        style={{ border: "1px solid #E5E2F5", boxShadow: "0 1px 4px rgba(26,21,51,0.06)" }}>
        {loading ? (
          <div>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="px-6 py-5 flex gap-3" style={{ borderBottom: "1px solid #EDEAF8" }}>
                <div className="skeleton w-9 h-9 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {commits.map((commit, idx) => {
              const gradient = authorGradients[
                commit.author_name.charCodeAt(0) % authorGradients.length
              ];
              return (
                <div
                  key={commit.id}
                  className="px-6 py-4 flex items-start gap-4 transition-colors group"
                  style={{ borderBottom: idx < commits.length - 1 ? "1px solid #EDEAF8" : "none" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#FAF9FF"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                >
                  {/* Avatar */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: gradient, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
                  >
                    <span className="text-white text-xs font-black">
                      {commit.author_name[0]?.toUpperCase()}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold line-clamp-1" style={{ color: "#1A1533" }}>
                      {commit.title}
                    </p>
                    <div className="flex items-center gap-2.5 mt-1 text-xs flex-wrap">
                      <span className="font-bold" style={{ color: "#4A4580" }}>{commit.author_name}</span>
                      <span style={{ color: "#CBC6F0" }}>·</span>
                      <code
                        className="px-1.5 py-0.5 rounded font-mono text-[10px]"
                        style={{ background: "#F5F3FF", color: "#7C3AED", border: "1px solid #E5E2F5" }}
                      >
                        {commit.short_id}
                      </code>
                      <span style={{ color: "#CBC6F0" }}>·</span>
                      <span style={{ color: "#8E89B8" }} title={formatDate(commit.authored_date)}>
                        {timeAgo(commit.authored_date)}
                      </span>
                      {commit.stats && (
                        <>
                          <span style={{ color: "#CBC6F0" }}>·</span>
                          <span className="font-bold" style={{ color: "#10B981" }}>+{commit.stats.additions}</span>
                          <span className="font-bold" style={{ color: "#F43F5E" }}>−{commit.stats.deletions}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Link */}
                  <a
                    href={commit.web_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 flex items-center justify-center rounded-lg transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
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
              );
            })}
          </div>
        )}
      </div>
      <Pagination page={page} totalPages={totalPages} total={total} pageSize={20} onPageChange={setPage} />
    </div>
  );
}

export default function CommitsPage() {
  return (
    <Suspense fallback={<div className="skeleton h-96 w-full" />}>
      <CommitsContent />
    </Suspense>
  );
}
