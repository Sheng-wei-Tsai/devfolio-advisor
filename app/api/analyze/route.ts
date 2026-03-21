import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPTS, buildUserPrompt, Persona } from "@/lib/advisors";
import { rateLimit } from "@/lib/rateLimit";
import { fetchRepoCode } from "@/lib/repoCode";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const VALID_PERSONAS = new Set(["frontend", "backend", "ux"]);

async function createWithRetry(
  params: Parameters<typeof anthropic.messages.create>[0],
  retries = 3
): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const msg = await anthropic.messages.create(params);
      const block = msg.content[0];
      return block.type === "text" ? block.text : "";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      const isOverloaded = msg.includes("overloaded") || msg.includes("529");
      if (isOverloaded && attempt < retries) {
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Max retries reached");
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { ok } = rateLimit(ip, 10, 60_000);
  if (!ok) {
    return new Response("Rate limit exceeded. Try again in a minute.", { status: 429 });
  }

  let body: { repo?: unknown; persona?: unknown };
  try { body = await req.json(); } catch { return new Response("Invalid JSON", { status: 400 }); }

  const { repo, persona } = body as {
    repo: {
      name: string; full_name: string; description: string | null;
      language: string | null; topics: string[]; default_branch: string;
    };
    persona: Persona;
  };

  if (!persona || !VALID_PERSONAS.has(String(persona))) {
    return new Response("Invalid persona", { status: 400 });
  }
  if (!repo?.name || repo.name.length > 100) {
    return new Response("Invalid repo", { status: 400 });
  }

  // Fetch code with hard 8s timeout
  const token = req.cookies.get("gh_token")?.value;
  const codeSnapshot = token
    ? await Promise.race([
        fetchRepoCode(repo.full_name, repo.default_branch, token).catch(() => ""),
        new Promise<string>((r) => setTimeout(() => r(""), 8000)),
      ])
    : "";

  try {
    const text = await createWithRetry({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      system: SYSTEM_PROMPTS[persona],
      messages: [{ role: "user", content: buildUserPrompt(repo, persona, codeSnapshot) }],
    });
    return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    const isOverloaded = msg.includes("overloaded");
    return new Response(
      isOverloaded
        ? "⚠ Claude API is busy right now. Please wait a moment and try again."
        : `⚠ Analysis failed: ${msg}`,
      { status: isOverloaded ? 503 : 500 }
    );
  }
}
