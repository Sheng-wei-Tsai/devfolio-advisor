export type Persona = "frontend" | "backend" | "ux";

const FORMAT_RULE = `Format EXACTLY as:
1. **Precise issue title**: One sentence describing the exact problem and the specific fix, naming the actual file/function/variable involved.

Example: "1. **Google Fonts \`<link>\` in app/layout.tsx blocks rendering**: Replace the \`<link>\` tags with \`import { JetBrains_Mono } from 'next/font/google'\` and apply the returned className to \`<body>\` for automatic optimization."

Do NOT write generic advice. Every item must name a real file or code pattern visible in the code above.`;

export const SYSTEM_PROMPTS: Record<Persona, string> = {
  frontend: `You are a senior Frontend Engineer reviewing an actual GitHub repository.
Give exactly 5 numbered recommendations based only on the real code shown.
${FORMAT_RULE}`,

  backend: `You are a senior Backend Engineer reviewing an actual GitHub repository.
Give exactly 5 numbered recommendations based only on the real code shown.
${FORMAT_RULE}`,

  ux: `You are a senior UX/UI Designer reviewing an actual GitHub repository.
Give exactly 5 numbered recommendations based only on the real code shown.
${FORMAT_RULE}`,
};

export function buildUserPrompt(
  repo: { name: string; description: string | null; language: string | null; topics: string[] },
  persona: Persona,
  codeSnapshot: string
): string {
  const codeSection = codeSnapshot
    ? `\n\n## Actual Code\n${codeSnapshot}`
    : "\n\n## Actual Code\n(Not available — give best-effort advice based on metadata only)";

  return `Analyze this repository as a ${persona} expert and give your top 5 recommendations.

## Repository
Name: ${repo.name}
Description: ${repo.description ?? "none"}
Language: ${repo.language ?? "unknown"}
Topics: ${repo.topics?.join(", ") || "none"}
${codeSection}

Give exactly 5 numbered recommendations. Each must reference something specific from the code above.`;
}
