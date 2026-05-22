import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { UsageEventType } from "./usage-calculations";
export {
  checkDocumentCountLimit,
  checkMaxDocumentLength,
  getCurrentMonthPeriodStartUtc,
} from "./usage-calculations";
export type { UsageEventType };

export type UserProfile = {
  id: string;
  email: string | null;
  display_name: string | null;
  plan_key: string;
  created_at: string;
  updated_at: string;
};

export type PlanLimits = {
  id: string;
  plan_key: string;
  monthly_rag_messages: number;
  monthly_vectorize_jobs: number;
  max_saved_documents: number;
  max_document_characters: number;
  max_chunks_per_document: number;
  max_chunks_total: number;
  retrieved_chunks_per_answer: number;
  max_output_tokens: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PlanLimitsErrorCode = "profile_failed" | "plan_limits_missing";

export type PlanLimitsResult =
  | {
      success: true;
      supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>;
      user: User;
      profile: UserProfile;
      planLimits: PlanLimits;
    }
  | {
      success: false;
      code: PlanLimitsErrorCode;
      error: string;
    };

type SupabaseServerClient = NonNullable<
  Awaited<ReturnType<typeof createServerSupabaseClient>>
>;

const profileFields = "id,email,display_name,plan_key,created_at,updated_at";
const planLimitFields =
  "id,plan_key,monthly_rag_messages,monthly_vectorize_jobs,max_saved_documents,max_document_characters,max_chunks_per_document,max_chunks_total,retrieved_chunks_per_answer,max_output_tokens,is_active,created_at,updated_at";

export async function requireAuthenticatedUsageContext() {
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

  return { supabase, user };
}

export async function ensureProfileForCurrentUser(
  supabase: SupabaseServerClient,
  user: User,
): Promise<UserProfile | null> {
  const { data: existingProfile, error: selectError } = await supabase
    .from("profiles")
    .select(profileFields)
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfile) {
    return existingProfile as UserProfile;
  }

  if (selectError) {
    return null;
  }

  const { data: createdProfile, error: insertError } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email ?? null,
      display_name:
        getStringMetadataValue(user, "full_name") ??
        getStringMetadataValue(user, "name"),
      plan_key: "free",
    })
    .select(profileFields)
    .single();

  if (createdProfile) {
    return createdProfile as UserProfile;
  }

  if (insertError) {
    const { data: retryProfile } = await supabase
      .from("profiles")
      .select(profileFields)
      .eq("id", user.id)
      .maybeSingle();

    return retryProfile ? (retryProfile as UserProfile) : null;
  }

  return null;
}

export async function getCurrentUserProfileAndPlan(): Promise<PlanLimitsResult> {
  const { supabase, user } = await requireAuthenticatedUsageContext();
  const profile = await ensureProfileForCurrentUser(supabase, user);

  if (!profile) {
    return {
      success: false,
      code: "profile_failed",
      error:
        "Could not load your usage profile. Please refresh and try again.",
    };
  }

  const { data: planLimits, error } = await supabase
    .from("plan_limits")
    .select(planLimitFields)
    .eq("plan_key", profile.plan_key)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !planLimits) {
    return {
      success: false,
      code: "plan_limits_missing",
      error:
        "Usage limits are not configured for your plan. Please try again later.",
    };
  }

  return {
    success: true,
    supabase,
    user,
    profile,
    planLimits: planLimits as PlanLimits,
  };
}

export async function getSavedDocumentCount(
  supabase: SupabaseServerClient,
  userId: string,
) {
  const { count, error } = await supabase
    .from("documents")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error || count === null) {
    return null;
  }

  return count;
}

function getStringMetadataValue(user: User, key: string) {
  const value = user.user_metadata?.[key];

  return typeof value === "string" && value.trim() ? value : null;
}
