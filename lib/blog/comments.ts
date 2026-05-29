import {
  RoleAuthenticationError,
  RolePermissionError,
  requireModeratorOrAdmin,
} from "../auth/roles";
import {
  createServerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "../supabase/server";

export type PublicBlogComment = {
  id: string;
  content: string;
  authorDisplayName: string;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  canManage: boolean;
};

export type ModerationCommentStatus = "visible" | "hidden" | "removed";

export type ModerationComment = {
  id: string;
  postId: string;
  postTitle: string;
  postSlug: string;
  authorDisplayName: string;
  content: string;
  status: ModerationCommentStatus;
  createdAt: string;
  updatedAt: string;
  reportCount: number;
};

export type CommentActionResult =
  | {
      success: true;
      slug: string;
    }
  | {
      success: false;
      code:
        | "auth_required"
        | "invalid_comment"
        | "invalid_status"
        | "not_found"
        | "forbidden"
        | "storage_unavailable"
        | "save_failed";
      error: string;
    };

type CommentRow = {
  id: string;
  user_id: string;
  content: string;
  status: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
};

type ModerationCommentRow = CommentRow & {
  post_id: string;
};

type PublishedPostReference = {
  id: string;
  slug: string;
};

const fallbackCommentAuthor = "DevToolBox AI reader";

export function validateCommentContent(content: string) {
  const trimmed = content.trim();

  if (trimmed.length < 1 || trimmed.length > 2000) {
    return {
      success: false as const,
      error: "Comment must be between 1 and 2000 characters.",
    };
  }

  return {
    success: true as const,
    content: trimmed,
  };
}

export function getCommentErrorMessage(code?: string) {
  switch (code) {
    case "auth_required":
      return "Sign in to comment.";
    case "invalid_comment":
      return "Comment must be between 1 and 2000 characters.";
    case "invalid_status":
      return "Select a valid comment moderation status.";
    case "not_found":
      return "This published post or visible comment was not found.";
    case "forbidden":
      return "You can only edit or delete your own visible comments.";
    case "storage_unavailable":
      return "Comment storage is not configured.";
    case "save_failed":
      return "Could not save the comment. Please try again.";
    default:
      return undefined;
  }
}

export function isModerationCommentStatus(
  value: unknown,
): value is ModerationCommentStatus {
  return value === "visible" || value === "hidden" || value === "removed";
}

function isEditedComment(createdAt: string, updatedAt: string) {
  return new Date(updatedAt).getTime() > new Date(createdAt).getTime() + 1000;
}

export function mapVisibleCommentsForPublic({
  comments,
  authorNamesById,
  currentUserId,
}: {
  comments: CommentRow[];
  authorNamesById: Map<string, string>;
  currentUserId: string | null;
}) {
  return comments
    .filter((comment) => comment.status === "visible" && !comment.parent_id)
    .map((comment) => ({
      id: comment.id,
      content: comment.content,
      authorDisplayName:
        authorNamesById.get(comment.user_id) ?? fallbackCommentAuthor,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      isEdited: isEditedComment(comment.created_at, comment.updated_at),
      canManage: Boolean(currentUserId && currentUserId === comment.user_id),
    }));
}

export function mapModerationComments({
  comments,
  authorNamesById,
  postsById,
  reportCountsByCommentId,
}: {
  comments: ModerationCommentRow[];
  authorNamesById: Map<string, string>;
  postsById: Map<string, { title: string; slug: string }>;
  reportCountsByCommentId: Map<string, number>;
}) {
  return comments
    .filter((comment) => isModerationCommentStatus(comment.status))
    .map((comment) => {
      const post = postsById.get(comment.post_id);

      return {
        id: comment.id,
        postId: comment.post_id,
        postTitle: post?.title ?? "Post unavailable",
        postSlug: post?.slug ?? "",
        authorDisplayName:
          authorNamesById.get(comment.user_id) ?? fallbackCommentAuthor,
        content: comment.content,
        status: comment.status as ModerationCommentStatus,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
        reportCount: reportCountsByCommentId.get(comment.id) ?? 0,
      };
    });
}

async function getPublishedPostReference(
  postId: string,
): Promise<PublishedPostReference | null> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id,slug")
    .eq("id", postId)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    id: String(data.id),
    slug: String(data.slug),
  };
}

