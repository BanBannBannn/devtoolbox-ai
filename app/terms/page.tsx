import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Terms",
  description:
    "Read the terms for using DevToolBox AI tools and developer content.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
        Terms
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
        Terms
      </h1>
      <div className="mt-6 space-y-5 text-lg leading-8 text-slate-600">
        <p>
          DevToolBox AI provides tools and content as-is for general developer
          education and productivity. The site does not guarantee that generated
          or formatted output is complete, correct, or suitable for every use.
        </p>
        <p>
          You are responsible for reviewing outputs before using them in your
          projects, repositories, tests, documentation, or workflows.
        </p>
        <p>
          The site may change over time as more tools, articles, and supporting
          pages are added.
        </p>
      </div>
    </div>
  );
}
