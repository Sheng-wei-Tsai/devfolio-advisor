export type ChecklistCategory = "frontend" | "backend" | "ux";

export interface ChecklistItem {
  key: string;
  label: string;
  category: ChecklistCategory;
}

// Extracts numbered items from each persona's analysis text
export function extractChecklistItems(
  analyses: Record<ChecklistCategory, string>
): ChecklistItem[] {
  const items: ChecklistItem[] = [];

  for (const [persona, text] of Object.entries(analyses) as [ChecklistCategory, string][]) {
    if (!text.trim()) continue;

    // Match lines like "1. Title: explanation" or "1. **Title**" or "1. Title — ..."
    const matches = [...text.matchAll(/^\d+\.\s+\*{0,2}([^*\n:—–]+?)\*{0,2}[:\s—–]/gm)];

    let count = 0;
    for (const match of matches) {
      if (count >= 5) break;
      const label = match[1].trim();
      if (label.length >= 5 && label.length <= 100) {
        items.push({ key: `${persona}-${count}`, label, category: persona });
        count++;
      }
    }
  }

  return items;
}
