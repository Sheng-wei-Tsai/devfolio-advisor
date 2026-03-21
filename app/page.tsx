"use client";
import { motion } from "framer-motion";
import Link from "next/link";

const lines = [
  { text: "initializing devfolio-advisor...", delay: 0 },
  { text: "loading ai advisors: frontend, backend, ux/ui", delay: 0.4 },
  { text: "connecting to github api...", delay: 0.8 },
  { text: "ready. authenticate to begin.", delay: 1.2 },
];

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <div className="neon-text text-4xl font-bold tracking-widest mb-2">
          DEVFOLIO<span style={{ color: "var(--text-secondary)" }}>/</span>ADVISOR
        </div>
        <div style={{ color: "var(--text-secondary)", fontSize: "0.75rem", letterSpacing: "0.2em" }}>
          AI-POWERED PORTFOLIO INTELLIGENCE
        </div>
      </motion.div>

      {/* Terminal window */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="card w-full max-w-lg"
        style={{ border: "1px solid var(--border-bright)" }}
      >
        {/* Terminal header */}
        <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--bg-elevated)" }}>
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--red)" }} />
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--amber)" }} />
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--neon)" }} />
          <span className="ml-2 text-xs" style={{ color: "var(--text-muted)" }}>devfolio-advisor — bash</span>
        </div>

        {/* Terminal body */}
        <div className="p-6 space-y-2">
          {lines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: line.delay }}
              className="text-sm prompt"
              style={{ color: "var(--text-secondary)" }}
            >
              {line.text}
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            className="pt-4"
          >
            <Link
              href="/api/auth/github"
              className="inline-flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all duration-200 neon-border"
              style={{
                backgroundColor: "var(--neon-glow)",
                color: "var(--neon)",
                border: "1px solid var(--neon)",
                borderRadius: "2px",
                letterSpacing: "0.1em",
              }}
            >
              <GitHubIcon />
              AUTHENTICATE WITH GITHUB
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="mt-8 flex gap-8 text-xs"
        style={{ color: "var(--text-muted)", letterSpacing: "0.1em" }}
      >
        {["FRONTEND ADVISOR", "BACKEND ADVISOR", "UX/UI ADVISOR"].map((label) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--neon)" }} />
            {label}
          </div>
        ))}
      </motion.div>
    </main>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}
