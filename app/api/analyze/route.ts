import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPTS, buildUserPrompt, Persona } from "@/lib/advisors";
import { rateLimit } from "@/lib/rateLimit";
import { fetchRepoCode } from "@/lib/repoCode";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const VALID_PERSONAS = new Set(["frontend", "backend", "ux"]);

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { ok } = rateLimit(ip, 10, 60_000);
  if (!ok) {
    return new Response("Rate limit exceeded. Try again in a minute.", {
      status: 429,
      headers: { "Retry-After": "60" },
    });
  }

  let body: { repo?: unknown; persona?: unknown };
  try { body = await req.json(); } catch { return new Response("Invalid JSON", { status: 400 }); }

  const { repo, persona } = body as {
    repo: {
      name: string;
      full_name: string;
      description: string | null;
      language: string | null;
      topics: string[];
      default_branch: string;
    };
    persona: Persona;
  };

  if (!persona || !VALID_PERSONAS.has(String(persona))) {
    return new Response("Invalid persona", { status: 400 });
  }
  if (!repo || typeof repo.name !== "string" || repo.name.length === 0 || repo.name.length > 100) {
    return new Response("Invalid repo", { status: 400 });
  }

  // Fetch actual code from GitHub using the user's token
  const token = req.cookies.get("gh_token")?.value;
  const codeSnapshot = token ? await fetchRepoCode(repo.full_name, repo.default_branch, token) : "";

  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 800,
    system: SYSTEM_PROMPTS[persona],
    messages: [{ role: "user", content: buildUserPrompt(repo, persona, codeSnapshot) }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          controller.enqueue(encoder.encode(event.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
