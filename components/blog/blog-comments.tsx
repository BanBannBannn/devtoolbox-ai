"use client";

import Link from "next/link";
import type React from "react";
import { useFormStatus } from "react-dom";
import type { PublicBlogComment } from "@/lib/blog/comments";

type BlogCommentsProps = {
  postId: string;
  slug: string;
  comments: PublicBlogComment[];
  isLoggedIn: boolean;
  createAction: (formData: FormData) => void;
  updateAction: (formData: FormData) => void;
  deleteAction: (formData: FormData) => void;
};

function formatCommentDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function SubmitButton({
  children,
  variant = "primary",
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
}) {
  const { pending } = useFormStatus();
  const className =
    variant === "danger"
      ? "border-red-200 bg-white text-red-700 hover:bg-red-50"
      : variant === "secondary"
        ? "border-slate-300 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-100"
        : "border-slate-950 bg-slate-950 text-white hover:bg-slate-800";

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex justify-center rounded-md border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {pending ? "Saving..." : children}
    </button>
  );
}

export function BlogComments({
  postId,
  slug,
  comments,
  isLoggedIn,
  createAction,
  updateAction,
  deleteAction,
}: BlogCommentsProps) {
  return (
    <section
      id="comments"
      className="mt-12 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Comments
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
          Join the discussion
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Comments are shown oldest first. Replies and reports are planned for
          later phases.
        </p>
      </div>

      {isLoggedIn ? (
        <form action={createAction} className="mt-6 space-y-3">
          <input type="hidden" name="post_id" value={postId} />
          <input type="hidden" name="slug" value={slug} />
          <label
            htmlFor="new-comment"
            className="text-sm font-semibold text-slate-950"
          >
            Add a comment
          </label>
          <textarea
            id="new-comment"
            name="content"
            required
            minLength={1}
            maxLength={2000}
            rows={4}
            placeholder="Share a helpful note, question, or follow-up..."
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          <div className="flex justify-end">
            <SubmitButton>Post comment</SubmitButton>
          </div>
        </form>
      ) : (
        <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          <p>Sign in to add a comment. Public comments are readable to everyone.</p>
          <Link
            href={`/login?next=/blog/${slug}`}
            className="mt-3 inline-flex rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Sign in to comment
          </Link>
        </div>
      )}

      <div className="mt-8 space-y-5">
        {comments.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
            No visible comments yet.
          </div>
        ) : (
          comments.map((comment) => (
            <article
              key={comment.id}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <h3 className="font-semibold text-slate-950">
                  {comment.authorDisplayName}
                </h3>
                <p className="text-xs text-slate-500">
                  {formatCommentDate(comment.createdAt)}
                  {comment.isEdited ? " · edited" : ""}
                </p>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {comment.content}
              </p>

              {comment.canManage ? (
                <div className="mt-4 space-y-3">
                  <details className="rounded-md border border-slate-200 bg-white p-3">
                    <summary className="cursor-pointer text-sm font-semibold text-slate-700">
                      Edit comment
                    </summary>
                    <form action={updateAction} className="mt-3 space-y-3">
                      <input type="hidden" name="comment_id" value={comment.id} />
                      <input type="hidden" name="slug" value={slug} />
                      <textarea
                        name="content"
                        required
                        minLength={1}
                        maxLength={2000}
                        rows={4}
                        defaultValue={comment.content}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      />
                      <SubmitButton variant="secondary">Save edit</SubmitButton>
                    </form>
                  </details>

                  <form
                    action={deleteAction}
                    onSubmit={(event) => {
                      if (!window.confirm("Delete this comment?")) {
                        event.preventDefault();
                      }
                    }}
                  >
                    <input type="hidden" name="comment_id" value={comment.id} />
                    <input type="hidden" name="slug" value={slug} />
                    <SubmitButton variant="danger">Delete comment</SubmitButton>
                  </form>
                </div>
              ) : null}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
