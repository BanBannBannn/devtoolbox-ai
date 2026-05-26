import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  resetRagRuntimeSettingsAction,
  savePlanLimitAction,
  saveRagRuntimeSettingsAction,
} from "./actions";
import {
  getAdminPlanLimits,
  PLAN_LIMIT_RANGES,
  type AdminPlanLimit,
} from "@/lib/rag/plan-limit-admin";
import { isRagAdminEmail } from "@/lib/rag/rag-admin";
import {
  getStoredRagRuntimeSettings,
  resolveRagRuntimeConfig,
  RUNTIME_RANGES,
  sanitizeRagRuntimeSettings,
} from "@/lib/rag/rag-runtime-config";
import { createMetadata } from "@/lib/seo";
import {
  createServerSupabaseClient,
  getSupabaseServerEnv,
} from "@/lib/supabase/server";

type RagSettingsPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

const messages: Record<string, string> = {
  saved: "RAG runtime settings were saved. Changes affect future RAG chat requests.",
  reset: "RAG runtime settings were reset to safe defaults.",
  plan_saved: "Plan limits were saved. Changes affect future quota checks.",
};

const errors: Record<string, string> = {
  save_failed:
    "RAG runtime settings could not be saved. Check server configuration and try again.",
  plan_save_failed:
    "Plan limits could not be saved. Check server configuration and try again.",
};

export const metadata = createMetadata({
  title: "RAG Runtime Settings",
  description: "Admin-only RAG runtime settings for DevToolBox AI.",
  path: "/dashboard/admin/rag-settings",
});

