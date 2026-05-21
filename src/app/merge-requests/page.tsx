"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ExternalLink, MessageSquare, ThumbsUp, GitBranch, GitMerge } from "lucide-react";
import Header from "@/components/layout/Header";
import Pagination from "@/components/ui/Pagination";
import Badge from "@/components/ui/Badge";
import { timeAgo } from "@/lib/utils";
import type { GitLabMergeRequest } from "@/types/gitlab";

const STATE_FILTERS = [
  { label: "Ouvertes",   value: "opened", bg: "#10B981" },
  { label: "Fusionnées", value: "merged",  bg: "#3B82F6" },
  { label: "Fermées",    value: "closed",  bg: "#F43F5E" },
  { label: "Toutes",     value: "all",     bg: "#1A1533" },
];

const stateConfig = {
  opened: { variant: "success" as const, label: "Ouverte" },
  merged: { variant: "info"    as const, label: "Fusionnée" },
  closed: { variant: "danger"  as const, label: "Fermée" },
  locked: { variant: "neutral" as const, label: "Verrouillée" },
};

function MergeRequestsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const state = (searchParams.get("state") as "opened" | "closed" | "merged" | "all") || "opened";
  const [mrs, setMrs] = useState<GitLabMergeRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMRs = useCallback(async (p: number, s: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/gitlab/merge-requests?state=${s}&page=${p}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMrs(data.mrs);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { setPage(1); }, [state]);
  useEffect(() => { fetchMRs(page, state); }, [page, state, fetchMRs]);

  const setState = (s: string) => router.push(`/merge-requests?state=${s}`);

  return (
    <div>
      <Header
        title="Merge Requests"
        subtitle={total > 0 ? `${total} merge request(s)` : "Merge Requests du groupe"}
      />

      <div className="flex gap-1 p-1 rounded-2xl inline-flex mb-6"
        style={{ background: "#fff", border: "1px solid #E5E2F5", boxShadow: "0 1px 3px rgba(26,21,51,0.06)" }}>
        {STATE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setState(f.value)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150"
            style={state === f.value ? {
              background: f.bg,
              color: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            } : { color: "#8E89B8" }}
            onMouseEnter={e => {
              if (state !== f.value) (e.currentTarget as HTMLElement).style.background = "#FAF9FF";
            }}
            onMouseLeave={e => {
              if (state !== f.value) (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl text-xs font-medium"
          style={{ background: "#FFF1F2", border: "1px solid #FECDD3", color: "#E11D48" }}>{error}</div>
      )}

      <div className="bg-white rounded-2xl overflow-hidden"
        style={{ border: "1px solid #E5E2F5", boxShadow: "0 1px 4px rgba(26,21,51,0.06)" }}>
        {loading ? (
          <div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="px-6 py-5 space-y-2"
                style={{ borderBottom: "1px solid #EDEAF8" }}>
                <div className="skeleton h-4 w-2/3" />
                <div className="skeleton h-3 w-1/3" />
              </div>
            ))}
          </div>
        ) : mrs.length === 0 ? (
          <div className="text-center py-16">
            <GitMerge className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: "#8E89B8" }} />
            <p className="font-semibold text-sm" style={{ color: "#4A4580" }}>Aucune merge request</p>
          </div>
        ) : (
          <div>
            {mrs.map((mr, idx) => {
              const sc = stateConfig[mr.state] || stateConfig.locked;
              return (
                <div
                  key={mr.id}
                  className="px-6 py-5 transition-colors group"
                  style={{ borderBottom: idx < mrs.length - 1 ? "1px solid #EDEAF8" : "none" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#FAF9FF"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Badges */}
                      <div className="flex items-center gap-1.5 flex-wrap mb-2">
                        <Badge variant={sc.variant}>{sc.label}</Badge>
                        {mr.draft && <Badge variant="neutral">Brouillon</Badge>}
                        {mr.has_conflicts && <Badge variant="danger">Conflits</Badge>}
                        {mr.labels.slice(0, 3).map((label) => (
                          <span
                            key={label}
                            className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                            style={{ background: "#F5F3FF", color: "#7C3AED", border: "1px solid #E5E2F5" }}
                          >
                            {label}
                          </span>
                        ))}
                      </div>

                      {/* Title */}
                      <a
                        href={mr.web_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-bold line-clamp-1 transition-colors"
                        style={{ color: "#1A1533" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#7C3AED"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#1A1533"}
                      >
                        <span className="font-mono text-xs mr-1.5" style={{ color: "#8E89B8" }}>!{mr.iid}</span>
                        {mr.title}
                      </a>

                      {/* Meta */}
                      <div className="flex items-center gap-2 mt-1.5 text-xs flex-wrap" style={{ color: "#8E89B8" }}>
                        <span className="flex items-center gap-1">
                          <GitBranch className="w-3 h-3" />
                          <code className="font-mono" style={{ color: "#7C3AED" }}>{mr.source_branch}</code>
                          <span style={{ color: "#CBC6F0" }}>→</span>
                          <code className="font-mono">{mr.target_branch}</code>
                        </span>
                        <span style={{ color: "#CBC6F0" }}>·</span>
                        <span>{timeAgo(mr.updated_at)}</span>
                        {mr.author && (
                          <>
                            <span style={{ color: "#CBC6F0" }}>·</span>
                            <span>par <span className="font-semibold" style={{ color: "#4A4580" }}>{mr.author.name}</span></span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {mr.user_notes_count > 0 && (
                        <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-semibold"
                          style={{ background: "#F5F3FF", color: "#7C3AED", border: "1px solid #E5E2F5" }}>
                          <MessageSquare className="w-3 h-3" />
                          {mr.user_notes_count}
                        </span>
                      )}
                      {mr.upvotes > 0 && (
                        <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-semibold"
                          style={{ background: "#ECFDF5", color: "#10B981", border: "1px solid #A7F3D0" }}>
                          <ThumbsUp className="w-3 h-3" />
                          {mr.upvotes}
                        </span>
                      )}
                      {mr.author?.avatar_url && (
                        <Image
                          src={mr.author.avatar_url}
                          alt={mr.author.name}
                          width={26}
                          height={26}
                          className="rounded-full"
                          style={{ border: "2px solid #E5E2F5" }}
                          title={mr.author.name}
                        />
                      )}
                      <a
                        href={mr.web_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 flex items-center justify-center rounded-lg transition-all opacity-0 group-hover:opacity-100"
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
                  </div>
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

export default function MergeRequestsPage() {
  return (
    <Suspense fallback={<div className="skeleton h-96 w-full" />}>
      <MergeRequestsContent />
    </Suspense>
  );
}
