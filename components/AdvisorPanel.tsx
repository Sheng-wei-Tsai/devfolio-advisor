"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GithubRepo } from "@/lib/github";
import ChecklistPanel from "@/components/ChecklistPanel";

type Persona = "frontend" | "backend" | "ux";

const PERSONAS: { id: Persona; label: string; color: string; icon: string }[] = [
  { id: "frontend", label: "FRONTEND", color: "#3b82f6", icon: "⬡" },
  { id: "backend",  label: "BACKEND",  color: "#a855f7", icon: "⚙" },
  { id: "ux",       label: "UX / UI",  color: "#f59e0b", icon: "◈" },
];

export default function AdvisorPanel({ repo }: { repo: GithubRepo }) {
  const [activeTab, setActiveTab] = useState<Persona | "checklist">("frontend");
  const [streams, setStreams] = useState<Record<Persona, string>>({ frontend: "", backend: "", ux: "" });
  const [loading, setLoading] = useState<Record<Persona, boolean>>({ frontend: false, backend: false, ux: false });
  const [started, setStarted] = useState(false);

  const runAnalysis = async () => {
    setStarted(true);
    for (const persona of ["frontend", "backend", "ux"] as Persona[]) {
      setLoading((p) => ({ ...p, [persona]: true }));
      setStreams((p) => ({ ...p, [persona]: "" }));

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo, persona }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) continue;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setStreams((p) => ({ ...p, [persona]: p[persona] + chunk }));
      }
      setLoading((p) => ({ ...p, [persona]: false }));
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Repo header */}
      <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
              <span style={{ color: "var(--text-muted)" }}>~/</span>{repo.name}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
              {repo.description || "no description"}
            </p>
          </div>
          {!started && (
            <button
              onClick={runAnalysis}
              className="px-4 py-2 text-xs font-medium transition-all duration-200"
              style={{
                backgroundColor: "var(--neon-glow)",
                color: "var(--neon)",
                border: "1px solid var(--neon)",
                borderRadius: "2px",
                letterSpacing: "0.1em",
              }}
            >
              ▶ RUN ANALYSIS
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex" style={{ borderBottom: "1px solid var(--border)" }}>
        {PERSONAS.map((p) => (
          <button
            key={p.id}
            onClick={() => setActiveTab(p.id)}
            className="px-5 py-3 text-xs font-medium transition-all duration-150 relative"
            style={{
              color: activeTab === p.id ? p.color : "var(--text-muted)",
              borderBottom: activeTab === p.id ? `2px solid ${p.color}` : "2px solid transparent",
              letterSpacing: "0.1em",
            }}
          >
            <span className="mr-1.5">{p.icon}</span>
            {p.label}
            {loading[p.id] && <span className="ml-2 animate-pulse" style={{ color: p.color }}>●</span>}
          </button>
        ))}
        <button
          onClick={() => setActiveTab("checklist")}
          className="px-5 py-3 text-xs font-medium transition-all duration-150"
          style={{
            color: activeTab === "checklist" ? "var(--neon)" : "var(--text-muted)",
            borderBottom: activeTab === "checklist" ? "2px solid var(--neon)" : "2px solid transparent",
            letterSpacing: "0.1em",
          }}
        >
          ☑ CHECKLIST
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {activeTab === "checklist" ? (
            <motion.div key="checklist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ChecklistPanel repoId={String(repo.id)} repoName={repo.name} />
            </motion.div>
          ) : (
            <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {!started ? (
                <div className="text-sm prompt" style={{ color: "var(--text-secondary)" }}>
                  click RUN ANALYSIS to start
                </div>
              ) : streams[activeTab] ? (
                <pre className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: "var(--text-primary)", fontFamily: "inherit" }}>
                  {streams[activeTab]}
                  {loading[activeTab] && <span className="cursor" />}
                </pre>
              ) : (
                <div className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {loading[activeTab] ? "analyzing..." : "waiting..."}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
