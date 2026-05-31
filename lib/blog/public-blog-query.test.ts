import { describe, expect, it } from "vitest";
import type { PublicBlogPost } from "./public-posts";
import {
  createPublicBlogQueryHref,
  filterAndSortPublishedBlogPosts,
  getPublishedBlogTags,
  paginatePublicBlogPosts,
  parsePublicBlogQuery,
  parsePublicBlogSort,
} from "./public-blog-query";

const posts: PublicBlogPost[] = [
  {
    id: "new",
    title: "RAG with Supabase",
    slug: "rag-with-supabase",
    excerpt: "Retrieval notes",
    contentJson: [],
    contentText: "Vector search guide",
    coverImageUrl: null,
    publishedAt: "2026-05-30T00:00:00.000Z",
    authorDisplayName: "Ada",
    tags: [{ name: "Supabase", slug: "supabase" }],
  },
  {
    id: "old",
    title: "Next.js routing",
    slug: "nextjs-routing",
    excerpt: "App Router notes",
    contentJson: [],
    contentText: "Server component guide",
    coverImageUrl: null,
    publishedAt: "2026-05-20T00:00:00.000Z",
    authorDisplayName: "Grace",
    tags: [{ name: "Next.js", slug: "nextjs" }],
  },
];

describe("public blog query helpers", () => {
  it("parses trimmed query params with safe fallbacks", () => {
    expect(
      parsePublicBlogQuery({
        q: "  rag  ",
        tag: " Supabase ",
        sort: "unexpected",
        page: "-2",
      }),
    ).toEqual({
      q: "rag",
      tag: "supabase",
      sort: "newest",
      page: 1,
    });
    expect(parsePublicBlogSort("oldest")).toBe("oldest");
  });

  it("handles an empty search query as the normal published list", () => {
    expect(
      filterAndSortPublishedBlogPosts(
        posts,
        parsePublicBlogQuery({ q: "   " }),
      ).map((post) => post.id),
    ).toEqual(["new", "old"]);
  });

  it("combines case-insensitive keyword and tag filtering", () => {
    expect(
      filterAndSortPublishedBlogPosts(posts, {
        q: "VECTOR",
        tag: "supabase",
        sort: "newest",
        page: 1,
      }).map((post) => post.id),
    ).toEqual(["new"]);
  });

  it("sorts oldest posts first when requested", () => {
    expect(
      filterAndSortPublishedBlogPosts(posts, {
        q: "",
        tag: "",
        sort: "oldest",
        page: 1,
      }).map((post) => post.id),
    ).toEqual(["old", "new"]);
  });

  it("lists only tags attached to supplied published posts", () => {
    expect(getPublishedBlogTags([posts[0]])).toEqual([
      { name: "Supabase", slug: "supabase" },
    ]);
  });

  it("paginates results and preserves URL state", () => {
    const pagination = paginatePublicBlogPosts(posts, 2, 1);

    expect(pagination.posts.map((post) => post.id)).toEqual(["old"]);
    expect(pagination.hasPreviousPage).toBe(true);
    expect(
      createPublicBlogQueryHref(
        { q: "rag", tag: "supabase", sort: "oldest", page: 1 },
        { page: 2 },
      ),
    ).toBe("/blog?q=rag&tag=supabase&sort=oldest&page=2");
  });
});
