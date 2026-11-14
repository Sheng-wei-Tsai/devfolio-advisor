"use client";

import { useState } from "react";
import Link from "next/link";
import type { ChecklistCategory } from "@/lib/extractChecklist";
import { evaluateReview, exportReviewReport, MAX_REVIEW_LENGTH } from "@/lib/evaluateReview";
import { DEMO_FILES, DEMO_REVIEWS, INVALID_REVIEW } from "@/lib/reviewFixtures";

const perspectives: { id: ChecklistCategory; label: string; focus: string }[] = [
  { id: "frontend", label: "Frontend", focus: "Rendering, semantics & request states" },
  { id: "backend", label: "Backend", focus: "Access boundaries & data integrity" },
  { id: "ux", label: "UX / UI", focus: "Feedback, recovery & accessibility" },
];
const paths = DEMO_FILES.map((file) => file.path);

export default function ReviewWorkbench() {
  const [persona, setPersona] = useState<ChecklistCategory>("frontend");
  const [text, setText] = useState(DEMO_REVIEWS.frontend);
  const [result, setResult] = useState<ReturnType<typeof evaluateReview> | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [notice, setNotice] = useState("");

  function loadReview(value: string, perspective = persona) {
    setPersona(perspective);
    setText(value);
    setResult(null);
    setCompleted([]);
    setNotice("");
  }

  function downloadReport() {
    const blob = new Blob([exportReviewReport(text, persona, paths, completed)], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `devfolio-${persona}-review.md`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    // Allow the browser to consume the URL before releasing it.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Markdown report downloaded.");
  }

  return (
    <main className="review-workbench">
      <a href="#review-editor" className="workbench-skip">Skip to review editor</a>
      <header className="workbench-nav">
        <Link href="/" className="workbench-brand">DEVFOLIO<span>/</span>ADVISOR</Link>
        <span className="workbench-badge">PUBLIC WORKBENCH</span>
        <Link href="/api/auth/github" className="workbench-auth">Connect your GitHub ↗</Link>
      </header>

      <section className="workbench-hero" aria-labelledby="workbench-title">
        <div>
          <p className="workbench-eyebrow">01 / INSPECT · EVALUATE · IMPROVE</p>
          <h1 id="workbench-title">Good advice needs<br /><span>visible evidence.</span></h1>
          <p className="workbench-intro">Take a repository review apart. Inspect the source, challenge the recommendations, and turn the useful ones into a plan.</p>
        </div>
        <aside className="workbench-context" aria-label="Demo scope">
          <span className="workbench-status-dot" aria-hidden="true" /> No account or API key needed
          <p>Authored example reviews over a synthetic repository. Evaluation runs locally in your browser. No live AI call; no code is uploaded.</p>
        </aside>
      </section>

      <div className="workbench-grid">
        <aside className="workbench-panel workbench-source" aria-labelledby="snapshot-title">
          <div className="workbench-section-label">THE EVIDENCE</div>
          <h2 id="snapshot-title">project-search / sample</h2>
          <p className="workbench-caption">Five deliberately incomplete excerpts. Expand a file to inspect the source behind a recommendation.</p>
          <div className="workbench-file-list">
            {DEMO_FILES.map((file) => (
              <details key={file.path}>
                <summary>{file.path}</summary>
                <pre><code>{file.code}</code></pre>
              </details>
            ))}
          </div>
          <div className="workbench-note">
            <strong>What the checks establish</strong>
            <p>Output structure and whether cited files exist. They cannot establish that advice is correct, secure, or complete. Human review still matters.</p>
          </div>
        </aside>

        <section className="workbench-panel workbench-editor" aria-labelledby="review-title">
          <div className="workbench-section-label">THE REVIEW</div>
          <h2 id="review-title">Choose a perspective.</h2>
          <div className="workbench-perspectives" role="group" aria-label="Review perspective">
            {perspectives.map((perspective) => (
              <button key={perspective.id} type="button" aria-pressed={persona === perspective.id}
                onClick={() => loadReview(DEMO_REVIEWS[perspective.id], perspective.id)}>
                {perspective.label}
              </button>
            ))}
          </div>
          <p className="workbench-caption">{perspectives.find((perspective) => perspective.id === persona)?.focus}</p>
          <label htmlFor="review-editor">Review text <span>editable authored sample</span></label>
          <textarea id="review-editor" value={text} maxLength={MAX_REVIEW_LENGTH} spellCheck={false}
            aria-describedby="review-editor-help"
            onChange={(event) => loadReview(event.target.value)} />
          <p id="review-editor-help" className="workbench-caption">Use 1–5 numbered items with a title, a colon and a detail. Cite snapshot file paths in backticks. Editing clears previous results and tasks.</p>
          <div className="workbench-actions">
            <button type="button" className="workbench-primary" disabled={!text.trim()}
              onClick={() => { setResult(evaluateReview(text, persona, paths)); setNotice(""); }}>Run checks <span aria-hidden="true">↗</span></button>
            <button type="button" className="workbench-secondary" onClick={() => loadReview(INVALID_REVIEW)}>Try a flawed review</button>
            <button type="button" className="workbench-text-button" onClick={() => loadReview(DEMO_REVIEWS[persona])}>Reset sample</button>
          </div>
        </section>
      </div>

      <section className="workbench-results" aria-labelledby="results-title" aria-live="polite">
        <div className="workbench-results-heading">
          <div>
            <div className="workbench-section-label">THE CONTRACT</div>
            <h2 id="results-title">{result ? `${result.checks.filter((check) => check.passed).length} / ${result.checks.length} checks passed` : "Make the review accountable."}</h2>
          </div>
          {result && <span className={`workbench-result-badge ${result.passed ? "is-passing" : "is-failing"}`}>{result.passed ? "CONTRACT MET" : "NEEDS ATTENTION"}</span>}
        </div>
        {!result ? <p className="workbench-caption">Run checks to inspect structure and file references. Try the flawed review to see the checks catch unsupported advice.</p> : (
          <>
            <div className="workbench-checks">
              {result.checks.map((check) => (
                <article key={check.id} className="workbench-check">
                  <span className={check.passed ? "workbench-pass" : "workbench-fail"}>{check.passed ? "PASS" : "FAIL"}</span>
                  <h3>{check.label}</h3><p>{check.detail}</p>
                </article>
              ))}
            </div>
            <div className="workbench-checklist-heading">
              <div><h2>Turn review into action.</h2><p className="workbench-caption">{completed.length} / {result.items.length} completed · current page session only</p></div>
              <button type="button" className="workbench-secondary" onClick={downloadReport}>Download report ↓</button>
            </div>
            {!result.passed && <p className="workbench-caution">This review failed contract checks. Verify each task before acting on it.</p>}
            {result.items.length ? <ul className="workbench-tasks">
              {result.items.map((item, index) => (
                <li key={`${item.key}-${index}`}>
                  <label>
                    <input type="checkbox" checked={completed.includes(item.key)}
                      onChange={(event) => setCompleted((previous) => event.target.checked ? [...previous, item.key] : previous.filter((key) => key !== item.key))} />
                    <span><strong>{item.title}</strong><span className="workbench-task-detail">{item.detail}</span></span>
                  </label>
                </li>
              ))}
            </ul> : <p className="workbench-caption">No recommendations could be parsed. Try a numbered sample.</p>}
          </>
        )}
      </section>
      <p role="status" className="workbench-download-status">{notice}</p>
      <footer className="workbench-footer"><span>DEVFOLIO / ADVISOR</span><p>Inspect the implementation, tests and evaluation fixtures on <a href="https://github.com/Sheng-wei-Tsai/devfolio-advisor">GitHub ↗</a>.</p></footer>
    </main>
  );
}
