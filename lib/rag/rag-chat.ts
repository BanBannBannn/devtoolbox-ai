import type { User } from "@supabase/supabase-js";
import { generateEmbedding } from "./embedding-provider";
import { generateRagAnswer } from "./rag-llm-provider";
import {
  createRagPromptMessages,
  createRetrievalDetails,
  mapChunksToSources,
  type RagRetrievalDetails,
  type RagSource,
  type RetrievedDocumentChunk,
} from "./rag-prompt";
import { createRagUsageSummary, type RagUsageSummary } from "./rag-response";
import { validateRagChatRequestBody } from "./rag-chat-validation";
import { createServerSupabaseClient } from "../supabase/server";
import {
  ensureProfileForCurrentUser,
  getCurrentMonthPeriodStartUtc,
  type PlanLimits,
} from "../usage/plan-limits";

export type RagChatSuccess = {
  success: true;
  answer: string;
  sources: RagSource[];
  usage: RagUsageSummary;
  retrievalDetails: RagRetrievalDetails;
};

export type RagChatFailure = {
  success: false;
  error: string;
  statusCode: number;
};

export type RagChatResult = RagChatSuccess | RagChatFailure;

type SupabaseServerClient = NonNullable<
  Awaited<ReturnType<typeof createServerSupabaseClient>>
>;

type PlanLimitsRow = PlanLimits;

type MatchDocumentChunkRow = {
  id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  source_title: string;
  source_anchor: string | null;
  similarity: number;
};

const planLimitFields =
  "id,plan_key,monthly_rag_messages,monthly_vectorize_jobs,max_saved_documents,max_document_characters,max_chunks_per_document,max_chunks_total,retrieved_chunks_per_answer,max_output_tokens,is_active,created_at,updated_at";

export async function answerRagChatForCurrentUser(
  body: unknown,
): Promise<RagChatResult> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return createFailure("Supabase is not configured.", 500);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return createFailure("Authentication is required.", 401);
  }

  const validation = validateRagChatRequestBody(body);

  if (!validation.success) {
    return createFailure(validation.error, 400);
  }

  const planLimits = await getPlanLimitsForUser(supabase, user);

  if (!planLimits) {
    return createFailure(
      "Usage limits are not configured for your plan. Please try again later.",
      500,
    );
  }

  const ragMessagesUsed = await countMonthlyRagMessages(supabase, user.id);

  if (ragMessagesUsed === null) {
    return createFailure("Could not check your RAG chat usage.", 500);
  }

  if (ragMessagesUsed >= planLimits.monthly_rag_messages) {
    return createFailure("Monthly RAG chat quota is exhausted.", 429);
  }

  const usageRecorded = await recordRagMessageUsageEvent(supabase, user.id);

  if (!usageRecorded) {
    return createFailure("Could not record RAG chat usage.", 500);
  }

  const embeddingResult = await generateEmbedding(validation.request.message);

  if (!embeddingResult.success) {
    return createFailure(embeddingResult.error, 502);
  }

  const retrievedChunks = await retrieveMatchedChunks({
    supabase,
    queryEmbedding: embeddingResult.embedding,
    matchCount: planLimits.retrieved_chunks_per_answer,
  });

  if (!retrievedChunks.success) {
    return createFailure(retrievedChunks.error, 500);
  }

  const sources = mapChunksToSources(retrievedChunks.chunks);
  const retrievalDetails = createRetrievalDetails({
    chunks: retrievedChunks.chunks,
    queryEmbedded: true,
  });
  const usage = createRagUsageSummary({
    ragMessagesUsed: ragMessagesUsed + 1,
    ragMessagesLimit: planLimits.monthly_rag_messages,
    retrievedChunks: retrievedChunks.chunks.length,
    maxRetrievedChunks: planLimits.retrieved_chunks_per_answer,
  });

  if (retrievedChunks.chunks.length === 0) {
    return {
      success: true,
      answer:
        "No relevant vectorized document content was found for that question. Try vectorizing a document first, or ask about content that exists in your saved documents.",
      sources,
      usage,
      retrievalDetails,
    };
  }

  const prompt = createRagPromptMessages({
    message: validation.request.message,
    chunks: retrievedChunks.chunks,
  });
  const answerResult = await generateRagAnswer({
    systemPrompt: prompt.system,
    userPrompt: prompt.user,
    maxOutputTokens: planLimits.max_output_tokens,
  });

  if (!answerResult.success) {
    return createFailure(answerResult.error, 502);
  }

  return {
    success: true,
    answer: answerResult.answer,
    sources,
    usage,
    retrievalDetails,
  };
}

function createFailure(error: string, statusCode: number): RagChatFailure {
  return {
    success: false,
    error,
    statusCode,
  };
}

async function getPlanLimitsForUser(
  supabase: SupabaseServerClient,
  user: User,
) {
  const profile = await ensureProfileForCurrentUser(supabase, user);

  if (!profile) {
    return null;
  }

  const { data, error } = await supabase
    .from("plan_limits")
    .select(planLimitFields)
    .eq("plan_key", profile.plan_key)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as PlanLimitsRow;
}

async function countMonthlyRagMessages(
  supabase: SupabaseServerClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("usage_events")
    .select("quantity")
    .eq("user_id", userId)
    .eq("event_type", "rag_message")
    .eq("period_start", getCurrentMonthPeriodStartUtc());

  if (error || !data) {
    return null;
  }

  return data.reduce((total, event) => {
    const quantity =
      typeof event.quantity === "number" && Number.isFinite(event.quantity)
        ? event.quantity
        : 0;

    return total + quantity;
  }, 0);
}

async function recordRagMessageUsageEvent(
  supabase: SupabaseServerClient,
  userId: string,
) {
  const { error } = await supabase.from("usage_events").insert({
    user_id: userId,
    event_type: "rag_message",
    quantity: 1,
    period_start: getCurrentMonthPeriodStartUtc(),
    metadata: {},
  });

  return !error;
}

async function retrieveMatchedChunks({
  supabase,
  queryEmbedding,
  matchCount,
}: {
  supabase: SupabaseServerClient;
  queryEmbedding: number[];
  matchCount: number;
}): Promise<
  | {
      success: true;
      chunks: RetrievedDocumentChunk[];
    }
  | {
      success: false;
      error: string;
    }
> {
  const { data, error } = await supabase.rpc("match_document_chunks", {
    query_embedding: queryEmbedding,
    match_count: matchCount,
  });

  if (error) {
    return {
      success: false,
      error: "Could not retrieve matching document chunks.",
    };
  }

  const rows = Array.isArray(data) ? (data as MatchDocumentChunkRow[]) : [];

  return {
    success: true,
    chunks: rows.map((row) => ({
      id: row.id,
      documentId: row.document_id,
      chunkIndex: row.chunk_index,
      content: row.content,
      sourceTitle: row.source_title,
      sourceAnchor: row.source_anchor ?? `chunk-${row.chunk_index}`,
      similarity: row.similarity,
    })),
  };
}
