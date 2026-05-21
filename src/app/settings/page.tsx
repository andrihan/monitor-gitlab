"use client";

import { useState } from "react";
import { CheckCircle2, Eye, EyeOff, ExternalLink, XCircle, Wifi } from "lucide-react";
import Header from "@/components/layout/Header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";

export default function SettingsPage() {
  const [showToken, setShowToken] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/gitlab/dashboard");
      if (res.ok) {
        setTestResult({ ok: true, message: "Connexion réussie ! Les données GitLab sont accessibles." });
      } else {
        const data = await res.json();
        setTestResult({ ok: false, message: data.error || "Connexion échouée" });
      }
    } catch {
      setTestResult({ ok: false, message: "Impossible de contacter l'API" });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div>
      <Header title="Paramètres" subtitle="Configuration de la connexion GitLab" />

      <div className="max-w-2xl space-y-5">
        <Card>
          <CardHeader><CardTitle>Configuration GitLab</CardTitle></CardHeader>
          <CardBody className="space-y-5">
            <ConfigField
              label="GitLab URL"
              hint={<>Défini via <Mono>NEXT_PUBLIC_GITLAB_URL</Mono> dans .env.local</>}
            >
              <div className="px-3 py-2.5 rounded-xl text-sm font-mono"
                style={{ background: "#FAF9FF", border: "1px solid #E5E2F5", color: "#4A4580" }}>
                {process.env.NEXT_PUBLIC_GITLAB_URL || "https://gitlab.com"}
              </div>
            </ConfigField>

            <ConfigField
              label="Personal Access Token"
              hint={<>Défini via <Mono>GITLAB_TOKEN</Mono> dans .env.local</>}
            >
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2.5 rounded-xl text-sm font-mono"
                  style={{ background: "#FAF9FF", border: "1px solid #E5E2F5", color: "#4A4580" }}>
                  {showToken ? "Voir .env.local → GITLAB_TOKEN" : "••••••••••••••••"}
                </div>
                <button
                  onClick={() => setShowToken(!showToken)}
                  className="p-2.5 rounded-xl transition-all"
                  style={{ border: "1px solid #E5E2F5", color: "#8E89B8", background: "#fff" }}
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
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </ConfigField>

            <ConfigField
              label="Group ID"
              hint={<>Défini via <Mono>GITLAB_GROUP_ID</Mono> dans .env.local</>}
            >
              <div className="px-3 py-2.5 rounded-xl text-sm font-mono"
                style={{ background: "#FAF9FF", border: "1px solid #E5E2F5", color: "#4A4580" }}>
                {process.env.NEXT_PUBLIC_GITLAB_URL ? "Configuré" : "Non configuré"}
              </div>
            </ConfigField>

            <button
              onClick={testConnection}
              disabled={testing}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: testing
                  ? "linear-gradient(135deg, #A78BFA, #8B5CF6)"
                  : "linear-gradient(135deg, #8B5CF6, #6D28D9)",
                boxShadow: "0 4px 16px rgba(109,40,217,0.35)",
              }}
            >
              <Wifi className={`w-4 h-4 ${testing ? "animate-pulse" : ""}`} />
              {testing ? "Test en cours…" : "Tester la connexion"}
            </button>

            {testResult && (
              <div
                className="p-3.5 rounded-xl text-sm flex items-start gap-2.5 font-medium"
                style={testResult.ok
                  ? { background: "#ECFDF5", border: "1px solid #A7F3D0", color: "#059669" }
                  : { background: "#FFF1F2", border: "1px solid #FECDD3", color: "#E11D48" }
                }
              >
                {testResult.ok
                  ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  : <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                }
                {testResult.message}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Comment configurer</CardTitle></CardHeader>
          <CardBody className="p-3">
            {[
              {
                step: "1",
                text: "Créez un Personal Access Token GitLab",
                link: "https://gitlab.com/-/user_settings/personal_access_tokens",
                linkText: "Créer un token →",
                detail: "Permissions requises : read_api, read_repository",
              },
              {
                step: "2",
                text: "Trouvez l'ID de votre groupe GitLab",
                detail: "Dans GitLab : groupe → Settings → General → Group ID",
              },
              {
                step: "3",
                text: "Éditez .env.local à la racine du projet",
                detail: "Remplissez GITLAB_TOKEN et GITLAB_GROUP_ID",
              },
              {
                step: "4",
                text: "Redémarrez le serveur Next.js",
                detail: "yarn dev pour prendre en compte les nouvelles variables",
              },
            ].map(({ step, text, link, linkText, detail }) => (
              <div
                key={step}
                className="flex items-start gap-3 p-3 rounded-xl transition-colors"
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#FAF9FF"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
              >
                <span
                  className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-black"
                  style={{
                    background: "linear-gradient(135deg, #8B5CF6, #6D28D9)",
                    boxShadow: "0 2px 8px rgba(109,40,217,0.35)",
                  }}
                >
                  {step}
                </span>
                <div>
                  <p className="text-sm font-bold" style={{ color: "#1A1533" }}>{text}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#8E89B8" }}>{detail}</p>
                  {link && (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs mt-1.5 font-bold transition-colors"
                      style={{ color: "#7C3AED" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#6D28D9"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#7C3AED"}
                    >
                      {linkText}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function ConfigField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-[0.12em] mb-1.5" style={{ color: "#8E89B8" }}>
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs" style={{ color: "#8E89B8" }}>{hint}</p>}
    </div>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono px-1 py-0.5 rounded text-[11px]"
      style={{ background: "#F5F3FF", color: "#7C3AED", border: "1px solid #E5E2F5" }}>
      {children}
    </code>
  );
}
