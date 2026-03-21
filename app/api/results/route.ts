import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const repoId = req.nextUrl.searchParams.get("repoId");
  if (!repoId) return NextResponse.json({});

  const { data } = await supabase
    .from("analysis_results")
    .select("persona, content")
    .eq("repo_id", repoId);

  const results: Record<string, string> = {};
  for (const row of data ?? []) {
    results[row.persona] = row.content;
  }
  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  const { repoId, persona, content } = await req.json();

  await supabase.from("analysis_results").upsert(
    { repo_id: repoId, persona, content, updated_at: new Date().toISOString() },
    { onConflict: "repo_id,persona" }
  );

  return NextResponse.json({ ok: true });
}
