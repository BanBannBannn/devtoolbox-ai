import { describe, expect, it } from "vitest";
import { chunkTextForEmbedding } from "./chunk-text";

function expectChunks(
  result: ReturnType<typeof chunkTextForEmbedding>,
): Extract<ReturnType<typeof chunkTextForEmbedding>, { success: true }>["chunks"] {
  expect(result.success).toBe(true);

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.chunks;
}

describe("chunkTextForEmbedding", () => {
  it("creates one chunk for short text", () => {
    const chunks = expectChunks(
      chunkTextForEmbedding({
        text: "A short note for embedding.",
        sourceTitle: "Short Note",
      }),
    );

    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toMatchObject({
      chunkIndex: 0,
      content: "A short note for embedding.",
      characterCount: 27,
      tokenEstimate: 7,
      sourceTitle: "Short Note",
      sourceAnchor: "chunk-0",
    });
  });

  it("keeps paragraphs together when they fit under chunk size", () => {
    const chunks = expectChunks(
      chunkTextForEmbedding({
        text: "First paragraph stays whole.\n\nSecond paragraph stays whole.",
        sourceTitle: "Paragraphs",
        chunkSize: 120,
        chunkOverlap: 0,
      }),
    );

    expect(chunks).toHaveLength(1);
    expect(chunks[0].content).toBe(
      "First paragraph stays whole.\n\nSecond paragraph stays whole.",
    );
  });

  it("keeps a markdown heading with the following paragraph when possible", () => {
    const chunks = expectChunks(
      chunkTextForEmbedding({
        text: "# Install\n\nRun npm install before starting the project.",
        sourceTitle: "Heading",
        chunkSize: 120,
        chunkOverlap: 0,
      }),
    );

    expect(chunks).toHaveLength(1);
    expect(chunks[0].content).toBe(
      "# Install\n\nRun npm install before starting the project.",
    );
  });

  it("starts a heading in a new chunk when the previous chunk is already large", () => {
    const chunks = expectChunks(
      chunkTextForEmbedding({
        text: `${"A".repeat(70)}\n\n# Next Section\n\nDetails fit with the heading.`,
        sourceTitle: "Sections",
        chunkSize: 90,
        chunkOverlap: 0,
      }),
    );

    expect(chunks).toHaveLength(2);
    expect(chunks[0].content).toBe("A".repeat(70));
    expect(chunks[1].content).toBe(
      "# Next Section\n\nDetails fit with the heading.",
    );
  });

  it("keeps consecutive list items together when possible", () => {
    const chunks = expectChunks(
      chunkTextForEmbedding({
        text: "- Create a document\n- Vectorize it\n- Ask questions later",
        sourceTitle: "List",
        chunkSize: 120,
        chunkOverlap: 0,
      }),
    );

    expect(chunks).toHaveLength(1);
    expect(chunks[0].content).toBe(
      "- Create a document\n- Vectorize it\n- Ask questions later",
    );
  });

  it("keeps fenced code blocks together when possible", () => {
    const codeBlock = "```ts\nconst answer = 42;\nconsole.log(answer);\n```";
    const chunks = expectChunks(
      chunkTextForEmbedding({
        text: `Example:\n\n${codeBlock}`,
        sourceTitle: "Code",
        chunkSize: 120,
        chunkOverlap: 0,
      }),
    );

    expect(chunks).toHaveLength(1);
    expect(chunks[0].content).toContain(codeBlock);
  });

  it("splits a long paragraph by characters with overlap", () => {
    const chunks = expectChunks(
      chunkTextForEmbedding({
        text: "abcdefghijklmnopqrstuvwxyz",
        sourceTitle: "Alphabet",
        chunkSize: 10,
        chunkOverlap: 2,
      }),
    );

    expect(chunks.map((chunk) => chunk.content)).toEqual([
      "abcdefghij",
      "ijklmnopqr",
      "qrstuvwxyz",
    ]);
  });

  it("splits a long code block safely when it exceeds chunk size", () => {
    const chunks = expectChunks(
      chunkTextForEmbedding({
        text: `\`\`\`txt\n${"x".repeat(40)}\n\`\`\``,
        sourceTitle: "Long Code",
        chunkSize: 16,
        chunkOverlap: 4,
      }),
    );

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((chunk) => chunk.content.length > 0)).toBe(true);
  });

  it("applies overlap between multi-block chunks", () => {
    const chunks = expectChunks(
      chunkTextForEmbedding({
        text: `${"A".repeat(25)}\n\n${"B".repeat(25)}\n\n${"C".repeat(25)}`,
        sourceTitle: "Overlap",
        chunkSize: 58,
        chunkOverlap: 5,
      }),
    );

    expect(chunks).toHaveLength(2);
    expect(chunks[1].content.startsWith("BBBBB\n\n")).toBe(true);
  });

  it("does not duplicate an entire previous chunk as overlap", () => {
    const chunks = expectChunks(
      chunkTextForEmbedding({
        text: "Alpha\n\nBeta\n\nGamma",
        sourceTitle: "Small Chunks",
        chunkSize: 7,
        chunkOverlap: 6,
      }),
    );

    expect(chunks.map((chunk) => chunk.content)).toEqual([
      "Alpha",
      "Beta",
      "Gamma",
    ]);
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

  it("rejects invalid chunk size", () => {
    const result = chunkTextForEmbedding({
      text: "Text",
      sourceTitle: "Invalid",
      chunkSize: 0,
    });

    expect(result).toEqual({
      success: false,
      error: "Chunk size must be a positive integer.",
    });
  });

  it("rejects invalid max chunks", () => {
    const result = chunkTextForEmbedding({
      text: "Text",
      sourceTitle: "Invalid",
      maxChunks: 0,
    });

    expect(result).toEqual({
      success: false,
      error: "Max chunks must be a positive integer.",
    });
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

  it("starts chunk indexes at 0", () => {
    const chunks = expectChunks(
      chunkTextForEmbedding({
        text: "abcdefghijklmnopqrstuvwxyz",
        sourceTitle: "Alphabet",
        chunkSize: 8,
        chunkOverlap: 1,
      }),
    );

    expect(chunks.map((chunk) => chunk.chunkIndex)).toEqual([0, 1, 2, 3]);
  });

  it("creates stable source anchors", () => {
    const chunks = expectChunks(
      chunkTextForEmbedding({
        text: "abcdefghijklmnopqrstuvwxyz",
        sourceTitle: "Alphabet",
        chunkSize: 8,
        chunkOverlap: 1,
      }),
    );

    expect(chunks.map((chunk) => chunk.sourceAnchor)).toEqual([
      "chunk-0",
      "chunk-1",
      "chunk-2",
      "chunk-3",
    ]);
  });

  it("populates token estimates", () => {
    const chunks = expectChunks(
      chunkTextForEmbedding({
        text: "123456789",
        sourceTitle: "Numbers",
        chunkSize: 20,
        chunkOverlap: 0,
      }),
    );

    expect(chunks[0].tokenEstimate).toBe(3);
  });

  it("does not return empty chunks", () => {
    const chunks = expectChunks(
      chunkTextForEmbedding({
        text: "\n\nReal content\n\n",
        sourceTitle: "Whitespace",
        chunkSize: 100,
        chunkOverlap: 0,
      }),
    );

    expect(chunks).toHaveLength(1);
    expect(chunks.every((chunk) => chunk.content.length > 0)).toBe(true);
    expect(chunks[0].content).toBe("Real content");
  });
});
