# Validation: public review workbench

Verified 2026-11-14 with Node 22.12.0. No application dependencies changed.

| Check | Result |
| --- | --- |
| `npm test` | 13 tests passed, including fabricated paths, missing citations, duplicates, numbering, oversized input and report completion state. |
| `npm run eval` | All four authored fixture expectations matched: three valid reviews accepted, deliberately invalid review rejected. Not a model benchmark. |
| `npm run build` | Production compilation, lint/type validation and static generation passed; `/demo` is a public static route. Existing dependency punycode deprecation warning remains. |
| HTTP smoke | Production `/demo` returned 200 without authentication. |
| Browser flow | Passed source expansion, three perspectives, valid and flawed review checks, checklist completion, Markdown download contents, empty-input disable, reset and home navigation. No page errors. |
| Mobile | Passed at 390 × 844 with no horizontal overflow. Desktop at 1440 × 1050 and mobile screenshots visually inspected. |
| `git diff --check` | Passed. |
| Code memory | `graphify update lib` generated local code graph: 20 nodes / 16 edges. Generated graph artifacts are ignored. |

Browser automation used installed Playwright with installed Google Chrome. The in-app browser execution tool was unavailable; standalone Chromium was terminated during launch. Chrome completed the checks. No browser dependencies were added to the repository, and these local browser checks are not part of the new CI job.

Screenshots:

- [Desktop](screenshots/review-workbench-desktop.png)
- [Mobile](screenshots/review-workbench-mobile.png)

Limits: no production deployment, hosted CI execution, live AI benchmark or authenticated OAuth/Anthropic/Supabase end-to-end certification. The public route uses authored fixtures, not recorded live model output. Build validation used existing local environment configuration.
