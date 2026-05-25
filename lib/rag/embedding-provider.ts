export type RagEmbeddingConfig = {
  apiKey: string;
  model: string;
  dimension: number;
  siteUrl?: string;
};

export type RagEmbeddingConfigResult =
  | {
      success: true;
      config: RagEmbeddingConfig;
    }
  | {
      success: false;
      error: string;
    };

export type GenerateEmbeddingResult =
  | {
      success: true;
      embedding: number[];
      model: string;
      dimension: number;
    }
  | {
      success: false;
      error: string;
    };

type OpenRouterEmbeddingResponse = {
  data?: Array<{
    embedding?: unknown;
  }>;
};

const OPENROUTER_EMBEDDINGS_URL =
  "https://openrouter.ai/api/v1/embeddings";
const DEFAULT_EMBEDDING_MODEL =
  "nvidia/llama-nemotron-embed-vl-1b-v2:free";

export function getRagEmbeddingConfig(
  env: NodeJS.ProcessEnv = process.env,
): RagEmbeddingConfigResult {
  const apiKey = env.OPENROUTER_API_KEY;
  const model = env.RAG_EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL;
  const dimensionValue = env.RAG_EMBEDDING_DIMENSION;

  if (!apiKey) {
    return {
      success: false,
      error: "OpenRouter API key is not configured.",
    };
  }

  if (!dimensionValue) {
    return {
      success: false,
      error: "RAG embedding dimension is not configured.",
    };
  }

  const dimension = Number(dimensionValue);

  if (!Number.isInteger(dimension) || dimension <= 0) {
    return {
      success: false,
      error: "RAG embedding dimension must be a positive integer.",
    };
  }

  return {
    success: true,
    config: {
      apiKey,
      model,
      dimension,
      siteUrl: env.NEXT_PUBLIC_SITE_URL,
    },
  };
}

export async function generateEmbedding(
  input: string,
): Promise<GenerateEmbeddingResult> {
  const text = input.trim();

  if (!text) {
    return {
      success: false,
      error: "Text is required before generating an embedding.",
    };
  }

  const configResult = getRagEmbeddingConfig();

  if (!configResult.success) {
    return {
      success: false,
      error: configResult.error,
    };
  }

  const { apiKey, model, dimension, siteUrl } = configResult.config;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "X-Title": "DevToolBox AI",
  };

  if (siteUrl) {
    headers["HTTP-Referer"] = siteUrl;
  }

  try {
    const response = await fetch(OPENROUTER_EMBEDDINGS_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        input: text,
        encoding_format: "float",
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: "Embedding provider request failed. Please try again later.",
      };
    }

    const body = (await response.json().catch(() => null)) as
      | OpenRouterEmbeddingResponse
      | null;
    const embedding = body?.data?.[0]?.embedding;

    if (!isNumberArray(embedding)) {
      return {
        success: false,
        error: "Embedding provider returned an invalid response.",
      };
    }

    if (embedding.length !== dimension) {
      return {
        success: false,
        error: `Embedding provider returned ${embedding.length.toLocaleString()} dimensions, but ${dimension.toLocaleString()} were expected.`,
      };
    }

    return {
      success: true,
      embedding,
      model,
      dimension,
    };
  } catch {
    return {
      success: false,
      error: "Embedding provider request failed. Please try again later.",
    };
  }
}

function isNumberArray(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => typeof item === "number" && Number.isFinite(item))
  );
}
