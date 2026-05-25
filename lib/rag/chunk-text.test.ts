import { describe, expect, it } from "vitest";
import { chunkTextForEmbedding } from "./chunk-text";

describe("chunkTextForEmbedding", () => {
  it("creates one chunk for short text", () => {
    const result = chunkTextForEmbedding({
      text: "A short note for embedding.",
      sourceTitle: "Short Note",
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error(result.error);
    }

    expect(result.chunks).toHaveLength(1);
    expect(result.chunks[0]).toMatchObject({
      chunkIndex: 0,
      content: "A short note for embedding.",
      characterCount: 27,
      tokenEstimate: 7,
      sourceTitle: "Short Note",
      sourceAnchor: "chunk-0",
    });
  });

  it("creates multiple chunks for long text", () => {
    const result = chunkTextForEmbedding({
      text: "abcdefghijklmnopqrstuvwxyz",
      sourceTitle: "Alphabet",
      chunkSize: 10,
      chunkOverlap: 2,
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error(result.error);
    }

    expect(result.chunks.map((chunk) => chunk.content)).toEqual([
      "abcdefghij",
      "ijklmnopqr",
      "qrstuvwxyz",
    ]);
  });

  it("preserves overlap between adjacent chunks", () => {
    const result = chunkTextForEmbedding({
      text: "abcdefghijklmnopqrstuvwxyz",
      sourceTitle: "Alphabet",
      chunkSize: 10,
      chunkOverlap: 3,
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error(result.error);
    }

    expect(result.chunks[0].content.slice(-3)).toBe(
      result.chunks[1].content.slice(0, 3),
    );
    expect(result.chunks[1].content.slice(-3)).toBe(
      result.chunks[2].content.slice(0, 3),
    );
  });

  it("rejects empty text", () => {
    const result = chunkTextForEmbedding({
      text: " \n \t ",
      sourceTitle: "Empty",
    });

    expect(result).toEqual({
      success: false,
      error: "Text is required before chunking.",
    });
  });

  it("does not return empty chunks", () => {
    const result = chunkTextForEmbedding({
      text: "\n\nReal content\n\n",
      sourceTitle: "Whitespace",
      chunkSize: 100,
      chunkOverlap: 0,
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error(result.error);
    }

    expect(result.chunks).toHaveLength(1);
    expect(result.chunks.every((chunk) => chunk.content.length > 0)).toBe(true);
    expect(result.chunks[0].content).toBe("Real content");
  });

  it("enforces max chunk count", () => {
    const result = chunkTextForEmbedding({
      text: "abcdefghijklmnopqrstuvwxyz",
      sourceTitle: "Alphabet",
      chunkSize: 10,
      chunkOverlap: 0,
      maxChunks: 2,
    });

    expect(result).toEqual({
      success: false,
      error: "Text would create more than 2 chunks.",
    });
  });

  it("starts chunk indexes at 0", () => {
    const result = chunkTextForEmbedding({
      text: "abcdefghijklmnopqrstuvwxyz",
      sourceTitle: "Alphabet",
      chunkSize: 8,
      chunkOverlap: 1,
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error(result.error);
    }

    expect(result.chunks.map((chunk) => chunk.chunkIndex)).toEqual([
      0, 1, 2, 3,
    ]);
  });

  it("creates stable source anchors", () => {
    const result = chunkTextForEmbedding({
      text: "abcdefghijklmnopqrstuvwxyz",
      sourceTitle: "Alphabet",
      chunkSize: 8,
      chunkOverlap: 1,
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error(result.error);
    }

    expect(result.chunks.map((chunk) => chunk.sourceAnchor)).toEqual([
      "chunk-0",
      "chunk-1",
      "chunk-2",
      "chunk-3",
    ]);
  });

  it("populates token estimates", () => {
    const result = chunkTextForEmbedding({
      text: "123456789",
      sourceTitle: "Numbers",
      chunkSize: 20,
      chunkOverlap: 0,
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error(result.error);
    }

    expect(result.chunks[0].tokenEstimate).toBe(3);
  });

  it("rejects invalid overlap greater than or equal to chunk size", () => {
    const result = chunkTextForEmbedding({
      text: "abcdefghijklmnopqrstuvwxyz",
      sourceTitle: "Alphabet",
      chunkSize: 10,
      chunkOverlap: 10,
    });

    expect(result).toEqual({
      success: false,
      error: "Chunk overlap must be smaller than chunk size.",
    });
  });
});
