"use server";

import { redirect } from "next/navigation";
import {
  createBlogPostForCurrentUser,
  getBlogPostSuccessRedirect,
  getBlogPostInputFromFormData,
  updateBlogPostForCurrentUser,
} from "@/lib/blog/writer-posts";

export async function createBlogPostAction(formData: FormData) {
  const input = getBlogPostInputFromFormData(formData);
  const result = await createBlogPostForCurrentUser(input);

  if (!result.success) {
    redirect(`/dashboard/blog/new?error=${result.code}`);
  }

  redirect(
    getBlogPostSuccessRedirect({
      postId: result.postId,
      intent: input.intent,
      action: "create",
    }),
  );
}

export async function updateBlogPostAction(id: string, formData: FormData) {
  const input = getBlogPostInputFromFormData(formData);
  const result = await updateBlogPostForCurrentUser(id, input);

  if (!result.success) {
    redirect(`/dashboard/blog/${id}/edit?error=${result.code}`);
  }

  redirect(
    getBlogPostSuccessRedirect({
      postId: result.postId,
      intent: input.intent,
      action: "update",
    }),
  );
}