export default async function RagRuntimeSettingsPage({
  searchParams,
}: RagSettingsPageProps) {
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

  if (!isRagAdminEmail(user.email)) {
    notFound();
  }

  const params = await searchParams;
  const storedSettings = await getStoredRagRuntimeSettings();
  const settings = sanitizeRagRuntimeSettings(storedSettings);
  const planLimitsResult = await getAdminPlanLimits();
  const plans = planLimitsResult.success ? planLimitsResult.plans : [];
  const previewPlan =
    plans.find((plan) => plan.plan_key === "free" && plan.is_active) ??
    plans.find((plan) => plan.is_active) ??
    plans[0];
  const effectivePreview = previewPlan
    ? resolveRagRuntimeConfig({
        planLimits: previewPlan,
        dbConfig: settings,
      })
    : null;
  const successMessage = params.message ? messages[params.message] : undefined;
  const errorMessage = params.error ? errors[params.error] : undefined;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/dashboard"
        className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
      >
        Back to dashboard
      </Link>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Admin settings
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          RAG settings
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
          Tune RAG runtime quality settings and product quota limits from one
          admin surface.{" "}
          <span className="font-semibold text-slate-950">app_config</span>{" "}
          stores runtime knobs, while{" "}
          <span className="font-semibold text-slate-950">plan_limits</span>{" "}
          remains the quota and cap source.
        </p>
      </div>

      <section className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
        <h2 className="font-semibold">Safety boundaries</h2>
        <p className="mt-2">
          Runtime settings must not contain secrets, prompts, raw embeddings,
          provider payloads, service role keys, API keys, or model names. The
          browser writes through a server action that re-checks admin access.
        </p>
      </section>

      <nav className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
        <a
          href="#runtime-settings"
          className="rounded-full bg-emerald-100 px-4 py-2 text-emerald-800"
        >
          RAG Runtime Settings
        </a>
        <a
          href="#plan-limits"
          className="rounded-full bg-slate-100 px-4 py-2 text-slate-700"
        >
          Plan Limits
        </a>
      </nav>

      {effectivePreview && previewPlan ? (
        <section className="mt-8 rounded-lg border border-sky-200 bg-sky-50 p-5 text-sm leading-6 text-sky-950">
          <h2 className="text-lg font-semibold">Effective preview</h2>
          <p className="mt-2">
            Previewing active plan{" "}
            <span className="font-semibold">{previewPlan.plan_key}</span>.
            Runtime settings tune quality, but plan limits cap what users on
            each plan can use.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <PreviewValue
              label="Effective retrieved chunks"
              value={effectivePreview.retrievedChunks}
              detail={`Runtime ${settings.retrievedChunks}; plan cap ${previewPlan.retrieved_chunks_per_answer}`}
            />
            <PreviewValue
              label="Effective max output tokens"
              value={effectivePreview.maxOutputTokens}
              detail={`Runtime ${settings.maxOutputTokens}; plan cap ${previewPlan.max_output_tokens}`}
            />
            <PreviewValue
              label="Similarity threshold"
              value={effectivePreview.similarityThreshold}
            />
            <PreviewValue
              label="Temperature"
              value={effectivePreview.temperature}
            />
            <PreviewValue
              label="Source snippet length"
              value={effectivePreview.sourceSnippetLength}
            />
            <PreviewValue
              label="Debug retrieval"
              value={effectivePreview.debugRetrieval ? "Enabled" : "Disabled"}
            />
          </div>
        </section>
      ) : null}

      <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div id="runtime-settings" className="scroll-mt-24">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            RAG Runtime Settings
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Runtime settings tune RAG answer quality. They cannot bypass plan
            limits: effective retrieved chunks use{" "}
            <span className="font-semibold text-slate-950">
              min(runtime, plan cap, safe hard cap)
            </span>
            , and effective output tokens use the same rule.
          </p>
        </div>

        {successMessage ? (
          <p className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            {successMessage}
          </p>
        ) : null}
        {errorMessage ? (
          <p className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
            {errorMessage}
          </p>
        ) : null}

        <form action={saveRagRuntimeSettingsAction} className="mt-6 space-y-6">
          <SettingsNumberField
            id="retrievedChunks"
            label="Retrieved chunks"
            description="How many vector chunks to request before threshold filtering."
            min={RUNTIME_RANGES.retrievedChunks.min}
            max={RUNTIME_RANGES.retrievedChunks.max}
            step={1}
            defaultValue={settings.retrievedChunks}
          />
          <SettingsNumberField
            id="similarityThreshold"
            label="Similarity threshold"
            description="Filters low-similarity chunks after retrieval. Use 0 to keep all returned matches."
            min={RUNTIME_RANGES.similarityThreshold.min}
            max={RUNTIME_RANGES.similarityThreshold.max}
            step={0.01}
            defaultValue={settings.similarityThreshold}
          />
          <SettingsNumberField
            id="maxOutputTokens"
            label="Max output tokens"
            description="Caps answer length, while each user's plan limit remains the final ceiling."
            min={RUNTIME_RANGES.maxOutputTokens.min}
            max={RUNTIME_RANGES.maxOutputTokens.max}
            step={1}
            defaultValue={settings.maxOutputTokens}
          />
          <SettingsNumberField
            id="temperature"
            label="Temperature"
            description="Controls answer randomness. Lower values are more deterministic."
            min={RUNTIME_RANGES.temperature.min}
            max={RUNTIME_RANGES.temperature.max}
            step={0.01}
            defaultValue={settings.temperature}
          />
          <SettingsNumberField
            id="sourceSnippetLength"
            label="Source snippet length"
            description="Controls snippet length in sources and retrieval diagnostics."
            min={RUNTIME_RANGES.sourceSnippetLength.min}
            max={RUNTIME_RANGES.sourceSnippetLength.max}
            step={1}
            defaultValue={settings.sourceSnippetLength}
          />

          <label className="flex gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
            <input
              name="debugRetrieval"
              type="checkbox"
              defaultChecked={settings.debugRetrieval}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-500"
            />
            <span>
              <span className="block text-sm font-semibold text-slate-950">
                Debug retrieval
              </span>
              <span className="mt-1 block text-sm leading-6 text-slate-600">
                Enables only safe retrieval diagnostics. It must never expose
                chain-of-thought, prompts, raw embeddings, full chunks, keys, or
                provider payloads.
              </span>
            </span>
          </label>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/dashboard/rag-chat"
              className="inline-flex justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100"
            >
              Open RAG chat
            </Link>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md bg-slate-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Save settings
            </button>
          </div>
        </form>

        <form action={resetRagRuntimeSettingsAction} className="mt-4">
          <button
            type="submit"
            className="text-sm font-semibold text-slate-600 underline-offset-4 hover:text-slate-950 hover:underline"
          >
            Reset to safe defaults
          </button>
        </form>
      </section>

      <section
        id="plan-limits"
        className="mt-8 scroll-mt-24 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          Plan Limits
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Plan limits are product quota caps. They control monthly usage,
          storage ceilings, and maximum answer budgets for each plan. Runtime
          settings can tune quality, but these caps still win.
        </p>

        {!planLimitsResult.success ? (
          <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
            {planLimitsResult.error}
          </p>
        ) : null}

        <div className="mt-6 space-y-6">
          {plans.map((plan) => (
            <PlanLimitForm key={plan.id} plan={plan} />
          ))}
        </div>
      </section>
    </div>
  );
}

