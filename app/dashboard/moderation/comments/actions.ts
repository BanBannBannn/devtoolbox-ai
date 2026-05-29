"use server";

import { redirect } from "next/navigation";
import {
  isModerationCommentStatus,
  updateCommentModerationStatus,
} from "@/lib/blog/comments";

function getCommentStatusFromFormData(formData: FormData) {
  const status = formData.get("status");

  return isModerationCommentStatus(status) ? status : null;
}

export async function updateCommentStatusAction(
  commentId: string,
  formData: FormData,
) {
  const result = await updateCommentModerationStatus({
    commentId,
    status: getCommentStatusFromFormData(formData),
  });

  if (!result.success) {
    redirect(`/dashboard/moderation/comments?error=${result.code}`);
  }

  redirect("/dashboard/moderation/comments?message=comment_updated");
}
