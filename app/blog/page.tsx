import Link from "next/link";
import { getPublishedBlogPosts } from "@/lib/blog/public-posts";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Developer Knowledge Blog",
  description:
    "Read published developer articles from the DevToolBox AI knowledge platform.",
  path: "/blog",
});

function formatDate(date: string | null) {
  if (!date) {
    return "Published";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Blog
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Developer knowledge from the community
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          Read published guides, notes, and project knowledge from DevToolBox AI.
          Writing, moderation, likes, comments, and bookmarks are coming in the
          next phases.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-slate-300 bg-white p-8">
          <h2 className="text-xl font-semibold text-slate-950">
            No published posts yet
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Published database-backed blog posts will appear here after they are
            approved. Existing static markdown articles are kept as legacy
            seed/reference content but are no longer the public source of truth.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:border-emerald-300 hover:shadow-sm"
            >
              {post.coverImageUrl ? (
                <div className="aspect-[16/9] w-full bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.coverImageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}
              <div className="p-6">
                <p className="text-sm font-medium text-slate-500">
                  {formatDate(post.publishedAt)} by {post.authorDisplayName}
                </p>
                <h2 className="mt-3 text-xl font-semibold text-slate-950">
                  {post.title}
                </h2>
                {post.excerpt ? (
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {post.excerpt}
                  </p>
                ) : null}
                {post.tags.length > 0 ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag.slug}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
