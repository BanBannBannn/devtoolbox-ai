import Link from "next/link";
import { redirect } from "next/navigation";
import { RagChatPanel } from "@/components/rag/rag-chat-panel";
import { RagSessionList } from "@/components/rag/rag-session-list";
import { listOwnedChatSessions } from "@/lib/rag/chat-sessions";
import { createMetadata } from "@/lib/seo";
import {
  createServerSupabaseClient,
  getSupabaseServerEnv,
} from "@/lib/supabase/server";

export const metadata = createMetadata({
  title: "RAG Chat",
  description:
    "Ask questions against your private vectorized DevToolBox AI documents.",
  path: "/dashboard/rag-chat",
});

export default async function DashboardRagChatPage() {
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

  const sessions = await listOwnedChatSessions({
    supabase,
    userId: user.id,
  });

  return (
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/dashboard"
        className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
      >
        Back to dashboard
      </Link>

      <div className="mt-5 shrink-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Private RAG chat
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          RAG Chat
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
          Ask questions against chunks retrieved from your own vectorized
          documents. Vectorize documents first from{" "}
          <Link
            href="/dashboard/documents"
            className="font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Dashboard - Documents
          </Link>
          . Retrieval details show search diagnostics, not AI thinking.
        </p>
      </div>

      <div className="mt-6 grid h-[calc(100vh-24rem)] min-h-[680px] gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <RagSessionList sessions={sessions ?? []} />
        <RagChatPanel />
      </div>
    </div>
  );
}
