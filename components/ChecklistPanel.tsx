"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { ChecklistItem } from "@/lib/extractChecklist";

const CATEGORY_COLORS: Record<string, string> = {
  frontend: "#3b82f6", backend: "#a855f7", ux: "#f59e0b",
  docs: "#00ff41", devops: "#ef4444", quality: "#ec4899",
};

const CATEGORY_LABEL: Record<string, string> = {
  frontend: "Frontend", backend: "Backend", ux: "UX/UI",
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
  const itemsKey = `checklist-items-${repoId}`;
  const doneKey = `checklist-done-${repoId}`;

  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  // Reload from localStorage whenever refreshKey changes or on mount
  useEffect(() => {
    try {
      const savedItems = localStorage.getItem(itemsKey);
      const savedDone = localStorage.getItem(doneKey);
      setItems(savedItems ? JSON.parse(savedItems) : []);
      setCompleted(savedDone ? JSON.parse(savedDone) : {});
    } catch {
      setItems([]);
      setCompleted({});
    }
  }, [repoId, refreshKey, itemsKey, doneKey]);

  const toggle = (key: string) => {
    const next = { ...completed, [key]: !completed[key] };
    setCompleted(next);
    try { localStorage.setItem(doneKey, JSON.stringify(next)); } catch { /* ignore */ }
  };

  const done = items.filter((i) => completed[i.key]).length;
  const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 0;

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

  // Group by category
  const grouped = items.reduce<Record<string, ChecklistItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

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

      {/* Items grouped by persona */}
      {Object.entries(grouped).map(([category, groupItems]) => (
        <div key={category} className="space-y-2">
          <div className="text-xs font-medium mb-2" style={{ color: CATEGORY_COLORS[category], letterSpacing: "0.1em" }}>
            {CATEGORY_LABEL[category] ?? category.toUpperCase()} IMPROVEMENTS
          </div>
          {groupItems.map((item) => (
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
              <span
                className="text-xs flex-1"
                style={{
                  color: completed[item.key] ? "var(--text-muted)" : "var(--text-primary)",
                  textDecoration: completed[item.key] ? "line-through" : "none",
                }}
              >
                {item.label}
              </span>
              <span
                className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
                style={{
                  color: CATEGORY_COLORS[category],
                  backgroundColor: `${CATEGORY_COLORS[category]}15`,
                  border: `1px solid ${CATEGORY_COLORS[category]}30`,
                }}
              >
                {CATEGORY_LABEL[category] ?? category}
              </span>
            </motion.button>
          ))}
        </div>
      ))}
    </div>
  );
}
