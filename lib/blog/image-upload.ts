export const BLOG_IMAGE_BUCKET = "blog-images";
export const BLOG_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const blogImageMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type BlogImageMimeType = (typeof blogImageMimeTypes)[number];

export type BlogImageValidationInput = {
  type?: string;
  size?: number;
};

export type BlogImageValidationResult =
  | {
      success: true;
      mimeType: BlogImageMimeType;
    }
  | {
      success: false;
      code: "invalid_type" | "too_large" | "empty_file";
      error: string;
    };

export function isAllowedBlogImageMimeType(
  value: string | undefined,
): value is BlogImageMimeType {
  return blogImageMimeTypes.includes(value as BlogImageMimeType);
}

export function validateBlogImageFile(
  file: BlogImageValidationInput,
): BlogImageValidationResult {
  if (!file.size || file.size <= 0) {
    return {
      success: false,
      code: "empty_file",
      error: "Choose a non-empty image file.",
    };
  }

  if (file.size > BLOG_IMAGE_MAX_BYTES) {
    return {
      success: false,
      code: "too_large",
      error: "Images must be 5MB or smaller.",
    };
  }

  if (!isAllowedBlogImageMimeType(file.type)) {
    return {
      success: false,
      code: "invalid_type",
      error: "Images must be JPEG, PNG, or WebP. SVG files are not allowed.",
    };
  }

  return {
    success: true,
    mimeType: file.type,
  };
}

export function getBlogImageFileExtension(mimeType: BlogImageMimeType) {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
  }
}

export function isEditableBlogImagePostStatus(status: string | null | undefined) {
  return status === "draft" || status === "rejected";
}

export function createBlogImageStoragePath({
  userId,
  postId,
  mimeType,
  randomId,
}: {
  userId: string;
  postId: string;
  mimeType: BlogImageMimeType;
  randomId: string;
}) {
  return `${userId}/${postId}/${randomId}.${getBlogImageFileExtension(mimeType)}`;
}
