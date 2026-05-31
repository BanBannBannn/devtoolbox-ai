# Phase G1 GraphRAG Planning Spec

## Status
Planning only. This phase does not add runtime code, run SQL, change Standard RAG behavior, or add a graph UI.

## Goal
Add an optional graph-assisted retrieval mode for private developer knowledge. Standard RAG remains the default. GraphRAG is an advanced beta mode that augments vector search with user-owned entities, relationships, evidence paths, and linked chunks.

The product should help a user inspect:

- which query topics were recognized,
- which entities matched,
- which relationships were traversed,
- which source chunks support those relationships,
- which final sources ground the answer.

These are retrieval diagnostics, not model chain-of-thought.

## Existing Foundation
The current RAG implementation already provides:

- private `documents` and `document_chunks`,
- deterministic Markdown/paragraph-aware chunking,
- `document_chunks.embedding vector(2048)`,
- authenticated cosine retrieval through `match_document_chunks`,
- server-side provider calls,
- persisted chat sessions and messages,
- bounded recent chat history,
- safe snippets and `retrievalDetails`,
- plan-limit caps and runtime tuning.

GraphRAG must layer onto this foundation. It must not replace vector retrieval or weaken ownership checks.

## Retrieval Modes
### Standard RAG
- Default mode.
- Embed the current question.
- Retrieve private vector chunks owned by the authenticated user.
- Build an answer from retrieved chunks and recent history.
- Return sources and safe retrieval diagnostics.

### GraphRAG Beta
- Opt-in mode.
- Run Standard RAG retrieval first.
- Resolve query topics or candidate entities.
- Expand matched entities through a bounded user-owned graph.
- Load chunks linked to matched entities and graph evidence.
- Merge, rank, and deduplicate graph-supported chunks with vector chunks.
- Generate an answer grounded in source chunks.
- Return sources, existing `retrievalDetails`, and a bounded `graphTrace`.

If graph data is missing, incomplete, or unavailable, GraphRAG should fall back safely to Standard RAG retrieval or explain that graph-assisted evidence was unavailable.

## Data Model
### `graph_entities`
Stores normalized user-owned concepts.

- `id uuid primary key`
- `user_id uuid references auth.users(id) on delete cascade`
- `name text`
- `normalized_name text`
- `type text nullable`
- `description text nullable`
- `created_at timestamptz`
- `updated_at timestamptz`

Prefer a unique expression index on `(user_id, normalized_name, coalesce(type, ''))`.

### `chunk_entities`
Links private source chunks to user-owned entities.

- `id uuid primary key`
- `user_id uuid references auth.users(id) on delete cascade`
- `document_id uuid references documents(id) on delete cascade`
- `chunk_id uuid references document_chunks(id) on delete cascade`
- `entity_id uuid references graph_entities(id) on delete cascade`
- `mention_text text`
- `created_at timestamptz`

Prefer a unique constraint or index on `(chunk_id, entity_id, mention_text)` where practical.

### `graph_relations`
Stores evidence-backed directed relations between entities.

- `id uuid primary key`
- `user_id uuid references auth.users(id) on delete cascade`
- `source_entity_id uuid references graph_entities(id) on delete cascade`
- `target_entity_id uuid references graph_entities(id) on delete cascade`
- `relation_type text`
- `weight numeric default 1`
- `evidence_text text`
- `document_id uuid references documents(id) on delete cascade`
- `chunk_id uuid references document_chunks(id) on delete cascade`
- `created_at timestamptz`

For the MVP, keep relation rows evidence-granular. Multiple chunks may support the same conceptual relation. Query code can group or score related rows without losing provenance.

### Optional Later Tables
- `graph_entity_aliases`
- `graph_entity_embeddings`
- `graph_extraction_runs`
- `graph_query_traces`

`graph_extraction_runs` is a likely G3 addition if the beta workflow needs status, retry, cost, or safe error tracking separate from `documents.vector_status`.

## Ingestion Plan
1. Start from already-created `document_chunks`.
2. Process chunks with a bounded server-side extraction job.
3. Skip empty or tiny chunks.
4. Ask a configured server-side provider for strict JSON only.
5. Parse JSON defensively.
6. Normalize entity names deterministically.
7. Upsert user-owned entities.
8. Link entities to chunks with mention text.
9. Insert evidence-backed relations tied to the source document and chunk.
10. Record safe metadata and user-safe errors.

Recommended initial extraction bounds:

- maximum entities per chunk: `20`,
- maximum relations per chunk: `30`,
- maximum relation evidence snippet: `240` characters,
- minimum useful chunk length: `80` characters.

These values are starting points for G3 review, not current runtime settings.

Extraction must be best effort. A graph extraction failure must not break successful vectorization, remove valid embeddings, or change `documents.vector_status` to failed.

## Extraction Contract
Use a bounded shape such as:

```json
{
  "entities": [
    {
      "name": "Supabase",
      "type": "technology",
      "description": "Hosted backend platform"
    }
  ],
  "relations": [
    {
      "source": "Supabase",
      "target": "PostgreSQL",
      "relationType": "uses",
      "evidence": "Supabase uses PostgreSQL as its database."
    }
  ]
}
```

Rules:

- Never execute or evaluate extracted content.
- Treat provider output as untrusted input.
- Reject malformed objects and unexpected types.
- Clamp arrays and text lengths.
- Require relation endpoints to resolve to extracted or existing user-owned entities.
- Store concise evidence, not full chunks.
- Keep prompts, provider payloads, and exact model names server-side.

