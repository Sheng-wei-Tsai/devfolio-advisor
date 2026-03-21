import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface ChecklistItem {
  key: string;
  label: string;
  category: "frontend" | "backend" | "ux" | "docs" | "devops" | "quality";
}

// GET — fetch saved items + completion state for a repo
export async function GET(req: NextRequest) {
  const repoId = req.nextUrl.searchParams.get("repoId");
  if (!repoId) return NextResponse.json({ items: [], completed: {} });

  const { data } = await supabase
    .from("repo_checklist")
    .select("items, completed")
    .eq("repo_id", repoId)
    .single();

  return NextResponse.json({
    items: data?.items ?? [],
    completed: data?.completed ?? {},
  });
}

// POST — generate repo-specific checklist from analysis results and store
export async function POST(req: NextRequest) {
  const { repoId, repoName, analyses } = await req.json() as {
    repoId: string;
    repoName: string;
    analyses: { frontend: string; backend: string; ux: string };
  };

  if (!repoId || !repoName || !analyses) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const prompt = `You are reviewing a GitHub repository called "${repoName}".
Here are expert analyses from three perspectives:

FRONTEND ANALYSIS:
${analyses.frontend}

BACKEND ANALYSIS:
${analyses.backend}

UX/UI ANALYSIS:
${analyses.ux}

Based ONLY on these specific analyses, extract 8-12 concrete, actionable checklist items that this developer should implement for THIS specific project.
Each item must be specific to what was found in the analysis — not generic advice.

Return ONLY a valid JSON array. No markdown, no explanation, no code block. Example format:
[{"key":"unique-slug","label":"Specific action for this repo","category":"frontend"}]

Valid categories: frontend, backend, ux, docs, devops, quality`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "[]";

  let items: ChecklistItem[] = [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) items = parsed;
  } catch {
    // fallback: try to extract JSON array from response
    const match = raw.match(/\[[\s\S]*\]/);
    if (match) {
      try { items = JSON.parse(match[0]); } catch { /* leave empty */ }
    }
  }

  // Preserve existing completion state when re-generating
  const { data: existing } = await supabase
    .from("repo_checklist")
    .select("completed")
    .eq("repo_id", repoId)
    .single();

  const { error } = await supabase.from("repo_checklist").upsert({
    repo_id: repoId,
    items,
    completed: existing?.completed ?? {},
    updated_at: new Date().toISOString(),
  }, { onConflict: "repo_id" });

  if (error) {
    console.error("Supabase upsert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items });
}

// PATCH — save completion state
export async function PATCH(req: NextRequest) {
  const { repoId, completed } = await req.json() as { repoId: string; completed: Record<string, boolean> };
  if (!repoId) return NextResponse.json({ error: "Missing repoId" }, { status: 400 });

  await supabase
    .from("repo_checklist")
    .update({ completed, updated_at: new Date().toISOString() })
    .eq("repo_id", repoId);

  return NextResponse.json({ ok: true });
}
