import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  resetRagRuntimeSettingsAction,
  saveRagRuntimeSettingsAction,
} from "./actions";
import { isRagAdminEmail } from "@/lib/rag/rag-admin";
import {
  getStoredRagRuntimeSettings,
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
};

const errors: Record<string, string> = {
  save_failed:
    "RAG runtime settings could not be saved. Check server configuration and try again.",
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
          RAG runtime settings
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
          Tune retrieval and answer generation settings stored in private{" "}
          <span className="font-semibold text-slate-950">app_config</span>.
          Plan limits still cap user quota and maximum values. Changes affect
          future RAG chat requests only.
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

      <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
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

        <form action={saveRagRuntimeSettingsAction} className="space-y-6">
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
