import Link from "next/link";
import { JsonFormatterTool } from "./json-formatter-tool";
import { createMetadata } from "@/lib/seo";

const exampleInput = '{"user":{"name":"Ban","skills":["Next.js","AI"]}}';
const exampleOutput = `{
  "user": {
    "name": "Ban",
    "skills": [
      "Next.js",
      "AI"
    ]
  }
}`;

export const metadata = createMetadata({
  title: "JSON Formatter",
  description:
    "Format and validate JSON in your browser with readable 2-space indentation.",
  path: "/tools/json-formatter",
});

export default function JsonFormatterPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Browser-based developer tool
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          JSON Formatter
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          Validate raw JSON and turn it into clean, readable output with
          two-space indentation. The formatter runs in your browser and does
          not send your input to a server.
        </p>
      </div>

      <div className="mt-10">
        <JsonFormatterTool />
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-10">
          <section aria-labelledby="what-it-does">
            <h2
              id="what-it-does"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              What this JSON formatter does
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              This tool checks whether pasted JSON is valid. If it is valid, it
              formats the data with consistent spacing so objects, arrays, and
              nested values are easier to scan while debugging API responses,
              configuration files, or test fixtures.
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
              <li>Paste your JSON into the input textarea.</li>
              <li>Click Format JSON.</li>
              <li>Review the formatted output or read the error message.</li>
              <li>Copy the formatted output when it looks correct.</li>
            </ol>
          </section>

          <section aria-labelledby="example">
            <h2
              id="example"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              Example input and output
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Input
                </h3>
                <pre className="mt-2 overflow-x-auto rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-800">
                  <code>{exampleInput}</code>
                </pre>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Output
                </h3>
                <pre className="mt-2 overflow-x-auto rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-800">
                  <code>{exampleOutput}</code>
                </pre>
              </div>
            </div>
          </section>

          <section aria-labelledby="common-errors">
            <h2
              id="common-errors"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              Common JSON errors
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 leading-7 text-slate-600">
              <li>Missing quotes around object keys.</li>
              <li>Trailing commas after the last item in an object or array.</li>
              <li>Single quotes instead of double quotes.</li>
              <li>Missing values after a colon.</li>
              <li>Unclosed braces, brackets, or strings.</li>
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
                  Does this tool upload my JSON?
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  No. Formatting uses browser JavaScript and the tested
                  `formatJson` logic from this project.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">
                  Can it fix invalid JSON automatically?
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  No. It validates and formats valid JSON. If the input is
                  invalid, it shows an error so you can correct the syntax.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">
                  What indentation does it use?
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  Valid JSON is formatted with two spaces, which is a common
                  readable default for API payloads and configuration files.
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
                href="/tools"
                className="font-semibold text-emerald-700 hover:text-emerald-800"
              >
                README Generator
              </Link>
              <p className="text-slate-600">Draft project documentation.</p>
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
