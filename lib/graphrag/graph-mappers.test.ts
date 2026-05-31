import { describe, expect, it } from "vitest";
import {
  createSafeGraphEvidenceSnippet,
  mapGraphEntityRow,
  mapGraphEntityToNode,
  mapGraphExtractionRunRow,
  mapGraphRelationRow,
  mapGraphRelationToEdge,
  normalizeGraphEntityName,
  parseGraphExtractionStatus,
} from "./graph-mappers";

describe("GraphRAG graph helpers", () => {
  it("normalizes entity names deterministically", () => {
    expect(normalizeGraphEntityName("  Supabase   Storage  ")).toBe(
      "supabase storage",
    );
    expect(normalizeGraphEntityName("Ｎｅｘｔ．ｊｓ")).toBe("next.js");
  });

  it("accepts only allowed extraction statuses", () => {
    expect(parseGraphExtractionStatus("queued")).toBe("queued");
    expect(parseGraphExtractionStatus("processing")).toBe("processing");
    expect(parseGraphExtractionStatus("completed")).toBe("completed");
    expect(parseGraphExtractionStatus("failed")).toBe("failed");
    expect(parseGraphExtractionStatus("running")).toBeNull();
    expect(parseGraphExtractionStatus(null)).toBeNull();
  });

  it("maps graph rows without exposing ownership or private implementation fields", () => {
    const entity = mapGraphEntityRow({
      id: "entity-1",
      user_id: "private-user",
      name: "Supabase",
      normalized_name: "supabase",
      type: "technology",
      description: "Hosted backend platform",
      created_at: "2026-05-31T00:00:00.000Z",
      updated_at: "2026-05-31T00:00:00.000Z",
    });

    expect(entity).not.toHaveProperty("user_id");
    expect(entity).not.toHaveProperty("embedding");
    expect(entity).not.toHaveProperty("model");
    expect(mapGraphEntityToNode(entity)).toEqual({
      id: "entity-1",
      name: "Supabase",
      type: "technology",
      description: "Hosted backend platform",
    });
  });

  it("maps relation edges with safe ids and bounded evidence", () => {
    const relation = mapGraphRelationRow({
      id: "relation-1",
      user_id: "private-user",
      source_entity_id: "entity-1",
      target_entity_id: "entity-2",
      relation_type: "uses",
      weight: "1.5",
      evidence_text: ` Evidence  ${"x".repeat(600)} `,
      document_id: "document-1",
      chunk_id: "chunk-1",
      created_at: "2026-05-31T00:00:00.000Z",
    });

    expect(relation.evidenceSnippet.length).toBeLessThanOrEqual(500);
    expect(relation).not.toHaveProperty("user_id");
    expect(mapGraphRelationToEdge(relation)).toEqual({
      id: "relation-1",
      sourceEntityId: "entity-1",
      targetEntityId: "entity-2",
      relationType: "uses",
      weight: 1.5,
      evidenceSnippet: relation.evidenceSnippet,
      documentId: "document-1",
      chunkId: "chunk-1",
    });
  });

  it("maps valid extraction runs and ignores unknown statuses", () => {
    const run = {
      id: "run-1",
      user_id: "private-user",
      document_id: "document-1",
      status: "completed",
      safe_error: null,
      created_at: "2026-05-31T00:00:00.000Z",
      updated_at: "2026-05-31T00:00:01.000Z",
    };

    expect(mapGraphExtractionRunRow(run)).toEqual({
      id: "run-1",
      documentId: "document-1",
      status: "completed",
      safeError: null,
      createdAt: "2026-05-31T00:00:00.000Z",
      updatedAt: "2026-05-31T00:00:01.000Z",
    });
    expect(
      mapGraphExtractionRunRow({
        ...run,
        status: "unknown",
      }),
    ).toBeNull();
  });

  it("normalizes and bounds graph evidence snippets", () => {
    expect(createSafeGraphEvidenceSnippet("  one \n two  ", 20)).toBe(
      "one two",
    );
    expect(createSafeGraphEvidenceSnippet("abcdefghij", 7)).toBe("abcd...");
  });
});
