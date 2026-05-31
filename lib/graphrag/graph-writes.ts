import type { GraphExtractionStatus } from "./graph-types";

type CreateGraphExtractionRunInput = {
  documentId: string;
};

type UpdateGraphExtractionRunInput = {
  runId: string;
  documentId: string;
  status: GraphExtractionStatus;
  safeError?: string | null;
};

type ReplaceDocumentGraphRowsInput = {
  documentId: string;
};

type UpsertGraphEntityInput = {
  name: string;
  normalizedName: string;
  type: string | null;
  description?: string | null;
};

type InsertChunkEntityLinksInput = {
  documentId: string;
};

type InsertGraphRelationsInput = {
  documentId: string;
};

const graphWriteDeferredMessage =
  "Graph extraction writes are deferred until Phase G3.";

/**
 * G3 TODO: authenticate, verify document ownership, then create the run through
 * the server-only service-role client.
 */
export async function createGraphExtractionRun(
  _input: CreateGraphExtractionRunInput,
): Promise<never> {
  void _input;
  throw new Error(graphWriteDeferredMessage);
}

/**
 * G3 TODO: authenticate, verify run and document ownership, then update status
 * through the server-only service-role client.
 */
export async function markGraphExtractionRun(
  _input: UpdateGraphExtractionRunInput,
): Promise<never> {
  void _input;
  throw new Error(graphWriteDeferredMessage);
}

/**
 * G3 TODO: authenticate and verify document/chunk ownership before replacing
 * derived graph rows. Do not change successful vectorization status on failure.
 */
export async function replaceGraphRowsForDocument(
  _input: ReplaceDocumentGraphRowsInput,
): Promise<never> {
  void _input;
  throw new Error(graphWriteDeferredMessage);
}

/**
 * G3 TODO: select by user_id, normalized_name, and nullable type before insert.
 * The schema uses an expression unique index, so do not rely on a Supabase
 * upsert conflict target for this operation.
 */
export async function upsertGraphEntityByNormalizedNameAndType(
  _input: UpsertGraphEntityInput,
): Promise<never> {
  void _input;
  throw new Error(graphWriteDeferredMessage);
}

/**
 * G3 TODO: authenticate and verify that links use owned document chunks and
 * owned graph entities before inserting through the service-role client.
 */
export async function insertChunkEntityLinks(
  _input: InsertChunkEntityLinksInput,
): Promise<never> {
  void _input;
  throw new Error(graphWriteDeferredMessage);
}

/**
 * G3 TODO: authenticate and verify owned relation endpoints, document, and
 * chunk evidence before inserting through the service-role client.
 */
export async function insertGraphRelations(
  _input: InsertGraphRelationsInput,
): Promise<never> {
  void _input;
  throw new Error(graphWriteDeferredMessage);
}
