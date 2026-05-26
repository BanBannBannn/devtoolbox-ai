import Link from "next/link";
import { redirect } from "next/navigation";
import { RagChatPanel } from "@/components/rag/rag-chat-panel";
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

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/dashboard"
        className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
      >
        Back to dashboard
      </Link>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Private RAG chat
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
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

      <div className="mt-8">
        <RagChatPanel />
      </div>
    </div>
  );
}
