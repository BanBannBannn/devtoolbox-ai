import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  generateEmbedding,
  getRagEmbeddingConfig,
} from "./embedding-provider";

const originalEnv = process.env;

describe("embedding provider", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = {
      ...originalEnv,
      OPENROUTER_API_KEY: "test-openrouter-key",
      RAG_EMBEDDING_MODEL: "test-embedding-model",
      RAG_EMBEDDING_DIMENSION: "3",
      NEXT_PUBLIC_SITE_URL: "https://example.com",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("returns a config error when OPENROUTER_API_KEY is missing", () => {
    const result = getRagEmbeddingConfig({
      RAG_EMBEDDING_MODEL: "test-embedding-model",
      RAG_EMBEDDING_DIMENSION: "3",
    });

    expect(result).toEqual({
      success: false,
      error: "OpenRouter API key is not configured.",
    });
  });

  it("uses the default embedding model when RAG_EMBEDDING_MODEL is missing", () => {
    const result = getRagEmbeddingConfig({
      OPENROUTER_API_KEY: "test-openrouter-key",
      RAG_EMBEDDING_DIMENSION: "2048",
    });

    expect(result).toEqual({
      success: true,
      config: {
        apiKey: "test-openrouter-key",
        model: "nvidia/llama-nemotron-embed-vl-1b-v2:free",
        dimension: 2048,
        siteUrl: undefined,
      },
    });
  });

  it("returns a config error when RAG_EMBEDDING_DIMENSION is missing", () => {
    const result = getRagEmbeddingConfig({
      OPENROUTER_API_KEY: "test-openrouter-key",
      RAG_EMBEDDING_MODEL: "test-embedding-model",
    });

    expect(result).toEqual({
      success: false,
      error: "RAG embedding dimension is not configured.",
    });
  });

  it("returns a config error when RAG_EMBEDDING_DIMENSION is invalid", () => {
    const result = getRagEmbeddingConfig({
      OPENROUTER_API_KEY: "test-openrouter-key",
      RAG_EMBEDDING_MODEL: "test-embedding-model",
      RAG_EMBEDDING_DIMENSION: "not-a-number",
    });

    expect(result).toEqual({
      success: false,
      error: "RAG embedding dimension must be a positive integer.",
    });
  });

  it("rejects empty input", async () => {
    await expect(generateEmbedding(" \n\t ")).resolves.toEqual({
      success: false,
      error: "Text is required before generating an embedding.",
    });
  });

  it("returns an embedding for a mocked successful provider response", async () => {
    const fetchMock = mockFetch({
      ok: true,
      body: {
        data: [{ embedding: [0.1, 0.2, 0.3] }],
      },
    });

    await expect(generateEmbedding("hello world")).resolves.toEqual({
      success: true,
      embedding: [0.1, 0.2, 0.3],
      model: "test-embedding-model",
      dimension: 3,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/embeddings",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-openrouter-key",
          "Content-Type": "application/json",
          "HTTP-Referer": "https://example.com",
          "X-Title": "DevToolBox AI",
        }),
        body: JSON.stringify({
          model: "test-embedding-model",
          input: "hello world",
          encoding_format: "float",
        }),
      }),
    );
  });

  it("returns an error when provider response has the wrong dimension", async () => {
    mockFetch({
      ok: true,
      body: {
        data: [{ embedding: [0.1, 0.2] }],
      },
    });

    await expect(generateEmbedding("hello world")).resolves.toEqual({
      success: false,
      error: "Embedding provider returned 2 dimensions, but 3 were expected.",
    });
  });

  it("returns an error when provider response shape is invalid", async () => {
    mockFetch({
      ok: true,
      body: {
        data: [{ embedding: ["not-a-number"] }],
      },
    });

    await expect(generateEmbedding("hello world")).resolves.toEqual({
      success: false,
      error: "Embedding provider returned an invalid response.",
    });
  });

  it("returns a user-safe error when provider response is not OK", async () => {
    mockFetch({
      ok: false,
      body: {
        error: {
          message: "provider says secret-ish details",
        },
      },
    });

    await expect(generateEmbedding("hello world")).resolves.toEqual({
      success: false,
      error: "Embedding provider request failed. Please try again later.",
    });
  });

  it("does not include the API key in returned errors", async () => {
    mockFetch({
      ok: false,
      body: {
        error: {
          message: "test-openrouter-key",
        },
      },
    });

    const result = await generateEmbedding("hello world");

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error).not.toContain("test-openrouter-key");
    }
  });
});

function mockFetch({
  ok,
  body,
}: {
  ok: boolean;
  body: unknown;
}) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    json: vi.fn().mockResolvedValue(body),
  });

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}
