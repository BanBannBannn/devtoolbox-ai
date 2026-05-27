import { describe, expect, it } from "vitest";
import { generateSessionTitle } from "./chat-sessions";

describe("chat session helpers", () => {
  it("generates a safe compact title from the first message", () => {
    expect(generateSessionTitle("  How do I deploy this?\n\nThanks ")).toBe(
      "How do I deploy this? Thanks",
    );
  });

  it("caps session title length at 60 characters", () => {
    expect(generateSessionTitle("a".repeat(100))).toHaveLength(60);
  });

  it("uses a fallback title for empty input", () => {
    expect(generateSessionTitle(" \n\t ")).toBe("New RAG chat");
  });
});
