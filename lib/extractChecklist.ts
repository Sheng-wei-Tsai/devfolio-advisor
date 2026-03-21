export type ChecklistCategory = "frontend" | "backend" | "ux";

export interface ChecklistItem {
  key: string;
  title: string;  // bold part: "Google Fonts <link> in app/layout.tsx blocks rendering"
  detail: string; // explanation after the colon
  category: ChecklistCategory;
}

function parsePersonaItems(text: string, persona: ChecklistCategory): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  const lines = text.split("\n");

  // Find line indices where numbered items start
  const starts: number[] = [];
  lines.forEach((line, idx) => {
    if (/^\d+\.\s/.test(line.trim())) starts.push(idx);
  });

  for (let i = 0; i < Math.min(starts.length, 5); i++) {
    const end = starts[i + 1] ?? lines.length;

    // Collapse all lines of this item into a single string
    const content = lines
      .slice(starts[i], end)
      .map((l) => l.trim())
      .filter(Boolean)
      .join(" ")
      .replace(/^\d+\.\s+/, ""); // remove "1. " prefix

    let title = "";
    let detail = "";

    // Format: **Title**: detail  ([\s\S] instead of . with s flag for TS compat)
    const boldColon = content.match(/^\*\*(.+?)\*\*\s*[:\u2014\u2013\-]+\s*([\s\S]*)/);
    if (boldColon) {
      title = boldColon[1].trim().replace(/`/g, "");
      detail = boldColon[2].trim();
    } else {
      // Format: Title: detail  (no bold)
      const colonIdx = content.indexOf(":");
      if (colonIdx > 4 && colonIdx < 120) {
        title = content.slice(0, colonIdx).trim().replace(/[*`]/g, "");
        detail = content.slice(colonIdx + 1).trim();
      } else {
        // Fallback: whole content as title
        title = content.slice(0, 100).trim().replace(/[*`]/g, "");
        detail = content.length > 100 ? content.slice(100).trim() : "";
      }
    }

    if (title.length >= 3) {
      items.push({ key: `${persona}-${i}`, title, detail, category: persona });
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
