import { createServiceRoleSupabaseClient } from "../supabase/server";

export type RagRuntimeSettings = {
  retrievedChunks: number;
  similarityThreshold: number;
  maxOutputTokens: number;
  temperature: number;
  sourceSnippetLength: number;
  debugRetrieval: boolean;
  chatHistoryMessages: number;
};

export type RagRuntimePlanCaps = {
  retrieved_chunks_per_answer: number;
  max_output_tokens: number;
};

type RuntimeSettingKey = keyof RagRuntimeSettings;

export const DEFAULT_RUNTIME_SETTINGS: RagRuntimeSettings = {
  retrievedChunks: 3,
  similarityThreshold: 0,
  maxOutputTokens: 800,
  temperature: 0.2,
  sourceSnippetLength: 240,
  debugRetrieval: false,
  chatHistoryMessages: 6,
};

export const RUNTIME_RANGES = {
  retrievedChunks: { min: 1, max: 20 },
  similarityThreshold: { min: 0, max: 1 },
  maxOutputTokens: { min: 100, max: 2000 },
  temperature: { min: 0, max: 1 },
  sourceSnippetLength: { min: 80, max: 500 },
  chatHistoryMessages: { min: 0, max: 20 },
} satisfies Record<Exclude<RuntimeSettingKey, "debugRetrieval">, {
  min: number;
  max: number;
}>;

const envOverrideKeys = {
  retrievedChunks: "RAG_RETRIEVED_CHUNKS_OVERRIDE",
  similarityThreshold: "RAG_SIMILARITY_THRESHOLD",
  maxOutputTokens: "RAG_MAX_OUTPUT_TOKENS_OVERRIDE",
  temperature: "RAG_TEMPERATURE",
  sourceSnippetLength: "RAG_SOURCE_SNIPPET_LENGTH",
  debugRetrieval: "RAG_DEBUG_RETRIEVAL",
  chatHistoryMessages: "RAG_CHAT_HISTORY_MESSAGES",
} satisfies Record<RuntimeSettingKey, string>;

export function resolveRagRuntimeConfig({
  planLimits,
  dbConfig,
  env = process.env,
}: {
  planLimits: RagRuntimePlanCaps;
  dbConfig?: unknown;
  env?: NodeJS.ProcessEnv;
}): RagRuntimeSettings {
  const defaults = applyPlanCaps(
    {
      ...DEFAULT_RUNTIME_SETTINGS,
      maxOutputTokens: planLimits.max_output_tokens,
    },
    planLimits,
  );
  const dbSettings = parseRuntimeSettingsObject(dbConfig);
  const envSettings = parseEnvOverrides(env);
  const forceEnvOverrides = parseBoolean(env.RAG_FORCE_ENV_OVERRIDES);
  const mergedSettings = forceEnvOverrides
    ? {
        ...defaults,
        ...dbSettings,
        ...envSettings,
      }
    : {
        ...defaults,
        ...envSettings,
        ...dbSettings,
      };

  return applyPlanCaps(mergedSettings, planLimits);
}

export function sanitizeRagRuntimeSettings(value: unknown): RagRuntimeSettings {
  return {
    ...DEFAULT_RUNTIME_SETTINGS,
    ...parseRuntimeSettingsObject(value),
  };
}

export async function getStoredRagRuntimeSettings(): Promise<unknown | null> {
  const supabase = createServiceRoleSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("app_config")
    .select("value")
    .eq("key", "rag_runtime_settings")
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data.value;
}

export async function saveStoredRagRuntimeSettings({
  settings,
  updatedBy,
}: {
  settings: RagRuntimeSettings;
  updatedBy: string;
}) {
  const supabase = createServiceRoleSupabaseClient();

  if (!supabase) {
    return {
      success: false,
      error: "RAG runtime settings storage is not configured.",
    };
  }

  const { error } = await supabase.from("app_config").upsert(
    {
      key: "rag_runtime_settings",
      value: settings,
      description:
        "Server-side RAG retrieval and answer generation runtime settings. Values must be clamped in application code and must not contain secrets or model names.",
      updated_by: updatedBy,
    },
    {
      onConflict: "key",
    },
  );

  if (error) {
    return {
      success: false,
      error: "Could not save RAG runtime settings.",
    };
  }

  return {
    success: true,
  };
}

export function filterChunksBySimilarity<
  TChunk extends { similarity: number },
>(chunks: TChunk[], similarityThreshold: number) {
  return chunks.filter((chunk) => chunk.similarity >= similarityThreshold);
}

