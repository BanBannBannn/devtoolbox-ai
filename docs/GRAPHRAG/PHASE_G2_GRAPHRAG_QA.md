# Phase G2 GraphRAG Schema And Helpers QA

## Repository Verification
- [ ] Final schema SQL exists and is marked for manual review.
- [ ] No SQL was executed by the implementation task.
- [ ] Standard RAG runtime behavior is unchanged.
- [ ] Blog and public tools are unchanged.
- [ ] Graph write helpers remain unavailable until G3.
- [ ] Pure graph helper tests pass.

## SQL Review Before Execution
- [ ] `graph_entities` has owner, normalized name, nullable type, and timestamps.
- [ ] Expression unique index uses `(user_id, normalized_name, coalesce(type, ''))`.
- [ ] G3 entity creation uses select-before-insert rather than a Supabase upsert conflict target.
- [ ] `chunk_entities` includes nullable `start_offset` and `end_offset`.
- [ ] `graph_relations.evidence_text` allows at most `500` characters.
- [ ] `graph_extraction_runs` exists separately from document vector status.
- [ ] Document and chunk foreign keys cascade as intended.
- [ ] RLS is enabled on all graph tables.
- [ ] Authenticated users receive owner-only `select` policies.
- [ ] Browser insert/update/delete access is revoked.
- [ ] Database ownership triggers remain deferred unless explicitly approved.

## Manual QA After SQL Execution
- [ ] Authenticated user can select their own empty `graph_entities` rows.
- [ ] Authenticated user can select their own empty `chunk_entities` rows.
- [ ] Authenticated user can select their own empty `graph_relations` rows.
- [ ] Authenticated user can select their own empty `graph_extraction_runs` rows.
- [ ] Browser insert into graph tables fails.
- [ ] Browser update of graph tables fails.
- [ ] Browser delete from graph tables fails.
- [ ] User cannot select another user's graph rows.
- [ ] Service-role key is not exposed to browser source or network responses.

## Regression QA
- [ ] Existing Standard RAG chat works.
- [ ] Existing RAG chat sessions and history work.
- [ ] Existing document CRUD works.
- [ ] Existing vectorization and re-vectorization work.
- [ ] Existing public blog works.
- [ ] Existing public tools work without login.

## Automated Checks
- [ ] `npm run test:run`
- [ ] `npm run lint`
- [ ] `npm run build`
