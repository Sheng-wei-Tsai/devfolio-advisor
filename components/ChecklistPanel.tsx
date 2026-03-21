"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ChecklistItem } from "@/lib/extractChecklist";

const CATEGORY_COLOR: Record<string, string> = {
  frontend: "#3b82f6",
  backend: "#a855f7",
  ux: "#f59e0b",
};

const CATEGORY_LABEL: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  ux: "UX / UI",
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
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const fetchChecklist = useCallback(() => {
    setLoading(true);
    fetch(`/api/checklist?repoId=${repoId}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items ?? []);
        setCompleted(data.completed ?? {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [repoId]);

  useEffect(() => { fetchChecklist(); }, [fetchChecklist, refreshKey]);

  const toggle = (key: string) => {
    const next = { ...completed, [key]: !completed[key] };
    setCompleted(next);
    fetch("/api/checklist", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoId, completed: next }),
    }).catch(() => {});
  };

  const toggleExpand = (key: string) =>
    setExpanded((p) => ({ ...p, [key]: !p[key] }));

  const done = items.filter((i) => completed[i.key]).length;
  const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 0;

  const grouped = items.reduce<Record<string, ChecklistItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="text-xs animate-pulse prompt" style={{ color: "var(--text-secondary)" }}>
          loading checklist...
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 rounded animate-pulse" style={{ backgroundColor: "var(--bg-elevated)" }} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-3">
        <div className="text-3xl" style={{ color: "var(--text-muted)" }}>☑</div>
        <div className="text-sm text-center" style={{ color: "var(--text-secondary)" }}>
          run analysis to generate a personalised checklist for{" "}
          <span style={{ color: "var(--neon)" }}>{repoName}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs mb-2" style={{ color: "var(--text-secondary)" }}>
          <span className="prompt" style={{ letterSpacing: "0.08em" }}>PRODUCTION READINESS — {repoName}</span>
          <span className="neon-text font-bold">{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-elevated)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: "var(--neon)", boxShadow: "0 0 8px var(--neon)" }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          {done} / {items.length} resolved
        </div>
      </div>

      {/* Items grouped by persona */}
      {(["frontend", "backend", "ux"] as const).map((category) => {
        const group = grouped[category];
        if (!group?.length) return null;
        const color = CATEGORY_COLOR[category];

        return (
          <div key={category}>
            {/* Section header */}
            <div
              className="flex items-center gap-2 mb-3 text-xs font-semibold"
              style={{ color, letterSpacing: "0.12em" }}
            >
              <div className="w-1 h-4 rounded-full" style={{ backgroundColor: color }} />
              {CATEGORY_LABEL[category].toUpperCase()} RECOMMENDATIONS
              <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
                ({group.filter((i) => completed[i.key]).length}/{group.length})
              </span>
            </div>

            <div className="space-y-2">
              {group.map((item) => {
                const isChecked = !!completed[item.key];
                const isExpanded = !!expanded[item.key];
                const hasDetail = !!item.detail;

                return (
                  <div
                    key={item.key}
                    className="rounded transition-all duration-150"
                    style={{
                      backgroundColor: isChecked ? "rgba(0,255,65,0.04)" : "var(--bg-elevated)",
                      border: "1px solid",
                      borderColor: isChecked ? "rgba(0,255,65,0.3)" : "var(--border)",
                    }}
                  >
                    {/* Title row */}
                    <div className="flex items-start gap-3 p-3">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggle(item.key)}
                        className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-sm flex items-center justify-center text-xs transition-all"
                        aria-label={isChecked ? "Mark incomplete" : "Mark complete"}
                        style={{
                          border: `1px solid ${isChecked ? "var(--neon)" : "var(--text-muted)"}`,
                          backgroundColor: isChecked ? "var(--neon)" : "transparent",
                          color: "#000",
                        }}
                      >
                        {isChecked && "✓"}
                      </button>

                      {/* Title */}
                      <span
                        className="text-xs flex-1 leading-relaxed"
                        style={{
                          color: isChecked ? "var(--text-muted)" : "var(--text-primary)",
                          textDecoration: isChecked ? "line-through" : "none",
                          fontWeight: 500,
                        }}
                      >
                        {item.title}
                      </span>

                      {/* Expand toggle */}
                      {hasDetail && (
                        <button
                          onClick={() => toggleExpand(item.key)}
                          className="flex-shrink-0 text-xs px-1.5 py-0.5 rounded transition-all"
                          style={{
                            color: isExpanded ? color : "var(--text-muted)",
                            border: `1px solid ${isExpanded ? color + "50" : "var(--border)"}`,
                          }}
                        >
                          {isExpanded ? "▲" : "▼"}
                        </button>
                      )}
                    </div>

                    {/* Detail — expandable */}
                    <AnimatePresence>
                      {hasDetail && isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ overflow: "hidden" }}
                        >
                          <div
                            className="px-3 pb-3 text-xs leading-relaxed"
                            style={{
                              color: "var(--text-secondary)",
                              borderTop: `1px solid ${color}20`,
                              paddingTop: "0.5rem",
                              marginLeft: "1.75rem",
                            }}
                          >
                            {item.detail}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
