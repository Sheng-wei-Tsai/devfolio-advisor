"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const DEFAULT_ITEMS = [
  { id: "readme",      label: "Add README with screenshots & demo link", category: "docs" },
  { id: "ci",          label: "Set up CI/CD pipeline (GitHub Actions)", category: "devops" },
  { id: "tests",       label: "Add test suite (unit + integration)", category: "quality" },
  { id: "env",         label: "Document all environment variables", category: "docs" },
  { id: "error",       label: "Add error boundaries & fallback UI", category: "frontend" },
  { id: "loading",     label: "Add loading & empty state components", category: "frontend" },
  { id: "auth",        label: "Implement proper auth & authorization", category: "backend" },
  { id: "validation",  label: "Add input validation & sanitization", category: "backend" },
  { id: "perf",        label: "Optimize bundle size & Core Web Vitals", category: "frontend" },
  { id: "a11y",        label: "Audit accessibility (WCAG 2.1 AA)", category: "ux" },
  { id: "mobile",      label: "Ensure fully responsive on all breakpoints", category: "ux" },
  { id: "seo",         label: "Add meta tags, OG image, sitemap", category: "docs" },
  { id: "monitoring",  label: "Add error monitoring (Sentry or similar)", category: "devops" },
  { id: "rate-limit",  label: "Implement API rate limiting", category: "backend" },
  { id: "license",     label: "Add LICENSE file", category: "docs" },
];

const CATEGORY_COLORS: Record<string, string> = {
  docs: "#3b82f6", devops: "#a855f7", quality: "#f59e0b",
  frontend: "#00ff41", backend: "#ef4444", ux: "#ec4899",
};

export default function ChecklistPanel({ repoId, repoName }: { repoId: string; repoName: string }) {
  const key = `checklist-${repoId}`;
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem(key) ?? "{}"); } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(checked));
  }, [checked, key]);

  const toggle = (id: string) => setChecked((p) => ({ ...p, [id]: !p[id] }));
  const done = DEFAULT_ITEMS.filter((i) => checked[i.id]).length;
  const pct = Math.round((done / DEFAULT_ITEMS.length) * 100);

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs mb-2" style={{ color: "var(--text-secondary)" }}>
          <span>PRODUCTION READINESS</span>
          <span className="neon-text">{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-elevated)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: "var(--neon)", boxShadow: "0 0 8px var(--neon)" }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          {done}/{DEFAULT_ITEMS.length} tasks complete
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {DEFAULT_ITEMS.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => toggle(item.id)}
            className="w-full flex items-start gap-3 p-3 rounded text-left transition-all duration-150"
            style={{
              backgroundColor: checked[item.id] ? "rgba(0,255,65,0.05)" : "var(--bg-elevated)",
              border: "1px solid",
              borderColor: checked[item.id] ? "var(--neon)" : "var(--border)",
            }}
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.998 }}
          >
            <div
              className="w-4 h-4 rounded-sm flex-shrink-0 mt-0.5 flex items-center justify-center text-xs"
              style={{
                border: `1px solid ${checked[item.id] ? "var(--neon)" : "var(--text-muted)"}`,
                backgroundColor: checked[item.id] ? "var(--neon)" : "transparent",
                color: "#000",
              }}
            >
              {checked[item.id] && "✓"}
            </div>
            <div className="flex-1 min-w-0">
              <span
                className="text-xs"
                style={{
                  color: checked[item.id] ? "var(--text-muted)" : "var(--text-primary)",
                  textDecoration: checked[item.id] ? "line-through" : "none",
                }}
              >
                {item.label}
              </span>
            </div>
            <span
              className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
              style={{
                color: CATEGORY_COLORS[item.category],
                backgroundColor: `${CATEGORY_COLORS[item.category]}15`,
                border: `1px solid ${CATEGORY_COLORS[item.category]}30`,
              }}
            >
              {item.category}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
