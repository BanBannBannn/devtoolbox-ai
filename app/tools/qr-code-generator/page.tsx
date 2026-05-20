import Link from "next/link";
import { createMetadata } from "@/lib/seo";
import { QrCodeGeneratorTool } from "./qr-code-generator-tool";

const qrExamples = `Website link: https://example.com
Contact card: Name, phone, and email details
Wi-Fi note: Network name and password instructions
Event link: Registration or check-in page`;

export const metadata = createMetadata({
  title: "QR Code Generator",
  description:
    "Generate downloadable PNG QR codes from text or URLs in your browser.",
  path: "/tools/qr-code-generator",
});

export default function QrCodeGeneratorPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Browser-based developer tool
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          QR Code Generator
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          Create a QR code from text or a URL, adjust the size and error
          correction level, then download the result as a PNG. Generation runs
          in your browser with no backend.
        </p>
      </div>

      <div className="mt-10">
        <QrCodeGeneratorTool />
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-10">
          <section aria-labelledby="what-is-qr-code">
            <h2
              id="what-is-qr-code"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              What is a QR code?
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              A QR code is a two-dimensional barcode that can store text, URLs,
              or other short data. Phones and scanners can read the pattern and
              open the encoded content without the user typing it manually.
            </p>
          </section>

          <section aria-labelledby="how-to-use">
            <h2
              id="how-to-use"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              How to use the QR Code Generator
            </h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7 text-slate-600">
              <li>Enter the text or URL you want to encode.</li>
              <li>Choose a QR code size that fits where you will use it.</li>
              <li>Select an error correction level.</li>
              <li>Generate the QR code and scan the preview to confirm it works.</li>
              <li>Download the PNG file when you are ready to use it.</li>
            </ol>
          </section>

          <section aria-labelledby="size-guide">
            <h2
              id="size-guide"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              QR code size guide
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Smaller QR codes are useful for compact digital layouts. Larger QR
              codes are easier to scan on posters, slides, printed material, or
              screens viewed from a distance. Keep enough white space around the
              code so scanners can detect it reliably.
            </p>
          </section>

          <section aria-labelledby="error-correction-guide">
            <h2
              id="error-correction-guide"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              Error correction level guide
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Error correction helps QR codes remain scannable when part of the
              image is damaged, blurred, or obscured. `L` creates simpler codes,
              `M` is a good default, `Q` adds more recovery, and `H` provides
              the highest recovery at the cost of a denser pattern.
            </p>
          </section>

          <section aria-labelledby="common-use-cases">
            <h2
              id="common-use-cases"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              Common use cases
            </h2>
            <pre className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-800">
              <code>{qrExamples}</code>
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
                  Can I generate a QR code from plain text?
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  Yes. The generator can encode plain text, URLs, short notes,
                  IDs, or any other text that fits in a QR code.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">
                  Which error correction level should I choose?
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  `M` is a practical default. Use `Q` or `H` when the code may
                  be printed, resized, or scanned in less reliable conditions.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">
                  Does this tool upload my QR code content?
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  No. QR generation happens in your browser. There is no
                  backend, database, AdSense, or external API call.
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
          </ul>
        </aside>
      </div>
    </div>
  );
}
