export type GraphExtractionStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed";

export type GraphEntity = {
  id: string;
  name: string;
  normalizedName: string;
  type: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ChunkEntity = {
  id: string;
  documentId: string;
  chunkId: string;
  entityId: string;
  mentionText: string;
  startOffset: number | null;
  endOffset: number | null;
  createdAt: string;
};

export type GraphRelation = {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationType: string;
  weight: number;
  evidenceSnippet: string;
  documentId: string;
  chunkId: string;
  createdAt: string;
};

export type GraphExtractionRun = {
  id: string;
  documentId: string;
  status: GraphExtractionStatus;
  safeError: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GraphNode = {
  id: string;
  name: string;
  type: string | null;
  description: string | null;
};

export type GraphEdge = {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationType: string;
  weight: number;
  evidenceSnippet: string;
  documentId: string;
  chunkId: string;
};

export type GraphExplorerSummary = {
  entityCount: number;
  relationCount: number;
  linkedChunkCount: number;
};

export type GraphEntityRelatedChunk = {
  id: string;
  documentId: string;
  chunkId: string;
  chunkIndex: number | null;
  sourceTitle: string | null;
  sourceAnchor: string | null;
  mentionText: string;
  startOffset: number | null;
  endOffset: number | null;
};

export type GraphEntityDetail = {
  entity: GraphEntity;
  relatedChunks: GraphEntityRelatedChunk[];
};
