import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPTS, buildUserPrompt, Persona } from "@/lib/advisors";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { repo, persona } = await req.json() as { repo: { name: string; description: string | null; language: string | null; topics: string[] }; persona: Persona };

  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    system: SYSTEM_PROMPTS[persona],
    messages: [{ role: "user", content: buildUserPrompt(repo, persona) }],
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
