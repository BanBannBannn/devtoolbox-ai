"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createCommentForPost,
  deleteOwnComment,
  updateOwnComment,
} from "@/lib/blog/comments";
import {
  togglePostBookmark,
  togglePostLike,
} from "@/lib/blog/post-interactions";

function getPostIdFromFormData(formData: FormData) {
  return String(formData.get("post_id") ?? "").trim();
}

function getCommentIdFromFormData(formData: FormData) {
  return String(formData.get("comment_id") ?? "").trim();
}

function getCommentContentFromFormData(formData: FormData) {
  return String(formData.get("content") ?? "");
}

function getCurrentSlugFromFormData(formData: FormData) {
  return String(formData.get("slug") ?? "").trim();
}

function getSlugRedirect(slug: string, search: string) {
  return `/blog/${slug}${search}`;
}

export async function toggleBlogPostLikeAction(formData: FormData) {
  const currentSlug = getCurrentSlugFromFormData(formData);
  const result = await togglePostLike(getPostIdFromFormData(formData));

  if (!result.success) {
    if (result.code === "auth_required") {
      redirect(`/login?next=/blog/${currentSlug}`);
    }

    redirect(`/blog/${currentSlug}?error=${result.code}`);
  }

  revalidatePath(`/blog/${result.slug}`);
  revalidatePath("/blog");
  redirect(
    getSlugRedirect(
      result.slug,
      result.toggledOn ? "?message=liked" : "?message=unliked",
    ),
  );
}

export async function toggleBlogPostBookmarkAction(formData: FormData) {
  const currentSlug = getCurrentSlugFromFormData(formData);
  const result = await togglePostBookmark(getPostIdFromFormData(formData));

  if (!result.success) {
    if (result.code === "auth_required") {
      redirect(`/login?next=/blog/${currentSlug}`);
    }

    redirect(`/blog/${currentSlug}?error=${result.code}`);
  }

  revalidatePath(`/blog/${result.slug}`);
  revalidatePath("/dashboard/bookmarks");
  redirect(
    getSlugRedirect(
      result.slug,
      result.toggledOn ? "?message=bookmarked" : "?message=unbookmarked",
    ),
  );
}

export async function createBlogCommentAction(formData: FormData) {
  const currentSlug = getCurrentSlugFromFormData(formData);
  const result = await createCommentForPost({
    postId: getPostIdFromFormData(formData),
    content: getCommentContentFromFormData(formData),
  });

  if (!result.success) {
    if (result.code === "auth_required") {
      redirect(`/login?next=/blog/${currentSlug}`);
    }

    redirect(`/blog/${currentSlug}?error=${result.code}#comments`);
  }

  revalidatePath(`/blog/${result.slug}`);
  redirect(`/blog/${result.slug}?message=comment_added#comments`);
}

export async function updateBlogCommentAction(formData: FormData) {
  const currentSlug = getCurrentSlugFromFormData(formData);
  const result = await updateOwnComment({
    commentId: getCommentIdFromFormData(formData),
    content: getCommentContentFromFormData(formData),
  });

  if (!result.success) {
    if (result.code === "auth_required") {
      redirect(`/login?next=/blog/${currentSlug}`);
    }

    redirect(`/blog/${currentSlug}?error=${result.code}#comments`);
  }

  revalidatePath(`/blog/${result.slug}`);
  redirect(`/blog/${result.slug}?message=comment_updated#comments`);
}

export async function deleteBlogCommentAction(formData: FormData) {
  const currentSlug = getCurrentSlugFromFormData(formData);
  const result = await deleteOwnComment(getCommentIdFromFormData(formData));

  if (!result.success) {
    if (result.code === "auth_required") {
      redirect(`/login?next=/blog/${currentSlug}`);
    }

    redirect(`/blog/${currentSlug}?error=${result.code}#comments`);
  }

  revalidatePath(`/blog/${result.slug}`);
  redirect(`/blog/${result.slug}?message=comment_deleted#comments`);
}
