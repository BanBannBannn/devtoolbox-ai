import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  BookOpenText,
  FileText,
  Heart,
  MessageSquareText,
  PenLine,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { PublicBlogCard } from "@/components/blog/public-blog-card";
import { HeroVisual } from "@/components/hero-visual";
import { ToolCard } from "@/components/tool-card";
import { getPublishedBlogPosts } from "@/lib/blog/public-posts";
import { createMetadata } from "@/lib/seo";
import { getFeaturedTools } from "@/lib/tools";

const pageTitle = "DevToolBox AI - Developer Knowledge Platform with AI Workspace";
const pageDescription =
  "Read and publish developer articles, chat with your own knowledge base, and use practical developer tools in one workspace.";
const baseMetadata = createMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/",
});

export const metadata = {
  ...baseMetadata,
  title: pageTitle,
  openGraph: {
    ...baseMetadata.openGraph,
    title: pageTitle,
  },
  twitter: {
    ...baseMetadata.twitter,
    title: pageTitle,
  },
};

export default async function HomePage() {
  const [publishedPosts, featuredTools] = await Promise.all([
    getPublishedBlogPosts(),
    Promise.resolve(getFeaturedTools()),
  ]);
  const latestPosts = publishedPosts.slice(0, 3);

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
              <BookOpenText aria-hidden="true" className="h-4 w-4" />
              Developer knowledge platform
            </div>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Write, share, and explore developer knowledge with AI.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Read developer articles, publish your own technical notes, save
              documents, chat with your knowledge base, and use practical tools
              when you need them.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Explore Blog
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard/blog/new"
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100"
              >
                <PenLine aria-hidden="true" className="h-4 w-4" />
                Start Writing
              </Link>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                ["Blog", "community articles"],
                ["Workspace", "document chat"],
                ["Tools", "quick utilities"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-lg border border-slate-200 bg-white/80 p-4 shadow-sm"
                >
                  <p className="text-lg font-semibold text-slate-950">{value}</p>
                  <p className="mt-1 text-sm text-slate-600">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <HeroVisual />
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                Latest knowledge
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Explore developer articles
              </h2>
              <p className="mt-2 max-w-2xl text-slate-600">
                Read published technical notes, practical guides, and AI
                workflow ideas from the community.
              </p>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              View all articles
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
          {latestPosts.length > 0 ? (
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {latestPosts.map((post) => (
                <PublicBlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-6">
              <p className="text-sm leading-6 text-slate-600">
                Published community articles will appear here after moderator
                review. The writing workspace is ready for the first posts.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Write and share technical knowledge
            </h2>
            <p className="mt-3 text-slate-600">
              Turn useful lessons into articles, send drafts through review,
              and keep the public knowledge base thoughtful and useful.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Publish developer articles",
                description:
                  "Draft technical notes with a polished editor, preview your work, and submit articles for moderation.",
                icon: PenLine,
              },
              {
                title: "Keep useful posts nearby",
                description:
                  "Like thoughtful articles, bookmark references, and join discussions through public comments.",
                icon: Bookmark,
              },
              {
                title: "Build a moderated community",
                description:
                  "Reports and moderator review help keep published knowledge relevant and respectful.",
                icon: ShieldCheck,
              },
            ].map((feature) => (
              <article
                key={feature.title}
                className="rounded-lg border border-slate-200 bg-slate-50 p-6"
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
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard/blog/new"
              className="inline-flex items-center gap-2 rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Start writing
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard/bookmarks"
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              <Heart aria-hidden="true" className="h-4 w-4" />
              Open saved posts
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            AI workspace
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Chat with your own project documents
          </h2>
          <p className="mt-3 leading-7 text-slate-600">
            Save Markdown or text documents, turn them into searchable
            knowledge, and ask questions against your own project context.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard/rag-chat"
              className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <MessageSquareText aria-hidden="true" className="h-4 w-4" />
              Open RAG Chat
            </Link>
            <Link
              href="/dashboard/documents"
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              <FileText aria-hidden="true" className="h-4 w-4" />
              Manage documents
            </Link>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["Documents", "Save project notes, specs, and checklists."],
            ["Vectorization", "Prepare saved content for retrieval."],
            ["RAG Chat", "Ask questions with cited document sources."],
            ["Sessions", "Return to earlier knowledge conversations."],
          ].map(([title, description]) => (
            <article
              key={title}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h3 className="font-semibold text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {description}
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
                Practical developer tools
              </h2>
              <p className="mt-2 max-w-2xl text-slate-600">
                Use focused utilities for quick formatting, generating,
                calculating, and checking tasks without losing your flow.
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
          <div className="mt-8">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              <Wrench aria-hidden="true" className="h-4 w-4" />
              Explore tools
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
