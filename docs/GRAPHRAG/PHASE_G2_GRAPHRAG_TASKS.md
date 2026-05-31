# Phase G2 GraphRAG Schema And Helpers Tasks

## Scope
Prepare the schema migration and unused server helper foundation. Do not run SQL or implement extraction, GraphRAG chat mode, or graph UI.

## Completed In Repository
- [x] Add manual-run GraphRAG schema SQL.
- [x] Include `graph_entities`, `chunk_entities`, `graph_relations`, and `graph_extraction_runs`.
- [x] Keep RLS owner reads and revoke browser writes.
- [x] Document server-only service-role write boundary.
- [x] Keep expression unique index and document select-before-insert entity handling.
- [x] Add GraphRAG types.
- [x] Add pure normalization, status parsing, safe snippet, and mapper helpers.
- [x] Add authenticated owner-scoped read helpers.
- [x] Add intentionally unavailable G3 write stubs.
- [x] Add pure helper tests.

## Manual G2 Review And Execution
- [ ] Review SQL in Supabase SQL Editor.
- [ ] Confirm existing `documents`, `document_chunks`, and `set_updated_at()`.
- [ ] Confirm service-role key stays server-only.
- [ ] Apply SQL manually after review.
- [ ] Run post-execution RLS policy queries.
- [ ] Confirm authenticated owner can select empty graph rows.
- [ ] Confirm browser insert/update/delete attempts fail.
- [ ] Confirm Standard RAG and vectorization still work.

## Deferred To G3
- [ ] Implement explicit `Graphize document` beta action.
- [ ] Replace write stubs with authenticated ownership-checked service-role writes.
- [ ] Add strict bounded extraction parsing.
- [ ] Add GraphRAG-specific quotas and usage event policy.
- [ ] Keep graph extraction status separate from vectorization status.
