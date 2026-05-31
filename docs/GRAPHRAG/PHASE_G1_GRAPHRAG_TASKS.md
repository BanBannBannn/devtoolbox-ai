# Phase G1 GraphRAG Tasks

## Status
Planning only. Do not run SQL or implement runtime behavior in G1.

## G1: Planning Package
- [x] Define Standard RAG as the default retrieval mode.
- [x] Define GraphRAG as an opt-in beta mode.
- [x] Define user-owned graph entities, relations, and chunk links.
- [x] Define bounded extraction and graph-assisted query flows.
- [x] Define safe `graphTrace` diagnostics.
- [x] Define future dashboard trace and graph explorer UX.
- [x] Document security, ownership, and failure-isolation rules.
- [x] Add review-only SQL and QA guidance.

## G2: SQL Schema And Helpers
- [ ] Review and apply the final graph schema manually in Supabase.
- [ ] Add `graph_entities`, `chunk_entities`, and `graph_relations`.
- [ ] Enable RLS and grant authenticated users read access only to owned rows.
- [ ] Keep browser insert/update/delete access revoked.
- [ ] Confirm document and chunk deletion cascades.
- [ ] Decide whether to add `graph_extraction_runs`.
- [ ] Add pure normalization, validation, and safe mapping helpers.
- [ ] Add server-only graph data-access helpers with explicit ownership input from trusted auth flow.
- [ ] Test normalization, bounded parsing, ownership-safe mapping, and source deletion assumptions.

## G3: Document Graph Extraction
- [ ] Add an explicit beta `Graphize document` action after vectorization.
- [ ] Require authenticated ownership of a saved vectorized document.
- [ ] Extract entities and relations from existing chunks server-side.
- [ ] Use strict bounded JSON parsing.
- [ ] Upsert normalized user-owned entities.
- [ ] Replace or reconcile graph rows for re-graphized chunks deterministically.
- [ ] Record safe extraction status and errors separately from vector status.
- [ ] Enforce GraphRAG-specific quotas before provider work.
- [ ] Ensure graph extraction failure never breaks Standard RAG or successful vectorization.

## G4: Graph Explorer
- [ ] Add protected `/dashboard/graph`.
- [ ] List the current user's entities and evidence-backed relations.
- [ ] Add document/entity filters.
- [ ] Show bounded evidence snippets and source links.
- [ ] Keep graph reads user-owned through RLS and server loaders.

## G5: Graph-Assisted Query Mode
- [ ] Add optional `retrievalMode` validation to `POST /api/rag/chat`.
- [ ] Default missing mode to `standard`.
- [ ] Keep the existing vector retrieval path intact.
- [ ] Resolve bounded query topics or candidate entities.
- [ ] Expand one or two hops with strict caps.
- [ ] Load linked source chunks.
- [ ] Merge and deduplicate graph-supported and vector chunks.
- [ ] Build prompts that label graph facts as untrusted derived context.
- [ ] Return safe bounded `graphTrace`.
- [ ] Preserve current safe snippets, sources, usage, and retrieval diagnostics.

## G6: Dashboard Trace And Visualization
- [ ] Add `Standard RAG` and `GraphRAG beta` mode selector.
- [ ] Extend `How this answer was retrieved`.
- [ ] Add Query, Entities, Graph paths, Supporting chunks, and Final sources tabs.
- [ ] Render at most `10` to `20` nodes.
- [ ] Add clickable nodes and edges with snippet-based evidence.
- [ ] Keep the mobile presentation usable.
- [ ] Avoid chain-of-thought wording.

## G7: Compare Modes
- [ ] Add internal comparison workflow for Standard RAG and GraphRAG.
- [ ] Compare retrieval hits, answer grounding, latency, and provider cost.
- [ ] Keep GraphRAG beta opt-in until it proves useful.

## G8: Evaluation
- [ ] Extend RAG benchmark cases with expected entities and relations where useful.
- [ ] Measure vector-only versus graph-assisted retrieval quality.
- [ ] Add safety checks for graph trace field exposure.
- [ ] Review graph extraction drift and stale graph cleanup.

## Blocking Decisions Before G2/G3
- [ ] Confirm explicit graphize action versus automatic post-vectorization extraction.
- [ ] Confirm whether `graph_extraction_runs` belongs in G2.
- [ ] Confirm entity normalization and alias strategy.
- [ ] Confirm evidence-granular relation storage.
- [ ] Define provider quotas and usage event names for graph extraction.
- [ ] Define query hop, node, edge, and path caps.
- [ ] Review trusted server write approach and cross-table ownership validation.

## Out Of Scope
- Neo4j or external graph stores.
- Public graph sharing.
- Team/workspace graphs.
- Changes to Standard RAG behavior.
- Blog or public-tool changes.
- SQL execution from this planning task.
