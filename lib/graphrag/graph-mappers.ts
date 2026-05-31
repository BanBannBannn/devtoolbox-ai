import type {
  ChunkEntity,
  GraphEdge,
  GraphEntity,
  GraphEntityRelatedChunk,
  GraphExtractionRun,
  GraphExtractionStatus,
  GraphNode,
  GraphRelation,
} from "./graph-types";

export type GraphEntityRow = {
  id: string;
  user_id?: string;
  name: string;
  normalized_name: string;
  type: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type ChunkEntityRow = {
  id: string;
  user_id?: string;
  document_id: string;
  chunk_id: string;
  entity_id: string;
  mention_text: string;
  start_offset: number | null;
  end_offset: number | null;
  created_at: string;
};

export type GraphRelationRow = {
  id: string;
  user_id?: string;
  source_entity_id: string;
  target_entity_id: string;
  relation_type: string;
  weight: number | string;
  evidence_text: string;
  document_id: string;
  chunk_id: string;
  created_at: string;
};

export type GraphExtractionRunRow = {
  id: string;
  user_id?: string;
  document_id: string;
  status: string;
  safe_error: string | null;
  created_at: string;
  updated_at: string;
};

export type GraphEntityRelatedChunkRow = {
  id: string;
  document_id: string;
  chunk_id: string;
  mention_text: string;
  start_offset: number | null;
  end_offset: number | null;
  document_chunks:
    | {
        chunk_index: number;
        source_title: string;
        source_anchor: string | null;
      }
    | Array<{
        chunk_index: number;
        source_title: string;
        source_anchor: string | null;
      }>
    | null;
};

const graphExtractionStatuses = [
  "queued",
  "processing",
  "completed",
  "failed",
] as const;
const graphEvidenceSnippetMaxLength = 500;

export function normalizeGraphEntityName(value: string) {
  return value.normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase();
}

export function parseGraphExtractionStatus(
  value: unknown,
): GraphExtractionStatus | null {
  return typeof value === "string" &&
    graphExtractionStatuses.includes(value as GraphExtractionStatus)
    ? (value as GraphExtractionStatus)
    : null;
}

export function createSafeGraphEvidenceSnippet(
  value: string,
  maxLength = graphEvidenceSnippetMaxLength,
) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(maxLength - 3, 0)).trimEnd()}...`;
}

export function mapGraphEntityRow(row: GraphEntityRow): GraphEntity {
  return {
    id: row.id,
    name: row.name,
    normalizedName: row.normalized_name,
    type: row.type,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapChunkEntityRow(row: ChunkEntityRow): ChunkEntity {
  return {
    id: row.id,
    documentId: row.document_id,
    chunkId: row.chunk_id,
    entityId: row.entity_id,
    mentionText: row.mention_text,
    startOffset: row.start_offset,
    endOffset: row.end_offset,
    createdAt: row.created_at,
  };
}

export function mapGraphRelationRow(row: GraphRelationRow): GraphRelation {
  return {
    id: row.id,
    sourceEntityId: row.source_entity_id,
    targetEntityId: row.target_entity_id,
    relationType: row.relation_type,
    weight: toFiniteNumber(row.weight),
    evidenceSnippet: createSafeGraphEvidenceSnippet(row.evidence_text),
    documentId: row.document_id,
    chunkId: row.chunk_id,
    createdAt: row.created_at,
  };
}

export function mapGraphExtractionRunRow(
  row: GraphExtractionRunRow,
): GraphExtractionRun | null {
  const status = parseGraphExtractionStatus(row.status);

  if (!status) {
    return null;
  }

  return {
    id: row.id,
    documentId: row.document_id,
    status,
    safeError: row.safe_error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapGraphEntityToNode(entity: GraphEntity): GraphNode {
  return {
    id: entity.id,
    name: entity.name,
    type: entity.type,
    description: entity.description,
  };
}

export function mapGraphRelationToEdge(relation: GraphRelation): GraphEdge {
  return {
    id: relation.id,
    sourceEntityId: relation.sourceEntityId,
    targetEntityId: relation.targetEntityId,
    relationType: relation.relationType,
    weight: relation.weight,
    evidenceSnippet: relation.evidenceSnippet,
    documentId: relation.documentId,
    chunkId: relation.chunkId,
  };
}

export function mapGraphEntityRelatedChunkRow(
  row: GraphEntityRelatedChunkRow,
): GraphEntityRelatedChunk {
  const chunk = Array.isArray(row.document_chunks)
    ? row.document_chunks[0]
    : row.document_chunks;

  return {
    id: row.id,
    documentId: row.document_id,
    chunkId: row.chunk_id,
    chunkIndex: chunk?.chunk_index ?? null,
    sourceTitle: chunk?.source_title ?? null,
    sourceAnchor: chunk?.source_anchor ?? null,
    mentionText: row.mention_text,
    startOffset: row.start_offset,
    endOffset: row.end_offset,
  };
}

function toFiniteNumber(value: number | string) {
  const parsed = typeof value === "number" ? value : Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}
