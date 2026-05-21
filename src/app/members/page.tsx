"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ExternalLink, Search, Users, Shield, Code, Eye } from "lucide-react";
import Header from "@/components/layout/Header";
import { accessLevelLabel } from "@/lib/utils";
import type { GitLabUser } from "@/types/gitlab";

const gitlabUrl = process.env.NEXT_PUBLIC_GITLAB_URL || "https://gitlab.com";

const accessConfig: Record<string, { label: string; textColor: string; bg: string; border: string; icon: React.ElementType }> = {
  Owner:      { label: "Owner",      textColor: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE", icon: Shield },
  Maintainer: { label: "Maintainer", textColor: "#D97706", bg: "#FFFBEB", border: "#FDE68A", icon: Shield },
  Developer:  { label: "Developer",  textColor: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE", icon: Code },
  Reporter:   { label: "Reporter",   textColor: "#8E89B8", bg: "#FAF9FF", border: "#E5E2F5", icon: Eye },
  Guest:      { label: "Guest",      textColor: "#8E89B8", bg: "#FAF9FF", border: "#E5E2F5", icon: Eye },
};

const avatarGradients = [
  "linear-gradient(135deg, #8B5CF6, #6D28D9)",
  "linear-gradient(135deg, #3B82F6, #1D4ED8)",
  "linear-gradient(135deg, #10B981, #059669)",
  "linear-gradient(135deg, #F59E0B, #D97706)",
  "linear-gradient(135deg, #EC4899, #BE185D)",
  "linear-gradient(135deg, #14B8A6, #0D9488)",
];

export default function MembersPage() {
  const [members, setMembers] = useState<GitLabUser[]>([]);
  const [filtered, setFiltered] = useState<GitLabUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/gitlab/members")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        const sorted = [...data.members].sort(
          (a: GitLabUser, b: GitLabUser) => (b.access_level || 0) - (a.access_level || 0)
        );
        setMembers(sorted);
        setFiltered(sorted);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      members.filter(
        (m) => m.name.toLowerCase().includes(q) || m.username.toLowerCase().includes(q)
      )
    );
  }, [search, members]);

  return (
    <div>
      <Header
        title="Membres"
        subtitle={members.length > 0 ? `${members.length} membres dans le groupe` : "Membres"}
      >
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#8E89B8" }} />
          <input
            type="text"
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white w-44 outline-none transition-all"
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
      </Header>

      {error && (
        <div className="mb-4 p-3 rounded-xl text-xs font-medium"
          style={{ background: "#FFF1F2", border: "1px solid #FECDD3", color: "#E11D48" }}>{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="skeleton h-24" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl"
          style={{ border: "1px solid #E5E2F5" }}>
          <Users className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: "#8E89B8" }} />
          <p className="font-semibold text-sm" style={{ color: "#4A4580" }}>Aucun membre trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((member, idx) => {
            const levelLabel = member.access_level !== undefined ? accessLevelLabel(member.access_level) : "";
            const ac = accessConfig[levelLabel];
            const AccessIcon = ac?.icon;
            const gradient = avatarGradients[idx % avatarGradients.length];

            return (
              <div
                key={member.id}
                className="bg-white rounded-2xl p-5 card-lift"
                style={{ border: "1px solid #E5E2F5", boxShadow: "0 1px 4px rgba(26,21,51,0.06)" }}
              >
                <div className="flex items-center gap-3">
                  {member.avatar_url ? (
                    <Image
                      src={member.avatar_url}
                      alt={member.name}
                      width={44}
                      height={44}
                      className="rounded-full flex-shrink-0"
                      style={{ border: "2px solid #E5E2F5" }}
                    />
                  ) : (
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: gradient, boxShadow: "0 4px 12px rgba(0,0,0,0.18)" }}
                    >
                      <span className="text-white font-black text-sm">
                        {member.name[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color: "#1A1533" }}>{member.name}</p>
                    <p className="text-xs truncate font-medium" style={{ color: "#8E89B8" }}>@{member.username}</p>
                    {ac && (
                      <span
                        className="inline-flex items-center gap-1 mt-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold"
                        style={{ background: ac.bg, color: ac.textColor, border: `1px solid ${ac.border}` }}
                      >
                        <AccessIcon className="w-2.5 h-2.5" />
                        {ac.label}
                      </span>
                    )}
                  </div>

                  <a
                    href={member.web_url || `${gitlabUrl}/${member.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 flex items-center justify-center rounded-lg transition-all flex-shrink-0"
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
            );
          })}
        </div>
      )}
    </div>
  );
}
