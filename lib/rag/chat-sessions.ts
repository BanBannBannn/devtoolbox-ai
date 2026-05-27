import type {
  RagRetrievalDetails,
  RagRetrievalDetailsChunk,
  RagSource,
} from "./rag-prompt";
import type { RagUsageSummary } from "./rag-response";
import { createServerSupabaseClient } from "../supabase/server";

type SupabaseServerClient = NonNullable<
  Awaited<ReturnType<typeof createServerSupabaseClient>>
>;

export type RagChatRole = "user" | "assistant";

export type RagChatHistoryMessage = {
  role: RagChatRole;
  content: string;
};

export type RagChatSessionSummary = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type RagChatStoredMessage = {
  id: string;
  role: RagChatRole;
  content: string;
  sources: RagSource[];
  retrievalDetails: RagRetrievalDetails | null;
  usage: RagUsageSummary | null;
  createdAt: string;
};

export type ChatSessionRow = {
  id: string;
  user_id: string;
  title: string;
  created_at?: string;
  updated_at?: string;
};

type ChatMessageRow = {
  id: string;
  role: RagChatRole;
  content: string;
  sources?: unknown;
  retrieval_details?: unknown;
  usage?: unknown;
  created_at: string;
};

const titleMaxLength = 60;
const fallbackSessionTitle = "New RAG chat";

export function generateSessionTitle(message: string) {
  const normalized = message.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return fallbackSessionTitle;
  }

  return normalized.length <= titleMaxLength
    ? normalized
    : normalized.slice(0, titleMaxLength).trimEnd();
}

export async function getOrCreateOwnedChatSession({
  supabase,
  userId,
  sessionId,
  firstMessage,
}: {
  supabase: SupabaseServerClient;
  userId: string;
  sessionId?: string;
  firstMessage: string;
}) {
  if (sessionId) {
    return loadOwnedChatSession({ supabase, userId, sessionId });
  }

  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({
      user_id: userId,
      title: generateSessionTitle(firstMessage),
    })
    .select("id,user_id,title")
    .single();

  if (error || !data) {
    return null;
  }

  return data as ChatSessionRow;
}

export async function listOwnedChatSessions({
  supabase,
  userId,
  limit = 25,
}: {
  supabase: SupabaseServerClient;
  userId: string;
  limit?: number;
}) {
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("id,title,created_at,updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return null;
  }

  return data.map(mapChatSessionRow);
}

export async function loadOwnedChatSession({
  supabase,
  userId,
  sessionId,
}: {
  supabase: SupabaseServerClient;
  userId: string;
  sessionId: string;
}) {
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("id,user_id,title,created_at,updated_at")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as ChatSessionRow;
}

export async function listOwnedChatMessages({
  supabase,
  userId,
  sessionId,
}: {
  supabase: SupabaseServerClient;
  userId: string;
  sessionId: string;
}) {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("id,role,content,sources,retrieval_details,usage,created_at")
    .eq("user_id", userId)
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return null;
  }

  return (data as ChatMessageRow[]).map(mapChatMessageRow);
}

export async function insertChatMessage({
  supabase,
  userId,
  sessionId,
  role,
  content,
  sources,
  retrievalDetails,
  usage,
}: {
  supabase: SupabaseServerClient;
  userId: string;
  sessionId: string;
  role: RagChatRole;
  content: string;
  sources?: RagSource[];
  retrievalDetails?: RagRetrievalDetails;
  usage?: RagUsageSummary;
}) {
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      user_id: userId,
      session_id: sessionId,
      role,
      content,
      sources: sources ?? null,
      retrieval_details: retrievalDetails ?? null,
      usage: usage ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return null;
  }

  return data.id as string;
}

