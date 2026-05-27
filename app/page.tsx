import Link from "next/link";
import {
  ArrowRight,
  FileText,
  MessageSquareText,
  Sparkles,
  Wrench,
} from "lucide-react";
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
  title: "AI Workspace for Developer Knowledge",
  description:
    "Save documents, chat with your own knowledge base, and use practical developer tools in one workspace.",
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
              AI workspace for developer knowledge
            </div>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Your AI workspace for developer knowledge
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Save documents, turn them into searchable knowledge, and chat
              with your own project context. Built-in developer tools are
              included when you need quick utilities.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Start your AI workspace
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100"
              >
                <Wrench aria-hidden="true" className="h-4 w-4" />
                Explore tools
              </Link>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                ["Docs", "saved knowledge"],
                ["RAG", "document chat"],
                [String(availableToolCount), "developer tools"],
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
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            Build a workspace around your project context
          </h2>
          <p className="mt-3 text-slate-600">
            DevToolBox AI helps you collect developer knowledge, find it again,
            and ask questions when you need a practical answer.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Chat with your documents",
              description:
                "Ask questions against your saved and vectorized project notes, specs, guides, and checklists.",
              icon: MessageSquareText,
            },
            {
              title: "Organize project knowledge",
              description:
                "Create and manage text or Markdown documents so useful context does not disappear across chats and tasks.",
              icon: FileText,
            },
            {
              title: "Use practical developer tools",
              description:
                "Jump into focused utilities for JSON, Git, timestamps, QR codes, README drafts, prompts, and more.",
              icon: Wrench,
            },
          ].map((feature) => (
            <article
              key={feature.title}
              className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <feature.icon aria-hidden="true" className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-950">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Developer tools when you need them
            </h2>
            <p className="mt-2 max-w-2xl text-slate-600">
              The workspace is the center of the product. These small utilities
              stay nearby for quick formatting, generating, calculating, and
              checking tasks.
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
                beginners, AI-assisted development, and knowledge workflows.
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
