import {
  mapGraphEntityRelatedChunkRow,
  mapGraphEntityRow,
  mapGraphExtractionRunRow,
  mapGraphRelationRow,
  type GraphEntityRelatedChunkRow,
  type GraphEntityRow,
  type GraphExtractionRunRow,
  type GraphRelationRow,
} from "./graph-mappers";
import type {
  GraphEntityDetail,
  GraphExplorerSummary,
} from "./graph-types";
import { createServerSupabaseClient } from "../supabase/server";

const graphEntityFields =
  "id,name,normalized_name,type,description,created_at,updated_at";
const graphRelationFields =
  "id,source_entity_id,target_entity_id,relation_type,weight,evidence_text,document_id,chunk_id,created_at";
const graphExtractionRunFields =
  "id,document_id,status,safe_error,created_at,updated_at";
const graphEntityRelatedChunkFields =
  "id,document_id,chunk_id,mention_text,start_offset,end_offset,document_chunks(chunk_index,source_title,source_anchor)";

export async function listCurrentUserGraphEntities(limit = 100) {
  const context = await getAuthenticatedGraphReadContext();

  if (!context) {
    return [];
  }

  const { data, error } = await context.supabase
    .from("graph_entities")
    .select(graphEntityFields)
    .eq("user_id", context.userId)
    .order("name", { ascending: true })
    .limit(clampListLimit(limit, 200));

  if (error || !data) {
    return [];
  }

  return (data as GraphEntityRow[]).map(mapGraphEntityRow);
}

export async function listCurrentUserGraphRelations(limit = 200) {
  const context = await getAuthenticatedGraphReadContext();

  if (!context) {
    return [];
  }

  const { data, error } = await context.supabase
    .from("graph_relations")
    .select(graphRelationFields)
    .eq("user_id", context.userId)
    .order("created_at", { ascending: false })
    .limit(clampListLimit(limit, 500));

  if (error || !data) {
    return [];
  }

  return (data as GraphRelationRow[]).map(mapGraphRelationRow);
}

export async function getCurrentUserGraphSummary(): Promise<GraphExplorerSummary> {
  const context = await getAuthenticatedGraphReadContext();

  if (!context) {
    return createEmptyGraphSummary();
  }

  const [entities, relations, linkedChunks] = await Promise.all([
    countOwnedRows(context, "graph_entities"),
    countOwnedRows(context, "graph_relations"),
    countOwnedRows(context, "chunk_entities"),
  ]);

  return {
    entityCount: entities,
    relationCount: relations,
    linkedChunkCount: linkedChunks,
  };
}

export async function getCurrentUserGraphEntityDetail(
  entityId: string,
  limit = 50,
): Promise<GraphEntityDetail | null> {
  const context = await getAuthenticatedGraphReadContext();

  if (!context || !entityId) {
    return null;
  }

  const [{ data: entity, error: entityError }, { data: links, error: linksError }] =
    await Promise.all([
      context.supabase
        .from("graph_entities")
        .select(graphEntityFields)
        .eq("id", entityId)
        .eq("user_id", context.userId)
        .maybeSingle(),
      context.supabase
        .from("chunk_entities")
        .select(graphEntityRelatedChunkFields)
        .eq("entity_id", entityId)
        .eq("user_id", context.userId)
        .order("created_at", { ascending: false })
        .limit(clampListLimit(limit, 100)),
    ]);

  if (entityError || linksError || !entity || !links) {
    return null;
  }

  return {
    entity: mapGraphEntityRow(entity as GraphEntityRow),
    relatedChunks: (links as GraphEntityRelatedChunkRow[]).map(
      mapGraphEntityRelatedChunkRow,
    ),
  };
}

export async function getCurrentUserGraphExtractionRunsForDocument(
  documentId: string,
  limit = 25,
) {
  const context = await getAuthenticatedGraphReadContext();

  if (!context || !documentId) {
    return [];
  }

  const { data, error } = await context.supabase
    .from("graph_extraction_runs")
    .select(graphExtractionRunFields)
    .eq("document_id", documentId)
    .eq("user_id", context.userId)
    .order("created_at", { ascending: false })
    .limit(clampListLimit(limit, 100));

  if (error || !data) {
    return [];
  }

  return (data as GraphExtractionRunRow[])
    .map(mapGraphExtractionRunRow)
    .filter((run) => run !== null);
}

function createEmptyGraphSummary(): GraphExplorerSummary {
  return {
    entityCount: 0,
    relationCount: 0,
    linkedChunkCount: 0,
  };
}

async function getAuthenticatedGraphReadContext() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return {
    supabase,
    userId: user.id,
  };
}

async function countOwnedRows(
  context: NonNullable<
    Awaited<ReturnType<typeof getAuthenticatedGraphReadContext>>
  >,
  table: "graph_entities" | "graph_relations" | "chunk_entities",
) {
  const { count, error } = await context.supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("user_id", context.userId);

  return error || count === null ? 0 : count;
}

function clampListLimit(value: number, max: number) {
  return Math.min(Math.max(Math.trunc(value) || 1, 1), max);
}