function SettingsNumberField({
  id,
  label,
  description,
  min,
  max,
  step,
  defaultValue,
}: {
  id: string;
  label: string;
  description: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}) {
  return (
    <div className="grid gap-3 rounded-md border border-slate-200 p-4 sm:grid-cols-[1fr_180px] sm:items-center">
      <div>
        <label htmlFor={id} className="text-sm font-semibold text-slate-950">
          {label}
        </label>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Safe range: {min.toLocaleString()} to {max.toLocaleString()}
        </p>
      </div>
      <input
        id={id}
        name={id}
        type="number"
        min={min}
        max={max}
        step={step}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      />
    </div>
  );
}

function PreviewValue({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <div className="rounded-md bg-white/70 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
      {detail ? <p className="mt-1 text-xs text-sky-800">{detail}</p> : null}
    </div>
  );
}

function PlanLimitForm({ plan }: { plan: AdminPlanLimit }) {
  const saveAction = savePlanLimitAction.bind(null, plan.id);

  return (
    <form action={saveAction} className="rounded-lg border border-slate-200 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Plan name
          </p>
          <h3 className="mt-1 text-xl font-semibold text-slate-950">
            {plan.plan_key}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            This project currently stores the plan name as{" "}
            <span className="font-semibold text-slate-950">plan_key</span>.
          </p>
        </div>
        <label className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
          <input
            name="is_active"
            type="checkbox"
            defaultChecked={plan.is_active}
            className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-500"
          />
          Active
        </label>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <PlanLimitNumberField
          id="monthly_rag_messages"
          label="Monthly RAG messages"
          defaultValue={plan.monthly_rag_messages}
        />
        <PlanLimitNumberField
          id="monthly_vectorize_jobs"
          label="Monthly vectorize jobs"
          defaultValue={plan.monthly_vectorize_jobs}
        />
        <PlanLimitNumberField
          id="max_saved_documents"
          label="Max saved documents"
          defaultValue={plan.max_saved_documents}
        />
        <PlanLimitNumberField
          id="max_document_characters"
          label="Max document characters"
          defaultValue={plan.max_document_characters}
        />
        <PlanLimitNumberField
          id="max_chunks_per_document"
          label="Max chunks per document"
          defaultValue={plan.max_chunks_per_document}
        />
        <PlanLimitNumberField
          id="max_chunks_total"
          label="Max chunks total"
          defaultValue={plan.max_chunks_total}
        />
        <PlanLimitNumberField
          id="retrieved_chunks_per_answer"
          label="Retrieved chunks per answer"
          defaultValue={plan.retrieved_chunks_per_answer}
        />
        <PlanLimitNumberField
          id="max_output_tokens"
          label="Max output tokens"
          defaultValue={plan.max_output_tokens}
        />
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          className="rounded-md bg-slate-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Save plan limits
        </button>
      </div>
    </form>
  );
}

function PlanLimitNumberField({
  id,
  label,
  defaultValue,
}: {
  id: keyof typeof PLAN_LIMIT_RANGES;
  label: string;
  defaultValue: number;
}) {
  const range = PLAN_LIMIT_RANGES[id];

  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-slate-950">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type="number"
        min={range.min}
        max={range.max}
        step={1}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      />
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Safe range: {range.min.toLocaleString()} to{" "}
        {range.max.toLocaleString()}
      </p>
    </div>
  );
}
