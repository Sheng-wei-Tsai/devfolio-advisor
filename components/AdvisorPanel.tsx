"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GithubRepo } from "@/lib/github";
import ChecklistPanel from "@/components/ChecklistPanel";
import type { ChecklistCategory } from "@/lib/extractChecklist";

type Persona = "frontend" | "backend" | "ux";

const PERSONAS: { id: Persona; label: string; color: string; icon: string }[] = [
  { id: "frontend", label: "FRONTEND", color: "#3b82f6", icon: "⬡" },
  { id: "backend",  label: "BACKEND",  color: "#a855f7", icon: "⚙" },
  { id: "ux",       label: "UX / UI",  color: "#f59e0b", icon: "◈" },
];

const EMPTY_STREAMS: Record<Persona, string> = { frontend: "", backend: "", ux: "" };
const EMPTY_LOADING: Record<Persona, boolean> = { frontend: false, backend: false, ux: false };

export default function AdvisorPanel({ repo }: { repo: GithubRepo }) {
  const [activeTab, setActiveTab] = useState<Persona | "checklist">("frontend");
  const [streams, setStreams] = useState<Record<Persona, string>>(EMPTY_STREAMS);
  const [loading, setLoading] = useState<Record<Persona, boolean>>(EMPTY_LOADING);
  const [isRunning, setIsRunning] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [checklistRefreshKey, setChecklistRefreshKey] = useState(0);

  // Load saved results from DB when repo is selected
  useEffect(() => {
    fetch(`/api/results?repoId=${repo.id}`)
      .then((r) => r.json())
      .then((data: Record<string, string>) => {
        if (Object.keys(data).length > 0) {
          setStreams((prev) => ({ ...prev, ...data }));
          setHasResults(true);
        }
      })
      .catch(() => {});
  }, [repo.id]);

  const runAnalysis = async () => {
    setIsRunning(true);
    setHasResults(true);

    const collected: Record<Persona, string> = { frontend: "", backend: "", ux: "" };

    for (const persona of ["frontend", "backend", "ux"] as Persona[]) {
      setLoading((p) => ({ ...p, [persona]: true }));
      setStreams((p) => ({ ...p, [persona]: "" }));

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo, persona }),
      });

      const text = await res.text().catch(() => "⚠ Failed to reach server.");
      collected[persona] = text;
      setStreams((p) => ({ ...p, [persona]: text }));

      setLoading((p) => ({ ...p, [persona]: false }));

      // Persist analysis result to DB
      fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoId: String(repo.id), persona, content: collected[persona] }),
      }).catch(() => {});
    }

    // Save analyses to DB — checklist API extracts items and persists them
    setChecklistRefreshKey((k) => k + 1); // show loading state in checklist tab
    await fetch("/api/checklist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoId: String(repo.id), analyses: collected }),
    }).catch(console.error);
    setChecklistRefreshKey((k) => k + 1); // trigger re-fetch with new items

    setIsRunning(false);
  };

  const anyLoading = Object.values(loading).some(Boolean);

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
          <button
            onClick={runAnalysis}
            disabled={anyLoading}
            aria-label={hasResults ? "Re-run analysis" : "Run analysis"}
            className="px-4 py-2 text-xs font-medium transition-all duration-200"
            style={{
              backgroundColor: anyLoading ? "transparent" : "var(--neon-glow)",
              color: anyLoading ? "var(--text-muted)" : "var(--neon)",
              border: `1px solid ${anyLoading ? "var(--border)" : "var(--neon)"}`,
              borderRadius: "2px",
              letterSpacing: "0.1em",
              cursor: anyLoading ? "not-allowed" : "pointer",
            }}
          >
            {anyLoading ? "● ANALYZING..." : hasResults ? "↺ RE-RUN ANALYSIS" : "▶ RUN ANALYSIS"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex" style={{ borderBottom: "1px solid var(--border)" }}>
        {PERSONAS.map((p) => (
          <button
            key={p.id}
            onClick={() => setActiveTab(p.id)}
            className="px-5 py-3 text-xs font-medium transition-all duration-150"
            style={{
              color: activeTab === p.id ? p.color : "var(--text-muted)",
              borderBottom: activeTab === p.id ? `2px solid ${p.color}` : "2px solid transparent",
              letterSpacing: "0.1em",
            }}
          >
            <span className="mr-1.5">{p.icon}</span>
            {p.label}
            {loading[p.id] && <span className="ml-2 animate-pulse" style={{ color: p.color }}>●</span>}
            {streams[p.id] && !loading[p.id] && (
              <span className="ml-2" style={{ color: p.color, opacity: 0.6 }}>✓</span>
            )}
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
              <ChecklistPanel
                repoId={String(repo.id)}
                repoName={repo.name}
                refreshKey={checklistRefreshKey}
              />
            </motion.div>
          ) : (
            <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {streams[activeTab] ? (
                <pre className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: "var(--text-primary)", fontFamily: "inherit" }}>
                  {streams[activeTab]}
                  {loading[activeTab] && <span className="cursor" />}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 gap-3">
                  <div className="text-3xl" style={{ color: "var(--text-muted)" }}>
                    {PERSONAS.find((p) => p.id === activeTab)?.icon}
                  </div>
                  <div className="text-sm prompt" style={{ color: "var(--text-secondary)" }}>
                    {loading[activeTab] ? "analyzing..." : isRunning ? "waiting in queue..." : "click RUN ANALYSIS to start"}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
