export type RagLlmConfig = {
  apiKey: string;
  model: string;
  siteUrl?: string;
};

export type RagLlmConfigResult =
  | {
      success: true;
      config: RagLlmConfig;
    }
  | {
      success: false;
      error: string;
    };

export type GenerateRagAnswerResult =
  | {
      success: true;
      answer: string;
      model: string;
    }
  | {
      success: false;
      error: string;
      model: string;
    };

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
};

const OPENROUTER_CHAT_COMPLETIONS_URL =
  "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_RAG_LLM_MODEL = "nvidia/nemotron-3-super-120b-a12b:free";

export function getRagLlmConfig(
  env: NodeJS.ProcessEnv = process.env,
): RagLlmConfigResult {
  const apiKey = env.OPENROUTER_API_KEY;
  const model = env.RAG_LLM_MODEL || DEFAULT_RAG_LLM_MODEL;

  if (!apiKey) {
    return {
      success: false,
      error: "OpenRouter API key is not configured.",
    };
  }

  return {
    success: true,
    config: {
      apiKey,
      model,
      siteUrl: env.NEXT_PUBLIC_SITE_URL,
    },
  };
}

export function getDefaultRagLlmModel(env: NodeJS.ProcessEnv = process.env) {
  return env.RAG_LLM_MODEL || DEFAULT_RAG_LLM_MODEL;
}

export async function generateRagAnswer({
  systemPrompt,
  userPrompt,
  maxOutputTokens,
  temperature,
}: {
  systemPrompt: string;
  userPrompt: string;
  maxOutputTokens: number;
  temperature: number;
}): Promise<GenerateRagAnswerResult> {
  const configResult = getRagLlmConfig();
  const model = configResult.success
    ? configResult.config.model
    : DEFAULT_RAG_LLM_MODEL;

  if (!configResult.success) {
    return {
      success: false,
      error: configResult.error,
      model,
    };
  }

  const { apiKey, siteUrl } = configResult.config;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "X-Title": "DevToolBox AI",
  };

  if (siteUrl) {
    headers["HTTP-Referer"] = siteUrl;
  }

  try {
    const response = await fetch(OPENROUTER_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature,
        max_tokens: maxOutputTokens,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: "RAG answer provider request failed. Please try again later.",
        model,
      };
    }

    const body = (await response.json().catch(() => null)) as
      | OpenRouterResponse
      | null;
    const answer = body?.choices?.[0]?.message?.content;

    if (typeof answer !== "string" || !answer.trim()) {
      return {
        success: false,
        error: "RAG answer provider returned an invalid response.",
        model,
      };
    }

    return {
      success: true,
      answer: answer.trim(),
      model,
    };
  } catch {
    return {
      success: false,
      error: "RAG answer provider request failed. Please try again later.",
      model,
    };
  }
}
