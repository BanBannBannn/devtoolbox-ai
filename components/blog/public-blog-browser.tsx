import Link from "next/link";
import { Search, X } from "lucide-react";
import {
  createPublicBlogQueryHref,
  type PublicBlogQuery,
} from "@/lib/blog/public-blog-query";
import type { PublicBlogPost, PublicBlogTag } from "@/lib/blog/public-posts";
import { PublicBlogCard } from "./public-blog-card";

type PublicBlogBrowserProps = {
  posts: PublicBlogPost[];
  tags: PublicBlogTag[];
  query: PublicBlogQuery;
  currentPage: number;
  pageCount: number;
  totalPosts: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export function PublicBlogBrowser({
  posts,
  tags,
  query,
  currentPage,
  pageCount,
  totalPosts,
  hasPreviousPage,
  hasNextPage,
}: PublicBlogBrowserProps) {
  const hasFilters =
    Boolean(query.q || query.tag) || query.sort !== "newest" || currentPage > 1;

  return (
    <section className="mt-10">
      <form
        action="/blog"
        className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
      >
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto]">
          <label className="relative block">
            <span className="sr-only">Search published articles</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            />
            <input
              name="q"
              type="search"
              defaultValue={query.q}
              maxLength={120}
              placeholder="Search title, excerpt, or article text"
              className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label>
            <span className="sr-only">Sort published articles</span>
            <select
              name="sort"
              defaultValue={query.sort}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
          {query.tag ? <input type="hidden" name="tag" value={query.tag} /> : null}
          <button
            type="submit"
            className="rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Apply
          </button>
        </div>
      </form>

      {tags.length > 0 ? (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <p className="mr-1 text-sm font-semibold text-slate-700">Tags</p>
          {tags.map((tag) => {
            const active = tag.slug === query.tag;

            return (
              <Link
                key={tag.slug}
                href={createPublicBlogQueryHref(query, {
                  tag: active ? "" : tag.slug,
                  page: 1,
                })}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-emerald-700 text-white"
                    : "bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
                }`}
              >
                {tag.name}
              </Link>
            );
          })}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          {totalPosts} published {totalPosts === 1 ? "article" : "articles"}
        </p>
        {hasFilters ? (
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            <X aria-hidden="true" className="size-4" />
            Clear filters
          </Link>
        ) : null}
      </div>

      {posts.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-8">
          <h2 className="text-xl font-semibold text-slate-950">
            No matching articles
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Try a different keyword or clear the active tag filter.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PublicBlogCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {pageCount > 1 ? (
        <nav
          aria-label="Blog pagination"
          className="mt-8 flex items-center justify-between gap-4"
        >
          {hasPreviousPage ? (
            <Link
              href={createPublicBlogQueryHref(query, { page: currentPage - 1 })}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Previous
            </Link>
          ) : (
            <span />
          )}
          <p className="text-sm text-slate-600">
            Page {currentPage} of {pageCount}
          </p>
          {hasNextPage ? (
            <Link
              href={createPublicBlogQueryHref(query, { page: currentPage + 1 })}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Next
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </section>
  );
}
