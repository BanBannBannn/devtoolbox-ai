"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  togglePostBookmark,
  togglePostLike,
} from "@/lib/blog/post-interactions";

function getPostIdFromFormData(formData: FormData) {
  return String(formData.get("post_id") ?? "").trim();
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
