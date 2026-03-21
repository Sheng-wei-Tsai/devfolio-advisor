"use client";
import { GithubRepo } from "@/lib/github";

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6", JavaScript: "#f7df1e", Python: "#3572A5",
  Go: "#00ADD8", Rust: "#dea584", Java: "#b07219", "C++": "#f34b7d",
  CSS: "#563d7c", HTML: "#e34c26", Ruby: "#701516",
};

export default function RepoCard({ repo, selected, onClick }: {
  repo: GithubRepo;
  selected: boolean;
  onClick: () => void;
}) {
  const langColor = repo.language ? LANG_COLORS[repo.language] ?? "var(--text-muted)" : "var(--text-muted)";

  return (
    <button
      onClick={onClick}
      className="card card-neon w-full text-left p-4 space-y-2 transition-all duration-200"
      style={{
        borderColor: selected ? "var(--neon)" : undefined,
        boxShadow: selected ? "0 0 15px var(--neon-glow)" : undefined,
        backgroundColor: selected ? "var(--neon-glow)" : undefined,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium truncate" style={{ color: selected ? "var(--neon)" : "var(--text-primary)" }}>
          {repo.name}
        </span>
        <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>
          ★ {repo.stargazers_count}
        </span>
      </div>
      {repo.description && (
        <p className="text-xs line-clamp-2" style={{ color: "var(--text-secondary)" }}>
          {repo.description}
        </p>
      )}
      <div className="flex items-center gap-3">
        {repo.language && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: langColor }} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{repo.language}</span>
          </div>
        )}
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {new Date(repo.updated_at).toLocaleDateString()}
        </span>
      </div>
    </button>
  );
}
