import evaluator from "../.eval-build/lib/evaluateReview.js";
import fixtures from "../.eval-build/lib/reviewFixtures.js";

const paths = fixtures.DEMO_FILES.map((file) => file.path);
const cases = [
  ...Object.entries(fixtures.DEMO_REVIEWS).map(([persona, review]) => ({ name: `${persona}-authored`, persona, review, expected: true })),
  { name: "invalid-authored", persona: "frontend", review: fixtures.INVALID_REVIEW, expected: false },
];
const results = cases.map(({ name, persona, review, expected }) => {
  const result = evaluator.evaluateReview(review, persona, paths);
  return { name, expected, passed: result.passed, matchesExpectation: result.passed === expected, checks: result.checks };
});
console.log(JSON.stringify({ kind: "authored output-contract fixtures; not model accuracy", results }, null, 2));
if (results.some((result) => !result.matchesExpectation)) process.exitCode = 1;
