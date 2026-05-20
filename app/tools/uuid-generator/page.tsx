import Link from "next/link";
import { createMetadata } from "@/lib/seo";
import { UuidGeneratorTool } from "./uuid-generator-tool";

const uuidExamples = `550e8400-e29b-41d4-a716-446655440000
f47ac10b-58cc-4372-a567-0e02b2c3d479
9F0C7D3E-6A1B-4E8C-9F2A-8D7C6B5A4E3F`;

export const metadata = createMetadata({
  title: "UUID Generator",
  description:
    "Generate one or more UUID v4 strings in your browser with lowercase or uppercase output.",
  path: "/tools/uuid-generator",
});

export default function UuidGeneratorPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Browser-based developer tool
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          UUID Generator
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          Generate UUID v4 strings for test data, seed records, request IDs, and
          local development. The tool runs in your browser and uses Web Crypto
          UUID generation when available.
        </p>
      </div>

      <div className="mt-10">
        <UuidGeneratorTool />
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-10">
          <section aria-labelledby="what-is-uuid-v4">
            <h2
              id="what-is-uuid-v4"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              What UUID v4 is
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              A UUID v4 is a 128-bit identifier generated from random values and
              displayed as five groups of hexadecimal characters. Version 4
              UUIDs are commonly used when you need unique identifiers without a
              central counter or database sequence.
            </p>
          </section>

          <section aria-labelledby="common-use-cases">
            <h2
              id="common-use-cases"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              Common use cases
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 leading-7 text-slate-600">
              <li>Create IDs for test fixtures, mock API payloads, and seed data.</li>
              <li>Generate temporary identifiers while building frontend flows.</li>
              <li>Add sample request IDs, event IDs, or correlation IDs to docs.</li>
              <li>Prepare unique values for local configuration and demos.</li>
            </ul>
          </section>

          <section aria-labelledby="how-to-use">
            <h2
              id="how-to-use"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              How to use the tool
            </h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7 text-slate-600">
              <li>Enter how many UUIDs you want to generate.</li>
              <li>Turn on uppercase output if your project needs it.</li>
              <li>Click Generate UUIDs and review the output list.</li>
              <li>Use Copy All to copy every generated UUID at once.</li>
              <li>Click Clear when you want to reset the tool.</li>
            </ol>
          </section>

          <section aria-labelledby="uuid-examples">
            <h2
              id="uuid-examples"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              UUID v4 examples
            </h2>
            <pre className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-800">
              <code>{uuidExamples}</code>
            </pre>
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
                  Does this tool upload generated UUIDs?
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  No. UUIDs are generated in your browser. The tool does not use
                  a backend, database, or external API.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">
                  How many UUIDs can I generate at once?
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  The generator accepts a minimum of 1 and caps output at 100
                  UUIDs to keep the page responsive and easy to copy.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">
                  Should I use uppercase or lowercase UUIDs?
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  Lowercase is common in many codebases, but UUIDs are generally
                  case-insensitive. Use uppercase when your docs, database, or
                  existing data format expects it.
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
                href="/tools/readme-generator"
                className="font-semibold text-emerald-700 hover:text-emerald-800"
              >
                README Generator
              </Link>
              <p className="text-slate-600">Create project documentation.</p>
            </li>
            <li>
              <Link
                href="/tools/test-case-checklist-generator"
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
