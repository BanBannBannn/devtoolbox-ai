import type { BlogPostStatus } from "@/lib/blog/post-utils";

const statusStyles: Record<BlogPostStatus, string> = {
  draft: "border-slate-200 bg-slate-100 text-slate-700",
  pending_review: "border-amber-200 bg-amber-50 text-amber-800",
  published: "border-emerald-200 bg-emerald-50 text-emerald-800",
  rejected: "border-red-200 bg-red-50 text-red-800",
  archived: "border-zinc-200 bg-zinc-100 text-zinc-700",
};

const statusLabels: Record<BlogPostStatus, string> = {
  draft: "Draft",
  pending_review: "Pending review",
  published: "Published",
  rejected: "Rejected",
  archived: "Archived",
};

export function BlogPostStatusBadge({ status }: { status: BlogPostStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
