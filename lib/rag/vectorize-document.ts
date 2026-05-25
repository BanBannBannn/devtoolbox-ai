import type { User } from "@supabase/supabase-js";
import { chunkTextForEmbedding, type TextChunk } from "./chunk-text";
import { generateEmbedding, getRagEmbeddingConfig } from "./embedding-provider";
import {
  calculateReplacementChunkTotal,
  getVectorizationUserSafeError,
  isChunkTotalWithinLimit,
  isVectorizeQuotaAvailable,
} from "./vectorize-calculations";
import {
  createServiceRoleSupabaseClient,
  createServerSupabaseClient,
} from "../supabase/server";
import {
  ensureProfileForCurrentUser,
  getCurrentMonthPeriodStartUtc,
  type PlanLimits,
} from "../usage/plan-limits";

export type VectorizeDocumentSuccess = {
  success: true;
  documentId: string;
  status: "vectorized";
  chunkCount: number;
  usage: {
    vectorizeJobsUsed: number;
    vectorizeJobsLimit: number;
    chunksCreated: number;
    chunksTotalLimit: number;
    embeddingModel: string;
    embeddingDimension: number;
  };
};

export type VectorizeDocumentFailure = {
  success: false;
  documentId?: string;
  status?: "failed";
  error: string;
};

export type VectorizeDocumentResult =
  | VectorizeDocumentSuccess
  | VectorizeDocumentFailure;

type SupabaseServerClient = NonNullable<
  Awaited<ReturnType<typeof createServerSupabaseClient>>
>;

type SupabaseServiceClient = NonNullable<
  ReturnType<typeof createServiceRoleSupabaseClient>
>;

type DocumentForVectorization = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  character_count: number;
};

type PlanLimitsRow = PlanLimits;

type ChunkInsert = {
  user_id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  character_count: number;
  token_estimate: number;
  embedding: number[];
  embedding_model: string;
  source_title: string;
  source_anchor: string;
};

const documentFields = "id,user_id,title,content,character_count";
const planLimitFields =
  "id,plan_key,monthly_rag_messages,monthly_vectorize_jobs,max_saved_documents,max_document_characters,max_chunks_per_document,max_chunks_total,retrieved_chunks_per_answer,max_output_tokens,is_active,created_at,updated_at";

export async function vectorizeDocumentForCurrentUser(
  documentId: string,
): Promise<VectorizeDocumentResult> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      success: false,
      error: "Supabase is not configured.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Authentication is required.",
    };
  }

  return vectorizeOwnedDocument({ supabase, user, documentId });
}

async function vectorizeOwnedDocument({
  supabase,
  user,
  documentId,
}: {
  supabase: SupabaseServerClient;
  user: User;
  documentId: string;
}): Promise<VectorizeDocumentResult> {
  const serviceSupabase = createServiceRoleSupabaseClient();

  if (!serviceSupabase) {
    return {
      success: false,
      documentId,
      error: "Document vectorization storage is not configured.",
    };
  }

  const document = await getOwnedDocument(supabase, documentId, user.id);

  if (!document) {
    return {
      success: false,
      documentId,
      error: "Document not found.",
    };
  }

  const planLimits = await getPlanLimitsForUser(supabase, user);

  if (!planLimits) {
    return {
      success: false,
      documentId,
      error: "Usage limits are not configured for your plan.",
    };
  }

  const vectorizeJobsUsed = await countMonthlyVectorizeJobs(supabase, user.id);

  if (vectorizeJobsUsed === null) {
    return {
      success: false,
      documentId,
      error: "Could not check your vectorization usage.",
    };
  }

  if (
    !isVectorizeQuotaAvailable({
      used: vectorizeJobsUsed,
      limit: planLimits.monthly_vectorize_jobs,
    })
  ) {
    return {
      success: false,
      documentId,
      error: "Monthly vectorization quota is exhausted.",
    };
  }

  if (document.character_count > planLimits.max_document_characters) {
    return {
      success: false,
      documentId,
      error: `Document content must be ${planLimits.max_document_characters.toLocaleString()} characters or fewer before vectorization.`,
    };
  }

  const chunkResult = chunkTextForEmbedding({
    text: document.content,
    sourceTitle: document.title,
    maxChunks: planLimits.max_chunks_per_document,
  });

  if (!chunkResult.success) {
    return {
      success: false,
      documentId,
      error: chunkResult.error,
    };
  }

  const [currentTotalChunks, oldChunksForDocument] = await Promise.all([
    countChunksForUser(serviceSupabase, user.id),
    countChunksForDocument(serviceSupabase, document.id, user.id),
  ]);

  if (currentTotalChunks === null || oldChunksForDocument === null) {
    return {
      success: false,
      documentId,
      error: "Could not check your current chunk usage.",
    };
  }

  const newTotal = calculateReplacementChunkTotal({
    currentTotalChunks,
    oldChunksForDocument,
    newChunkCount: chunkResult.chunks.length,
  });

  if (
    !isChunkTotalWithinLimit({
      newTotal,
      maxChunksTotal: planLimits.max_chunks_total,
    })
  ) {
    return {
      success: false,
      documentId,
      error: `Vectorization would exceed your ${planLimits.max_chunks_total.toLocaleString()} total chunk limit.`,
    };
  }

  const embeddingConfig = getRagEmbeddingConfig();

  if (!embeddingConfig.success) {
    return {
      success: false,
      documentId,
      error: embeddingConfig.error,
    };
  }

  let providerWorkStarted = false;

  try {
    const statusSet = await updateDocumentVectorStatus(supabase, {
      documentId: document.id,
      userId: user.id,
      status: "vectorizing",
      vectorizedAt: null,
      lastVectorizeError: null,
    });

    if (!statusSet) {
      return {
        success: false,
        documentId,
        error: "Could not update document vectorization status.",
      };
    }

    providerWorkStarted = true;
    const chunksToInsert = await createChunkInserts({
      chunks: chunkResult.chunks,
      document,
      userId: user.id,
    });

    await recordVectorizeUsageEvent(supabase, user.id, document.id);

    await replaceDocumentChunks(serviceSupabase, {
      documentId: document.id,
      userId: user.id,
      chunks: chunksToInsert,
    });

    const vectorized = await updateDocumentVectorStatus(supabase, {
      documentId: document.id,
      userId: user.id,
      status: "vectorized",
      vectorizedAt: new Date().toISOString(),
      lastVectorizeError: null,
    });

    if (!vectorized) {
      throw new Error("Could not update document vectorized status.");
    }

    const firstChunk = chunksToInsert[0];

    return {
      success: true,
      documentId: document.id,
      status: "vectorized",
      chunkCount: chunksToInsert.length,
      usage: {
        vectorizeJobsUsed: vectorizeJobsUsed + 1,
        vectorizeJobsLimit: planLimits.monthly_vectorize_jobs,
        chunksCreated: chunksToInsert.length,
        chunksTotalLimit: planLimits.max_chunks_total,
        embeddingModel: firstChunk.embedding_model,
        embeddingDimension: firstChunk.embedding.length,
      },
    };
  } catch (error) {
    const safeError = getVectorizationUserSafeError(error);

    if (providerWorkStarted) {
      await updateDocumentVectorStatus(supabase, {
        documentId: document.id,
        userId: user.id,
        status: "failed",
        vectorizedAt: null,
        lastVectorizeError: safeError,
      });
    }

    return {
      success: false,
      documentId: document.id,
      status: providerWorkStarted ? "failed" : undefined,
      error: safeError,
    };
  }
}

