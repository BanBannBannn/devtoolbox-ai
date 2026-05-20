export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatValidationResult =
  | {
      success: true;
      messages: ChatMessage[];
    }
  | {
      success: false;
      error: string;
    };

export const MAX_CHAT_MESSAGES = 10;
export const MAX_USER_MESSAGE_LENGTH = 1000;

const supportedRoles = new Set<ChatRole>(["user", "assistant"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateChatRequestBody(body: unknown): ChatValidationResult {
  if (!isRecord(body) || !Array.isArray(body.messages)) {
    return {
      success: false,
      error: "Request body must include a messages array.",
    };
  }

  if (body.messages.length === 0) {
    return {
      success: false,
      error: "Please send at least one message.",
    };
  }

  if (body.messages.length > MAX_CHAT_MESSAGES) {
    return {
      success: false,
      error: `Conversation is too long. Send ${MAX_CHAT_MESSAGES} messages or fewer.`,
    };
  }

  const messages: ChatMessage[] = [];
  let hasUserMessage = false;

  for (const rawMessage of body.messages) {
    if (!isRecord(rawMessage)) {
      return {
        success: false,
        error: "Each message must be an object with role and content.",
      };
    }

    const { role, content } = rawMessage;

    if (role !== "user" && role !== "assistant") {
      return {
        success: false,
        error: "Unsupported message role. Use user or assistant.",
      };
    }

    if (!supportedRoles.has(role)) {
      return {
        success: false,
        error: "Unsupported message role. Use user or assistant.",
      };
    }

    if (typeof content !== "string") {
      return {
        success: false,
        error: "Message content must be a string.",
      };
    }

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return {
        success: false,
        error: "Message content cannot be empty.",
      };
    }

    if (
      role === "user" &&
      trimmedContent.length > MAX_USER_MESSAGE_LENGTH
    ) {
      return {
        success: false,
        error: `User messages must be ${MAX_USER_MESSAGE_LENGTH} characters or fewer.`,
      };
    }

    if (role === "user") {
      hasUserMessage = true;
    }

    messages.push({
      role,
      content: trimmedContent,
    });
  }

  if (!hasUserMessage) {
    return {
      success: false,
      error: "Please include at least one user message.",
    };
  }

  return {
    success: true,
    messages,
  };
}
