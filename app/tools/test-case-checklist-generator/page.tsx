import Link from "next/link";
import { TestCaseChecklistGeneratorTool } from "./test-case-checklist-generator-tool";
import { createMetadata } from "@/lib/seo";

const exampleChecklist = `# QA Checklist: JSON Formatter

Platform: Web

## Smoke Tests
- [ ] Page or feature loads without crashing.
- [ ] Primary controls are visible and usable.

## Happy Path Tests
- [ ] Main user flow works: User pastes JSON, clicks format, sees formatted output.
- [ ] Expected success state or output is shown.

## Edge Case Tests
- [ ] Empty input
- [ ] Invalid JSON
- [ ] Large JSON

## Error Handling Tests
- [ ] Invalid input shows a clear and helpful error message.

## Mobile/Responsive Tests
- [ ] Layout works on small screens without horizontal scrolling.

## Accessibility Checks
- [ ] Form controls have clear labels.

## Regression Checks
- [ ] Existing related flows still work.`;

export const metadata = createMetadata({
  title: "Test Case Checklist Generator",
  description:
    "Generate a manual QA checklist for a feature with smoke, happy path, edge case, accessibility, and regression checks.",
  path: "/tools/test-case-checklist-generator",
});

export default function TestCaseChecklistGeneratorPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Browser-based developer tool
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Test Case Checklist Generator
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          Create a structured manual QA checklist for a feature, including smoke
          tests, happy paths, edge cases, error handling, responsive checks,
          accessibility, and regression coverage.
        </p>
      </div>

      <div className="mt-10">
        <TestCaseChecklistGeneratorTool />
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-10">
          <section aria-labelledby="what-it-does">
            <h2
              id="what-it-does"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              What this checklist generator does
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              This tool turns a feature name, user flow, edge cases, and target
              platform into a Markdown QA checklist. It is designed for
              developers and students who want a practical starting point before
              manually testing their work.
            </p>
          </section>

          <section aria-labelledby="how-to-use">
            <h2
              id="how-to-use"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              How to use it
            </h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7 text-slate-600">
              <li>Enter the feature name and main user flow.</li>
              <li>Add one edge case per line, or leave it blank for defaults.</li>
              <li>Select the target platform.</li>
              <li>Generate the checklist and review the Markdown output.</li>
              <li>Copy the Markdown or download it as a `.md` file.</li>
            </ol>
          </section>

          <section aria-labelledby="example-output">
            <h2
              id="example-output"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              Example checklist output
            </h2>
            <pre className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-800">
              <code>{exampleChecklist}</code>
            </pre>
          </section>

          <section aria-labelledby="test-case-tips">
            <h2
              id="test-case-tips"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              Tips for writing good test cases
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 leading-7 text-slate-600">
              <li>Start with the smallest smoke test that proves the page loads.</li>
              <li>Write happy path checks around the most common user flow.</li>
              <li>Include invalid, empty, large, or unexpected inputs.</li>
              <li>Check mobile layout, keyboard navigation, and clear labels.</li>
              <li>Retest nearby features that could share code or UI state.</li>
            </ul>
          </section>

          <section aria-labelledby="faq">
            <h2
              id="faq"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              FAQ
            </h2>
            <div className="mt-4 space-y-5">
              <div>
                <h3 className="font-semibold text-slate-950">
                  Does this replace real QA?
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  No. It creates a starting checklist. You should adapt the
                  output to the actual risk, complexity, and users of the
                  feature.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">
                  What if I leave edge cases blank?
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  The generator includes generic edge cases for empty input,
                  invalid input, and unexpected large input.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">
                  Can I edit the checklist?
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  Yes. The output is plain Markdown, so you can copy it into an
                  issue, pull request, test plan, or local `.md` file.
                </p>
              </div>
            </div>
          </section>
        </div>

        <aside
          aria-labelledby="related-tools"
          className="h-fit rounded-lg border border-slate-200 bg-white p-5"
        >
          <h2
            id="related-tools"
            className="text-lg font-semibold tracking-tight text-slate-950"
          >
            Related tools
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-6">
            <li>
              <Link
                href="/tools/ai-coding-prompt-generator"
                className="font-semibold text-emerald-700 hover:text-emerald-800"
              >
                AI Coding Prompt Generator
              </Link>
              <p className="text-slate-600">Structure implementation prompts.</p>
            </li>
            <li>
              <Link
                href="/tools/git-command-helper"
                className="font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Git Command Helper
              </Link>
              <p className="text-slate-600">Review common Git commands.</p>
            </li>
            <li>
              <Link
                href="/tools/json-formatter"
                className="font-semibold text-emerald-700 hover:text-emerald-800"
              >
                JSON Formatter
              </Link>
              <p className="text-slate-600">Format API payloads and config.</p>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
