const IGNORE_PATTERNS = [
  "node_modules", ".next", "dist", "build", ".git", ".turbo",
  "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
  ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".webp",
  ".woff", ".woff2", ".ttf", ".eot",
  ".min.js", ".min.css", ".map",
];

// Files to prioritise (fetched first if present)
const PRIORITY_FILES = [
  "package.json", "tsconfig.json", "next.config.ts", "next.config.js",
  "README.md", ".env.example", ".env.local.example",
];

const MAX_FILE_CHARS = 3_000;
const MAX_TOTAL_CHARS = 18_000;
const MAX_FILES = 12;

function shouldIgnore(path: string): boolean {
  return IGNORE_PATTERNS.some((p) => path.includes(p));
}

async function ghFetch(url: string, token: string) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28" },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchRepoCode(
  fullName: string,
  branch: string,
  token: string
): Promise<string> {
  // Get flat file tree
  const tree = await ghFetch(
    `https://api.github.com/repos/${fullName}/git/trees/${branch}?recursive=1`,
    token
  );
  if (!tree?.tree) return "";

  const allFiles: string[] = tree.tree
    .filter((f: { type: string; path: string }) => f.type === "blob" && !shouldIgnore(f.path))
    .map((f: { path: string }) => f.path);

  // Sort: priority files first, then by path depth (shallow = more important), then alpha
  const sorted = allFiles.sort((a, b) => {
    const aPriority = PRIORITY_FILES.indexOf(a.split("/").pop() ?? "");
    const bPriority = PRIORITY_FILES.indexOf(b.split("/").pop() ?? "");
    if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
    if (aPriority !== -1) return -1;
    if (bPriority !== -1) return 1;
    return a.split("/").length - b.split("/").length || a.localeCompare(b);
  });

  const picked = sorted.slice(0, MAX_FILES);

  // Fetch file contents in parallel
  const contents = await Promise.all(
    picked.map(async (path) => {
      const data = await ghFetch(
        `https://api.github.com/repos/${fullName}/contents/${path}?ref=${branch}`,
        token
      );
      if (!data?.content) return null;
      try {
        const decoded = Buffer.from(data.content, "base64").toString("utf-8");
        const truncated = decoded.length > MAX_FILE_CHARS
          ? decoded.slice(0, MAX_FILE_CHARS) + "\n... (truncated)"
          : decoded;
        return `### ${path}\n\`\`\`\n${truncated}\n\`\`\``;
      } catch {
        return null;
      }
    })
  );

  const sections = contents.filter(Boolean) as string[];
  let snapshot = sections.join("\n\n");
  if (snapshot.length > MAX_TOTAL_CHARS) {
    snapshot = snapshot.slice(0, MAX_TOTAL_CHARS) + "\n... (truncated)";
  }

  return snapshot;
}
