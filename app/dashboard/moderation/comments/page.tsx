import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MessageSquareWarning, ShieldCheck } from "lucide-react";
import { updateCommentStatusAction } from "./actions";
import {
  getCommentErrorMessage,
  isModerationCommentStatus,
  listCommentsForModeration,
  type ModerationCommentStatus,
} from "@/lib/blog/comments";
import {
  RoleAuthenticationError,
  RolePermissionError,
  requireModeratorOrAdmin,
} from "@/lib/auth/roles";
import { createMetadata } from "@/lib/seo";

type ModerationCommentsPageProps = {
  searchParams: Promise<{
    status?: string;
    error?: string;
    message?: string;
  }>;
};

const statuses: Array<{ label: string; value: ModerationCommentStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "Visible", value: "visible" },
  { label: "Hidden", value: "hidden" },
  { label: "Removed", value: "removed" },
];

const messages: Record<string, string> = {
  comment_updated: "Comment status updated.",
};

export const metadata = createMetadata({
  title: "Comment Moderation",
  description: "Moderate DevToolBox AI blog comments.",
  path: "/dashboard/moderation/comments",
});

async function requireModerationAccess() {
  try {
    await requireModeratorOrAdmin();
  } catch (error) {
    if (error instanceof RoleAuthenticationError) {
      redirect("/login");
    }

    if (error instanceof RolePermissionError) {
      notFound();
    }

    throw error;
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusClass(status: ModerationCommentStatus) {
  switch (status) {
    case "hidden":
      return "bg-amber-50 text-amber-800";
    case "removed":
      return "bg-red-50 text-red-800";
    default:
      return "bg-emerald-50 text-emerald-800";
  }
}

export default async function ModerationCommentsPage({
  searchParams,
}: ModerationCommentsPageProps) {
  const params = await searchParams;
  await requireModerationAccess();
  const activeStatus = isModerationCommentStatus(params.status)
    ? params.status
    : undefined;
  const comments = await listCommentsForModeration(activeStatus);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div>
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
        >
          Back to dashboard
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <ShieldCheck aria-hidden="true" className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Moderation
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
              Comment moderation
            </h1>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Hide, remove, or restore top-level blog comments. Public blog pages
          show only visible comments.
        </p>
      </div>

      {params.error ? (
        <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {getCommentErrorMessage(params.error)}
        </p>
      ) : null}
      {params.message ? (
        <p className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {messages[params.message]}
        </p>
      ) : null}

      <nav className="mt-8 flex flex-wrap gap-2 text-sm font-semibold">
        {statuses.map((status) => {
          const href =
            status.value === "all"
              ? "/dashboard/moderation/comments"
              : `/dashboard/moderation/comments?status=${status.value}`;
          const isActive =
            status.value === "all"
              ? !activeStatus
              : activeStatus === status.value;

          return (
            <Link
              key={status.value}
              href={href}
              className={`rounded-full border px-3 py-1 transition ${
                isActive
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {status.label}
            </Link>
          );
        })}
      </nav>

      {comments.length === 0 ? (
        <section className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <MessageSquareWarning
            aria-hidden="true"
            className="mx-auto h-10 w-10 text-slate-400"
          />
          <h2 className="mt-4 text-xl font-semibold text-slate-950">
            No comments in this queue
          </h2>
        </section>
      ) : (
        <section className="mt-8 grid gap-4">
          {comments.map((comment) => {
            const action = updateCommentStatusAction.bind(null, comment.id);

            return (
              <article
                key={comment.id}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusClass(
                          comment.status,
                        )}`}
                      >
                        {comment.status}
                      </span>
                      {comment.reportCount > 0 ? (
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-800">
                          {comment.reportCount} reports
                        </span>
                      ) : null}
                    </div>
                    <h2 className="mt-3 text-xl font-semibold text-slate-950">
                      {comment.postTitle}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      by {comment.authorDisplayName} ·{" "}
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>
                  {comment.postSlug ? (
                    <Link
                      href={`/blog/${comment.postSlug}#comments`}
                      className="inline-flex justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100"
                    >
                      View post
                    </Link>
                  ) : null}
                </div>

                <p className="mt-4 whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                  {comment.content}
                </p>

                <form action={action} className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    name="status"
                    value="hidden"
                    className="rounded-md border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-50"
                  >
                    Hide
                  </button>
                  <button
                    type="submit"
                    name="status"
                    value="removed"
                    className="rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                  >
                    Remove
                  </button>
                  <button
                    type="submit"
                    name="status"
                    value="visible"
                    className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Restore visible
                  </button>
                </form>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
