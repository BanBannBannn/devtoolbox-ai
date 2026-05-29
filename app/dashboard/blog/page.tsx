import Link from "next/link";
import { Plus } from "lucide-react";
import { BlogPostStatusBadge } from "@/components/blog/blog-post-status-badge";
import {
  blogPostStatuses,
  canEditWriterPostStatus,
  listBlogPostsForCurrentUser,
  type BlogPostStatus,
} from "@/lib/blog/writer-posts";
import { createMetadata } from "@/lib/seo";

type DashboardBlogPageProps = {
  searchParams: Promise<{
    status?: string;
    message?: string;
  }>;
};

const filters: Array<{ label: string; value: BlogPostStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "Drafts", value: "draft" },
  { label: "Pending review", value: "pending_review" },
  { label: "Published", value: "published" },
  { label: "Rejected", value: "rejected" },
  { label: "Archived", value: "archived" },
];

const messages: Record<string, string> = {
  submitted: "Post submitted for review. It is not public yet.",
};

export const metadata = createMetadata({
  title: "Blog Posts",
  description: "Manage your DevToolBox AI blog drafts and submissions.",
  path: "/dashboard/blog",
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

export default async function DashboardBlogPage({
  searchParams,
}: DashboardBlogPageProps) {
  const params = await searchParams;
  const activeStatus = blogPostStatuses.includes(params.status as BlogPostStatus)
    ? (params.status as BlogPostStatus)
    : undefined;
  const posts = await listBlogPostsForCurrentUser(activeStatus);

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
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
            Blog posts
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Write drafts, preview your work, and submit posts for moderator
            review. Published posts remain the only posts visible on the public
            blog.
          </p>
        </div>
        <Link
          href="/dashboard/blog/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          New post
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {filters.map((filter) => {
          const href =
            filter.value === "all"
              ? "/dashboard/blog"
              : `/dashboard/blog?status=${filter.value}`;
          const isActive =
            filter.value === "all" ? !activeStatus : activeStatus === filter.value;

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

      {params.message && messages[params.message] ? (
        <p className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {messages[params.message]}
        </p>
      ) : null}

      {posts.length === 0 ? (
        <section className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-950">
            No posts here yet
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Create a draft to start writing. Submitting sends your post to the
            review queue; public publishing arrives in the moderation phase.
          </p>
          <Link
            href="/dashboard/blog/new"
            className="mt-6 inline-flex rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Create post
          </Link>
        </section>
      ) : (
        <section className="mt-8 grid gap-4">
          {posts.map((post) => (
            <article
              key={post.id}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Updated {formatDate(post.updated_at)}
                  </p>
                </div>
                <BlogPostStatusBadge status={post.status} />
              </div>

              <dl className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                <div>
                  <dt className="font-semibold text-slate-900">Submitted</dt>
                  <dd className="mt-1">{formatDate(post.submitted_at)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-900">Published</dt>
                  <dd className="mt-1">{formatDate(post.published_at)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-900">Slug</dt>
                  <dd className="mt-1 break-all">{post.slug}</dd>
                </div>
              </dl>

              {post.rejection_reason ? (
                <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {post.rejection_reason}
                </p>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-3">
                {canEditWriterPostStatus(post.status) ? (
                  <Link
                    href={`/dashboard/blog/${post.id}/edit`}
                    className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Edit
                  </Link>
                ) : null}
                <Link
                  href={`/dashboard/blog/${post.id}/preview`}
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100"
                >
                  Preview
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
