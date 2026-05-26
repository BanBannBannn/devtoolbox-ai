import { describe, expect, it } from "vitest";
import { validateRagChatRequestBody } from "./rag-chat-validation";

describe("validateRagChatRequestBody", () => {
  it("accepts a valid message body", () => {
    expect(
      validateRagChatRequestBody({
        message: "  What does my document say about setup?  ",
      }),
    ).toEqual({
      success: true,
      request: {
        message: "What does my document say about setup?",
      },
    });
  });

  it("accepts a valid optional session id", () => {
    expect(
      validateRagChatRequestBody({
        message: "Question",
        sessionId: "8d24a29c-df45-4c2d-87e0-246dd8301fd1",
      }),
    ).toEqual({
      success: true,
      request: {
        message: "Question",
        sessionId: "8d24a29c-df45-4c2d-87e0-246dd8301fd1",
      },
    });
  });

  it("rejects missing message", () => {
    expect(validateRagChatRequestBody({})).toEqual({
      success: false,
      error: "Message is required.",
    });
  });

  it("rejects empty message", () => {
    expect(validateRagChatRequestBody({ message: " \n\t " })).toEqual({
      success: false,
      error: "Message is required.",
    });
  });

  it("rejects messages longer than 2000 characters", () => {
    expect(validateRagChatRequestBody({ message: "x".repeat(2001) })).toEqual({
      success: false,
      error: "Message must be 2,000 characters or fewer.",
    });
  });

  it("rejects invalid session id", () => {
    expect(
      validateRagChatRequestBody({
        message: "Question",
        sessionId: "not-a-uuid",
      }),
    ).toEqual({
      success: false,
      error: "Session ID must be a valid UUID when provided.",
    });
  });
});
