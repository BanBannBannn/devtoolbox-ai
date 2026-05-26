import { createServiceRoleSupabaseClient } from "../supabase/server";

export type AdminPlanLimit = {
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
};

export type PlanLimitFormInput = Omit<AdminPlanLimit, "plan_key">;

type NumericPlanLimitKey = Exclude<
  keyof PlanLimitFormInput,
  "id" | "is_active"
>;

export const PLAN_LIMIT_RANGES = {
  monthly_rag_messages: { min: 0, max: 100000 },
  monthly_vectorize_jobs: { min: 0, max: 100000 },
  max_saved_documents: { min: 0, max: 100000 },
  max_document_characters: { min: 100, max: 1000000 },
  max_chunks_per_document: { min: 1, max: 10000 },
  max_chunks_total: { min: 1, max: 1000000 },
  retrieved_chunks_per_answer: { min: 1, max: 20 },
  max_output_tokens: { min: 100, max: 4000 },
} satisfies Record<NumericPlanLimitKey, { min: number; max: number }>;

const planLimitFields =
  "id,plan_key,monthly_rag_messages,monthly_vectorize_jobs,max_saved_documents,max_document_characters,max_chunks_per_document,max_chunks_total,retrieved_chunks_per_answer,max_output_tokens,is_active";

export async function getAdminPlanLimits() {
  const supabase = createServiceRoleSupabaseClient();

  if (!supabase) {
    return {
      success: false,
      error: "Plan limit storage is not configured.",
      plans: [] as AdminPlanLimit[],
    };
  }

  const { data, error } = await supabase
    .from("plan_limits")
    .select(planLimitFields)
    .order("plan_key", { ascending: true });

  if (error || !data) {
    return {
      success: false,
      error: "Could not load plan limits.",
      plans: [] as AdminPlanLimit[],
    };
  }

  return {
    success: true,
    plans: data as AdminPlanLimit[],
  };
}

export async function saveAdminPlanLimit(planId: string, input: PlanLimitFormInput) {
  const supabase = createServiceRoleSupabaseClient();

  if (!supabase) {
    return {
      success: false,
      error: "Plan limit storage is not configured.",
    };
  }

  const { error } = await supabase
    .from("plan_limits")
    .update({
      monthly_rag_messages: input.monthly_rag_messages,
      monthly_vectorize_jobs: input.monthly_vectorize_jobs,
      max_saved_documents: input.max_saved_documents,
      max_document_characters: input.max_document_characters,
      max_chunks_per_document: input.max_chunks_per_document,
      max_chunks_total: input.max_chunks_total,
      retrieved_chunks_per_answer: input.retrieved_chunks_per_answer,
      max_output_tokens: input.max_output_tokens,
      is_active: input.is_active,
    })
    .eq("id", planId);

  if (error) {
    return {
      success: false,
      error: "Could not save plan limits.",
    };
  }

  return {
    success: true,
  };
}

export function getPlanLimitInputFromFormData(
  planId: string,
  formData: FormData,
): PlanLimitFormInput {
  return {
    id: planId,
    monthly_rag_messages: getClampedNumber(
      formData,
      "monthly_rag_messages",
    ),
    monthly_vectorize_jobs: getClampedNumber(
      formData,
      "monthly_vectorize_jobs",
    ),
    max_saved_documents: getClampedNumber(formData, "max_saved_documents"),
    max_document_characters: getClampedNumber(
      formData,
      "max_document_characters",
    ),
    max_chunks_per_document: getClampedNumber(
      formData,
      "max_chunks_per_document",
    ),
    max_chunks_total: getClampedNumber(formData, "max_chunks_total"),
    retrieved_chunks_per_answer: getClampedNumber(
      formData,
      "retrieved_chunks_per_answer",
    ),
    max_output_tokens: getClampedNumber(formData, "max_output_tokens"),
    is_active: formData.get("is_active") === "on",
  };
}

function getClampedNumber(formData: FormData, key: NumericPlanLimitKey) {
  const range = PLAN_LIMIT_RANGES[key];
  const value = Number(formData.get(key));

  if (!Number.isFinite(value)) {
    return range.min;
  }

  return Math.trunc(Math.min(Math.max(value, range.min), range.max));
}
