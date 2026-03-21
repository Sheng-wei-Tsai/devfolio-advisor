import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPTS, buildUserPrompt, Persona } from "@/lib/advisors";
import { rateLimit } from "@/lib/rateLimit";
import { fetchRepoCode } from "@/lib/repoCode";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const VALID_PERSONAS = new Set(["frontend", "backend", "ux"]);

async function streamWithRetry(params: Parameters<typeof anthropic.messages.stream>[0], retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await anthropic.messages.stream(params);
    } catch (err: unknown) {
      const isOverloaded =
        err instanceof Error &&
        (err.message.includes("overloaded") || err.message.includes("529"));
      if (isOverloaded && attempt < retries) {
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
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

  // Fetch code with a 8s timeout so slow GitHub responses don't block everything
  const token = req.cookies.get("gh_token")?.value;
  const codeSnapshot = token
    ? await Promise.race([
        fetchRepoCode(repo.full_name, repo.default_branch, token),
        new Promise<string>((r) => setTimeout(() => r(""), 8000)),
      ])
    : "";

  let stream: Awaited<ReturnType<typeof anthropic.messages.stream>>;
  try {
    stream = await streamWithRetry({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      system: SYSTEM_PROMPTS[persona],
      messages: [{ role: "user", content: buildUserPrompt(repo, persona, codeSnapshot) }],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    const isOverloaded = msg.includes("overloaded");
    return new Response(
      isOverloaded
        ? "⚠ Claude API is overloaded. Please wait a moment and try again."
        : `⚠ Analysis failed: ${msg}`,
      { status: isOverloaded ? 503 : 500 }
    );
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch {
        controller.enqueue(encoder.encode("\n\n⚠ Stream interrupted. Please re-run analysis."));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
