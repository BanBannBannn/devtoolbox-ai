import Link from "next/link";
import type { ComponentType } from "react";
import { BookText, Gauge, Layers, MessageSquareText, Zap } from "lucide-react";
import { createMetadata } from "@/lib/seo";
import { getUsageSummaryForCurrentUser } from "@/lib/usage/usage-summary";

export const metadata = createMetadata({
  title: "Usage Limits",
  description: "View your DevToolBox AI usage limits and current quota usage.",
  path: "/dashboard/usage",
});

export default async function UsagePage() {
  const summary = await getUsageSummaryForCurrentUser();

  if (!summary.success) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
        >
          Back to dashboard
        </Link>
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6 text-sm font-medium text-red-800">
          {summary.error}
        </div>
      </div>
    );
  }

  const { planLimits, usageCounts } = summary;
  const documentPercent =
    planLimits.max_saved_documents === 0
      ? 100
      : Math.min(
          (summary.documentCount / planLimits.max_saved_documents) * 100,
          100,
        );

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
          Current plan
        </p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
              Usage limits
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Your active plan is{" "}
              <span className="font-semibold text-slate-950">
                {summary.profile.plan_key}
              </span>
              . These limits are loaded from Supabase and can change without
              hardcoding app logic.
            </p>
          </div>
          <p className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-emerald-800">
            {planLimits.plan_key}
          </p>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <UsageStat
          icon={BookText}
          label="Saved documents"
          value={`${summary.documentCount.toLocaleString()} / ${planLimits.max_saved_documents.toLocaleString()}`}
          note={`${summary.remainingDocumentSlots.toLocaleString()} document slots remaining`}
        />
        <UsageStat
          icon={MessageSquareText}
          label="RAG messages"
          value={`${usageCounts.rag_message.toLocaleString()} / ${planLimits.monthly_rag_messages.toLocaleString()}`}
          note="Reserved for the future RAG chat phase"
        />
        <UsageStat
          icon={Zap}
          label="Vectorize jobs"
          value={`${usageCounts.vectorize_job.toLocaleString()} / ${planLimits.monthly_vectorize_jobs.toLocaleString()}`}
          note="Reserved for the future vectorization phase"
        />
      </section>

      <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <Gauge aria-hidden="true" className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              Document capacity
            </h2>
            <p className="text-sm text-slate-600">
              Period starts {summary.periodStart} UTC for monthly usage events.
            </p>
          </div>
        </div>

        <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-600"
            style={{ width: `${documentPercent}%` }}
          />
        </div>
        <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
          <LimitRow
            label="Max saved documents"
            value={planLimits.max_saved_documents}
          />
          <LimitRow
            label="Max document characters"
            value={planLimits.max_document_characters}
          />
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
              <Layers aria-hidden="true" className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-slate-950">
              Future vector limits
            </h2>
          </div>
          <div className="mt-5 space-y-3 text-sm text-slate-700">
            <LimitRow
              label="Max chunks per document"
              value={planLimits.max_chunks_per_document}
            />
            <LimitRow
              label="Max chunks total"
              value={planLimits.max_chunks_total}
            />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
              <MessageSquareText aria-hidden="true" className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-slate-950">
              Future answer limits
            </h2>
          </div>
          <div className="mt-5 space-y-3 text-sm text-slate-700">
            <LimitRow
              label="Retrieved chunks per answer"
              value={planLimits.retrieved_chunks_per_answer}
            />
            <LimitRow
              label="Max output tokens"
              value={planLimits.max_output_tokens}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

type UsageStatProps = {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: string;
  note: string;
};

function UsageStat({ icon: Icon, label, value, note }: UsageStatProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
        <Icon aria-hidden={true} className="h-5 w-5" />
      </div>
      <h2 className="mt-5 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </h2>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{note}</p>
    </article>
  );
}

function LimitRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md bg-slate-50 px-4 py-3">
      <span>{label}</span>
      <span className="font-semibold text-slate-950">
        {value.toLocaleString()}
      </span>
    </div>
  );
}
