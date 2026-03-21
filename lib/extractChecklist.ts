export type ChecklistCategory = "frontend" | "backend" | "ux";

export interface ChecklistItem {
  key: string;
  title: string;
  detail: string;
  category: ChecklistCategory;
}

// Stable key derived from title — same title = same key across re-runs
function stableKey(category: string, title: string): string {
  return `${category}:${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)}`;
}

function parsePersonaItems(text: string, persona: ChecklistCategory): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  const lines = text.split("\n");

  const starts: number[] = [];
  lines.forEach((line, idx) => {
    if (/^\d+\.\s/.test(line.trim())) starts.push(idx);
  });

  for (let i = 0; i < Math.min(starts.length, 5); i++) {
    const end = starts[i + 1] ?? lines.length;

    const content = lines
      .slice(starts[i], end)
      .map((l) => l.trim())
      .filter(Boolean)
      .join(" ")
      .replace(/^\d+\.\s+/, "");

    let title = "";
    let detail = "";

    const boldColon = content.match(/^\*\*(.+?)\*\*\s*[:\u2014\u2013\-]+\s*([\s\S]*)/);
    if (boldColon) {
      title = boldColon[1].trim().replace(/`/g, "");
      detail = boldColon[2].trim();
    } else {
      const colonIdx = content.indexOf(":");
      if (colonIdx > 4 && colonIdx < 120) {
        title = content.slice(0, colonIdx).trim().replace(/[*`]/g, "");
        detail = content.slice(colonIdx + 1).trim();
      } else {
        title = content.slice(0, 100).trim().replace(/[*`]/g, "");
        detail = content.length > 100 ? content.slice(100).trim() : "";
      }
    }

    if (title.length >= 3) {
      items.push({ key: stableKey(persona, title), title, detail, category: persona });
    }
  }

  return items;
}

export function extractChecklistItems(
  analyses: Record<ChecklistCategory, string>
): ChecklistItem[] {
  return (Object.entries(analyses) as [ChecklistCategory, string][])
    .flatMap(([persona, text]) => (text.trim() ? parsePersonaItems(text, persona) : []));
}

/**
 * Merge freshly-extracted items into an existing list.
 * - Items with the same title (same key) are NOT duplicated.
 * - Existing items (including completed ones) are preserved.
 * - New issues are appended after existing ones for each category.
 */
export function mergeChecklistItems(
  existing: ChecklistItem[],
  incoming: ChecklistItem[]
): ChecklistItem[] {
  const existingKeys = new Set(existing.map((i) => i.key));
  const brandNew = incoming.filter((i) => !existingKeys.has(i.key));
  return [...existing, ...brandNew];
}
