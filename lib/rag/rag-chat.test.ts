import { describe, expect, it } from "vitest";
import { createRagUsageSummary } from "./rag-response";

describe("rag chat response helpers", () => {
  it("creates usage summary without exposing model names", () => {
    const usage = createRagUsageSummary({
      ragMessagesUsed: 1,
      ragMessagesLimit: 30,
      retrievedChunks: 3,
      maxRetrievedChunks: 3,
    });

    expect(usage).toEqual({
      ragMessagesUsed: 1,
      ragMessagesLimit: 30,
      retrievedChunks: 3,
      maxRetrievedChunks: 3,
    });
    expect("llmModel" in usage).toBe(false);
    expect("embeddingModel" in usage).toBe(false);
  });
});
