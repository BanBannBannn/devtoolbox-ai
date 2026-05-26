"use server";

import { redirect } from "next/navigation";
import { isRagAdminEmail } from "@/lib/rag/rag-admin";
import {
  DEFAULT_RUNTIME_SETTINGS,
  getRagRuntimeSettingsFromFormData,
  saveStoredRagRuntimeSettings,
} from "@/lib/rag/rag-runtime-config";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function requireRagSettingsAdmin() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    redirect("/login?error=auth_config");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!isRagAdminEmail(user.email)) {
    redirect("/dashboard?error=forbidden");
  }

  return user;
}

export async function saveRagRuntimeSettingsAction(formData: FormData) {
  const user = await requireRagSettingsAdmin();
  const settings = getRagRuntimeSettingsFromFormData(formData);
  const result = await saveStoredRagRuntimeSettings({
    settings,
    updatedBy: user.id,
  });

  if (!result.success) {
    redirect("/dashboard/admin/rag-settings?error=save_failed");
  }

  redirect("/dashboard/admin/rag-settings?message=saved");
}

export async function resetRagRuntimeSettingsAction() {
  const user = await requireRagSettingsAdmin();
  const result = await saveStoredRagRuntimeSettings({
    settings: DEFAULT_RUNTIME_SETTINGS,
    updatedBy: user.id,
  });

  if (!result.success) {
    redirect("/dashboard/admin/rag-settings?error=save_failed");
  }

  redirect("/dashboard/admin/rag-settings?message=reset");
}
