"use client";
import { Fragment } from "react";

// Renders inline markdown: **bold**, `code`, plain text
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} style={{ color: "var(--text-primary)", fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="rounded px-1 py-0.5 text-xs"
          style={{ backgroundColor: "var(--bg-elevated)", color: "var(--neon)", border: "1px solid var(--border-bright)", fontFamily: "inherit" }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

interface Props { content: string }

export default function MarkdownContent({ content }: Props) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines (handled by spacing)
    if (!trimmed) { i++; continue; }

    // Numbered list item: "1. ..." or "2. ..."
    if (/^\d+\.\s/.test(trimmed)) {
      const numMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
      if (numMatch) {
        const num = numMatch[1];
        const rest = numMatch[2];
        elements.push(
          <div key={i} className="flex gap-3 mb-4">
            <span
              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
              style={{ backgroundColor: "var(--neon-glow)", color: "var(--neon)", border: "1px solid var(--neon)", minWidth: "1.25rem" }}
            >
              {num}
            </span>
            <div className="flex-1 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {renderInline(rest)}
            </div>
          </div>
        );
      }
      i++;
      continue;
    }

    // Heading: "## Title" or "### Title"
    if (/^#{1,3}\s/.test(trimmed)) {
      const headMatch = trimmed.match(/^(#{1,3})\s+(.+)/);
      if (headMatch) {
        const level = headMatch[1].length;
        const text = headMatch[2];
        const sizes = ["text-base", "text-sm", "text-xs"];
        elements.push(
          <div
            key={i}
            className={`${sizes[level - 1]} font-semibold mb-3 mt-4`}
            style={{ color: "var(--text-primary)", letterSpacing: "0.04em" }}
          >
            {renderInline(text)}
          </div>
        );
      }
      i++;
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(trimmed)) {
      elements.push(<hr key={i} className="my-4" style={{ borderColor: "var(--border-bright)" }} />);
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-secondary)" }}>
        {renderInline(trimmed)}
      </p>
    );
    i++;
  }

  return <div className="space-y-0">{elements}</div>;
}
