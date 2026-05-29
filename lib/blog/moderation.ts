import { redirect } from "next/navigation";
import {
  RoleAuthenticationError,
  RolePermissionError,
  requireModeratorOrAdmin,
} from "../auth/roles";
import { createServerSupabaseClient } from "../supabase/server";
import {
  parseBlogPostStatus,
  type BlogPostStatus,
  type EditorJsonValue,
} from "./post-utils";

export type ModerationBlogPostRow = {
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
  authorDisplayName: string;
};

export type ModerationActionResult =
  | {
      success: true;
      postId: string;
    }
  | {
      success: false;
      code:
        | "auth_required"
        | "forbidden"
        | "not_found"
        | "invalid_status"
        | "invalid_rejection_reason"
        | "save_failed";
      error: string;
    };

const moderationPostFields =
  "id,author_id,title,slug,excerpt,content_json,content_text,cover_image_url,status,submitted_at,reviewed_at,reviewed_by,rejection_reason,published_at,created_at,updated_at";

const moderationStatuses: BlogPostStatus[] = [
  "pending_review",
  "published",
  "rejected",
  "archived",
];

const fallbackAuthorName = "DevToolBox AI contributor";

export function validateRejectionReason(reason: string) {
  const trimmedReason = reason.trim();

  if (trimmedReason.length < 1 || trimmedReason.length > 1000) {
    return {
      success: false as const,
      error: "Rejection reason must be between 1 and 1000 characters.",
    };
  }

  return {
    success: true as const,
    reason: trimmedReason,
  };
}

export function canPublishFromStatus(status: BlogPostStatus) {
  return status === "pending_review";
}

export function canRejectFromStatus(status: BlogPostStatus) {
  return status === "pending_review";
}

export function canArchiveFromStatus(status: BlogPostStatus) {
  return status === "published";
}

export function getModerationErrorMessage(code?: string) {
  switch (code) {
    case "auth_required":
      return "Sign in as a moderator or admin to review blog posts.";
    case "forbidden":
      return "You do not have permission to review blog posts.";
    case "not_found":
      return "Post not found.";
    case "invalid_status":
      return "That post cannot move through the requested moderation action.";
    case "invalid_rejection_reason":
      return "Rejection reason must be between 1 and 1000 characters.";
    case "save_failed":
      return "Could not update the post. Please try again.";
    default:
      return undefined;
  }
}

async function requireModerationContext() {
  let roleContext;

  try {
    roleContext = await requireModeratorOrAdmin();
  } catch (error) {
    if (error instanceof RoleAuthenticationError) {
      redirect("/login");
    }

    if (error instanceof RolePermissionError) {
      return {
        success: false as const,
        code: "forbidden" as const,
        error: "You do not have permission to review blog posts.",
      };
    }

    throw error;
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    redirect("/login?error=auth_config");
  }

  return {
    success: true as const,
    supabase,
    userId: roleContext.userId,
  };
}

async function getAuthorNamesById(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>,
  authorIds: string[],
) {
  const namesById = new Map<string, string>();

  if (authorIds.length === 0) {
    return namesById;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id,display_name")
    .in("id", authorIds);

  if (error || !data) {
    return namesById;
  }

  for (const profile of data as Array<{ id: string; display_name: string | null }>) {
    const displayName = profile.display_name?.trim();

    if (displayName) {
      namesById.set(profile.id, displayName);
    }
  }

  return namesById;
}

export async function listModerationBlogPosts(status?: string) {
  const context = await requireModerationContext();

  if (!context.success) {
    return [];
  }

  const parsedStatus = moderationStatuses.includes(status as BlogPostStatus)
    ? (status as BlogPostStatus)
    : null;
  let query = context.supabase
    .from("blog_posts")
    .select(moderationPostFields)
    .in("status", moderationStatuses)
    .order("submitted_at", { ascending: true, nullsFirst: false })
    .order("updated_at", { ascending: false });

  if (parsedStatus) {
    query = query.eq("status", parsedStatus);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  const rows = (data as ModerationBlogPostRow[]).map((post) => ({
    ...post,
    status: parseBlogPostStatus(post.status),
  }));
  const authorIds = Array.from(new Set(rows.map((post) => post.author_id)));
  const authorNamesById = await getAuthorNamesById(context.supabase, authorIds);

  return rows.map((post) => ({
    ...post,
    authorDisplayName:
      authorNamesById.get(post.author_id) ?? fallbackAuthorName,
  }));
}

async function getModeratablePost(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>,
  id: string,
) {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id,status,published_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    id: String(data.id),
    status: parseBlogPostStatus(data.status),
    published_at:
      typeof data.published_at === "string" ? data.published_at : null,
  };
}

export async function publishBlogPostForReview(
  id: string,
): Promise<ModerationActionResult> {
  const context = await requireModerationContext();

  if (!context.success) {
    return context;
  }

  const post = await getModeratablePost(context.supabase, id);

  if (!post) {
    return {
      success: false,
      code: "not_found",
      error: "Post not found.",
    };
  }

  if (!canPublishFromStatus(post.status)) {
    return {
      success: false,
      code: "invalid_status",
      error: "Only pending review posts can be published.",
    };
  }

  const now = new Date().toISOString();
  const { error } = await context.supabase
    .from("blog_posts")
    .update({
      status: "published",
      reviewed_by: context.userId,
      reviewed_at: now,
      published_at: post.published_at ?? now,
      rejection_reason: null,
    })
    .eq("id", id);

  if (error) {
    return {
      success: false,
      code: "save_failed",
      error: "Could not publish the post. Please try again.",
    };
  }

  return {
    success: true,
    postId: id,
  };
}

export async function rejectBlogPostForReview(
  id: string,
  rejectionReason: string,
): Promise<ModerationActionResult> {
  const context = await requireModerationContext();

  if (!context.success) {
    return context;
  }

  const validatedReason = validateRejectionReason(rejectionReason);

  if (!validatedReason.success) {
    return {
      success: false,
      code: "invalid_rejection_reason",
      error: validatedReason.error,
    };
  }

  const post = await getModeratablePost(context.supabase, id);

  if (!post) {
    return {
      success: false,
      code: "not_found",
      error: "Post not found.",
    };
  }

  if (!canRejectFromStatus(post.status)) {
    return {
      success: false,
      code: "invalid_status",
      error: "Only pending review posts can be rejected.",
    };
  }

  const now = new Date().toISOString();
  const { error } = await context.supabase
    .from("blog_posts")
    .update({
      status: "rejected",
      reviewed_by: context.userId,
      reviewed_at: now,
      rejection_reason: validatedReason.reason,
      published_at: null,
    })
    .eq("id", id);

  if (error) {
    return {
      success: false,
      code: "save_failed",
      error: "Could not reject the post. Please try again.",
    };
  }

  return {
    success: true,
    postId: id,
  };
}

export async function archivePublishedBlogPost(
  id: string,
): Promise<ModerationActionResult> {
  const context = await requireModerationContext();

  if (!context.success) {
    return context;
  }

  const post = await getModeratablePost(context.supabase, id);

  if (!post) {
    return {
      success: false,
      code: "not_found",
      error: "Post not found.",
    };
  }

  if (!canArchiveFromStatus(post.status)) {
    return {
      success: false,
      code: "invalid_status",
      error: "Only published posts can be archived.",
    };
  }

  const { error } = await context.supabase
    .from("blog_posts")
    .update({
      status: "archived",
      reviewed_by: context.userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return {
      success: false,
      code: "save_failed",
      error: "Could not archive the post. Please try again.",
    };
  }

  return {
    success: true,
    postId: id,
  };
}
