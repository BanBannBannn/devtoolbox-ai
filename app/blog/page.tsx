import Link from "next/link";
import { getAllBlogPosts } from "@/lib/blog";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Blog",
  description:
    "Read practical articles about developer tools, AI coding workflows, and software testing.",
  path: "/blog",
});

export default function BlogPage() {
  const articles = getAllBlogPosts();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Blog
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Developer guides and articles
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          Read focused guides for using developer utilities, improving
          AI-assisted coding workflows, and understanding common development
          concepts.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/blog/${article.slug}`}
            className="rounded-lg border border-slate-200 bg-white p-6 transition hover:border-emerald-300 hover:shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">{article.date}</p>
            <h2 className="mt-3 text-xl font-semibold text-slate-950">
              {article.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {article.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
