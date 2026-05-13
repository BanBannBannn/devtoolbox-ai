import Link from "next/link";
import { ReadmeGeneratorTool } from "./readme-generator-tool";
import { createMetadata } from "@/lib/seo";

const exampleReadme = `# DevToolBox AI

## Description
Free developer tools for students and software engineers.

## Tech Stack
Next.js, TypeScript, Tailwind CSS

## Features
- JSON Formatter
- README Generator

## Installation
\`\`\`bash
npm install
\`\`\`

## Usage
\`\`\`bash
npm run dev
\`\`\`

## License
Add license information here.`;

export const metadata = createMetadata({
  title: "README Generator",
  description:
    "Generate a clean Markdown README from project details in your browser.",
  path: "/tools/readme-generator",
});

export default function ReadmeGeneratorPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Browser-based developer tool
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          README Generator
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          Create a practical starter README from project details, commands, and
          features. The generator runs in your browser and can copy or download
          the Markdown as README.md.
        </p>
      </div>

      <div className="mt-10">
        <ReadmeGeneratorTool />
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-10">
          <section aria-labelledby="what-it-does">
            <h2
              id="what-it-does"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              What this README generator does
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              This tool turns simple project notes into a structured Markdown
              README with sections for description, tech stack, features,
              installation, usage, and license information. It is meant as a
              fast starting point that you can edit for your repository.
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
              <li>Enter the project name, description, and tech stack.</li>
              <li>Add installation and run commands if the project has them.</li>
              <li>Add one feature per line.</li>
              <li>Click Generate README and review the Markdown output.</li>
              <li>Copy the Markdown or download it as README.md.</li>
            </ol>
          </section>

          <section aria-labelledby="example-output">
            <h2
              id="example-output"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              Example README output
            </h2>
            <pre className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-800">
              <code>{exampleReadme}</code>
            </pre>
          </section>

          <section aria-labelledby="readme-tips">
            <h2
              id="readme-tips"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              Tips for writing a good README
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 leading-7 text-slate-600">
              <li>Start with a clear one-paragraph description.</li>
              <li>List the main technologies so readers know the stack fast.</li>
              <li>Keep installation and run commands copyable.</li>
              <li>Describe features from the user or maintainer perspective.</li>
              <li>Add license, screenshots, links, or deployment notes later.</li>
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
                  Does this tool upload my project details?
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  No. README generation runs in the browser using the tested
                  project logic.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">
                  What happens if I leave fields blank?
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  The generator uses simple placeholders where helpful. A blank
                  project name falls back to Untitled Project.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">
                  Can I edit the generated README?
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  Yes. The output is plain Markdown, so you can copy it, edit it
                  in your repository, or download it as README.md.
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
                AI Coding Prompt Generator
              </Link>
              <p className="text-slate-600">Structure implementation prompts.</p>
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
