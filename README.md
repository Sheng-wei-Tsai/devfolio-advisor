# DEVFOLIO/ADVISOR

AI-powered portfolio intelligence for developers. Connect your GitHub account and get sharp, actionable feedback on your repositories from three expert AI advisors: Frontend Engineer, Backend Architect, and UX/UI Designer.

## Features

- **Public review workbench** — `/demo` lets visitors inspect synthetic code, edit authored sample reviews, run six output-contract checks, complete tasks and download Markdown without signing in or making a live AI call.
- **Reproducible evaluation** — shared TypeScript checks, negative tests and a CLI fixture runner. These validate structure and file references, not model accuracy.
- **GitHub OAuth** — authenticate and pull your 5 most recent repositories
- **3 AI Advisors** — each powered by Claude Sonnet, specialized in Frontend, Backend, or UX/UI
- **Streaming responses** — real-time AI analysis streamed to the UI
- **Checklist panel** — track portfolio improvements per repository (persisted in Supabase)
- **Terminal-style UI** — dark cyberpunk aesthetic built with Tailwind CSS + Framer Motion

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [Anthropic Claude](https://www.anthropic.com/) (`claude-sonnet-4-6`) for AI analysis
- [Supabase](https://supabase.com/) for checklist persistence
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Tailwind CSS v4](https://tailwindcss.com/)

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/Sheng-wei-Tsai/devfolio-advisor.git
cd devfolio-advisor
npm install
```

### 2. Set up environment variables

Copy the example file and fill in your keys:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|---|---|
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `NEXT_PUBLIC_APP_URL` | App base URL (e.g. `http://localhost:3000`) |

**GitHub OAuth App setup:**
1. Go to [github.com/settings/developers](https://github.com/settings/developers) → OAuth Apps → New OAuth App
2. Set callback URL to `{NEXT_PUBLIC_APP_URL}/api/auth/github/callback`

**Supabase setup:**
1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL Editor to create the checklist table

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Use **Node 22**. To explore the public workbench, open [http://localhost:3000/demo](http://localhost:3000/demo). Its interactions do not call GitHub, Anthropic or Supabase. The existing authenticated application still needs the environment configuration above.

## Validation and engineering decisions

```bash
npm test       # evaluator regression tests, including fabricated citations
npm run eval   # authored fixture expectations; nonzero exit on regression
npm run build  # production compilation and type checks
```

See [the workbench decision record](docs/review-workbench.md) for architecture, tradeoffs and limitations. The new evaluator runs in the demo and CLI; it does not gate the existing model endpoint. The demo uses authored samples, not live model output, and task completion lasts for the current page session.

## How It Works

1. User authenticates via GitHub OAuth — access token is stored in an HTTP-only cookie
2. Dashboard fetches the user's 5 most recently updated repos via GitHub API
3. Selecting a repo + advisor persona sends a request to `/api/analyze`
4. The API streams a Claude response back using the Anthropic SDK
5. Checklist items are saved per user/repo in Supabase with Row Level Security

## License

MIT
