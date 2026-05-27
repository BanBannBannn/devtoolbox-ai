import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { RagChatPanel } from "@/components/rag/rag-chat-panel";
import {
  listOwnedChatMessages,
  listOwnedChatSessions,
  loadOwnedChatSession,
} from "@/lib/rag/chat-sessions";
import { createMetadata } from "@/lib/seo";
import {
  createServerSupabaseClient,
  getSupabaseServerEnv,
} from "@/lib/supabase/server";

export const metadata = createMetadata({
  title: "RAG Chat Session",
  description:
    "Continue a private DevToolBox AI RAG chat against your vectorized documents.",
  path: "/dashboard/rag-chat",
});

export default async function DashboardRagChatSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const authConfig = getSupabaseServerEnv();

  if (!authConfig.isConfigured) {
    redirect("/login?error=auth_config");
  }

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

  const [session, sessions, messages] = await Promise.all([
    loadOwnedChatSession({
      supabase,
      userId: user.id,
      sessionId,
    }),
    listOwnedChatSessions({
      supabase,
      userId: user.id,
    }),
    listOwnedChatMessages({
      supabase,
      userId: user.id,
      sessionId,
    }),
  ]);

  if (!session) {
    notFound();
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/dashboard/rag-chat"
        className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
      >
        Back to RAG chats
      </Link>

      <div className="mt-5 shrink-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Saved RAG chat
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          {session.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
          Continue this saved conversation. Retrieval still searches only your
          own vectorized document chunks, and diagnostics are not AI thinking.
        </p>
      </div>

      <div className="mt-6 grid h-[calc(100vh-24rem)] min-h-[680px] gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <SessionList
          activeSessionId={session.id}
          sessions={sessions ?? []}
        />
        <RagChatPanel
          sessionId={session.id}
          initialMessages={messages ?? []}
        />
      </div>
    </div>
  );
}

function SessionList({
  activeSessionId,
  sessions,
}: {
  activeSessionId: string;
  sessions: {
    id: string;
    title: string;
    updatedAt: string;
  }[];
}) {
  return (
    <aside className="flex max-h-64 min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:h-full lg:max-h-none">
      <div className="shrink-0 border-b border-slate-200 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-950">
            Recent chats
          </h2>
          <Link
            href="/dashboard/rag-chat"
            className="rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            New chat
          </Link>
        </div>
      </div>

      {sessions.length === 0 ? (
        <p className="m-5 rounded-md bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
          No RAG chat sessions yet.
        </p>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="grid gap-2">
            {sessions.map((chatSession) => {
              const isActive = chatSession.id === activeSessionId;

              return (
                <Link
                  key={chatSession.id}
                  href={`/dashboard/rag-chat/${chatSession.id}`}
                  className={`rounded-md border px-3 py-3 transition ${
                    isActive
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-slate-200 hover:border-emerald-200 hover:bg-emerald-50"
                  }`}
                >
                  <p className="line-clamp-2 text-sm font-semibold text-slate-950">
                    {chatSession.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Updated {formatDateTime(chatSession.updatedAt)}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}

function formatDateTime(value: string) {
  if (!value) {
    return "recently";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "recently";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
