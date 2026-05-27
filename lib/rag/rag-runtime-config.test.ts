import { describe, expect, it } from "vitest";
import {
  filterChunksBySimilarity,
  getRagRuntimeSettingsFromFormData,
  resolveRagRuntimeConfig,
  sanitizeRagRuntimeSettings,
  type RagRuntimePlanCaps,
} from "./rag-runtime-config";

const planLimits: RagRuntimePlanCaps = {
  retrieved_chunks_per_answer: 3,
  max_output_tokens: 800,
};

describe("rag runtime config", () => {
  it("uses safe defaults capped by plan limits", () => {
    expect(resolveRagRuntimeConfig({ planLimits, env: {} })).toEqual({
      retrievedChunks: 3,
      similarityThreshold: 0,
      maxOutputTokens: 800,
      temperature: 0.2,
      sourceSnippetLength: 240,
      debugRetrieval: false,
      chatHistoryMessages: 6,
    });
  });

  it("applies valid DB config values", () => {
    expect(
      resolveRagRuntimeConfig({
        planLimits: {
          retrieved_chunks_per_answer: 10,
          max_output_tokens: 1200,
        },
        dbConfig: {
          retrievedChunks: 6,
          similarityThreshold: 0.7,
          maxOutputTokens: 1000,
          temperature: 0.4,
          sourceSnippetLength: 300,
          debugRetrieval: true,
          chatHistoryMessages: 12,
        },
        env: {},
      }),
    ).toEqual({
      retrievedChunks: 6,
      similarityThreshold: 0.7,
      maxOutputTokens: 1000,
      temperature: 0.4,
      sourceSnippetLength: 300,
      debugRetrieval: true,
      chatHistoryMessages: 12,
    });
  });

  it("ignores invalid DB config values and clamps out-of-range values", () => {
    expect(
      resolveRagRuntimeConfig({
        planLimits: {
          retrieved_chunks_per_answer: 20,
          max_output_tokens: 2000,
        },
        dbConfig: {
          retrievedChunks: 99,
          similarityThreshold: -1,
          maxOutputTokens: "many",
          temperature: 2,
          sourceSnippetLength: 10,
          debugRetrieval: "yes",
          chatHistoryMessages: 99,
        },
        env: {},
      }),
    ).toEqual({
      retrievedChunks: 20,
      similarityThreshold: 0,
      maxOutputTokens: 2000,
      temperature: 1,
      sourceSnippetLength: 80,
      debugRetrieval: false,
      chatHistoryMessages: 20,
    });
  });

  it("uses app_config over env by default", () => {
    expect(
      resolveRagRuntimeConfig({
        planLimits: {
          retrieved_chunks_per_answer: 10,
          max_output_tokens: 1200,
        },
        dbConfig: {
          retrievedChunks: 2,
          similarityThreshold: 0.1,
          maxOutputTokens: 500,
          temperature: 0.2,
          sourceSnippetLength: 120,
          debugRetrieval: false,
          chatHistoryMessages: 5,
        },
        env: {
          RAG_RETRIEVED_CHUNKS_OVERRIDE: "8",
          RAG_SIMILARITY_THRESHOLD: "0.55",
          RAG_MAX_OUTPUT_TOKENS_OVERRIDE: "900",
          RAG_TEMPERATURE: "0.6",
          RAG_SOURCE_SNIPPET_LENGTH: "320",
          RAG_DEBUG_RETRIEVAL: "true",
          RAG_CHAT_HISTORY_MESSAGES: "15",
        },
      }),
    ).toEqual({
      retrievedChunks: 2,
      similarityThreshold: 0.1,
      maxOutputTokens: 500,
      temperature: 0.2,
      sourceSnippetLength: 120,
      debugRetrieval: false,
      chatHistoryMessages: 5,
    });
  });

  it("uses env overrides after app_config only when forced", () => {
    expect(
      resolveRagRuntimeConfig({
        planLimits: {
          retrieved_chunks_per_answer: 10,
          max_output_tokens: 1200,
        },
        dbConfig: {
          retrievedChunks: 5,
          maxOutputTokens: 800,
          debugRetrieval: false,
          chatHistoryMessages: 4,
        },
        env: {
          RAG_FORCE_ENV_OVERRIDES: "true",
          RAG_RETRIEVED_CHUNKS_OVERRIDE: "8",
          RAG_MAX_OUTPUT_TOKENS_OVERRIDE: "900",
          RAG_DEBUG_RETRIEVAL: "true",
          RAG_CHAT_HISTORY_MESSAGES: "10",
        },
      }),
    ).toMatchObject({
      retrievedChunks: 8,
      maxOutputTokens: 900,
      debugRetrieval: true,
      chatHistoryMessages: 10,
    });
  });

  it("uses env as fallback when app_config values are missing or invalid", () => {
    expect(
      resolveRagRuntimeConfig({
        planLimits: {
          retrieved_chunks_per_answer: 10,
          max_output_tokens: 1200,
        },
        dbConfig: {
          retrievedChunks: "invalid",
          similarityThreshold: 0.4,
        },
        env: {
          RAG_RETRIEVED_CHUNKS_OVERRIDE: "6",
          RAG_MAX_OUTPUT_TOKENS_OVERRIDE: "900",
        },
      }),
    ).toMatchObject({
      retrievedChunks: 6,
      similarityThreshold: 0.4,
      maxOutputTokens: 900,
    });
  });

  it("clamps env overrides to safe ranges and plan caps", () => {
    expect(
      resolveRagRuntimeConfig({
        planLimits,
        env: {
          RAG_RETRIEVED_CHUNKS_OVERRIDE: "50",
          RAG_SIMILARITY_THRESHOLD: "5",
          RAG_MAX_OUTPUT_TOKENS_OVERRIDE: "5000",
          RAG_TEMPERATURE: "-1",
          RAG_SOURCE_SNIPPET_LENGTH: "1000",
          RAG_DEBUG_RETRIEVAL: "on",
          RAG_CHAT_HISTORY_MESSAGES: "99",
        },
      }),
    ).toEqual({
      retrievedChunks: 3,
      similarityThreshold: 1,
      maxOutputTokens: 800,
      temperature: 0,
      sourceSnippetLength: 500,
      debugRetrieval: true,
      chatHistoryMessages: 20,
    });
  });

  it("clamps chat history window to zero through twenty", () => {
    expect(
      resolveRagRuntimeConfig({
        planLimits,
        dbConfig: {
          chatHistoryMessages: -1,
        },
        env: {},
      }).chatHistoryMessages,
    ).toBe(0);
  });

  it("keeps effective values under runtime hard caps even when plan caps are higher", () => {
    expect(
      resolveRagRuntimeConfig({
        planLimits: {
          retrieved_chunks_per_answer: 50,
          max_output_tokens: 5000,
        },
        dbConfig: {
          retrievedChunks: 30,
          maxOutputTokens: 5000,
        },
        env: {},
      }),
    ).toMatchObject({
      retrievedChunks: 20,
      maxOutputTokens: 2000,
    });
  });

  it("filters low-similarity chunks", () => {
    expect(
      filterChunksBySimilarity(
        [
          { id: "a", similarity: 0.9 },
          { id: "b", similarity: 0.4 },
          { id: "c", similarity: 0.7 },
        ],
        0.7,
      ),
    ).toEqual([
      { id: "a", similarity: 0.9 },
      { id: "c", similarity: 0.7 },
    ]);
  });

  it("clamps settings parsed from form data", () => {
    const formData = new FormData();
    formData.set("retrievedChunks", "50");
    formData.set("similarityThreshold", "-1");
    formData.set("maxOutputTokens", "50");
    formData.set("temperature", "2");
    formData.set("sourceSnippetLength", "1000");
    formData.set("debugRetrieval", "on");
    formData.set("chatHistoryMessages", "99");

    expect(getRagRuntimeSettingsFromFormData(formData)).toEqual({
      retrievedChunks: 20,
      similarityThreshold: 0,
      maxOutputTokens: 100,
      temperature: 1,
      sourceSnippetLength: 500,
      debugRetrieval: true,
      chatHistoryMessages: 20,
    });
  });

  it("sanitizes stored settings without applying user plan caps", () => {
    expect(
      sanitizeRagRuntimeSettings({
        retrievedChunks: 10,
        maxOutputTokens: 1500,
        chatHistoryMessages: 8,
      }),
    ).toMatchObject({
      retrievedChunks: 10,
      maxOutputTokens: 1500,
      temperature: 0.2,
      chatHistoryMessages: 8,
    });
  });
});
