"use client";

import Link from "next/link";
import { Bookmark, Heart } from "lucide-react";
import type React from "react";
import { useFormStatus } from "react-dom";
import type { PostInteractionState } from "@/lib/blog/post-interactions";

type PostInteractionButtonsProps = {
  postId: string;
  slug: string;
  isLoggedIn: boolean;
  state: PostInteractionState;
  likeAction: (formData: FormData) => void;
  bookmarkAction: (formData: FormData) => void;
};

function InteractionSubmitButton({
  children,
  active,
  activeClassName,
}: {
  children: React.ReactNode;
  active: boolean;
  activeClassName: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
        active
          ? activeClassName
          : "border-slate-300 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-100"
      }`}
    >
      {pending ? "Updating..." : children}
    </button>
  );
}

export function PostInteractionButtons({
  postId,
  slug,
  isLoggedIn,
  state,
  likeAction,
  bookmarkAction,
}: PostInteractionButtonsProps) {
  if (!isLoggedIn) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
        <p>
          Sign in to like or bookmark this post. You can still read and share
          published articles without an account.
        </p>
        <Link
          href={`/login?next=/blog/${slug}`}
          className="mt-3 inline-flex rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      <form action={likeAction}>
        <input type="hidden" name="post_id" value={postId} />
        <input type="hidden" name="slug" value={slug} />
        <InteractionSubmitButton
          active={state.isLiked}
          activeClassName="border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
        >
          <Heart
            aria-hidden="true"
            className={`h-4 w-4 ${state.isLiked ? "fill-current" : ""}`}
          />
          {state.isLiked ? "Liked" : "Like"} {state.likeCount}
        </InteractionSubmitButton>
      </form>

      <form action={bookmarkAction}>
        <input type="hidden" name="post_id" value={postId} />
        <input type="hidden" name="slug" value={slug} />
        <InteractionSubmitButton
          active={state.isBookmarked}
          activeClassName="border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
        >
          <Bookmark
            aria-hidden="true"
            className={`h-4 w-4 ${state.isBookmarked ? "fill-current" : ""}`}
          />
          {state.isBookmarked ? "Bookmarked" : "Bookmark"}
        </InteractionSubmitButton>
      </form>
    </div>
  );
}
