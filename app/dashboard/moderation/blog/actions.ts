"use server";

import { redirect } from "next/navigation";
import {
  archivePublishedBlogPost,
  publishBlogPostForReview,
  rejectBlogPostForReview,
} from "@/lib/blog/moderation";

function redirectWithResult(code: string) {
  redirect(`/dashboard/moderation/blog?error=${code}`);
}

export async function publishBlogPostAction(id: string) {
  const result = await publishBlogPostForReview(id);

  if (!result.success) {
    redirectWithResult(result.code);
  }

  redirect("/dashboard/moderation/blog?message=published");
}

export async function rejectBlogPostAction(id: string, formData: FormData) {
  const rejectionReason = String(formData.get("rejection_reason") ?? "");
  const result = await rejectBlogPostForReview(id, rejectionReason);

  if (!result.success) {
    redirectWithResult(result.code);
  }

  redirect("/dashboard/moderation/blog?message=rejected");
}

export async function archiveBlogPostAction(id: string) {
  const result = await archivePublishedBlogPost(id);

  if (!result.success) {
    redirectWithResult(result.code);
  }

  redirect("/dashboard/moderation/blog?message=archived");
}
