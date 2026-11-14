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
| `npm run lint` | Passed after adding the missing Next.js ESLint configuration; existing custom-font warning remains. |
| Code memory | `graphify update lib` generated local code graph: 20 nodes / 16 edges. Generated graph artifacts are ignored. |

Browser automation used installed Playwright with installed Google Chrome. The in-app browser execution tool was unavailable; standalone Chromium was terminated during launch. Chrome completed the checks. No browser dependencies were added to the repository, and these local browser checks are not part of the new CI job.

Screenshots:

- [Desktop](screenshots/review-workbench-desktop.png)
- [Mobile](screenshots/review-workbench-mobile.png)

Limits: no production deployment, live AI benchmark or authenticated OAuth/Anthropic/Supabase end-to-end certification. The public route uses authored fixtures, not recorded live model output. Initial build validation used existing local environment configuration; a subsequent local build also passed with all CI provider variables explicitly set to non-production placeholders.

Hosted follow-up: the new Review evaluation workflow passed for commit `a52729c`. The existing CI failed at lint because the repository had no ESLint configuration and the command prompted interactively. Added `.eslintrc.json` extending the installed `next/core-web-vitals` configuration; local lint now exits successfully. Subsequent hosted CI results are recorded in the pull request.

The next CI run passed lint and type checks, then exposed missing Supabase build variables. The build workflow now uses explicit non-production placeholders, like its other provider placeholders, and Node 22. Compilation should not depend on production database credentials. This does not test database access.
