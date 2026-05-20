import Link from "next/link";
import { createMetadata } from "@/lib/seo";
import { DateCalculatorTool } from "./date-calculator-tool";

const dateExamples = `2026-01-01 + 30 days = 2026-01-31
2026-01-10 - 5 days = 2026-01-05
2024-02-29 + 1 year = 2025-02-28
2026-01-01 to 2026-01-31 = 30 days`;

export const metadata = createMetadata({
  title: "Date Calculator",
  description:
    "Add or subtract days, months, and years, or calculate days between dates in your browser.",
  path: "/tools/date-calculator",
});

export default function DateCalculatorPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Browser-based developer tool
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Date Calculator
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          Add or subtract days, months, and years from a date, or calculate the
          number of days between two dates. Results use ISO `YYYY-MM-DD` dates
          where a date is returned.
        </p>
      </div>

      <div className="mt-10">
        <DateCalculatorTool />
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-10">
          <section aria-labelledby="what-it-does">
            <h2
              id="what-it-does"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              What this tool does
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              This date calculator helps with deadline math, planning windows,
              test data, and schedule checks. It can move a date forward or
              backward by a whole number of days, months, or years, and it can
              count the days between two dates.
            </p>
          </section>

          <section aria-labelledby="days-from-today">
            <h2
              id="days-from-today"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              How to calculate days from today
            </h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7 text-slate-600">
              <li>Select add/subtract days.</li>
              <li>Use today as the start date or click a quick button.</li>
              <li>Enter a positive number to add days.</li>
              <li>Enter a negative number to subtract days.</li>
              <li>Click Calculate and read the ISO date result.</li>
            </ol>
          </section>

          <section aria-labelledby="date-examples">
            <h2
              id="date-examples"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              Date examples
            </h2>
            <pre className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-800">
              <code>{dateExamples}</code>
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
                  Can I subtract dates?
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  Yes. Use a negative number when adding days, months, or years.
                  For example, `-7` days returns the date one week earlier.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">
                  How are month-end dates handled?
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  If the target month has fewer days, the result clamps to the
                  last valid day of that month. For example, adding one year to
                  February 29, 2024 returns February 28, 2025.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">
                  Does this tool use a server?
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  No. Date calculations run in your browser using the tested
                  project logic. There is no backend, database, or external API.
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
                href="/tools/uuid-generator"
                className="font-semibold text-emerald-700 hover:text-emerald-800"
              >
                UUID Generator
              </Link>
              <p className="text-slate-600">Create IDs for test data.</p>
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
