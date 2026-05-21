"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Timer, User, GitBranch, Hash, Search } from "lucide-react";
import Header from "@/components/layout/Header";
import PipelineBadge from "@/components/ui/PipelineBadge";
import { timeAgo, formatDuration } from "@/lib/utils";
import type { GitLabPipeline, GitLabProject, PipelineStatus } from "@/types/gitlab";

type PipelineRow = GitLabPipeline & { project: GitLabProject };

const STATUS_FILTERS = [
  { label: "Tous",        value: "",         bg: "#1A1533", hover: false },
  { label: "En cours",   value: "running",  bg: "#3B82F6", hover: false },
  { label: "En attente", value: "pending",  bg: "#F59E0B", hover: false },
  { label: "Échoués",    value: "failed",   bg: "#F43F5E", hover: false },
  { label: "Succès",     value: "success",  bg: "#10B981", hover: false },
  { label: "Annulés",    value: "canceled", bg: "#8E89B8", hover: false },
];

function PipelinesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get("status") || "";
  const [search, setSearch] = useState("");
  const [pipelines, setPipelines] = useState<PipelineRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPipelines = useCallback(async (s: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = s ? `/api/gitlab/pipelines?status=${s}` : "/api/gitlab/pipelines";
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPipelines(data.pipelines);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPipelines(status); }, [status, fetchPipelines]);

  const setStatus = (s: string) =>
    router.push(`/pipelines${s ? `?status=${s}` : ""}`);

  const filtered = search
    ? pipelines.filter(
        (p) =>
          p.project.name.toLowerCase().includes(search.toLowerCase()) ||
          p.ref.toLowerCase().includes(search.toLowerCase()) ||
          p.sha.includes(search.toLowerCase())
      )
    : pipelines;

  return (
    <div>
      <Header
        title="Pipelines"
        subtitle={filtered.length > 0 ? `${filtered.length} pipeline(s)` : "Pipelines CI/CD"}
      />

      {/* Filters + search */}
      <div className="flex flex-wrap items-center gap-2.5 mb-6">
        <div className="flex gap-1 p-1 rounded-2xl"
          style={{ background: "#fff", border: "1px solid #E5E2F5", boxShadow: "0 1px 3px rgba(26,21,51,0.06)" }}>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150"
              style={status === f.value ? {
                background: f.bg,
                color: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              } : {
                color: "#8E89B8",
              }}
              onMouseEnter={e => {
                if (status !== f.value) (e.currentTarget as HTMLElement).style.background = "#FAF9FF";
              }}
              onMouseLeave={e => {
                if (status !== f.value) (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#8E89B8" }} />
          <input
            type="text"
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-2 text-xs rounded-xl bg-white w-52 outline-none transition-all"
            style={{ border: "1px solid #E5E2F5", boxShadow: "0 1px 3px rgba(26,21,51,0.06)", color: "#1A1533" }}
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
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl text-xs font-medium flex items-center gap-2"
          style={{ background: "#FFF1F2", border: "1px solid #FECDD3", color: "#E11D48" }}>
          <span className="font-bold">Erreur :</span> {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden"
        style={{ border: "1px solid #E5E2F5", boxShadow: "0 1px 4px rgba(26,21,51,0.06)" }}>
        <div
          className="grid text-[10px] font-black uppercase tracking-widest px-6 py-3.5"
          style={{
            gridTemplateColumns: "140px 1fr 130px 100px 110px 80px 40px",
            background: "#FAF9FF",
            borderBottom: "1px solid #EDEAF8",
            color: "#8E89B8",
          }}
        >
          <span>Statut</span>
          <span>Projet / Branche</span>
          <span>Commit</span>
          <span>Durée</span>
          <span>Déclenché</span>
          <span>Auteur</span>
          <span />
        </div>

        {loading ? (
          <div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="px-6 py-4 grid gap-4"
                style={{ gridTemplateColumns: "140px 1fr 130px 100px 110px 80px 40px", borderBottom: "1px solid #EDEAF8" }}>
                {Array.from({ length: 7 }).map((_, j) => (
                  <div key={j} className="skeleton h-4" />
                ))}
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <GitBranch className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: "#8E89B8" }} />
            <p className="font-semibold text-sm" style={{ color: "#4A4580" }}>Aucun pipeline trouvé</p>
            <p className="text-xs mt-1" style={{ color: "#8E89B8" }}>Essayez un autre filtre</p>
          </div>
        ) : (
          <div>
            {filtered.map((pipeline, idx) => (
              <div
                key={`${pipeline.project.id}-${pipeline.id}`}
                className="px-6 py-4 grid items-center gap-4 transition-colors group"
                style={{
                  gridTemplateColumns: "140px 1fr 130px 100px 110px 80px 40px",
                  borderBottom: idx < filtered.length - 1 ? "1px solid #EDEAF8" : "none",
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#FAF9FF"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
              >
                {/* Status */}
                <div>
                  <PipelineBadge status={pipeline.status as PipelineStatus} />
                </div>

                {/* Project + branch */}
                <div className="min-w-0">
                  <Link
                    href={`/commits?projectId=${pipeline.project.id}&name=${encodeURIComponent(pipeline.project.name)}`}
                    className="text-sm font-bold truncate block transition-colors"
                    style={{ color: "#1A1533" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#7C3AED"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#1A1533"}
                  >
                    {pipeline.project.name}
                  </Link>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <GitBranch className="w-3 h-3 flex-shrink-0" style={{ color: "#8E89B8" }} />
                    <span className="text-xs font-mono truncate" style={{ color: "#8E89B8" }}>{pipeline.ref}</span>
                    <code className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                      style={{ background: "#F5F3FF", color: "#7C3AED", border: "1px solid #E5E2F5" }}>
                      #{pipeline.iid}
                    </code>
                  </div>
                </div>

                {/* SHA */}
                <div className="flex items-center gap-1.5">
                  <Hash className="w-3 h-3 flex-shrink-0" style={{ color: "#8E89B8" }} />
                  <span className="text-xs font-mono truncate" style={{ color: "#4A4580" }}>
                    {pipeline.sha.slice(0, 10)}
                  </span>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "#8E89B8" }}>
                  <Timer className="w-3 h-3" />
                  {pipeline.duration != null ? formatDuration(pipeline.duration ?? null) : "—"}
                </div>

                {/* Time */}
                <div className="text-xs" style={{ color: "#8E89B8" }}>
                  {timeAgo(pipeline.created_at)}
                </div>

                {/* User */}
                <div className="flex items-center gap-1.5">
                  {pipeline.user?.avatar_url ? (
                    <Image
                      src={pipeline.user.avatar_url}
                      alt={pipeline.user.name}
                      width={22}
                      height={22}
                      className="rounded-full"
                      style={{ border: "1px solid #E5E2F5" }}
                      title={pipeline.user.name}
                    />
                  ) : pipeline.user ? (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #8B5CF6, #6D28D9)" }}
                      title={pipeline.user.name}
                    >
                      <span className="text-white text-[8px] font-bold">{pipeline.user.name[0]}</span>
                    </div>
                  ) : (
                    <User className="w-4 h-4" style={{ color: "#CBC6F0" }} />
                  )}
                  {pipeline.user && (
                    <span className="text-xs truncate hidden xl:block" style={{ color: "#8E89B8" }}>
                      {pipeline.user.username}
                    </span>
                  )}
                </div>

                {/* Link */}
                <div className="flex justify-end">
                  <a
                    href={pipeline.web_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors opacity-0 group-hover:opacity-100"
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
            ))}
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <p className="text-xs mt-3 text-center" style={{ color: "#8E89B8" }}>
          {filtered.length} pipeline(s) — données enrichies avec durée et auteur
        </p>
      )}
    </div>
  );
}

export default function PipelinesPage() {
  return (
    <Suspense fallback={<div className="skeleton h-96 w-full" />}>
      <PipelinesContent />
    </Suspense>
  );
}
