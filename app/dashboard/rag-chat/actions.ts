"use server";

import {
  deleteOwnedChatSession,
  renameOwnedChatSession,
} from "@/lib/rag/chat-sessions";
import {
  createServerSupabaseClient,
  getSupabaseServerEnv,
} from "@/lib/supabase/server";

type ChatSessionActionResult =
  | {
      success: true;
      title?: string;
    }
  | {
      success: false;
      error: string;
    };

async function getAuthenticatedSessionContext(): Promise<
  | {
      success: true;
      supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>;
      userId: string;
    }
  | {
      success: false;
      error: string;
    }
> {
  const authConfig = getSupabaseServerEnv();

  if (!authConfig.isConfigured) {
    return {
      success: false,
      error: "Authentication is not configured.",
    };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      success: false,
      error: "Authentication is not configured.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Sign in before managing chat sessions.",
    };
  }

  return {
    success: true,
    supabase,
    userId: user.id,
  };
}

export async function renameChatSessionAction({
  sessionId,
  title,
}: {
  sessionId: string;
  title: string;
}): Promise<ChatSessionActionResult> {
  const context = await getAuthenticatedSessionContext();

  if (!context.success) {
    return context;
  }

  const result = await renameOwnedChatSession({
    supabase: context.supabase,
    userId: context.userId,
    sessionId,
    title,
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  return {
    success: true,
    title: result.session.title,
  };
}

export async function deleteChatSessionAction({
  sessionId,
}: {
  sessionId: string;
}): Promise<ChatSessionActionResult> {
  const context = await getAuthenticatedSessionContext();

  if (!context.success) {
    return context;
  }

  const result = await deleteOwnedChatSession({
    supabase: context.supabase,
    userId: context.userId,
    sessionId,
  });

  if (!result.success) {
    return result;
  }

  return {
    success: true,
  };
}
