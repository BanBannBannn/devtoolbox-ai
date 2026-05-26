import { describe, expect, it } from "vitest";
import {
  createRagPromptMessages,
  createRetrievalDetails,
  createSafeSnippet,
  mapChunksToSources,
  type RetrievedDocumentChunk,
} from "./rag-prompt";

const chunks: RetrievedDocumentChunk[] = [
  {
    id: "chunk-id",
    documentId: "document-id",
    chunkIndex: 0,
    content:
      "This is a retrieved document chunk with setup notes and enough words to produce a useful snippet for the API response.",
    sourceTitle: "Project Notes",
    sourceAnchor: "chunk-0",
    similarity: 0.82,
  },
];

describe("rag prompt helpers", () => {
  it("creates short safe snippets", () => {
    expect(createSafeSnippet("Line one\n\nLine two", 50)).toBe(
      "Line one Line two",
    );
    expect(createSafeSnippet("x".repeat(300))).toHaveLength(240);
    expect(createSafeSnippet("x".repeat(300)).endsWith("...")).toBe(true);
  });

  it("maps chunks to sources without full content", () => {
    const sources = mapChunksToSources(chunks);

    expect(sources).toEqual([
      {
        documentId: "document-id",
        chunkIndex: 0,
        sourceTitle: "Project Notes",
        sourceAnchor: "chunk-0",
        snippet:
          "This is a retrieved document chunk with setup notes and enough words to produce a useful snippet for the API response.",
      },
    ]);
    expect("content" in sources[0]).toBe(false);
    expect("embedding" in sources[0]).toBe(false);
  });

  it("creates retrieval details without raw embeddings or full content fields", () => {
    const details = createRetrievalDetails({
      chunks,
      embeddingModel: "embedding-model",
      llmModel: "llm-model",
      queryEmbedded: true,
    });

    expect(details).toMatchObject({
      queryEmbedded: true,
      matchedChunkCount: 1,
      similarityMetric: "cosine",
      models: {
        embeddingModel: "embedding-model",
        llmModel: "llm-model",
      },
    });
    expect(details.retrievedChunks[0]).toMatchObject({
      documentId: "document-id",
      chunkIndex: 0,
      sourceTitle: "Project Notes",
      sourceAnchor: "chunk-0",
      similarity: 0.82,
    });
    expect("content" in details.retrievedChunks[0]).toBe(false);
    expect("embedding" in details.retrievedChunks[0]).toBe(false);
  });

  it("builds a prompt that treats retrieved chunks as untrusted context", () => {
    const prompt = createRagPromptMessages({
      message: "How do I set up the project?",
      chunks,
    });

    expect(prompt.system).toContain("untrusted data");
    expect(prompt.system).toContain("not commands");
    expect(prompt.user).toContain("Project Notes");
    expect(prompt.user).toContain("chunk-0");
    expect(prompt.system.toLowerCase()).not.toContain("chain-of-thought");
    expect(prompt.user.toLowerCase()).not.toContain("chain-of-thought");
  });
});