async function getOwnedDocument(
  supabase: SupabaseServerClient,
  documentId: string,
  userId: string,
) {
  const { data, error } = await supabase
    .from("documents")
    .select(documentFields)
    .eq("id", documentId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as DocumentForVectorization;
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

async function countMonthlyVectorizeJobs(
  supabase: SupabaseServerClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("usage_events")
    .select("quantity")
    .eq("user_id", userId)
    .eq("event_type", "vectorize_job")
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

async function countChunksForUser(
  supabase: SupabaseServiceClient,
  userId: string,
) {
  const { count, error } = await supabase
    .from("document_chunks")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error || count === null) {
    return null;
  }

  return count;
}

async function countChunksForDocument(
  supabase: SupabaseServiceClient,
  documentId: string,
  userId: string,
) {
  const { count, error } = await supabase
    .from("document_chunks")
    .select("id", { count: "exact", head: true })
    .eq("document_id", documentId)
    .eq("user_id", userId);

  if (error || count === null) {
    return null;
  }

  return count;
}

async function createChunkInserts({
  chunks,
  document,
  userId,
}: {
  chunks: TextChunk[];
  document: DocumentForVectorization;
  userId: string;
}) {
  const inserts: ChunkInsert[] = [];

  for (const chunk of chunks) {
    const embeddingResult = await generateEmbedding(chunk.content);

    if (!embeddingResult.success) {
      throw new Error(embeddingResult.error);
    }

    inserts.push({
      user_id: userId,
      document_id: document.id,
      chunk_index: chunk.chunkIndex,
      content: chunk.content,
      character_count: chunk.characterCount,
      token_estimate: chunk.tokenEstimate,
      embedding: embeddingResult.embedding,
      embedding_model: embeddingResult.model,
      source_title: chunk.sourceTitle,
      source_anchor: chunk.sourceAnchor,
    });
  }

  return inserts;
}

async function replaceDocumentChunks(
  supabase: SupabaseServiceClient,
  {
    documentId,
    userId,
    chunks,
  }: {
    documentId: string;
    userId: string;
    chunks: ChunkInsert[];
  },
) {
  const { error: deleteError } = await supabase
    .from("document_chunks")
    .delete()
    .eq("document_id", documentId)
    .eq("user_id", userId);

  if (deleteError) {
    throw new Error("Could not replace existing document chunks.");
  }

  const { error: insertError } = await supabase
    .from("document_chunks")
    .insert(chunks);

  if (insertError) {
    throw new Error("Could not save document chunks.");
  }
}

async function recordVectorizeUsageEvent(
  supabase: SupabaseServerClient,
  userId: string,
  documentId: string,
) {
  const { error } = await supabase.from("usage_events").insert({
    user_id: userId,
    event_type: "vectorize_job",
    quantity: 1,
    period_start: getCurrentMonthPeriodStartUtc(),
    metadata: {
      documentId,
    },
  });

  if (error) {
    throw new Error("Could not record vectorization usage.");
  }
}

async function updateDocumentVectorStatus(
  supabase: SupabaseServerClient,
  {
    documentId,
    userId,
    status,
    vectorizedAt,
    lastVectorizeError,
  }: {
    documentId: string;
    userId: string;
    status: "vectorizing" | "vectorized" | "failed";
    vectorizedAt: string | null;
    lastVectorizeError: string | null;
  },
) {
  const { error } = await supabase
    .from("documents")
    .update({
      vector_status: status,
      vectorized_at: vectorizedAt,
      last_vectorize_error: lastVectorizeError,
    })
    .eq("id", documentId)
    .eq("user_id", userId);

  return !error;
}
