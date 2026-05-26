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
    });
  });

  it("applies server env overrides after DB config", () => {
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
        },
        env: {
          RAG_RETRIEVED_CHUNKS_OVERRIDE: "8",
          RAG_SIMILARITY_THRESHOLD: "0.55",
          RAG_MAX_OUTPUT_TOKENS_OVERRIDE: "900",
          RAG_TEMPERATURE: "0.6",
          RAG_SOURCE_SNIPPET_LENGTH: "320",
          RAG_DEBUG_RETRIEVAL: "true",
        },
      }),
    ).toEqual({
      retrievedChunks: 8,
      similarityThreshold: 0.55,
      maxOutputTokens: 900,
      temperature: 0.6,
      sourceSnippetLength: 320,
      debugRetrieval: true,
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
        },
      }),
    ).toEqual({
      retrievedChunks: 3,
      similarityThreshold: 1,
      maxOutputTokens: 800,
      temperature: 0,
      sourceSnippetLength: 500,
      debugRetrieval: true,
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

    expect(getRagRuntimeSettingsFromFormData(formData)).toEqual({
      retrievedChunks: 20,
      similarityThreshold: 0,
      maxOutputTokens: 100,
      temperature: 1,
      sourceSnippetLength: 500,
      debugRetrieval: true,
    });
  });

  it("sanitizes stored settings without applying user plan caps", () => {
    expect(
      sanitizeRagRuntimeSettings({
        retrievedChunks: 10,
        maxOutputTokens: 1500,
      }),
    ).toMatchObject({
      retrievedChunks: 10,
      maxOutputTokens: 1500,
      temperature: 0.2,
    });
  });
});
