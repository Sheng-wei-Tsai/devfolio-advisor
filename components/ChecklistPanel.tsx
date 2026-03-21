"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import type { ChecklistItem } from "@/app/api/checklist/route";

const CATEGORY_COLORS: Record<string, string> = {
  docs: "#3b82f6", devops: "#a855f7", quality: "#f59e0b",
  frontend: "#00ff41", backend: "#ef4444", ux: "#ec4899",
};

export default function ChecklistPanel({
  repoId,
  repoName,
  refreshKey,
}: {
  repoId: string;
  repoName: string;
  refreshKey: number;
}) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchChecklist = useCallback(() => {
    setLoading(true);
    fetch(`/api/checklist?repoId=${repoId}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items ?? []);
        setCompleted(data.completed ?? {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [repoId]);

  useEffect(() => { fetchChecklist(); }, [fetchChecklist, refreshKey]);

  // Detect when parent signals new checklist is being generated
  useEffect(() => {
    if (refreshKey > 0) setGenerating(true);
  }, [refreshKey]);

  useEffect(() => {
    if (!loading && generating) setGenerating(false);
  }, [loading, generating]);

  const toggle = (key: string) => {
    const next = { ...completed, [key]: !completed[key] };
    setCompleted(next);
    fetch("/api/checklist", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoId, completed: next }),
    }).catch(() => {});
  };

  const done = items.filter((i) => completed[i.key]).length;
  const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 0;

  if (loading || generating) {
    return (
      <div className="space-y-3">
        <div className="text-xs prompt animate-pulse" style={{ color: "var(--text-secondary)" }}>
          {generating ? "generating checklist for " + repoName + "..." : "loading..."}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 rounded animate-pulse" style={{ backgroundColor: "var(--bg-elevated)" }} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-3">
        <div className="text-3xl" style={{ color: "var(--text-muted)" }}>☑</div>
        <div className="text-sm text-center" style={{ color: "var(--text-secondary)" }}>
          run analysis first to generate a personalised checklist for{" "}
          <span style={{ color: "var(--neon)" }}>{repoName}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs mb-2" style={{ color: "var(--text-secondary)" }}>
          <span>PRODUCTION READINESS — {repoName}</span>
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
          {done}/{items.length} tasks complete
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {items.map((item) => (
          <motion.button
            key={item.key}
            onClick={() => toggle(item.key)}
            className="w-full flex items-start gap-3 p-3 rounded text-left transition-all duration-150"
            style={{
              backgroundColor: completed[item.key] ? "rgba(0,255,65,0.05)" : "var(--bg-elevated)",
              border: "1px solid",
              borderColor: completed[item.key] ? "var(--neon)" : "var(--border)",
            }}
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.998 }}
          >
            <div
              className="w-4 h-4 rounded-sm flex-shrink-0 mt-0.5 flex items-center justify-center text-xs"
              style={{
                border: `1px solid ${completed[item.key] ? "var(--neon)" : "var(--text-muted)"}`,
                backgroundColor: completed[item.key] ? "var(--neon)" : "transparent",
                color: "#000",
              }}
            >
              {completed[item.key] && "✓"}
            </div>
            <div className="flex-1 min-w-0">
              <span
                className="text-xs"
                style={{
                  color: completed[item.key] ? "var(--text-muted)" : "var(--text-primary)",
                  textDecoration: completed[item.key] ? "line-through" : "none",
                }}
              >
                {item.label}
              </span>
            </div>
            <span
              className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
              style={{
                color: CATEGORY_COLORS[item.category] ?? "var(--text-muted)",
                backgroundColor: `${CATEGORY_COLORS[item.category] ?? "#888"}15`,
                border: `1px solid ${CATEGORY_COLORS[item.category] ?? "#888"}30`,
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
