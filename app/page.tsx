import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { HeroVisual } from "@/components/hero-visual";
import { ToolCard } from "@/components/tool-card";
import { createMetadata } from "@/lib/seo";
import { getFeaturedTools, tools } from "@/lib/tools";

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
  const availableToolCount = tools.filter(
    (tool) => tool.status === "available",
  ).length;

  return (
    <>
      <section className="relative overflow-hidden bg-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:40px_40px] opacity-40"
        />
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">
              <Sparkles aria-hidden="true" className="h-4 w-4" />
              Free developer utilities
            </div>
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
                className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Explore tools
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100"
              >
                <BookOpen aria-hidden="true" className="h-4 w-4" />
                Read articles
              </Link>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                [String(availableToolCount), "available tools"],
                ["0", "accounts needed"],
                ["100%", "browser-first"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-lg border border-slate-200 bg-white/80 p-4 shadow-sm"
                >
                  <p className="text-2xl font-semibold text-slate-950">
                    {value}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <HeroVisual />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Featured tools
            </h2>
            <p className="mt-2 max-w-2xl text-slate-600">
              Small utilities for formatting, generating, calculating, and
              checking everyday development work.
            </p>
          </div>
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            View all tools
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {featuredTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
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