export function getRagRuntimeSettingsFromFormData(
  formData: FormData,
): RagRuntimeSettings {
  return {
    retrievedChunks: clamp(
      parseNumber(formData.get("retrievedChunks")) ??
        DEFAULT_RUNTIME_SETTINGS.retrievedChunks,
      RUNTIME_RANGES.retrievedChunks,
    ),
    similarityThreshold: clamp(
      parseNumber(formData.get("similarityThreshold")) ??
        DEFAULT_RUNTIME_SETTINGS.similarityThreshold,
      RUNTIME_RANGES.similarityThreshold,
    ),
    maxOutputTokens: clamp(
      parseNumber(formData.get("maxOutputTokens")) ??
        DEFAULT_RUNTIME_SETTINGS.maxOutputTokens,
      RUNTIME_RANGES.maxOutputTokens,
    ),
    temperature: clamp(
      parseNumber(formData.get("temperature")) ??
        DEFAULT_RUNTIME_SETTINGS.temperature,
      RUNTIME_RANGES.temperature,
    ),
    sourceSnippetLength: clamp(
      parseNumber(formData.get("sourceSnippetLength")) ??
        DEFAULT_RUNTIME_SETTINGS.sourceSnippetLength,
      RUNTIME_RANGES.sourceSnippetLength,
    ),
    debugRetrieval: formData.get("debugRetrieval") === "on",
    chatHistoryMessages: clamp(
      parseNumber(formData.get("chatHistoryMessages")) ??
        DEFAULT_RUNTIME_SETTINGS.chatHistoryMessages,
      RUNTIME_RANGES.chatHistoryMessages,
    ),
  };
}

function parseRuntimeSettingsObject(value: unknown): Partial<RagRuntimeSettings> {
  if (!isRecord(value)) {
    return {};
  }

  const parsed: Partial<RagRuntimeSettings> = {};

  for (const key of Object.keys(RUNTIME_RANGES) as Array<
    keyof typeof RUNTIME_RANGES
  >) {
    const numericValue = parseNumber(value[key]);

    if (numericValue !== null) {
      parsed[key] = clamp(numericValue, RUNTIME_RANGES[key]);
    }
  }

  if (typeof value.debugRetrieval === "boolean") {
    parsed.debugRetrieval = value.debugRetrieval;
  }

  return parsed;
}

function parseEnvOverrides(env: NodeJS.ProcessEnv): Partial<RagRuntimeSettings> {
  const parsed: Partial<RagRuntimeSettings> = {};

  for (const key of Object.keys(RUNTIME_RANGES) as Array<
    keyof typeof RUNTIME_RANGES
  >) {
    const rawValue = env[envOverrideKeys[key]];

    if (rawValue === undefined || rawValue === "") {
      continue;
    }

    const numericValue = parseNumber(rawValue);

    if (numericValue !== null) {
      parsed[key] = clamp(numericValue, RUNTIME_RANGES[key]);
    }
  }

  const debugValue = env[envOverrideKeys.debugRetrieval];

  if (debugValue !== undefined && debugValue !== "") {
    parsed.debugRetrieval = parseBoolean(debugValue);
  }

  return parsed;
}

function applyPlanCaps(
  settings: RagRuntimeSettings,
  planLimits: RagRuntimePlanCaps,
): RagRuntimeSettings {
  return {
    retrievedChunks: Math.min(
      clamp(settings.retrievedChunks, RUNTIME_RANGES.retrievedChunks),
      Math.max(1, planLimits.retrieved_chunks_per_answer),
    ),
    similarityThreshold: clamp(
      settings.similarityThreshold,
      RUNTIME_RANGES.similarityThreshold,
    ),
    maxOutputTokens: Math.min(
      clamp(settings.maxOutputTokens, RUNTIME_RANGES.maxOutputTokens),
      Math.max(1, planLimits.max_output_tokens),
    ),
    temperature: clamp(settings.temperature, RUNTIME_RANGES.temperature),
    sourceSnippetLength: clamp(
      settings.sourceSnippetLength,
      RUNTIME_RANGES.sourceSnippetLength,
    ),
    debugRetrieval: settings.debugRetrieval,
    chatHistoryMessages: clamp(
      settings.chatHistoryMessages,
      RUNTIME_RANGES.chatHistoryMessages,
    ),
  };
}

function parseNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const numberValue = Number(value);

    if (Number.isFinite(numberValue)) {
      return numberValue;
    }
  }

  return null;
}

function parseBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (["1", "true", "yes", "on"].includes(normalized)) {
      return true;
    }

    if (["0", "false", "no", "off"].includes(normalized)) {
      return false;
    }
  }

  return false;
}

function clamp(value: number, { min, max }: { min: number; max: number }) {
  return Math.min(Math.max(value, min), max);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
