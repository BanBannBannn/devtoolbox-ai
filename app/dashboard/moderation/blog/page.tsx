import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  Archive,
  CheckCircle2,
  Clock,
  Eye,
  ShieldCheck,
} from "lucide-react";
import { BlogModerationActions } from "@/components/blog/blog-moderation-actions";
import { BlogPostStatusBadge } from "@/components/blog/blog-post-status-badge";
import {
  archiveBlogPostAction,
  publishBlogPostAction,
  rejectBlogPostAction,
} from "./actions";
import {
  getModerationErrorMessage,
  listModerationBlogPosts,
} from "@/lib/blog/moderation";
import type { BlogPostStatus } from "@/lib/blog/post-utils";
import {
  RoleAuthenticationError,
  RolePermissionError,
  requireModeratorOrAdmin,
} from "@/lib/auth/roles";
import { createMetadata } from "@/lib/seo";

type ModerationBlogPageProps = {
  searchParams: Promise<{
    status?: string;
    error?: string;
    message?: string;
  }>;
};

const filters: Array<{ label: string; value: BlogPostStatus | "all" }> = [
  { label: "All reviewable", value: "all" },
  { label: "Pending review", value: "pending_review" },
  { label: "Published", value: "published" },
  { label: "Rejected", value: "rejected" },
  { label: "Archived", value: "archived" },
];

const messages: Record<string, string> = {
  published: "Post published.",
  rejected: "Post rejected.",
  archived: "Post archived.",
};

export const metadata = createMetadata({
  title: "Blog Moderation",
  description: "Review submitted DevToolBox AI blog posts.",
  path: "/dashboard/moderation/blog",
});

function formatDate(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

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

export default async function ModerationBlogPage({
  searchParams,
}: ModerationBlogPageProps) {
  const params = await searchParams;
  await requireModerationAccess();
  const posts = await listModerationBlogPosts(params.status);
  const pendingCount = posts.filter(
    (post) => post.status === "pending_review",
  ).length;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
                Blog review queue
              </h1>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Review submitted developer posts, publish approved articles, reject
            drafts with a clear reason, or archive public posts when needed.
          </p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
          {pendingCount} pending
        </div>
      </div>

      {params.error ? (
        <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {getModerationErrorMessage(params.error)}
        </p>
      ) : null}
      {params.message ? (
        <p className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {messages[params.message]}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-2">
        {filters.map((filter) => {
          const href =
            filter.value === "all"
              ? "/dashboard/moderation/blog"
              : `/dashboard/moderation/blog?status=${filter.value}`;
          const isActive =
            filter.value === "all" ? !params.status : params.status === filter.value;

          return (
            <Link
              key={filter.value}
              href={href}
              className={`rounded-full border px-3 py-1 text-sm font-semibold transition ${
                isActive
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      {posts.length === 0 ? (
        <section className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-950">
            No posts in this queue
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Submitted posts will appear here after authors send drafts for
            review.
          </p>
        </section>
      ) : (
        <section className="mt-8 grid gap-4">
          {posts.map((post) => (
            <article
              key={post.id}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <BlogPostStatusBadge status={post.status} />
                    <p className="text-sm text-slate-500">
                      by {post.authorDisplayName}
                    </p>
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                    {post.title}
                  </h2>
                  {post.excerpt ? (
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                      {post.excerpt}
                    </p>
                  ) : null}
                </div>
                <Link
                  href={`/dashboard/blog/${post.id}/preview`}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100"
                >
                  <Eye aria-hidden="true" className="h-4 w-4" />
                  Preview
                </Link>
              </div>

              <dl className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-4">
                <div>
                  <dt className="flex items-center gap-2 font-semibold text-slate-900">
                    <Clock aria-hidden="true" className="h-4 w-4" />
                    Submitted
                  </dt>
                  <dd className="mt-1">{formatDate(post.submitted_at)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-900">Updated</dt>
                  <dd className="mt-1">{formatDate(post.updated_at)}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 font-semibold text-slate-900">
                    <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
                    Published
                  </dt>
                  <dd className="mt-1">{formatDate(post.published_at)}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 font-semibold text-slate-900">
                    <Archive aria-hidden="true" className="h-4 w-4" />
                    Slug
                  </dt>
                  <dd className="mt-1 break-all">{post.slug}</dd>
                </div>
              </dl>

              {post.rejection_reason ? (
                <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {post.rejection_reason}
                </p>
              ) : null}

              <div className="mt-5 border-t border-slate-200 pt-5">
                <BlogModerationActions
                  status={post.status}
                  publishAction={publishBlogPostAction.bind(null, post.id)}
                  rejectAction={rejectBlogPostAction.bind(null, post.id)}
                  archiveAction={archiveBlogPostAction.bind(null, post.id)}
                />
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
