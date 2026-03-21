export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  topics: string[];
  visibility: string;
  default_branch: string;
}

export async function fetchTopRepos(accessToken: string): Promise<GithubRepo[]> {
  const res = await fetch("https://api.github.com/user/repos?sort=updated&per_page=5&type=owner", {
    headers: { Authorization: `Bearer ${accessToken}`, "X-GitHub-Api-Version": "2022-11-28" },
  });
  if (!res.ok) throw new Error("Failed to fetch repos");
  return res.json();
}
