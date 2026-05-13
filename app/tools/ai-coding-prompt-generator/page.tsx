import Link from "next/link";
import { AiCodingPromptGeneratorTool } from "./ai-coding-prompt-generator-tool";
import { createMetadata } from "@/lib/seo";

const examplePrompt = `## Role
You are a senior software engineer helping implement a focused coding task.

## Context
Tech stack: Next.js, TypeScript
Feature or task context: JSON Formatter

## Task
Build feature

## Requirements
- Read the relevant project documentation before coding.
- Implement only the requested task.
- Keep the solution clean, typed, and easy to maintain.
- Add or update tests for pure logic when applicable.

## Constraints
No backend, client-side only

## Output format
Changed files and explanation

## Things not to do
- Do not add extra features.
- Do not introduce unrelated refactors.`;

export const metadata = createMetadata({
  title: "AI Coding Prompt Generator",
  description:
    "Generate structured prompts for AI coding tools from task details, constraints, and expected output.",
  path: "/tools/ai-coding-prompt-generator",
});

export default function AiCodingPromptGeneratorPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Browser-based developer tool
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          AI Coding Prompt Generator
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          Create a structured prompt for AI coding tools using your task type,
          tech stack, feature details, constraints, and expected output. This
          tool only formats text in your browser and does not call any AI API.
        </p>
      </div>

      <div className="mt-10">
        <AiCodingPromptGeneratorTool />
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-10">
          <section aria-labelledby="what-it-does">
            <h2
              id="what-it-does"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              What this prompt generator does
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              This tool turns rough implementation notes into a prompt with
              clear sections for role, context, task, requirements, constraints,
              output format, and things not to do. It helps reduce ambiguity
              before you paste a request into an AI coding assistant.
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
              <li>Choose the task type that best matches the work.</li>
              <li>Add the tech stack and feature description.</li>
              <li>List constraints such as scope, architecture, or limits.</li>
              <li>Describe what the AI should return.</li>
              <li>Generate the prompt, review it, then copy it.</li>
            </ol>
          </section>

          <section aria-labelledby="example-output">
            <h2
              id="example-output"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              Example prompt output
            </h2>
            <pre className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-800">
              <code>{examplePrompt}</code>
            </pre>
          </section>

          <section aria-labelledby="prompt-tips">
            <h2
              id="prompt-tips"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              Tips for better AI coding prompts
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 leading-7 text-slate-600">
              <li>Name the exact files, routes, or modules when you know them.</li>
              <li>Include constraints that prevent unnecessary features.</li>
              <li>Ask for tests when the task includes reusable logic.</li>
              <li>Specify whether the AI should implement, review, or explain.</li>
              <li>Describe the expected final response before starting work.</li>
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
                  Does this tool call an AI model?
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  No. It only generates a prompt string in your browser. You can
                  paste that prompt into the AI coding tool of your choice.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">
                  What if I leave constraints empty?
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  The generator adds default constraints that encourage a small,
                  scoped implementation and tell the AI not to add extra
                  features.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">
                  Can I edit the generated prompt?
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  Yes. The output is plain text, so you can copy it and adjust
                  any wording before sending it to an AI coding assistant.
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
                href="/tools/readme-generator"
                className="font-semibold text-emerald-700 hover:text-emerald-800"
              >
                README Generator
              </Link>
              <p className="text-slate-600">Draft project documentation.</p>
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
            <li>
              <Link
                href="/tools"
                className="font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Test Case Checklist Generator
              </Link>
              <p className="text-slate-600">Plan manual QA coverage.</p>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
