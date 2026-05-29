import {
  RoleAuthenticationError,
  RolePermissionError,
  requireModeratorOrAdmin,
} from "../auth/roles";
import {
  createServerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "../supabase/server";
import {
  reportReasons,
  reportStatuses,
  type ReportReason,
  type ReportStatus,
  type ReportTargetType,
} from "./report-constants";

export { reportReasons, reportStatuses };
export type { ReportReason, ReportStatus, ReportTargetType };

export type ReportActionResult =
  | {
      success: true;
      slug?: string;
    }
  | {
      success: false;
      code:
        | "auth_required"
        | "forbidden"
        | "invalid_reason"
        | "invalid_details"
        | "invalid_target"
        | "invalid_status"
        | "not_found"
        | "storage_unavailable"
        | "save_failed";
      error: string;
    };

export type ModerationReport = {
  id: string;
  reporterDisplayName: string;
  targetType: ReportTargetType;
  targetId: string;
  targetLabel: string;
  targetHref: string | null;
  targetSnippet: string | null;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  createdAt: string;
  reviewedAt: string | null;
};

type ReportRow = {
  id: string;
  reporter_id: string;
  target_type: string;
  target_id: string;
  reason: string;
  details: string | null;
  status: string;
  reviewed_at: string | null;
  created_at: string;
};

type ProfileNameRow = {
  id: string;
  display_name: string | null;
};

const fallbackReporterName = "DevToolBox AI reader";

export function isReportReason(value: unknown): value is ReportReason {
  return (
    typeof value === "string" && reportReasons.includes(value as ReportReason)
  );
}

export function isReportStatus(value: unknown): value is ReportStatus {
  return (
    typeof value === "string" && reportStatuses.includes(value as ReportStatus)
  );
}

export function validateReportDetails(details: string) {
  const trimmed = details.trim();

  if (trimmed.length > 1000) {
    return {
      success: false as const,
      error: "Report details must be 1000 characters or fewer.",
    };
  }

  return {
    success: true as const,
    details: trimmed || null,
  };
}

export function getReportErrorMessage(code?: string) {
  switch (code) {
    case "auth_required":
      return "Sign in to report content.";
    case "forbidden":
      return "You do not have permission to review reports.";
    case "invalid_reason":
      return "Select a valid report reason.";
    case "invalid_details":
      return "Report details must be 1000 characters or fewer.";
    case "invalid_target":
      return "This content cannot be reported.";
    case "invalid_status":
      return "Select a valid report status.";
    case "not_found":
      return "Report or target content was not found.";
    case "storage_unavailable":
      return "Report storage is not configured.";
    case "save_failed":
      return "Could not save the report action. Please try again.";
    default:
      return undefined;
  }
}

export function getReportStatusLabel(status: ReportStatus) {
  switch (status) {
    case "action_taken":
      return "Action taken";
    case "dismissed":
      return "Dismissed";
    case "reviewed":
      return "Reviewed";
    default:
      return "Open";
  }
}

async function requireReportUser() {
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

async function requireModerationContext() {
  try {
    const context = await requireModeratorOrAdmin();
    const supabase = createServiceRoleSupabaseClient();

    if (!supabase) {
      return {
        success: false as const,
        code: "storage_unavailable" as const,
        error: "Moderation storage is not configured.",
      };
    }

    return {
      success: true as const,
      supabase,
      userId: context.userId,
    };
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
}

async function getPublishedPostTarget(postId: string) {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id,slug,title")
    .eq("id", postId)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    id: String(data.id),
    slug: String(data.slug),
    title: String(data.title),
  };
}

async function getVisibleCommentTarget(commentId: string) {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data: comment, error } = await supabase
    .from("blog_comments")
    .select("id,post_id,content,status")
    .eq("id", commentId)
    .eq("status", "visible")
    .maybeSingle();

  if (error || !comment) {
    return null;
  }

  const post = await getPublishedPostTarget(String(comment.post_id));

  if (!post) {
    return null;
  }

  return {
    id: String(comment.id),
    post,
    content: String(comment.content),
  };
}

export async function createContentReport({
  targetType,
  targetId,
  reason,
  details,
}: {
  targetType: ReportTargetType;
  targetId: string;
  reason: unknown;
  details: string;
}): Promise<ReportActionResult> {
  const auth = await requireReportUser();

  if (!auth) {
    return {
      success: false,
      code: "auth_required",
      error: "Authentication is required.",
    };
  }

  if (targetType !== "post" && targetType !== "comment") {
    return {
      success: false,
      code: "invalid_target",
      error: "Invalid report target.",
    };
  }

  if (!isReportReason(reason)) {
    return {
      success: false,
      code: "invalid_reason",
      error: "Select a valid report reason.",
    };
  }

  const validDetails = validateReportDetails(details);

  if (!validDetails.success) {
    return {
      success: false,
      code: "invalid_details",
      error: validDetails.error,
    };
  }

  const target =
    targetType === "post"
      ? await getPublishedPostTarget(targetId)
      : await getVisibleCommentTarget(targetId);

  if (!target) {
    return {
      success: false,
      code: "not_found",
      error: "Report target was not found.",
    };
  }

  const { error } = await auth.supabase.from("content_reports").insert({
    reporter_id: auth.userId,
    target_type: targetType,
    target_id: targetId,
    reason,
    details: validDetails.details,
    status: "open",
  });

  if (error) {
    return {
      success: false,
      code: "save_failed",
      error: "Could not create report.",
    };
  }

  return {
    success: true,
    slug:
      targetType === "post"
        ? (target as Awaited<ReturnType<typeof getPublishedPostTarget>>)?.slug
        : (target as Awaited<ReturnType<typeof getVisibleCommentTarget>>)?.post
            .slug,
  };
}

async function getProfileNamesById(userIds: string[]) {
  const supabase = createServiceRoleSupabaseClient();
  const namesById = new Map<string, string>();
  const uniqueIds = Array.from(new Set(userIds)).filter(Boolean);

  if (!supabase || uniqueIds.length === 0) {
    return namesById;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id,display_name")
    .in("id", uniqueIds);

  if (error || !data) {
    return namesById;
  }

  for (const profile of data as ProfileNameRow[]) {
    const displayName = profile.display_name?.trim();

    if (displayName) {
      namesById.set(profile.id, displayName);
    }
  }

  return namesById;
}

async function getPostTargetsById(postIds: string[]) {
  const supabase = createServiceRoleSupabaseClient();
  const postsById = new Map<
    string,
    { id: string; title: string; slug: string; status: string }
  >();
  const uniqueIds = Array.from(new Set(postIds)).filter(Boolean);

  if (!supabase || uniqueIds.length === 0) {
    return postsById;
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id,title,slug,status")
    .in("id", uniqueIds);

  if (error || !data) {
    return postsById;
  }

  for (const post of data as Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
  }>) {
    postsById.set(post.id, post);
  }

  return postsById;
}

async function getCommentTargetsById(commentIds: string[]) {
  const supabase = createServiceRoleSupabaseClient();
  const commentsById = new Map<
    string,
    { id: string; content: string; status: string; post_id: string }
  >();
  const uniqueIds = Array.from(new Set(commentIds)).filter(Boolean);

  if (!supabase || uniqueIds.length === 0) {
    return commentsById;
  }

  const { data, error } = await supabase
    .from("blog_comments")
    .select("id,content,status,post_id")
    .in("id", uniqueIds);

  if (error || !data) {
    return commentsById;
  }

  for (const comment of data as Array<{
    id: string;
    content: string;
    status: string;
    post_id: string;
  }>) {
    commentsById.set(comment.id, comment);
  }

  return commentsById;
}

function snippet(value: string, max = 180) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= max) {
    return normalized;
  }

  return `${normalized.slice(0, max - 1).trim()}...`;
}

