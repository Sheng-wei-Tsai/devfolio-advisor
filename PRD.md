# Devfolio Advisor: review evidence and public demo

## Goal
Make one complete portfolio feature inspectable without OAuth or paid API access. Show how review output becomes actionable tasks and how deterministic checks catch malformed or unsupported file references.

Users: developers assessing repository feedback, and hiring teams assessing implementation quality. Initial role focus: remote AI product engineering with TypeScript/React. This is an assumption pending the owner's preference.

## MVP and acceptance criteria

- Public `/demo`: inspect a synthetic repository snapshot, select Frontend / Backend / UX, edit a clearly labelled authored sample review, run contract checks, complete checklist items, and download a Markdown report.
- Six deterministic checks: exactly five items, sequential numbering, unique titles, nonempty details, file citations on every item, and cited files present in the snapshot.
- Demonstrate valid and intentionally invalid authored reviews; never present them as live model output or a benchmark of model accuracy.
- Unit tests cover malformed output, extra items, duplicates, missing citations, fabricated paths, empty input and report export. The same evaluator powers the demo and CLI.
- CLI evaluation exits nonzero when fixture expectations regress; GitHub Actions runs tests and evaluation.
- Production build, HTTP smoke checks and browser interaction checks where tooling permits.

## Architecture and scope

Use the existing Next.js App Router, React, TypeScript and CSS tokens. No new dependencies, environment variables, migrations or paid calls. Add a pure evaluator and fixtures in `lib/`, a public route, focused styles, Node test runner scripts and a short architecture/case-study document. Preserve existing OAuth and analysis flows.

## Non-goals

No production model-quality score, LLM judge, live benchmark, account persistence, new authentication, deployment migration or claims about employment history. Passing file-reference checks does not prove a recommendation is correct. The demo checklist lasts only for the current page session.

## Implementation plan

1. Pure evaluator + authored fixtures → verify meaningful negative cases with Node's test runner and CLI expectations.
2. Demo and home entry point → verify build, public access, role switching, editing, evaluation, checklist and export.
3. Delivery evidence → add CI, architecture/tradeoffs and remote-role portfolio roadmap; record exact validation results.

Status: MVP implemented and validated on `ai/codex/review-evaluation-demo`. Thirteen unit tests, four fixture expectations, production build and local browser interactions pass. Prepared for pull-request review; no deployment in this iteration.
