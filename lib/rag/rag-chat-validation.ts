export type RagChatRequest = {
  message: string;
  sessionId?: string;
};

export type RagChatValidationResult =
  | {
      success: true;
      request: RagChatRequest;
    }
  | {
      success: false;
      error: string;
    };

const MAX_RAG_MESSAGE_LENGTH = 2000;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateRagChatRequestBody(
  body: unknown,
): RagChatValidationResult {
  if (!isRecord(body)) {
    return {
      success: false,
      error: "Request body must be a JSON object.",
    };
  }

  if (typeof body.message !== "string") {
    return {
      success: false,
      error: "Message is required.",
    };
  }

  const message = body.message.trim();

  if (!message) {
    return {
      success: false,
      error: "Message is required.",
    };
  }

  if (message.length > MAX_RAG_MESSAGE_LENGTH) {
    return {
      success: false,
      error: `Message must be ${MAX_RAG_MESSAGE_LENGTH.toLocaleString()} characters or fewer.`,
    };
  }

  if (body.sessionId !== undefined) {
    if (typeof body.sessionId !== "string" || !uuidPattern.test(body.sessionId)) {
      return {
        success: false,
        error: "Session ID must be a valid UUID when provided.",
      };
    }

    return {
      success: true,
      request: {
        message,
        sessionId: body.sessionId,
      },
    };
  }

  return {
    success: true,
    request: {
      message,
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
