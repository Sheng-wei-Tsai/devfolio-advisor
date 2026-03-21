"use client";
import { Fragment, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
// AnimatePresence removed — detail always visible now
import type { ChecklistItem } from "@/lib/extractChecklist";

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} style={{ color: "var(--text-primary)" }}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={i} className="rounded px-1" style={{ backgroundColor: "var(--bg-primary)", color: "var(--neon)", fontSize: "0.7rem", border: "1px solid var(--border-bright)" }}>{part.slice(1, -1)}</code>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

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

  const loadChecklist = useCallback(() => {
    setLoading(true);

    // 1. Try localStorage first (instant, always available)
    try {
      const savedItems = localStorage.getItem(`checklist-items-${repoId}`);
      const savedDone = localStorage.getItem(`checklist-done-${repoId}`);
      if (savedItems) {
        setItems(JSON.parse(savedItems));
        setCompleted(savedDone ? JSON.parse(savedDone) : {});
        setLoading(false);
        return;
      }
    } catch { /* ignore */ }

    // 2. Fall back to Supabase
    fetch(`/api/checklist?repoId=${repoId}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items ?? []);
        setCompleted(data.completed ?? {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [repoId]);

  useEffect(() => { loadChecklist(); }, [loadChecklist, refreshKey]);

  const toggle = (key: string) => {
    const next = { ...completed, [key]: !completed[key] };
    setCompleted(next);
    // Save to localStorage immediately
    try { localStorage.setItem(`checklist-done-${repoId}`, JSON.stringify(next)); } catch { /* ignore */ }
    // Sync to Supabase in background
    fetch("/api/checklist", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoId, completed: next }),
    }).catch(() => {});
  };

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
                    <div className="flex items-start gap-3 p-3">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggle(item.key)}
                        className="flex-shrink-0 mt-1 w-4 h-4 rounded-sm flex items-center justify-center text-xs transition-all"
                        aria-label={isChecked ? "Mark incomplete" : "Mark complete"}
                        style={{
                          border: `1px solid ${isChecked ? "var(--neon)" : "var(--text-muted)"}`,
                          backgroundColor: isChecked ? "var(--neon)" : "transparent",
                          color: "#000",
                        }}
                      >
                        {isChecked && "✓"}
                      </button>

                      {/* Title + detail */}
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-xs leading-relaxed font-medium mb-1"
                          style={{
                            color: isChecked ? "var(--text-muted)" : "var(--text-primary)",
                            textDecoration: isChecked ? "line-through" : "none",
                          }}
                        >
                          {renderInline(item.title)}
                        </div>
                        {hasDetail && (
                          <div className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                            {renderInline(item.detail)}
                          </div>
                        )}
                      </div>
                    </div>
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
