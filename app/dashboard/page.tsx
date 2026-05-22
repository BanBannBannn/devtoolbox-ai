import { BookText, Gauge, MessageSquareText, Settings } from "lucide-react";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";
import { createMetadata } from "@/lib/seo";
import {
  createServerSupabaseClient,
  getSupabaseServerEnv,
} from "@/lib/supabase/server";

const dashboardCards = [
  {
    title: "Documents",
    description:
      "Create and manage text or Markdown documents in Phase 2. Document CRUD is not active yet.",
    icon: BookText,
  },
  {
    title: "Usage",
    description:
      "View monthly limits and quota usage in Phase 3. Usage tracking is coming later.",
    icon: Gauge,
  },
  {
    title: "RAG Chat",
    description:
      "Chat with your vectorized knowledge base in Phase 5 and Phase 6. RAG chat is not active yet.",
    icon: MessageSquareText,
  },
  {
    title: "Settings",
    description:
      "Manage account and platform preferences in a later phase. Settings are a placeholder for now.",
    icon: Settings,
  },
];

export const metadata = createMetadata({
  title: "Dashboard",
  description: "Protected DevToolBox AI dashboard shell.",
  path: "/dashboard",
});

export default async function DashboardPage() {
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
      <div className="flex flex-col gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Private dashboard
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            Dashboard
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            You are signed in as{" "}
            <span className="font-semibold text-slate-950">{user.email}</span>.
            This shell is ready for the later document, usage, vectorization,
            and RAG chat phases.
          </p>
        </div>
        <LogoutButton />
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {dashboardCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.title}
              className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <Icon aria-hidden="true" className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-xl font-semibold text-slate-950">
                {card.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {card.description}
              </p>
              <p className="mt-5 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Coming in a later phase
              </p>
            </article>
          );
        })}
      </section>
    </div>
  );
}
