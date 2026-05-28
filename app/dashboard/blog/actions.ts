"use server";

import { redirect } from "next/navigation";
import {
  createBlogPostForCurrentUser,
  getBlogPostInputFromFormData,
  updateBlogPostForCurrentUser,
} from "@/lib/blog/writer-posts";

export async function createBlogPostAction(formData: FormData) {
  const result = await createBlogPostForCurrentUser(
    getBlogPostInputFromFormData(formData),
  );

  if (!result.success) {
    redirect(`/dashboard/blog/new?error=${result.code}`);
  }

  const message =
    formData.get("intent") === "submit_review" ? "submitted" : "created";
  redirect(`/dashboard/blog/${result.postId}/edit?message=${message}`);
}

export async function updateBlogPostAction(id: string, formData: FormData) {
  const result = await updateBlogPostForCurrentUser(
    id,
    getBlogPostInputFromFormData(formData),
  );

  if (!result.success) {
    redirect(`/dashboard/blog/${id}/edit?error=${result.code}`);
  }

  const message =
    formData.get("intent") === "submit_review" ? "submitted" : "saved";
  redirect(`/dashboard/blog/${id}/edit?message=${message}`);
}