async function requireCommentUser() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return {
    supabase,
    userId: user.id,
  };
}

async function requireCommentModerationContext() {
  try {
    await requireModeratorOrAdmin();
  } catch (error) {
    if (error instanceof RoleAuthenticationError) {
      return {
        success: false as const,
        code: "auth_required" as const,
        error: "Authentication is required.",
      };
    }

    if (error instanceof RolePermissionError) {
      return {
        success: false as const,
        code: "forbidden" as const,
        error: "Moderator or admin access is required.",
      };
    }

    throw error;
  }

  const supabase = createServiceRoleSupabaseClient();

  if (!supabase) {
    return {
      success: false as const,
      code: "storage_unavailable" as const,
      error: "Comment moderation storage is not configured.",
    };
  }

  return {
    success: true as const,
    supabase,
  };
}

async function getAuthorNamesById(userIds: string[]) {
  const supabase = createServiceRoleSupabaseClient();
  const namesById = new Map<string, string>();
  const uniqueUserIds = Array.from(new Set(userIds)).filter(Boolean);

  if (!supabase || uniqueUserIds.length === 0) {
    return namesById;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id,display_name")
    .in("id", uniqueUserIds);

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

export async function listVisibleCommentsForPost({
  postId,
  currentUserId,
}: {
  postId: string;
  currentUserId: string | null;
}) {
  const supabase =
    createServiceRoleSupabaseClient() ?? (await createServerSupabaseClient());

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("blog_comments")
    .select("id,user_id,content,status,parent_id,created_at,updated_at")
    .eq("post_id", postId)
    .eq("status", "visible")
    .is("parent_id", null)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  const comments = data as CommentRow[];
  const authorNamesById = await getAuthorNamesById(
    comments.map((comment) => comment.user_id),
  );

  return mapVisibleCommentsForPublic({
    comments,
    authorNamesById,
    currentUserId,
  });
}

export async function createCommentForPost({
  postId,
  content,
}: {
  postId: string;
  content: string;
}): Promise<CommentActionResult> {
  const auth = await requireCommentUser();

  if (!auth) {
    return {
      success: false,
      code: "auth_required",
      error: "Authentication is required.",
    };
  }

  const validContent = validateCommentContent(content);

  if (!validContent.success) {
    return {
      success: false,
      code: "invalid_comment",
      error: validContent.error,
    };
  }

  const post = await getPublishedPostReference(postId);

  if (!post) {
    return {
      success: false,
      code: "not_found",
      error: "Published post not found.",
    };
  }

  const { error } = await auth.supabase.from("blog_comments").insert({
    post_id: post.id,
    user_id: auth.userId,
    parent_id: null,
    content: validContent.content,
    status: "visible",
  });

  if (error) {
    return {
      success: false,
      code: "save_failed",
      error: "Could not save the comment.",
    };
  }

  return {
    success: true,
    slug: post.slug,
  };
}

async function getOwnedVisibleCommentReference(commentId: string) {
  const auth = await requireCommentUser();

  if (!auth) {
    return {
      success: false as const,
      code: "auth_required" as const,
      error: "Authentication is required.",
    };
  }

  const { data: comment, error } = await auth.supabase
    .from("blog_comments")
    .select("id,post_id,user_id,status")
    .eq("id", commentId)
    .maybeSingle();

  if (error || !comment) {
    return {
      success: false as const,
      code: "not_found" as const,
      error: "Comment not found.",
    };
  }

  const typedComment = comment as {
    id: string;
    post_id: string;
    user_id: string;
    status: string;
  };

  if (typedComment.user_id !== auth.userId || typedComment.status !== "visible") {
    return {
      success: false as const,
      code: "forbidden" as const,
      error: "You can only manage your own visible comments.",
    };
  }

  const post = await getPublishedPostReference(typedComment.post_id);

  if (!post) {
    return {
      success: false as const,
      code: "not_found" as const,
      error: "Published post not found.",
    };
  }

  return {
    success: true as const,
    supabase: auth.supabase,
    commentId: typedComment.id,
    userId: auth.userId,
    post,
  };
}

export async function updateOwnComment({
  commentId,
  content,
}: {
  commentId: string;
  content: string;
}): Promise<CommentActionResult> {
  const validContent = validateCommentContent(content);

  if (!validContent.success) {
    return {
      success: false,
      code: "invalid_comment",
      error: validContent.error,
    };
  }

  const reference = await getOwnedVisibleCommentReference(commentId);

  if (!reference.success) {
    return reference;
  }

  const { error } = await reference.supabase
    .from("blog_comments")
    .update({
      content: validContent.content,
      status: "visible",
    })
    .eq("id", reference.commentId)
    .eq("user_id", reference.userId)
    .eq("status", "visible");

  if (error) {
    return {
      success: false,
      code: "save_failed",
      error: "Could not update the comment.",
    };
  }

  return {
    success: true,
    slug: reference.post.slug,
  };
}

export async function deleteOwnComment(
  commentId: string,
): Promise<CommentActionResult> {
  const reference = await getOwnedVisibleCommentReference(commentId);

  if (!reference.success) {
    return reference;
  }

  const { error } = await reference.supabase
    .from("blog_comments")
    .delete()
    .eq("id", reference.commentId)
    .eq("user_id", reference.userId)
    .eq("status", "visible");

  if (error) {
    return {
      success: false,
      code: "save_failed",
      error: "Could not delete the comment.",
    };
  }

  return {
    success: true,
    slug: reference.post.slug,
  };
}

async function getPostTitlesById(postIds: string[]) {
  const supabase = createServiceRoleSupabaseClient();
  const postsById = new Map<string, { title: string; slug: string }>();
  const uniquePostIds = Array.from(new Set(postIds)).filter(Boolean);

  if (!supabase || uniquePostIds.length === 0) {
    return postsById;
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id,title,slug")
    .in("id", uniquePostIds);

  if (error || !data) {
    return postsById;
  }

  for (const post of data as Array<{ id: string; title: string; slug: string }>) {
    postsById.set(post.id, {
      title: post.title,
      slug: post.slug,
    });
  }

  return postsById;
}

async function getReportCountsByCommentId(commentIds: string[]) {
  const supabase = createServiceRoleSupabaseClient();
  const reportCountsByCommentId = new Map<string, number>();
  const uniqueCommentIds = Array.from(new Set(commentIds)).filter(Boolean);

  if (!supabase || uniqueCommentIds.length === 0) {
    return reportCountsByCommentId;
  }

  const { data, error } = await supabase
    .from("content_reports")
    .select("target_id")
    .eq("target_type", "comment")
    .in("target_id", uniqueCommentIds);

  if (error || !data) {
    return reportCountsByCommentId;
  }

  for (const report of data as Array<{ target_id: string }>) {
    reportCountsByCommentId.set(
      report.target_id,
      (reportCountsByCommentId.get(report.target_id) ?? 0) + 1,
    );
  }

  return reportCountsByCommentId;
}

export async function listCommentsForModeration(status?: string) {
  const context = await requireCommentModerationContext();

  if (!context.success) {
    return [];
  }

  const statusFilter = isModerationCommentStatus(status) ? status : null;
  let query = context.supabase
    .from("blog_comments")
    .select("id,post_id,user_id,content,status,parent_id,created_at,updated_at")
    .is("parent_id", null)
    .order("created_at", { ascending: false })
    .limit(100);

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  const comments = data as ModerationCommentRow[];
  const [authorNamesById, postsById, reportCountsByCommentId] =
    await Promise.all([
      getAuthorNamesById(comments.map((comment) => comment.user_id)),
      getPostTitlesById(comments.map((comment) => comment.post_id)),
      getReportCountsByCommentId(comments.map((comment) => comment.id)),
    ]);

  return mapModerationComments({
    comments,
    authorNamesById,
    postsById,
    reportCountsByCommentId,
  });
}

export async function updateCommentModerationStatus({
  commentId,
  status,
}: {
  commentId: string;
  status: ModerationCommentStatus | null;
}): Promise<CommentActionResult> {
  const context = await requireCommentModerationContext();

  if (!context.success) {
    return context;
  }

  if (!status) {
    return {
      success: false,
      code: "invalid_status",
      error: "Select a valid comment status.",
    };
  }

  const { error } = await context.supabase
    .from("blog_comments")
    .update({ status })
    .eq("id", commentId);

  if (error) {
    return {
      success: false,
      code: "save_failed",
      error: "Could not update comment status.",
    };
  }

  return {
    success: true,
    slug: "",
  };
}
