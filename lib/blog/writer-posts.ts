import { redirect } from "next/navigation";
import { canModerateBlog, getCurrentUserRoleContext } from "../auth/roles";
import { createServerSupabaseClient } from "../supabase/server";
import {
  blogPostStatuses,
  canEditWriterPostStatus,
  canSubmitPostForReview,
  isValidSlug,
  isSafeImageUrl,
  normalizeBlogSlug,
  parseBlogPostStatus,
  type BlogPostFormIntent,
  type BlogPostStatus,
  type EditorJsonValue,
  type WriterBlogPostInput,
} from "./post-utils";

export {
  blogPostStatuses,
  canEditWriterPostStatus,
  canSubmitPostForReview,
  emptyEditorDocument,
  emptyTiptapDocument,
  extractPlainTextFromEditorJson,
  extractPlainTextFromTiptapJson,
  getBlogPostInputFromFormData,
  getInitialEditorBlocks,
  isSafeHttpUrl,
  isSafeImageUrl,
  isValidSlug,
  normalizeBlogSlug,
  parseEditorJson,
  parseBlogPostStatus,
  parseTiptapJson,
  slugifyTitle,
  type BlogPostFormIntent,
  type BlogPostStatus,
  type EditorJsonValue,
  type EditorJsonNode,
  type TipTapJsonNode,
  type WriterBlogPostInput,
} from "./post-utils";

