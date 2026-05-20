import {
  createChatSystemPrompt,
  DEFAULT_OPENROUTER_MODEL,
} from "@/lib/chat-context";
import { validateChatRequestBody } from "@/lib/chat-validation";

const OPENROUTER_CHAT_COMPLETIONS_URL =
  "https://openrouter.ai/api/v1/chat/completions";

type OpenRouterMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
  error?: {
    message?: unknown;
  };
};

type ChatApiResponse =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

function jsonResponse(body: ChatApiResponse, status: number) {
  return Response.json(body, { status });
}

async function readJsonBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function getOpenRouterHeaders(apiKey: string): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "X-Title": "DevToolBox AI",
  };

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    headers["HTTP-Referer"] = process.env.NEXT_PUBLIC_SITE_URL;
  }

  return headers;
}

function getOpenRouterError(data: OpenRouterResponse) {
  if (typeof data.error?.message === "string" && data.error.message.trim()) {
    return data.error.message;
  }

  return "OpenRouter returned an error.";
}

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  const validation = validateChatRequestBody(body);

  if (!validation.success) {
    return jsonResponse(
      {
        success: false,
        error: validation.error,
      },
      400,
    );
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return jsonResponse(
      {
        success: false,
        error:
          "Chat is not configured. Set OPENROUTER_API_KEY on the server.",
      },
      500,
    );
  }

  const messages: OpenRouterMessage[] = [
    {
      role: "system",
      content: createChatSystemPrompt(),
    },
    ...validation.messages,
  ];

  try {
    const response = await fetch(OPENROUTER_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: getOpenRouterHeaders(apiKey),
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || DEFAULT_OPENROUTER_MODEL,
        messages,
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    const data = (await response.json().catch(() => ({}))) as OpenRouterResponse;

    if (!response.ok) {
      return jsonResponse(
        {
          success: false,
          error: getOpenRouterError(data),
        },
        502,
      );
    }

    const message = data.choices?.[0]?.message?.content;

    if (typeof message !== "string" || !message.trim()) {
      return jsonResponse(
        {
          success: false,
          error: "OpenRouter did not return a usable assistant message.",
        },
        502,
      );
    }

    return jsonResponse(
      {
        success: true,
        message: message.trim(),
      },
      200,
    );
  } catch {
    return jsonResponse(
      {
        success: false,
        error: "Could not reach OpenRouter. Please try again later.",
      },
      502,
    );
  }
}
