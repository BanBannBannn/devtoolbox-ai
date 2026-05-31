"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { PublicBlogPost } from "@/lib/blog/public-posts";
import { PublicBlogCard } from "./public-blog-card";

type PublicBlogListProps = {
  posts: PublicBlogPost[];
};

export function PublicBlogList({ posts }: PublicBlogListProps) {
  const [query, setQuery] = useState("");
  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return posts;
    }

    return posts.filter((post) =>
      [
        post.title,
        post.excerpt,
        post.contentText,
        post.authorDisplayName,
        ...post.tags.map((tag) => tag.name),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [posts, query]);

  return (
    <section className="mt-10">
      <label className="relative block max-w-xl">
        <span className="sr-only">Filter published articles</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter articles by title, topic, or tag"
          className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
      </label>

      {filteredPosts.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-8">
          <h2 className="text-xl font-semibold text-slate-950">
            No matching articles
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Try a different title, topic, or tag.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <PublicBlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  );
}
