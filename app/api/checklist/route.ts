import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { extractChecklistItems, type ChecklistItem, type ChecklistCategory } from "@/lib/extractChecklist";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type { ChecklistItem };

// GET — fetch saved items + completion state for a repo
export async function GET(req: NextRequest) {
  const repoId = req.nextUrl.searchParams.get("repoId");
  if (!repoId) return NextResponse.json({ items: [], completed: {} });

  const { data, error } = await supabase
    .from("repo_checklist")
    .select("items, completed")
    .eq("repo_id", repoId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Supabase GET error:", error);
  }

  return NextResponse.json({
    items: data?.items ?? [],
    completed: data?.completed ?? {},
  });
}

// POST — extract checklist items from analyses and save to DB
export async function POST(req: NextRequest) {
  const { repoId, analyses } = await req.json() as {
    repoId: string;
    analyses: Record<ChecklistCategory, string>;
  };

  if (!repoId || !analyses) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const items = extractChecklistItems(analyses);

  // Preserve existing completion state
  const { data: existing } = await supabase
    .from("repo_checklist")
    .select("completed")
    .eq("repo_id", repoId)
    .single();

  const { error } = await supabase.from("repo_checklist").upsert(
    { repo_id: repoId, items, completed: existing?.completed ?? {}, updated_at: new Date().toISOString() },
    { onConflict: "repo_id" }
  );

  if (error) {
    console.error("Supabase upsert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items });
}

// PATCH — toggle completion state for an item
export async function PATCH(req: NextRequest) {
  const { repoId, completed } = await req.json() as {
    repoId: string;
    completed: Record<string, boolean>;
  };
  if (!repoId) return NextResponse.json({ error: "Missing repoId" }, { status: 400 });

  await supabase
    .from("repo_checklist")
    .update({ completed, updated_at: new Date().toISOString() })
    .eq("repo_id", repoId);

  return NextResponse.json({ ok: true });
}
