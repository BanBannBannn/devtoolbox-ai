import Link from "next/link";
import { Bookmark } from "lucide-react";
import { redirect } from "next/navigation";
import { listUserBookmarks } from "@/lib/blog/post-interactions";
import { createMetadata } from "@/lib/seo";
import {
  createServerSupabaseClient,
  getSupabaseServerEnv,
} from "@/lib/supabase/server";

export const metadata = createMetadata({
  title: "Saved Blog Posts",
  description: "View your saved DevToolBox AI blog posts.",
  path: "/dashboard/bookmarks",
});

function formatDate(value: string | null) {
  if (!value) {
    return "Saved";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function DashboardBookmarksPage() {
  const authConfig = getSupabaseServerEnv();

  if (!authConfig.isConfigured) {
    redirect("/login?error=auth_config");
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    redirect("/login?error=auth_config");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const bookmarks = await listUserBookmarks(user.id);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Back to dashboard
          </Link>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
            Saved posts
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Your private list of bookmarked published blog posts. Removed or
            unpublished posts are hidden from this list.
          </p>
        </div>
        <Link
          href="/blog"
          className="inline-flex justify-center rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Browse blog
        </Link>
      </div>

      {bookmarks.length === 0 ? (
        <section className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <Bookmark aria-hidden="true" className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-slate-950">
            No saved posts yet
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Bookmark published blog posts to build your personal reading list.
          </p>
          <Link
            href="/blog"
            className="mt-6 inline-flex rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Explore posts
          </Link>
        </section>
      ) : (
        <section className="mt-8 grid gap-5 md:grid-cols-2">
          {bookmarks.map(({ post, bookmarkedAt }) => (
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
                  Saved {formatDate(bookmarkedAt)}
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
        </section>
      )}
    </div>
  );
}
