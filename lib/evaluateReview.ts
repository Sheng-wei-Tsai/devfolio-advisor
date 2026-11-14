import { extractChecklistItems, type ChecklistCategory } from "./extractChecklist";

export interface ReviewCheck {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

export const MAX_REVIEW_LENGTH = 12000;

/** Contract checks only: a real file citation does not prove a recommendation is correct. */
export function evaluateReview(text: string, persona: ChecklistCategory, files: string[]) {
  const bounded = text.length <= MAX_REVIEW_LENGTH;
  const source = bounded ? text : "";
  const numbers = [...source.matchAll(/^\s*(\d+)\.\s+/gm)].map((match) => Number(match[1]));
  const items = extractChecklistItems({ frontend: "", backend: "", ux: "", [persona]: source });
  const knownFiles = new Set(files);
  const references = items.map((item) =>
    [...item.detail.matchAll(/`([^`\n]+)`/g)]
      .map((match) => match[1])
      .filter((value) => /\.[a-zA-Z0-9]+(?::\d+(?:-\d+)?)?$/.test(value))
      .map((value) => value.replace(/:\d+(?:-\d+)?$/, ""))
  );
  const unknown = [...new Set(references.flat().filter((file) => !knownFiles.has(file)))];
  const hasItems = items.length > 0;
  const checks: ReviewCheck[] = [
    {
      id: "count", label: "Five recommendations",
      passed: numbers.length === 5 && items.length === 5,
      detail: bounded ? `${numbers.length} numbered entries; ${items.length} parsed recommendations.` : `Review exceeds ${MAX_REVIEW_LENGTH} characters.`,
    },
    {
      id: "sequence", label: "Sequential numbering",
      passed: numbers.length === 5 && numbers.every((number, index) => number === index + 1),
      detail: `Expected 1–5; received ${numbers.join(", ") || "no numbered entries"}.`,
    },
    {
      id: "unique", label: "Distinct concerns",
      passed: hasItems && new Set(items.map((item) => item.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim())).size === items.length,
      detail: "Checks normalised titles for duplicates; does not assess semantic overlap.",
    },
    {
      id: "details", label: "Action details present",
      passed: hasItems && items.every((item) => item.detail.trim().length > 0),
      detail: "Each parsed recommendation needs a nonempty detail after its title.",
    },
    {
      id: "citations", label: "File citation per item",
      passed: hasItems && references.every((paths) => paths.length > 0),
      detail: "Cite a file in backticks, for example `app/page.tsx` or `app/page.tsx:12`.",
    },
    {
      id: "grounding", label: "Cited files exist",
      passed: hasItems && references.some((paths) => paths.length > 0) && unknown.length === 0,
      detail: unknown.length ? `Not in this snapshot: ${unknown.join(", ")}.` : "Every detected file citation must match a snapshot path. This does not validate the advice.",
    },
  ];
  return { items, checks, passed: checks.every((check) => check.passed) };
}

export function exportReviewReport(
  text: string,
  persona: ChecklistCategory,
  files: string[],
  completed: string[]
) {
  const result = evaluateReview(text, persona, files);
  return [
    "# Devfolio Advisor — demo review", "",
    `Perspective: ${persona}`, "Source: authored sample or visitor-edited text; no live model call.",
    "Scope: deterministic output-contract checks, not an assessment of model accuracy.", "",
    "## Contract checks", "",
    ...result.checks.map((check) => `- [${check.passed ? "x" : " "}] ${check.label}: ${check.detail}`),
    "", "## Action checklist", "",
    ...result.items.map((item) => `- [${completed.includes(item.key) ? "x" : " "}] ${item.title}: ${item.detail}`),
    "", "## Snapshot paths", "", ...files.map((file) => `- ${file}`), "",
    "## Submitted review", "", text.slice(0, MAX_REVIEW_LENGTH), "",
  ].join("\n");
}
