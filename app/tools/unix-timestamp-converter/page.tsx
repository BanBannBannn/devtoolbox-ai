import Link from "next/link";
import { createMetadata } from "@/lib/seo";
import { UnixTimestampConverterTool } from "./unix-timestamp-converter-tool";

const commonExamples = `1700000000 seconds = 2023-11-14T22:13:20.000Z
1700000000000 milliseconds = 2023-11-14T22:13:20.000Z
2023-11-14T22:13:20.000Z = 1700000000 seconds
2023-11-14T22:13:20.000Z = 1700000000000 milliseconds`;

export const metadata = createMetadata({
  title: "Unix Timestamp Converter",
  description:
    "Convert Unix timestamps in seconds or milliseconds to dates, and convert dates back to Unix timestamps.",
  path: "/tools/unix-timestamp-converter",
});

export default function UnixTimestampConverterPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Browser-based developer tool
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Unix Timestamp Converter
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          Convert Unix timestamps to readable date/time values, or convert a
          date/time back to Unix seconds and milliseconds. The converter runs in
          your browser and does not send values to a server.
        </p>
      </div>

      <div className="mt-10">
        <UnixTimestampConverterTool />
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-10">
          <section aria-labelledby="what-is-unix-timestamp">
            <h2
              id="what-is-unix-timestamp"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              What is a Unix timestamp?
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              A Unix timestamp is a number that represents time elapsed since
              January 1, 1970 at 00:00:00 UTC. Developers often see timestamps
              in API responses, logs, databases, analytics events, and token
              claims.
            </p>
          </section>

          <section aria-labelledby="seconds-vs-milliseconds">
            <h2
              id="seconds-vs-milliseconds"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              Seconds vs milliseconds
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Unix timestamps are commonly stored in seconds, while JavaScript
              dates use milliseconds internally. A 10-digit value is usually
              seconds, and a 13-digit value is usually milliseconds.
            </p>
          </section>

          <section aria-labelledby="timestamp-to-date">
            <h2
              id="timestamp-to-date"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              How to convert timestamp to date
            </h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7 text-slate-600">
              <li>Select Unix timestamp to date.</li>
              <li>Choose whether the input is seconds or milliseconds.</li>
              <li>Paste or type the timestamp.</li>
              <li>Click Convert to see local, ISO, UTC, seconds, and milliseconds values.</li>
            </ol>
          </section>

          <section aria-labelledby="date-to-timestamp">
            <h2
              id="date-to-timestamp"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              How to convert date to timestamp
            </h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7 text-slate-600">
              <li>Select Date to Unix timestamp.</li>
              <li>Choose a date/time value or click Use Current Time.</li>
              <li>Pick seconds or milliseconds as your preferred input unit.</li>
              <li>Click Convert and use the timestamp output your system expects.</li>
            </ol>
          </section>

          <section aria-labelledby="common-examples">
            <h2
              id="common-examples"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              Common examples
            </h2>
            <pre className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-800">
              <code>{commonExamples}</code>
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
                  Is Unix time always UTC?
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  Yes. Unix time counts from the UTC epoch. Local date/time
                  display depends on the timezone configured in your browser.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">
                  Should I use seconds or milliseconds?
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  Use the unit your system expects. APIs, JWT claims, and many
                  databases often use seconds. JavaScript `Date` values and
                  frontend code often use milliseconds.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">
                  Does this tool upload my dates?
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  No. Conversion runs in your browser using local JavaScript.
                  There is no backend, database, or external API call.
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
                href="/tools/date-calculator"
                className="font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Date Calculator
              </Link>
              <p className="text-slate-600">Add dates and compare date ranges.</p>
            </li>
            <li>
              <Link
                href="/tools/jwt-decoder"
                className="font-semibold text-emerald-700 hover:text-emerald-800"
              >
                JWT Decoder
              </Link>
              <p className="text-slate-600">Inspect timestamp claims in tokens.</p>
            </li>
            <li>
              <Link
                href="/tools/json-formatter"
                className="font-semibold text-emerald-700 hover:text-emerald-800"
              >
                JSON Formatter
              </Link>
              <p className="text-slate-600">Format API payloads and logs.</p>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
