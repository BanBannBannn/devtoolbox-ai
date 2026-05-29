import { describe, expect, it } from "vitest";
import {
  canEditWriterPostStatus,
  canSubmitPostForReview,
  extractPlainTextFromEditorJson,
  extractPlainTextFromTiptapJson,
  getBlogPostInputFromFormData,
  getBlogPostSuccessRedirect,
  isValidSlug,
  isSafeImageUrl,
  normalizeBlogSlug,
  parseBlogPostStatus,
  slugifyTitle,
  validateBlogPostInput,
  type WriterBlogPostInput,
} from "./writer-posts";

const validInput: WriterBlogPostInput = {
  title: "My first post",
  slug: "my-first-post",
  excerpt: "A short excerpt",
  coverImageUrl: "",
  contentJson: {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: "Hello world" }],
      },
    ],
  },
  contentText: "Hello world",
  intent: "save_draft",
};

describe("writer blog post helpers", () => {
  it("generates URL-safe slugs from titles", () => {
    expect(slugifyTitle(" Hello, Next.js + RAG! ")).toBe("hello-next-js-rag");
    expect(slugifyTitle("Đây là bài viết")).toBe("ay-la-bai-viet");
  });

  it("validates safe slugs", () => {
    expect(isValidSlug("hello-next-js")).toBe(true);
    expect(isValidSlug("Hello")).toBe(false);
    expect(isValidSlug("bad_slug")).toBe(false);
    expect(isValidSlug("-bad")).toBe(false);
  });

  it("validates safe image URLs", () => {
    expect(isSafeImageUrl("")).toBe(true);
    expect(isSafeImageUrl("https://example.com/image.png")).toBe(true);
    expect(isSafeImageUrl("http://example.com/image.webp")).toBe(true);
    expect(isSafeImageUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeImageUrl("data:image/png;base64,abc")).toBe(false);
    expect(isSafeImageUrl("ftp://example.com/image.png")).toBe(false);
  });

  it("normalizes blank slug from title", () => {
    expect(normalizeBlogSlug("", "My Draft Post")).toBe("my-draft-post");
  });

  it("extracts plain text from Tiptap JSON", () => {
    expect(
      extractPlainTextFromTiptapJson({
        type: "doc",
        content: [
          {
            type: "heading",
            content: [{ type: "text", text: "Heading" }],
          },
          {
            type: "paragraph",
            content: [
              { type: "text", text: "First" },
              { type: "text", text: " paragraph" },
            ],
          },
        ],
      }),
    ).toBe("Heading\nFirst paragraph");
  });

  it("extracts plain text from editor JSON blocks", () => {
    expect(
      extractPlainTextFromEditorJson([
        {
          type: "heading",
          props: { level: 2 },
          content: [{ type: "text", text: "Heading", styles: { bold: true } }],
          children: [],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "First", styles: {} },
            { type: "text", text: " paragraph", styles: {} },
          ],
          children: [],
        },
      ]),
    ).toBe("Heading\nFirst paragraph");
  });

  it("allows minimal drafts but requires content for review submission", () => {
    expect(
      validateBlogPostInput({
        ...validInput,
        contentText: "",
        intent: "save_draft",
      }),
    ).toBeNull();
    expect(
      validateBlogPostInput({
        ...validInput,
        contentText: "",
        intent: "submit_review",
      }),
    ).toMatchObject({
      success: false,
      code: "invalid_content",
    });
  });

  it("validates title and excerpt limits", () => {
    expect(validateBlogPostInput({ ...validInput, title: "" })).toMatchObject({
      success: false,
      code: "invalid_title",
    });
    expect(
      validateBlogPostInput({ ...validInput, excerpt: "a".repeat(301) }),
    ).toMatchObject({
      success: false,
      code: "invalid_excerpt",
    });
    expect(
      validateBlogPostInput({
        ...validInput,
        coverImageUrl: "javascript:alert(1)",
      }),
    ).toMatchObject({
      success: false,
      code: "invalid_cover_image_url",
    });
  });

  it("allows only draft and rejected posts to move through writer edits", () => {
    expect(canEditWriterPostStatus("draft")).toBe(true);
    expect(canEditWriterPostStatus("rejected")).toBe(true);
    expect(canEditWriterPostStatus("pending_review")).toBe(false);
    expect(canEditWriterPostStatus("published")).toBe(false);
    expect(canSubmitPostForReview("draft")).toBe(true);
    expect(canSubmitPostForReview("rejected")).toBe(true);
    expect(canSubmitPostForReview("published")).toBe(false);
  });

  it("parses unknown statuses as draft", () => {
    expect(parseBlogPostStatus("archived")).toBe("archived");
    expect(parseBlogPostStatus("owner_only")).toBe("draft");
  });

  it("builds input from form data without trusting client status", () => {
    const formData = new FormData();
    formData.set("title", "Post");
    formData.set("slug", "");
    formData.set("excerpt", "Excerpt");
    formData.set("cover_image_url", "https://example.com/cover.png");
    formData.set(
      "content_json",
      JSON.stringify([
        {
          type: "paragraph",
          content: [{ type: "text", text: "Body", styles: {} }],
          children: [],
        },
      ]),
    );
    formData.set("status", "published");
    formData.set("intent", "submit_review");

    expect(getBlogPostInputFromFormData(formData)).toMatchObject({
      title: "Post",
      slug: "",
      excerpt: "Excerpt",
      coverImageUrl: "https://example.com/cover.png",
      contentText: "Body",
      intent: "submit_review",
    });
  });

  it("keeps submit-for-review redirects inside the dashboard flow", () => {
    expect(
      getBlogPostSuccessRedirect({
        postId: "post-1",
        intent: "submit_review",
        action: "create",
      }),
    ).toBe("/dashboard/blog?message=submitted");
    expect(
      getBlogPostSuccessRedirect({
        postId: "post-1",
        intent: "submit_review",
        action: "update",
      }),
    ).toBe("/dashboard/blog?message=submitted");
  });

  it("keeps draft save redirects on editable dashboard routes", () => {
    expect(
      getBlogPostSuccessRedirect({
        postId: "post-1",
        intent: "save_draft",
        action: "create",
      }),
    ).toBe("/dashboard/blog/post-1/edit?message=created");
    expect(
      getBlogPostSuccessRedirect({
        postId: "post-1",
        intent: "save_draft",
        action: "update",
      }),
    ).toBe("/dashboard/blog/post-1/edit?message=saved");
  });
});
