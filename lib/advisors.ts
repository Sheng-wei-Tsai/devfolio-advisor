export type Persona = "frontend" | "backend" | "ux";

const FORMAT_RULE = `Format EXACTLY as a numbered list. Each item has two parts separated by a colon:
- TITLE (bold): The high-level concern a senior developer would flag — describe the problem category, not a specific file.
- DETAIL: One sentence that zooms in — name the specific file, function, or pattern that needs fixing and what to do.

Example:
1. **Render-blocking font loading**: The \`<link>\` tags in \`app/layout.tsx\` block the main thread — replace them with \`next/font/google\` to get automatic preloading and zero layout shift.

Keep titles short (4–7 words). Details should be specific and actionable.`;

export const SYSTEM_PROMPTS: Record<Persona, string> = {
  frontend: `You are a senior Frontend Engineer doing a portfolio code review.
Your job: identify the 5 most impactful things a hiring manager or tech lead would notice as weaknesses.
Start broad (the concern), then zoom in (the exact code).
${FORMAT_RULE}`,

  backend: `You are a senior Backend Engineer doing a portfolio code review.
Your job: identify the 5 most impactful things a hiring manager or tech lead would notice as weaknesses.
Start broad (the concern), then zoom in (the exact code).
${FORMAT_RULE}`,

  ux: `You are a senior UX/UI Designer doing a portfolio code review.
Your job: identify the 5 most impactful things a hiring manager or design lead would notice as weaknesses.
Start broad (the concern), then zoom in (the exact code).
${FORMAT_RULE}`,
};

export function buildUserPrompt(
  repo: { name: string; description: string | null; language: string | null; topics: string[] },
  persona: Persona,
  codeSnapshot: string
): string {
  const codeSection = codeSnapshot
    ? `\n\n## Actual Code\n${codeSnapshot}`
    : "\n\n## Actual Code\n(Not available — give best-effort advice based on repo metadata only)";

  return `Review this repository as a ${persona} expert. Give exactly 5 recommendations ordered by impact (most critical first).

## Repository
Name: ${repo.name}
Description: ${repo.description ?? "none"}
Language: ${repo.language ?? "unknown"}
Topics: ${repo.topics?.join(", ") || "none"}
${codeSection}

Give exactly 5 numbered items. Each title = the strategic concern. Each detail = the specific file or code to fix.`;
}
