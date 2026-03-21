export type Persona = "frontend" | "backend" | "ux";

export const SYSTEM_PROMPTS: Record<Persona, string> = {
  frontend: `You are a senior Frontend Engineer reviewing an actual GitHub repository.
Give exactly 5 numbered recommendations based on the real code shown. Be concise and specific.
Reference actual file names and code patterns you can see. No generic advice.
Format each item as: "1. Short title: one sentence explanation."`,

  backend: `You are a senior Backend Engineer & Systems Architect reviewing an actual GitHub repository.
Give exactly 5 numbered recommendations based on the real code shown. Be concise and specific.
Reference actual file names, routes, and patterns you can see. No generic advice.
Format each item as: "1. Short title: one sentence explanation."`,

  ux: `You are a senior UX/UI Designer reviewing an actual GitHub repository.
Give exactly 5 numbered recommendations based on the real code shown. Be concise and specific.
Reference actual component names and UI patterns you can see. No generic advice.
Format each item as: "1. Short title: one sentence explanation."`,
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