export type WriterBlogPostRow = {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_json: EditorJsonValue;
  content_text: string;
  cover_image_url: string | null;
  status: BlogPostStatus;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BlogPostActionResult =
  | {
      success: true;
      postId: string;
    }
  | {
      success: false;
      code:
        | "auth_required"
        | "not_found"
        | "invalid_title"
        | "invalid_slug"
        | "invalid_excerpt"
        | "invalid_cover_image_url"
        | "invalid_content"
        | "forbidden_status"
        | "duplicate_slug"
        | "save_failed";
      error: string;
    };

type AuthenticatedBlogContext = {
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>;
  userId: string;
};

const writerPostFields =
  "id,author_id,title,slug,excerpt,content_json,content_text,cover_image_url,status,submitted_at,reviewed_at,reviewed_by,rejection_reason,published_at,created_at,updated_at";

export function validateBlogPostInput(
  input: WriterBlogPostInput,
): BlogPostActionResult | null {
  const title = input.title.trim();
  const slug = normalizeBlogSlug(input.slug, title);
  const excerpt = input.excerpt.trim();
  const coverImageUrl = input.coverImageUrl.trim();
  const contentText = input.contentText.trim();

  if (title.length < 1 || title.length > 120) {
    return {
      success: false,
      code: "invalid_title",
      error: "Title must be between 1 and 120 characters.",
    };
  }

  if (slug.length < 1 || slug.length > 140 || !isValidSlug(slug)) {
    return {
      success: false,
      code: "invalid_slug",
      error: "Slug must be 1 to 140 characters and use lowercase letters, numbers, and hyphens.",
    };
  }

  if (excerpt.length > 300) {
    return {
      success: false,
      code: "invalid_excerpt",
      error: "Excerpt must be 300 characters or fewer.",
    };
  }

  if (!isSafeImageUrl(coverImageUrl)) {
    return {
      success: false,
      code: "invalid_cover_image_url",
      error: "Cover image URL must use http or https.",
    };
  }

  if (input.intent === "submit_review" && !contentText) {
    return {
      success: false,
      code: "invalid_content",
      error: "Add post content before submitting for review.",
    };
  }

  return null;
}

export function normalizeBlogPostInput(input: WriterBlogPostInput) {
  const title = input.title.trim();

  return {
    title,
    slug: normalizeBlogSlug(input.slug, title),
    excerpt: input.excerpt.trim(),
    coverImageUrl: input.coverImageUrl.trim(),
    contentJson: input.contentJson,
    contentText: input.contentText.trim(),
    intent: input.intent,
  };
}

export function getBlogPostErrorMessage(code?: string) {
  switch (code) {
    case "invalid_title":
      return "Title must be between 1 and 120 characters.";
    case "invalid_slug":
      return "Slug must be 1 to 140 characters and use lowercase letters, numbers, and hyphens.";
    case "invalid_excerpt":
      return "Excerpt must be 300 characters or fewer.";
    case "invalid_cover_image_url":
      return "Cover image URL must use http or https.";
    case "invalid_content":
      return "Add post content before submitting for review.";
    case "forbidden_status":
      return "Only draft or rejected posts can be edited or submitted.";
    case "duplicate_slug":
      return "That slug is already in use. Try a different slug.";
    case "save_failed":
      return "Could not save the post. Please try again.";
    case "not_found":
      return "Post not found.";
    case "auth_required":
      return "Sign in to manage blog posts.";
    default:
      return undefined;
  }
}

async function requireAuthenticatedBlogContext(): Promise<AuthenticatedBlogContext> {
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

  return {
    supabase,
    userId: user.id,
  };
}

function isDuplicateSlugError(error: { code?: string; message?: string } | null) {
  return error?.code === "23505" || error?.message?.toLowerCase().includes("slug");
}

function createSlugCandidate(baseSlug: string, attempt: number) {
  if (attempt === 0) {
    return baseSlug;
  }

  const suffix = `-${attempt + 1}`;
  return `${baseSlug.slice(0, 140 - suffix.length)}${suffix}`;
}

function getStatusFields(intent: BlogPostFormIntent) {
  if (intent === "submit_review") {
    return {
      status: "pending_review" as BlogPostStatus,
      submitted_at: new Date().toISOString(),
      reviewed_by: null,
      reviewed_at: null,
      rejection_reason: null,
      published_at: null,
    };
  }

  return {
    status: "draft" as BlogPostStatus,
    submitted_at: null,
    reviewed_by: null,
    reviewed_at: null,
    rejection_reason: null,
    published_at: null,
  };
}

export async function listBlogPostsForCurrentUser(status?: string) {
  const { supabase } = await requireAuthenticatedBlogContext();
  const parsedStatus =
    status && blogPostStatuses.includes(status as BlogPostStatus)
      ? (status as BlogPostStatus)
      : null;
  let query = supabase
    .from("blog_posts")
    .select(writerPostFields)
    .order("updated_at", { ascending: false });

  if (parsedStatus) {
    query = query.eq("status", parsedStatus);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return (data as WriterBlogPostRow[]).map((post) => ({
    ...post,
    status: parseBlogPostStatus(post.status),
  }));
}

export async function getOwnedBlogPostForCurrentUser(id: string) {
  const { supabase, userId } = await requireAuthenticatedBlogContext();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(writerPostFields)
    .eq("id", id)
    .eq("author_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    ...(data as WriterBlogPostRow),
    status: parseBlogPostStatus((data as WriterBlogPostRow).status),
  };
}

export async function getPreviewableBlogPostForCurrentUser(id: string) {
  const { supabase, userId } = await requireAuthenticatedBlogContext();
  const roleContext = await getCurrentUserRoleContext();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(writerPostFields)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const post = {
    ...(data as WriterBlogPostRow),
    status: parseBlogPostStatus((data as WriterBlogPostRow).status),
  };

  if (post.author_id === userId || canModerateBlog(roleContext.role)) {
    return post;
  }

  return null;
}

export async function createBlogPostForCurrentUser(
  input: WriterBlogPostInput,
): Promise<BlogPostActionResult> {
  const invalidResult = validateBlogPostInput(input);

  if (invalidResult) {
    return invalidResult;
  }

  const { supabase, userId } = await requireAuthenticatedBlogContext();
  const normalized = normalizeBlogPostInput(input);
  const initialStatusFields = getStatusFields("save_draft");

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const slug = createSlugCandidate(normalized.slug, attempt);
    const { data, error } = await supabase
      .from("blog_posts")
      .insert({
        author_id: userId,
        title: normalized.title,
        slug,
        excerpt: normalized.excerpt || null,
        cover_image_url: normalized.coverImageUrl || null,
        content_json: normalized.contentJson,
        content_text: normalized.contentText,
        ...initialStatusFields,
      })
      .select("id")
      .single();

    if (!error && data) {
      const postId = (data as { id: string }).id;

      if (normalized.intent === "submit_review") {
        const { error: submitError } = await supabase
          .from("blog_posts")
          .update(getStatusFields("submit_review"))
          .eq("id", postId)
          .eq("author_id", userId);

        if (submitError) {
          return {
            success: false,
            code: "save_failed",
            error: "Could not submit the post for review. Please try again.",
          };
        }
      }

      return {
        success: true,
        postId,
      };
    }

    if (!isDuplicateSlugError(error)) {
      return {
        success: false,
        code: "save_failed",
        error: "Could not save the post. Please try again.",
      };
    }
  }

  return {
    success: false,
    code: "duplicate_slug",
    error: "That slug is already in use. Try a different slug.",
  };
}

export async function updateBlogPostForCurrentUser(
  id: string,
  input: WriterBlogPostInput,
): Promise<BlogPostActionResult> {
  const invalidResult = validateBlogPostInput(input);

  if (invalidResult) {
    return invalidResult;
  }

  const { supabase, userId } = await requireAuthenticatedBlogContext();
  const existingPost = await getOwnedBlogPostForCurrentUser(id);

  if (!existingPost) {
    return {
      success: false,
      code: "not_found",
      error: "Post not found.",
    };
  }

  if (
    !canEditWriterPostStatus(existingPost.status) ||
    (input.intent === "submit_review" &&
      !canSubmitPostForReview(existingPost.status))
  ) {
    return {
      success: false,
      code: "forbidden_status",
      error: "Only draft or rejected posts can be edited or submitted.",
    };
  }

  const normalized = normalizeBlogPostInput(input);
  const statusFields = getStatusFields(normalized.intent);

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const slug =
      attempt === 0
        ? normalized.slug
        : createSlugCandidate(normalized.slug, attempt);
    const { error } = await supabase
      .from("blog_posts")
      .update({
        title: normalized.title,
        slug,
        excerpt: normalized.excerpt || null,
        cover_image_url: normalized.coverImageUrl || null,
        content_json: normalized.contentJson,
        content_text: normalized.contentText,
        ...statusFields,
      })
      .eq("id", id)
      .eq("author_id", userId);

    if (!error) {
      return {
        success: true,
        postId: id,
      };
    }

    if (!isDuplicateSlugError(error)) {
      return {
        success: false,
        code: "save_failed",
        error: "Could not save the post. Please try again.",
      };
    }
  }

  return {
    success: false,
    code: "duplicate_slug",
    error: "That slug is already in use. Try a different slug.",
  };
}
