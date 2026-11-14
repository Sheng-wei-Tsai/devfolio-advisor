import test from "node:test";
import assert from "node:assert/strict";
import evaluator from "../.eval-build/lib/evaluateReview.js";
import fixtures from "../.eval-build/lib/reviewFixtures.js";

const { evaluateReview, exportReviewReport, MAX_REVIEW_LENGTH } = evaluator;
const { DEMO_FILES, DEMO_REVIEWS, INVALID_REVIEW } = fixtures;
const paths = DEMO_FILES.map((file) => file.path);
const check = (text, id) => evaluateReview(text, "frontend", paths).checks.find((item) => item.id === id).passed;

for (const persona of ["frontend", "backend", "ux"]) {
  test(`${persona} authored fixture meets all six output-contract checks`, () => {
    const result = evaluateReview(DEMO_REVIEWS[persona], persona, paths);
    assert.equal(result.passed, true);
    assert.equal(result.items.length, 5);
    assert.ok(result.items.every((item) => item.category === persona));
  });
}

test("rejects an extra sixth entry even though the production parser caps at five", () => {
  const text = DEMO_REVIEWS.frontend + '\n6. **Extra concern**: Inspect `app/page.tsx`.';
  assert.equal(check(text, "count"), false);
});

test("detects a fabricated path even alongside a real citation", () => {
  const text = DEMO_REVIEWS.frontend.replace('`app/page.tsx`', '`app/page.tsx` and `lib/redis.ts`');
  const result = evaluateReview(text, "frontend", paths);
  assert.equal(result.passed, false);
  assert.match(result.checks.find((item) => item.id === "grounding").detail, /lib\/redis.ts/);
});

test("accepts line citations without requiring a line-count claim", () => {
  assert.equal(check(DEMO_REVIEWS.frontend.replace('`app/page.tsx`', '`app/page.tsx:3-5`'), "grounding"), true);
});

test("requires a citation on every item, even if other items are grounded", () => {
  assert.equal(check(DEMO_REVIEWS.frontend.replace('`app/page.tsx`', 'the search page'), "citations"), false);
});

test("rejects repeated and skipped numbering", () => {
  assert.equal(check(DEMO_REVIEWS.frontend.replace('2. **', '1. **'), "sequence"), false);
  assert.equal(check(DEMO_REVIEWS.frontend.replace('3. **', '7. **'), "sequence"), false);
});

test("detects titles that differ only in case or punctuation", () => {
  const text = DEMO_REVIEWS.frontend.replace('Semantic project navigation', 'ACCESSIBLE SEARCH FIELD!');
  assert.equal(check(text, "unique"), false);
});

test("flags empty action details", () => {
  assert.equal(check('1. **Empty action**:', "details"), false);
});

test("empty, oversized and unstructured output cannot pass", () => {
  for (const text of ["", "No problems found", "x".repeat(MAX_REVIEW_LENGTH + 1)]) {
    assert.equal(evaluateReview(text, "frontend", paths).passed, false);
  }
});

test("intentionally invalid fixture exposes several independent failures", () => {
  const result = evaluateReview(INVALID_REVIEW, "frontend", paths);
  for (const id of ["count", "sequence", "unique", "details", "citations", "grounding"]) {
    assert.equal(result.checks.find((item) => item.id === id).passed, false, id);
  }
});

test("export preserves completed tasks and labels the evaluation limitations", () => {
  const result = evaluateReview(DEMO_REVIEWS.frontend, "frontend", paths);
  const report = exportReviewReport(DEMO_REVIEWS.frontend, "frontend", paths, [result.items[0].key]);
  assert.match(report, /\[x\] Accessible search field/);
  assert.match(report, /\[ \] Semantic project navigation/);
  assert.match(report, /not an assessment of model accuracy/);
  assert.match(report, /no live model call/);
});
