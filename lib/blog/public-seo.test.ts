import { describe, expect, it } from "vitest";
import {
  createPublicBlogPostMetadata,
  getPublicBlogPostDescription,
  getPublicBlogShareUrl,
  getPublishedBlogSitemapPaths,
} from "./public-seo";

const publishedPost = {
  id: "post-1",
  title: "Reliable TypeScript",
  slug: "reliable-typescript",
  excerpt: "",
  contentJson: [],
  contentText: "A practical guide to reliable TypeScript workflows.",
  coverImageUrl: "https://example.com/cover.webp",
  publishedAt: "2026-05-31T00:00:00.000Z",
  authorDisplayName: "Ada",
  tags: [{ name: "TypeScript", slug: "typescript" }],
};

describe("public blog SEO helpers", () => {
  it("uses trimmed content text as a safe metadata description fallback", () => {
    expect(
      getPublicBlogPostDescription({
        excerpt: "",
        contentText: "  Useful\n\n developer   notes. ",
      }),
    ).toBe("Useful developer notes.");
  });

  it("maps safe published post metadata without private fields", () => {
    const metadata = createPublicBlogPostMetadata(publishedPost);

    expect(metadata.description).toBe(
      "A practical guide to reliable TypeScript workflows.",
    );
    expect(metadata.authors).toEqual([{ name: "Ada" }]);
    expect(metadata.openGraph).toMatchObject({
      type: "article",
      publishedTime: "2026-05-31T00:00:00.000Z",
      authors: ["Ada"],
      tags: ["TypeScript"],
    });
    expect(metadata).not.toHaveProperty("email");
  });

  it("excludes unpublished posts and tags from sitemap paths", () => {
    expect(
      getPublishedBlogSitemapPaths([
        {
          slug: "published",
          status: "published",
          tags: [{ slug: "typescript" }],
        },
        {
          slug: "draft",
          status: "draft",
          tags: [{ slug: "private-tag" }],
        },
      ]),
    ).toEqual(["/blog/published", "/blog/tags/typescript"]);
  });

  it("builds sharing URLs only under the public blog path", () => {
    expect(
      getPublicBlogShareUrl("https://example.com/", "reliable typescript"),
    ).toBe("https://example.com/blog/reliable%20typescript");
  });
});
