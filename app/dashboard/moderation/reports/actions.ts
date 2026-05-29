"use server";

import { redirect } from "next/navigation";
import {
  isReportStatus,
  updateContentReportStatus,
} from "@/lib/blog/reports";

function getStatusFromFormData(formData: FormData) {
  const status = formData.get("status");

  return isReportStatus(status) ? status : null;
}

export async function updateReportStatusAction(
  reportId: string,
  formData: FormData,
) {
  const result = await updateContentReportStatus({
    reportId,
    status: getStatusFromFormData(formData),
  });

  if (!result.success) {
    redirect(`/dashboard/moderation/reports?error=${result.code}`);
  }

  redirect("/dashboard/moderation/reports?message=report_updated");
}