## Graph-Assisted Query Flow
1. Authenticate the user.
2. Validate the current question.
3. Load plan limits and existing RAG runtime settings.
4. Embed only the current question for vector retrieval.
5. Retrieve Standard RAG vector chunks through the existing authenticated RPC.
6. Resolve bounded query topics or candidate entities.
7. Match only the authenticated user's graph entities.
8. Expand one or two hops with strict node, edge, and path limits.
9. Load linked chunks and relation evidence owned by the same user.
10. Merge graph-supported chunks with vector chunks.
11. Deduplicate by chunk ID.
12. Rank with a documented deterministic strategy.
13. Build a prompt with system instructions, untrusted graph facts, untrusted chunks, bounded history, and the current question.
14. Generate a grounded answer.
15. Return sources, existing safe retrieval details, and a bounded graph trace.

The source chunks remain the evidence layer. A graph relation can improve discovery, but it should not become an unsupported factual claim.

## Suggested Beta Request Shape
Keep `POST /api/rag/chat` and add an optional server-validated mode:

```json
{
  "message": "How does the deployment service connect to the database?",
  "sessionId": "optional uuid",
  "retrievalMode": "graph_assisted"
}
```

Allowed values:

- `standard`
- `graph_assisted`

Missing mode means `standard`.

## Safe `graphTrace`
GraphRAG responses may add:

```json
{
  "graphTrace": {
    "mode": "graph_assisted",
    "queryTopics": ["deployment service", "database"],
    "matchedEntities": [
      {
        "entityId": "uuid",
        "name": "Supabase",
        "type": "technology"
      }
    ],
    "paths": [
      {
        "sourceEntityId": "uuid",
        "sourceName": "Supabase",
        "targetEntityId": "uuid",
        "targetName": "PostgreSQL",
        "relationType": "uses",
        "weight": 1,
        "evidenceSnippet": "Supabase uses PostgreSQL as its database.",
        "documentId": "uuid",
        "chunkId": "uuid"
      }
    ],
    "supportingChunks": [
      {
        "documentId": "uuid",
        "chunkId": "uuid",
        "chunkIndex": 0,
        "sourceTitle": "Architecture Notes",
        "sourceAnchor": "chunk-0",
        "snippet": "Short safe snippet"
      }
    ],
    "nodeCount": 2,
    "edgeCount": 1
  }
}
```

`graphTrace` must stay bounded and snippet-based. It must not include full chunks, full documents, prompts, raw embeddings, provider payloads, exact model names, secrets, or hidden reasoning.

## UI Plan
Add a retrieval-mode selector in a later dashboard phase:

- `Standard RAG`
- `GraphRAG beta`

For GraphRAG answers, extend the existing collapsible retrieval panel with tabs:

- Query
- Entities
- Graph paths
- Supporting chunks
- Final sources

Visualization rules:

- show at most `10` to `20` nodes,
- show bounded edges and paths,
- allow clicking a node or edge to inspect safe evidence snippets,
- keep the mobile view usable,
- label diagnostics clearly as retrieval evidence, not AI thinking.

A future `/dashboard/graph` explorer may let users inspect their own knowledge graph independently of chat.

## Answer Rules
- Cite source titles or anchors where useful.
- Prefer claims supported by source chunks.
- If graph evidence is weak or ambiguous, say so.
- If retrieved context is insufficient, say that the uploaded documents do not contain enough information.
- Do not expose hidden reasoning.

## Security
- Derive `user_id` from the authenticated Supabase session.
- Never accept `user_id` from browser input.
- Filter graph reads by the authenticated user's ownership.
- Do not add direct browser extraction writes.
- Use a server-only trusted write path after auth and document ownership checks.
- If service role is used for graph writes, keep it server-only and never use it to bypass ownership validation.
- Treat extracted graph facts as untrusted derived data.
- Treat source chunks and chat history as untrusted context.
- Never return prompts, chain-of-thought, raw embeddings, raw provider payloads, API keys, service role keys, exact model names, or another user's graph data.
- Delete graph-derived rows when their source document or chunk is deleted.

## Scope Boundaries
Out of scope for G1:

- runtime implementation,
- SQL execution,
- extraction implementation,
- chat mode implementation,
- graph visualization implementation,
- Neo4j or an external graph database,
- payments,
- public graph sharing,
- team graphs,
- changes to Standard RAG behavior,
- changes to blog or public tools.

## Acceptance Criteria
- The plan keeps Standard RAG as the default.
- GraphRAG is an optional beta augmentation.
- Graph tables are user-owned and source-linked.
- Graph writes are server-only.
- Source deletion cascades to graph-derived rows.
- Extraction failure cannot break ordinary vectorization.
- Query-time graph expansion is bounded.
- Graph facts are treated as untrusted derived context.
- `graphTrace` is explainable retrieval metadata, not chain-of-thought.
- No private data, secrets, prompts, embeddings, or model names are exposed.

## Decisions Before Implementation
1. Choose the G3 extraction trigger: explicit `Graphize document` beta action is recommended before automatic post-vectorization extraction.
2. Decide whether G2 includes `graph_extraction_runs` immediately or G3 adds it alongside extraction.
3. Confirm normalization rules for entity names and nullable entity types.
4. Confirm relation deduplication: evidence-granular rows are recommended for MVP provenance.
5. Define GraphRAG-specific quotas and `usage_events` types before provider work is added.
6. Define graph expansion caps and ranking weights before G5.
7. Confirm that future graph writes use the existing server-only service-role helper only after authenticated ownership checks.
8. Select a lightweight graph visualization library during G6, after the trace contract is stable.
