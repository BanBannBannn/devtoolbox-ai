import { describe, expect, it } from "vitest";
import {
  BLOG_IMAGE_MAX_BYTES,
  createBlogImageStoragePath,
  isEditableBlogImagePostStatus,
  sanitizeBlogImageStorageSegment,
  validateBlogImageFile,
} from "./image-upload";

describe("blog image upload helpers", () => {
  it("accepts JPEG, PNG, and WebP files under 5MB", () => {
    expect(validateBlogImageFile({ type: "image/jpeg", size: 1024 })).toMatchObject({
      success: true,
      mimeType: "image/jpeg",
    });
    expect(validateBlogImageFile({ type: "image/png", size: 1024 })).toMatchObject({
      success: true,
      mimeType: "image/png",
    });
    expect(validateBlogImageFile({ type: "image/webp", size: 1024 })).toMatchObject({
      success: true,
      mimeType: "image/webp",
    });
  });

  it("rejects SVG, non-images, empty files, and oversized files", () => {
    expect(validateBlogImageFile({ type: "image/svg+xml", size: 1024 })).toMatchObject({
      success: false,
      code: "invalid_type",
    });
    expect(validateBlogImageFile({ type: "text/plain", size: 1024 })).toMatchObject({
      success: false,
      code: "invalid_type",
    });
    expect(validateBlogImageFile({ type: "image/png", size: 0 })).toMatchObject({
      success: false,
      code: "empty_file",
    });
    expect(
      validateBlogImageFile({ type: "image/png", size: BLOG_IMAGE_MAX_BYTES + 1 }),
    ).toMatchObject({
      success: false,
      code: "too_large",
    });
  });

  it("creates storage paths scoped by user and post", () => {
    expect(
      createBlogImageStoragePath({
        userId: "user-1",
        postId: "post-1",
        mimeType: "image/webp",
        randomId: "abc",
      }),
    ).toBe("user-1/post-1/abc.webp");
  });

  it("sanitizes storage segments instead of trusting filenames or path separators", () => {
    expect(sanitizeBlogImageStorageSegment(" original file/name?.png ")).toBe(
      "original-file-name-png",
    );
    expect(
      createBlogImageStoragePath({
        userId: "user/1",
        postId: "post 1",
        mimeType: "image/jpeg",
        randomId: "random?.jpg",
      }),
    ).toBe("user-1/post-1/random-jpg.jpg");
  });

  it("allows image uploads only for editable writer post statuses", () => {
    expect(isEditableBlogImagePostStatus("draft")).toBe(true);
    expect(isEditableBlogImagePostStatus("rejected")).toBe(true);
    expect(isEditableBlogImagePostStatus("pending_review")).toBe(false);
    expect(isEditableBlogImagePostStatus("published")).toBe(false);
    expect(isEditableBlogImagePostStatus("archived")).toBe(false);
  });
});
