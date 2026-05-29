import { describe, expect, it } from "vitest";
import {
  getDisplayLikeCount,
  getInteractionErrorMessage,
  mapBookmarkListItems,
} from "./post-interactions";
import type { PublicBlogPost } from "./public-posts";

const publishedPost: PublicBlogPost = {
  id: "post-1",
  title: "Published post",
  slug: "published-post",
  excerpt: "Short excerpt",
  contentJson: [],
  contentText: "Body",
  coverImageUrl: null,
  publishedAt: "2026-05-29T00:00:00.000Z",
  authorDisplayName: "Ada",
  tags: [],
};

describe("blog post interaction helpers", () => {
  it("normalizes like count display fallbacks", () => {
    expect(getDisplayLikeCount(12)).toBe(12);
    expect(getDisplayLikeCount(12.8)).toBe(12);
    expect(getDisplayLikeCount(null)).toBe(0);
    expect(getDisplayLikeCount(-2)).toBe(0);
    expect(getDisplayLikeCount(Number.NaN)).toBe(0);
  });

  it("maps bookmarks to published posts only", () => {
    expect(
      mapBookmarkListItems({
        bookmarks: [
          {
            post_id: "post-1",
            created_at: "2026-05-29T00:00:00.000Z",
          },
          {
            post_id: "unpublished-post",
            created_at: "2026-05-28T00:00:00.000Z",
          },
        ],
        posts: [publishedPost],
      }),
    ).toEqual([
      {
        post: publishedPost,
        bookmarkedAt: "2026-05-29T00:00:00.000Z",
      },
    ]);
  });

  it("keeps bookmark mapping free of private fields", () => {
    const [item] = mapBookmarkListItems({
      bookmarks: [
        {
          post_id: "post-1",
          created_at: "2026-05-29T00:00:00.000Z",
        },
      ],
      posts: [publishedPost],
    });

    expect(item.post).not.toHaveProperty("author_id");
    expect(item.post).not.toHaveProperty("email");
    expect(item).not.toHaveProperty("user_id");
  });

  it("maps safe interaction error messages", () => {
    expect(getInteractionErrorMessage("auth_required")).toBe(
      "Sign in to like or bookmark posts.",
    );
    expect(getInteractionErrorMessage("not_found")).toBe(
      "This post is not available for likes or bookmarks.",
    );
    expect(getInteractionErrorMessage("unknown")).toBeUndefined();
  });
});
