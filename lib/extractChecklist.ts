export type ChecklistCategory = "frontend" | "backend" | "ux";

export interface ChecklistItem {
  key: string;
  title: string;   // Short title e.g. "Self-managed OAuth is a security risk"
  detail: string;  // Full specific advice with file references
  category: ChecklistCategory;
}

function parsePersonaItems(text: string, persona: ChecklistCategory): ChecklistItem[] {
  const items: ChecklistItem[] = [];

  // Split on numbered lines: "1. ", "2. ", etc.
  const sections = text.split(/(?=^\d+\.)/m).filter((s) => /^\d+\./.test(s.trim()));

  for (let i = 0; i < Math.min(sections.length, 5); i++) {
    const section = sections[i].trim();
    let title = "";
    let detail = "";

    // Format: "1. **Title**: detail text (possibly multiline)"
    const boldMatch = section.match(/^\d+\.\s+\*\*([^*\n]+)\*\*[:\s—–]+(.+)/s);
    if (boldMatch) {
      title = boldMatch[1].trim().replace(/[`*]/g, "");
      detail = boldMatch[2].trim().replace(/\n+/g, " ").replace(/\s{2,}/g, " ");
    } else {
      // Format: "1. Title: detail text"
      const plainMatch = section.match(/^\d+\.\s+(.+?)[:\s—–]{1,3}(.+)/s);
      if (plainMatch) {
        title = plainMatch[1].trim().replace(/[`*]/g, "");
        detail = plainMatch[2].trim().replace(/\n+/g, " ").replace(/\s{2,}/g, " ");
      } else {
        // Fallback: whole first line as title
        const firstLine = section.replace(/^\d+\.\s+/, "").split("\n")[0].trim();
        title = firstLine.replace(/[`*]/g, "");
        detail = "";
      }
    }

    if (title.length >= 5) {
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