export async function listRecentChatMessages({
  supabase,
  userId,
  sessionId,
  limit,
  excludeMessageId,
}: {
  supabase: SupabaseServerClient;
  userId: string;
  sessionId: string;
  limit: number;
  excludeMessageId?: string;
}) {
  if (limit <= 0) {
    return [] satisfies RagChatHistoryMessage[];
  }

  let query = supabase
    .from("chat_messages")
    .select("id,role,content,created_at")
    .eq("user_id", userId)
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (excludeMessageId) {
    query = query.neq("id", excludeMessageId);
  }

  const { data, error } = await query;

  if (error || !data) {
    return null;
  }

  return (data as ChatMessageRow[])
    .reverse()
    .map((message) => ({
      role: message.role,
      content: message.content,
    }));
}

export async function bumpChatSessionUpdatedAt({
  supabase,
  userId,
  sessionId,
}: {
  supabase: SupabaseServerClient;
  userId: string;
  sessionId: string;
}) {
  const { error } = await supabase
    .from("chat_sessions")
    .update({
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .eq("user_id", userId);

  return !error;
}

export function mapChatSessionRow(row: {
  id: string;
  title: string;
  created_at?: string | null;
  updated_at?: string | null;
}): RagChatSessionSummary {
  return {
    id: row.id,
    title: row.title || fallbackSessionTitle,
    createdAt: row.created_at ?? "",
    updatedAt: row.updated_at ?? row.created_at ?? "",
  };
}

export function mapChatMessageRow(row: ChatMessageRow): RagChatStoredMessage {
  return {
    id: row.id,
    role: row.role === "assistant" ? "assistant" : "user",
    content: row.content,
    sources: parseSources(row.sources),
    retrievalDetails: parseRetrievalDetails(row.retrieval_details),
    usage: parseUsage(row.usage),
    createdAt: row.created_at,
  };
}

function parseSources(value: unknown): RagSource[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isSource).map(mapSource);
}

function parseRetrievalDetails(value: unknown): RagRetrievalDetails | null {
  if (
    !isRecord(value) ||
    typeof value.queryEmbedded !== "boolean" ||
    typeof value.matchedChunkCount !== "number" ||
    value.similarityMetric !== "cosine" ||
    !Array.isArray(value.retrievedChunks)
  ) {
    return null;
  }

  return {
    queryEmbedded: value.queryEmbedded,
    matchedChunkCount: value.matchedChunkCount,
    similarityMetric: value.similarityMetric,
    retrievedChunks: value.retrievedChunks
      .filter(isRetrievalChunk)
      .map((chunk) => ({
        ...mapSource(chunk),
        similarity: chunk.similarity,
      })),
    similarityThreshold:
      typeof value.similarityThreshold === "number"
        ? value.similarityThreshold
        : undefined,
    debugRetrievalEnabled:
      typeof value.debugRetrievalEnabled === "boolean"
        ? value.debugRetrievalEnabled
        : undefined,
  };
}

function mapSource(source: RagSource): RagSource {
  return {
    documentId: source.documentId,
    chunkIndex: source.chunkIndex,
    sourceTitle: source.sourceTitle,
    sourceAnchor: source.sourceAnchor,
    snippet: source.snippet,
  };
}

function parseUsage(value: unknown): RagUsageSummary | null {
  if (
    !isRecord(value) ||
    typeof value.ragMessagesUsed !== "number" ||
    typeof value.ragMessagesLimit !== "number" ||
    typeof value.retrievedChunks !== "number" ||
    typeof value.maxRetrievedChunks !== "number"
  ) {
    return null;
  }

  return {
    ragMessagesUsed: value.ragMessagesUsed,
    ragMessagesLimit: value.ragMessagesLimit,
    retrievedChunks: value.retrievedChunks,
    maxRetrievedChunks: value.maxRetrievedChunks,
  };
}

function isRetrievalChunk(value: unknown): value is RagRetrievalDetailsChunk {
  return (
    isRecord(value) &&
    typeof value.similarity === "number" &&
    isSource(value)
  );
}

function isSource(value: unknown): value is RagSource {
  return (
    isRecord(value) &&
    typeof value.documentId === "string" &&
    typeof value.chunkIndex === "number" &&
    typeof value.sourceTitle === "string" &&
    typeof value.sourceAnchor === "string" &&
    typeof value.snippet === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
