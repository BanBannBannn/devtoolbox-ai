import Link from "next/link";
import {
  ArrowRight,
  BookText,
  Gauge,
  MessageSquareText,
  PenLine,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";
import { isRagAdminEmail } from "@/lib/rag/rag-admin";
import { createMetadata } from "@/lib/seo";
import {
  createServerSupabaseClient,
  getSupabaseServerEnv,
} from "@/lib/supabase/server";

const dashboardCards = [
  {
    title: "Documents",
    description:
      "Create and manage private text or Markdown documents.",
    icon: BookText,
    href: "/dashboard/documents",
    cta: "Open documents",
  },
  {
    title: "Blog",
    description:
      "Write drafts, preview posts, and submit developer articles for review.",
    icon: PenLine,
    href: "/dashboard/blog",
    cta: "Open blog posts",
  },
  {
    title: "Usage",
    description:
      "View your current plan limits, saved document capacity, and monthly usage counters.",
    icon: Gauge,
    href: "/dashboard/usage",
    cta: "Open usage",
  },
  {
    title: "RAG Chat",
    description:
      "Ask questions against your private vectorized documents with cited sources and retrieval diagnostics.",
    icon: MessageSquareText,
    href: "/dashboard/rag-chat",
    cta: "Open RAG chat",
  },
  {
    title: "Settings",
    description:
      "Manage account and platform preferences in a later phase. Settings are a placeholder for now.",
    icon: Settings,
    cta: "Coming in a later phase",
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

  const cards = isRagAdminEmail(user.email)
    ? [
        ...dashboardCards,
        {
          title: "Admin RAG Settings",
          description:
            "Tune private RAG runtime retrieval and answer generation settings.",
          icon: ShieldCheck,
          href: "/dashboard/admin/rag-settings",
          cta: "Open admin settings",
        },
      ]
    : dashboardCards;

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
        {cards.map((card) => {
          const Icon = card.icon;

          const cardContent = (
            <>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <Icon aria-hidden="true" className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-xl font-semibold text-slate-950">
                {card.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {card.description}
              </p>
              <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                {card.cta}
                {card.href ? <ArrowRight aria-hidden="true" className="h-3 w-3" /> : null}
              </p>
            </>
          );

          if (card.href) {
            return (
              <Link
                key={card.title}
                href={card.href}
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
              >
                {cardContent}
              </Link>
            );
          }

          return (
            <article
              key={card.title}
              className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
            >
              {cardContent}
            </article>
          );
        })}
      </section>
    </div>
  );
}