export function sortReportsForModeration(reports: ModerationReport[]) {
  return [...reports].sort((a, b) => {
    if (a.status === "open" && b.status !== "open") {
      return -1;
    }

    if (a.status !== "open" && b.status === "open") {
      return 1;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export async function listContentReportsForModeration(status?: string) {
  const context = await requireModerationContext();

  if (!context.success) {
    return [];
  }

  const statusFilter = isReportStatus(status) ? status : null;
  let query = context.supabase
    .from("content_reports")
    .select(
      "id,reporter_id,target_type,target_id,reason,details,status,reviewed_at,created_at",
    )
    .order("created_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  const rows = data as ReportRow[];
  const reporterNamesById = await getProfileNamesById(
    rows.map((row) => row.reporter_id),
  );
  const postIds = rows
    .filter((row) => row.target_type === "post")
    .map((row) => row.target_id);
  const commentIds = rows
    .filter((row) => row.target_type === "comment")
    .map((row) => row.target_id);
  const commentsById = await getCommentTargetsById(commentIds);
  const commentPostIds = Array.from(commentsById.values()).map(
    (comment) => comment.post_id,
  );
  const postsById = await getPostTargetsById([...postIds, ...commentPostIds]);

  const reports = rows
    .filter(
      (row) =>
        (row.target_type === "post" || row.target_type === "comment") &&
        isReportReason(row.reason) &&
        isReportStatus(row.status),
    )
    .map((row): ModerationReport => {
      if (row.target_type === "post") {
        const post = postsById.get(row.target_id);

        return {
          id: row.id,
          reporterDisplayName:
            reporterNamesById.get(row.reporter_id) ?? fallbackReporterName,
          targetType: "post",
          targetId: row.target_id,
          targetLabel: post ? `Post: ${post.title}` : "Post unavailable",
          targetHref: post?.status === "published" ? `/blog/${post.slug}` : null,
          targetSnippet: null,
          reason: row.reason as ReportReason,
          details: row.details,
          status: row.status as ReportStatus,
          createdAt: row.created_at,
          reviewedAt: row.reviewed_at,
        };
      }

      const comment = commentsById.get(row.target_id);
      const post = comment ? postsById.get(comment.post_id) : null;

      return {
        id: row.id,
        reporterDisplayName:
          reporterNamesById.get(row.reporter_id) ?? fallbackReporterName,
        targetType: "comment",
        targetId: row.target_id,
        targetLabel: post ? `Comment on: ${post.title}` : "Comment unavailable",
        targetHref: post?.status === "published" ? `/blog/${post.slug}#comments` : null,
        targetSnippet: comment ? snippet(comment.content) : null,
        reason: row.reason as ReportReason,
        details: row.details,
        status: row.status as ReportStatus,
        createdAt: row.created_at,
        reviewedAt: row.reviewed_at,
      };
    });

  return sortReportsForModeration(reports);
}

export async function updateContentReportStatus({
  reportId,
  status,
}: {
  reportId: string;
  status: ReportStatus | null;
}): Promise<ReportActionResult> {
  const context = await requireModerationContext();

  if (!context.success) {
    return context;
  }

  if (!status || status === "open") {
    return {
      success: false,
      code: "invalid_status",
      error: "Select a valid report status.",
    };
  }

  const { error } = await context.supabase
    .from("content_reports")
    .update({
      status,
      reviewed_by: context.userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", reportId);

  if (error) {
    return {
      success: false,
      code: "save_failed",
      error: "Could not update report status.",
    };
  }

  return {
    success: true,
  };
}
