"use client";

import { useFormStatus } from "react-dom";
import type { BlogPostStatus } from "@/lib/blog/post-utils";

type BlogModerationActionsProps = {
  status: BlogPostStatus;
  publishAction: () => void;
  rejectAction: (formData: FormData) => void;
  archiveAction: () => void;
};

function SubmitButton({
  children,
  variant = "secondary",
}: {
  children: string;
  variant?: "primary" | "danger" | "secondary";
}) {
  const { pending } = useFormStatus();
  const className =
    variant === "primary"
      ? "bg-slate-950 text-white hover:bg-slate-800"
      : variant === "danger"
        ? "border border-red-200 bg-white text-red-700 hover:bg-red-50"
        : "border border-slate-300 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-100";

  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {pending ? "Working..." : children}
    </button>
  );
}

export function BlogModerationActions({
  status,
  publishAction,
  rejectAction,
  archiveAction,
}: BlogModerationActionsProps) {
  return (
    <div className="grid gap-3">
      {status === "pending_review" ? (
        <div className="flex flex-wrap gap-3">
          <form
            action={publishAction}
            onSubmit={(event) => {
              if (!window.confirm("Publish this post to the public blog?")) {
                event.preventDefault();
              }
            }}
          >
            <SubmitButton variant="primary">Approve and publish</SubmitButton>
          </form>
        </div>
      ) : null}

      {status === "pending_review" ? (
        <form action={rejectAction} className="grid gap-2 sm:max-w-xl">
          <label
            htmlFor="rejection_reason"
            className="text-sm font-semibold text-slate-900"
          >
            Rejection reason
          </label>
          <textarea
            id="rejection_reason"
            name="rejection_reason"
            required
            minLength={1}
            maxLength={1000}
            rows={3}
            placeholder="Explain what the author should improve before resubmitting."
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          <div>
            <SubmitButton variant="danger">Reject post</SubmitButton>
          </div>
        </form>
      ) : null}

      {status === "published" ? (
        <form
          action={archiveAction}
          onSubmit={(event) => {
            if (!window.confirm("Archive this post and remove it from the public blog?")) {
              event.preventDefault();
            }
          }}
        >
          <SubmitButton variant="danger">Archive / unpublish</SubmitButton>
        </form>
      ) : null}
    </div>
  );
}
