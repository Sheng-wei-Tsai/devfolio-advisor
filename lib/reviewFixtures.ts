import type { ChecklistCategory } from "./extractChecklist";

// Deliberately synthetic and incomplete code excerpts, never private repository content.
export const DEMO_FILES = [
  { path: "app/page.tsx", code: 'export default function Search() {\n  return <main>\n    <h1>Find a project</h1>\n    <input placeholder="Search projects" />\n    <button onClick={() => fetch("/api/projects")}>Search</button>\n  </main>;\n}' },
  { path: "app/api/projects/route.ts", code: 'export async function GET(request: Request) {\n  const query = new URL(request.url).searchParams.get("q");\n  const rows = await db.query(`SELECT * FROM projects WHERE name = \'${query}\'`);\n  return Response.json(rows);\n}' },
  { path: "components/ProjectCard.tsx", code: 'export function ProjectCard({ project }) {\n  return <div onClick={() => location.href = project.url}>\n    <img src={project.image} />\n    <h2>{project.name}</h2>\n    <span style={{ color: "#555", background: "#111" }}>Open project</span>\n  </div>;\n}' },
  { path: "lib/loadProjects.ts", code: 'export async function loadProjects() {\n  const response = await fetch("/api/projects");\n  return response.json();\n}' },
  { path: "supabase/schema.sql", code: 'CREATE TABLE projects (\n  id uuid PRIMARY KEY,\n  owner_id uuid NOT NULL,\n  name text NOT NULL\n);\n-- No row-level security policies defined in this excerpt.' },
];

export const DEMO_REVIEWS: Record<ChecklistCategory, string> = {
  frontend: [
    '1. **Accessible search field**: Add a visible label to the input in `app/page.tsx` so its purpose is available to assistive technology.',
    '2. **Semantic project navigation**: Replace the clickable div in `components/ProjectCard.tsx` with a link to provide keyboard navigation.',
    '3. **Stable image layout**: Give the image in `components/ProjectCard.tsx` dimensions and descriptive alt text to prevent layout shifts and convey its content.',
    '4. **Visible request failure**: Check response.ok in `lib/loadProjects.ts` and surface an error rather than treating every response as project data.',
    '5. **Search result state**: In `app/page.tsx`, store the response and show loading, empty and result states after submitting the search.',
  ].join("\n\n"),
  backend: [
    '1. **Parameterised database query**: Replace interpolated query text in `app/api/projects/route.ts` with a parameterised query to prevent SQL injection.',
    '2. **Authenticated project access**: Validate the session and scope results to the current owner in `app/api/projects/route.ts` before returning project data.',
    '3. **Database access policies**: Enable row-level security and define owner policies in `supabase/schema.sql` to enforce access at the data layer.',
    '4. **Bounded search input**: Validate and cap the q parameter in `app/api/projects/route.ts` before sending it to the database.',
    '5. **Bounded result payload**: Select only necessary columns and limit rows in `app/api/projects/route.ts` so a request cannot return the entire table.',
  ].join("\n\n"),
  ux: [
    '1. **Search progress feedback**: Disable repeat submissions and announce loading in `app/page.tsx` while a search is running.',
    '2. **Recoverable search errors**: Show a clear error and retry action in `app/page.tsx` when the request fails.',
    '3. **Meaningful empty state**: Render a no-results message and suggestions in `app/page.tsx` when the returned collection is empty.',
    '4. **Readable action contrast**: Increase the contrast of the Open project text in `components/ProjectCard.tsx` against its background.',
    '5. **Keyboard discoverable action**: Use a link and visible focus treatment in `components/ProjectCard.tsx` so keyboard users can discover and open a project.',
  ].join("\n\n"),
};

export const INVALID_REVIEW = [
  '1. **Improve your architecture**: Add a cache in `lib/redis.ts` for better performance.',
  '2. **Improve your architecture**: Add more reusable components.',
  '4. **Add more tests**: ',
].join("\n\n");
