import {
  getCurrentUserProfileAndPlan,
  getSavedDocumentCount,
  type PlanLimits,
  type UserProfile,
} from "@/lib/usage/plan-limits";
import {
  getCurrentMonthPeriodStartUtc,
  summarizeUsageEvents,
  type UsageCounts,
  type UsageEventQuantity,
} from "@/lib/usage/usage-calculations";

export type UsageSummary = {
  profile: UserProfile;
  planLimits: PlanLimits;
  periodStart: string;
  documentCount: number;
  remainingDocumentSlots: number;
  usageCounts: UsageCounts;
};

export async function getUsageSummaryForCurrentUser() {
  const result = await getCurrentUserProfileAndPlan();

  if (!result.success) {
    return result;
  }

  const periodStart = getCurrentMonthPeriodStartUtc();
  const [documentCount, usageEventsResult] = await Promise.all([
    getSavedDocumentCount(result.supabase, result.user.id),
    result.supabase
      .from("usage_events")
      .select("event_type,quantity")
      .eq("user_id", result.user.id)
      .eq("period_start", periodStart),
  ]);

  if (documentCount === null || usageEventsResult.error) {
    return {
      success: false as const,
      code: "plan_limits_missing" as const,
      error:
        "Could not load your current usage summary. Please try again later.",
    };
  }

  const usageCounts = summarizeUsageEvents(
    (usageEventsResult.data ?? []) as UsageEventQuantity[],
  );
  const remainingDocumentSlots = Math.max(
    result.planLimits.max_saved_documents - documentCount,
    0,
  );

  return {
    success: true as const,
    profile: result.profile,
    planLimits: result.planLimits,
    periodStart,
    documentCount,
    remainingDocumentSlots,
    usageCounts,
  } satisfies UsageSummary & { success: true };
}
