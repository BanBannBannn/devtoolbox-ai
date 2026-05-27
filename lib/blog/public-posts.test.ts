import { describe, expect, it } from "vitest";
import {
  getContentTextParagraphs,
  getPublishedStatusFilter,
  mapPublicBlogPost,
} from "./public-posts";

describe("public blog post helpers", () => {
  it("maps public posts without private author fields", () => {
    const post = mapPublicBlogPost(
      {
        id: "post-1",
        title: "Published post",
        slug: "published-post",
        excerpt: "Short excerpt",
        content_text: "Body",
        cover_image_url: "https://example.com/cover.png",
        published_at: "2026-05-27T00:00:00.000Z",
        author_id: "user-1",
      },
      [{ name: "Next.js", slug: "nextjs" }],
      "Ada",
    );

    expect(post).toEqual({
      id: "post-1",
      title: "Published post",
      slug: "published-post",
      excerpt: "Short excerpt",
      contentText: "Body",
      coverImageUrl: "https://example.com/cover.png",
      publishedAt: "2026-05-27T00:00:00.000Z",
      authorDisplayName: "Ada",
      tags: [{ name: "Next.js", slug: "nextjs" }],
    });
    expect(post).not.toHaveProperty("author_id");
    expect(post).not.toHaveProperty("email");
  });

  it("falls back to safe defaults for nullable public fields", () => {
    const post = mapPublicBlogPost({
      id: "post-1",
      title: "Published post",
      slug: "published-post",
      excerpt: null,
      content_text: null,
      cover_image_url: null,
      published_at: null,
      author_id: "user-1",
    });

    expect(post.excerpt).toBe("");
    expect(post.contentText).toBe("");
    expect(post.coverImageUrl).toBeNull();
    expect(post.authorDisplayName).toBe("DevToolBox AI contributor");
  });

  it("keeps the public query filter pinned to published posts", () => {
    expect(getPublishedStatusFilter()).toEqual({
      column: "status",
      value: "published",
    });
  });

  it("turns content text into safe paragraphs", () => {
    expect(
      getContentTextParagraphs(
        "First paragraph\r\nstill first.\r\n\r\n<script>alert(1)</script>\n\nLast",
      ),
    ).toEqual([
      "First paragraph still first.",
      "<script>alert(1)</script>",
      "Last",
    ]);
  });
});
