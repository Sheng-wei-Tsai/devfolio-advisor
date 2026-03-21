import { NextRequest, NextResponse } from "next/server";
import { fetchTopRepos } from "@/lib/github";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("gh_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const repos = await fetchTopRepos(token);
    return NextResponse.json(repos);
  } catch {
    return NextResponse.json({ error: "Failed to fetch repos" }, { status: 500 });
  }
}
