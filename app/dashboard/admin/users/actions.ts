"use server";

import { redirect } from "next/navigation";
import {
  getRoleInputFromFormData,
  updateAdminUserRole,
} from "@/lib/blog/admin-users";

export async function updateUserRoleAction(formData: FormData) {
  const input = getRoleInputFromFormData(formData);
  const result = await updateAdminUserRole({
    targetUserId: input.userId,
    nextRole: input.role,
  });

  if (!result.success) {
    redirect(`/dashboard/admin/users?error=${result.code}`);
  }

  redirect("/dashboard/admin/users?message=role_saved");
}
