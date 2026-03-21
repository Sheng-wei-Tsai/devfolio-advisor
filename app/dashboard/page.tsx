"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import RepoCard from "@/components/RepoCard";
import AdvisorPanel from "@/components/AdvisorPanel";
import { GithubRepo } from "@/lib/github";

export default function DashboardPage() {
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/repos")
      .then((r) => r.json())
      .then((data) => { setRepos(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* Header */}
      <header className="px-8 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--bg-secondary)" }}>
        <div className="neon-text text-lg font-bold tracking-widest">DEVFOLIO/ADVISOR</div>
        <div className="text-xs" style={{ color: "var(--text-muted)", letterSpacing: "0.1em" }}>
          SYSTEM ONLINE <span className="neon-text">●</span>
        </div>
      </header>

      <div className="flex h-[calc(100vh-57px)]">
        {/* Left: Repo list */}
        <aside className="w-80 flex-shrink-0 overflow-y-auto p-4 space-y-3" style={{ borderRight: "1px solid var(--border)" }}>
          <div className="text-xs mb-4 prompt" style={{ color: "var(--text-secondary)", letterSpacing: "0.1em" }}>
            TOP 5 RECENT REPOS
          </div>

          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="card h-24 animate-pulse" style={{ backgroundColor: "var(--bg-elevated)" }} />
            ))
          ) : (
            repos.map((repo, i) => (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <RepoCard
                  repo={repo}
                  selected={selectedRepo?.id === repo.id}
                  onClick={() => setSelectedRepo(repo)}
                />
              </motion.div>
            ))
          )}
        </aside>

        {/* Right: Advisor panel */}
        <main className="flex-1 overflow-y-auto">
          {selectedRepo ? (
            <AdvisorPanel repo={selectedRepo} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl mb-4" style={{ color: "var(--text-muted)" }}>▋</div>
                <div className="text-sm prompt" style={{ color: "var(--text-secondary)" }}>
                  select a repository to begin analysis
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
