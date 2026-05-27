import type { RagRetrievalDetails, RagSource } from "./rag-prompt";
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

type ChatSessionRow = {
  id: string;
  user_id: string;
  title: string;
};

type ChatMessageRow = {
  id: string;
  role: RagChatRole;
  content: string;
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

async function loadOwnedChatSession({
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
    .select("id,user_id,title")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as ChatSessionRow;
}
