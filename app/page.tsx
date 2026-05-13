import Link from "next/link";
import { createMetadata } from "@/lib/seo";
import { getFeaturedTools } from "@/lib/tools";

const latestArticles = [
  {
    title: "How to write better AI coding prompts",
    description:
      "A practical guide to giving coding assistants clearer context, constraints, and expected output.",
    date: "Coming soon",
  },
  {
    title: "A beginner-friendly manual testing checklist",
    description:
      "The core flows, edge cases, and regression checks to review before shipping a feature.",
    date: "Coming soon",
  },
  {
    title: "When to format, validate, or lint JSON",
    description:
      "Simple differences that help developers debug API payloads and configuration files faster.",
    date: "Coming soon",
  },
];

export const metadata = createMetadata({
  description:
    "Use free developer tools, AI coding prompts, and testing checklists directly in your browser.",
  path: "/",
});

export default function HomePage() {
  const featuredTools = getFeaturedTools();

  return (
    <>
      <section className="bg-white">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Free developer utilities
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Fast tools and practical guides for everyday development work.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              DevToolBox AI helps developers format data, draft prompts, plan
              README files, review Git commands, and prepare testing checklists
              without a login.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/tools"
                className="rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Explore tools
              </Link>
              <Link
                href="/blog"
                className="rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100"
              >
                Read articles
              </Link>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-950">
              Built for quick tasks
            </h2>
            <ul className="mt-5 space-y-4 text-sm leading-6 text-slate-600">
              <li>Browser-first tools where possible.</li>
              <li>No account, database, or paid API required for v1.</li>
              <li>Useful written context around every tool as the library grows.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Featured tools
            </h2>
            <p className="mt-2 max-w-2xl text-slate-600">
              The first v1 tools are queued for implementation in upcoming
              phases.
            </p>
          </div>
          <Link
            href="/tools"
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            View all tools
          </Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {featuredTools.map((tool) => (
            <article
              key={tool.slug}
              className="rounded-lg border border-slate-200 bg-white p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                {tool.category}
              </p>
              <h3 className="mt-3 text-lg font-semibold text-slate-950">
                {tool.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {tool.description}
              </p>
              <p className="mt-5 text-sm font-medium text-slate-500">
                Planned for v1
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Latest articles
              </h2>
              <p className="mt-2 max-w-2xl text-slate-600">
                Guides will focus on practical workflows for students,
                beginners, and AI-assisted development.
              </p>
            </div>
            <Link
              href="/blog"
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              View blog
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {latestArticles.map((article) => (
              <article
                key={article.title}
                className="rounded-lg border border-slate-200 bg-slate-50 p-6"
              >
                <p className="text-sm font-medium text-slate-500">
                  {article.date}
                </p>
                <h3 className="mt-3 text-lg font-semibold text-slate-950">
                  {article.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {article.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
