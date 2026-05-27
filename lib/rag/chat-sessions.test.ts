import { describe, expect, it } from "vitest";
import {
  generateSessionTitle,
  mapChatMessageRow,
  mapChatSessionRow,
  validateChatSessionTitle,
} from "./chat-sessions";

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

  it("validates and normalizes renamed session titles", () => {
    expect(validateChatSessionTitle("  Project\n notes  ")).toEqual({
      success: true,
      title: "Project notes",
    });
  });

  it("rejects empty renamed session titles", () => {
    expect(validateChatSessionTitle(" \n\t ")).toEqual({
      success: false,
      error: "Session title is required.",
    });
  });

  it("rejects renamed session titles over 120 characters", () => {
    const result = validateChatSessionTitle("a".repeat(121));

    expect(result.success).toBe(false);
  });

  it("maps session rows with safe title fallback", () => {
    expect(
      mapChatSessionRow({
        id: "session-id",
        title: "",
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: null,
      }),
    ).toEqual({
      id: "session-id",
      title: "New RAG chat",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
  });

  it("maps message rows without forbidden fields", () => {
    const message = mapChatMessageRow({
      id: "message-id",
      role: "assistant",
      content: "Answer",
      sources: [
        {
          documentId: "doc-id",
          chunkIndex: 0,
          sourceTitle: "Doc",
          sourceAnchor: "chunk-0",
          snippet: "Short snippet",
          modelName: "hidden",
        },
      ],
      retrieval_details: {
        queryEmbedded: true,
        matchedChunkCount: 1,
        similarityMetric: "cosine",
        models: {
          llmModel: "hidden",
        },
        retrievedChunks: [
          {
            documentId: "doc-id",
            chunkIndex: 0,
            sourceTitle: "Doc",
            sourceAnchor: "chunk-0",
            snippet: "Short snippet",
            similarity: 0.8,
            embedding: [1, 2, 3],
          },
        ],
      },
      usage: {
        ragMessagesUsed: 1,
        ragMessagesLimit: 30,
        retrievedChunks: 1,
        maxRetrievedChunks: 3,
        llmModel: "hidden",
      },
      created_at: "2026-01-01T00:00:00.000Z",
    });

    expect(message.sources[0]).toEqual({
      documentId: "doc-id",
      chunkIndex: 0,
      sourceTitle: "Doc",
      sourceAnchor: "chunk-0",
      snippet: "Short snippet",
    });
    expect(message.retrievalDetails?.retrievedChunks[0]).toEqual({
      documentId: "doc-id",
      chunkIndex: 0,
      sourceTitle: "Doc",
      sourceAnchor: "chunk-0",
      snippet: "Short snippet",
      similarity: 0.8,
    });
    expect("models" in (message.retrievalDetails ?? {})).toBe(false);
    expect("llmModel" in (message.usage ?? {})).toBe(false);
  });
});
