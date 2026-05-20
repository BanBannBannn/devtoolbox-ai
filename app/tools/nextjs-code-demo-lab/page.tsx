import Link from "next/link";
import { createMetadata } from "@/lib/seo";
import { NextjsCodeDemoLabTool } from "./nextjs-code-demo-lab-tool";

export const metadata = createMetadata({
  title: "Next.js Code Demo Lab",
  description:
    "Learn Next.js and React concepts with safe predefined code examples, explanations, and live or simulated previews.",
  path: "/tools/nextjs-code-demo-lab",
});

export default function NextjsCodeDemoLabPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Educational developer tool
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Next.js Code Demo Lab
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          Learn React and Next.js concepts through fixed, safe examples. Pick a
          lesson, read the snippet, and compare it with a live or simulated
          preview without running arbitrary code.
        </p>
      </div>

      <div className="mt-10">
        <NextjsCodeDemoLabTool />
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-10">
          <section aria-labelledby="what-is-code-demo-lab">
            <h2
              id="what-is-code-demo-lab"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              What is the Next.js Code Demo Lab?
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              The lab is a guided learning tool with predefined examples for
              common React and Next.js concepts. Each lesson pairs code with an
              explanation, a common mistake, and a visual result.
            </p>
          </section>

          <section aria-labelledby="how-to-use-demos">
            <h2
              id="how-to-use-demos"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              How to use the demos
            </h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7 text-slate-600">
              <li>Select a lesson from the dropdown.</li>
              <li>Read the concept and code snippet.</li>
              <li>Compare the explanation with the preview.</li>
              <li>Use Copy Code if you want to study the snippet elsewhere.</li>
              <li>Use Reset Demo to return interactive previews to their start.</li>
            </ol>
          </section>

          <section aria-labelledby="preview-types">
            <h2
              id="preview-types"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              Live preview vs simulated preview
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Live previews are small built-in components, like a counter or a
              toggle. Simulated previews show the expected result as a static
              card, which is useful for server-only concepts such as Route
              Handlers and environment variable safety.
            </p>
          </section>

          <section aria-labelledby="why-no-code-execution">
            <h2
              id="why-no-code-execution"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              Why arbitrary code execution is not supported in v1
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              This tool is designed for safe beginner learning, not as a
              sandbox. It does not evaluate user-provided JavaScript, use{" "}
              <code>eval</code>, use the <code>Function</code> constructor, add
              Sandpack, create files, or call a backend.
            </p>
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
                  Can I edit and run my own code?
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  No. Version 1 uses fixed lessons only. That keeps the tool
                  safe, predictable, and easy for beginners to follow.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">
                  Are Route Handler demos real API calls?
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  No. Route Handler lessons use simulated output so the page can
                  remain client-side only.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">
                  Does the lab store my lesson activity?
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  No. Lesson selection and preview state are local to the page
                  session and are not stored in a database.
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
                href="/tools/nextjs-file-tree-visualizer"
                className="font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Next.js File Tree Visualizer
              </Link>
              <p className="text-slate-600">Map routes to App Router files.</p>
            </li>
            <li>
              <Link
                href="/tools/ai-coding-prompt-generator"
                className="font-semibold text-emerald-700 hover:text-emerald-800"
              >
                AI Coding Prompt Generator
              </Link>
              <p className="text-slate-600">Draft clearer coding prompts.</p>
            </li>
            <li>
              <Link
                href="/tools/readme-generator"
                className="font-semibold text-emerald-700 hover:text-emerald-800"
              >
                README Generator
              </Link>
              <p className="text-slate-600">Create project documentation.</p>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
