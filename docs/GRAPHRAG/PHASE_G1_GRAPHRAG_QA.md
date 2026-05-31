# Phase G1 GraphRAG QA

## Planning Review
- [ ] Standard RAG remains the default mode.
- [ ] GraphRAG is documented as opt-in beta retrieval.
- [ ] The plan augments vector retrieval instead of replacing it.
- [ ] No runtime code was added in G1.
- [ ] No SQL was run in G1.
- [ ] Blog and public tools are unchanged.

## Schema Review Before G2 SQL
- [ ] `graph_entities`, `chunk_entities`, and `graph_relations` are user-owned.
- [ ] Graph rows reference source documents and chunks where required.
- [ ] Source document deletion cascades to graph-derived rows.
- [ ] Chunk replacement during re-vectorization cascades to chunk-derived graph rows.
- [ ] RLS is enabled on graph tables.
- [ ] Authenticated users can read only their own graph rows.
- [ ] Browser insert/update/delete access is revoked.
- [ ] Trusted graph writers validate document, chunk, entity, and relation ownership.
- [ ] Cross-table ownership enforcement strategy is reviewed before applying SQL.
- [ ] Need for `graph_extraction_runs` is decided before G3.

## Future Extraction QA
- [ ] Only logged-in users can graphize a document.
- [ ] User cannot graphize another user's document.
- [ ] Extraction uses existing owned chunks.
- [ ] Empty and tiny chunks are skipped safely.
- [ ] Entity and relation arrays are bounded.
- [ ] Malformed provider JSON is rejected safely.
- [ ] Extracted text is treated as untrusted data.
- [ ] Re-graphizing replaces or reconciles stale chunk links deterministically.
- [ ] Graph extraction failure does not break successful vectorization.
- [ ] Graph extraction failure does not change valid Standard RAG behavior.
- [ ] Provider prompts, payloads, exact model names, and keys are not returned.

## Future Query QA
- [ ] Standard mode still returns the existing answer, sources, usage, and retrieval details shape.
- [ ] Missing retrieval mode defaults to Standard RAG.
- [ ] GraphRAG mode retrieves only the authenticated user's entities, relations, and chunks.
- [ ] User cannot retrieve another user's graph data.
- [ ] Graph expansion is limited to one or two hops.
- [ ] Node, edge, path, and supporting-chunk counts are bounded.
- [ ] Graph-supported chunks are merged and deduplicated with vector chunks.
- [ ] Source chunks remain the evidence layer.
- [ ] Weak graph evidence is presented cautiously.
- [ ] Missing graph data falls back safely.

## Future Trace And UI QA
- [ ] UI labels modes as `Standard RAG` and `GraphRAG beta`.
- [ ] Existing `How this answer was retrieved` panel remains available.
- [ ] Graph trace includes Query, Entities, Graph paths, Supporting chunks, and Final sources.
- [ ] Visualization shows no more than `10` to `20` nodes.
- [ ] Graph trace is described as retrieval diagnostics, not AI thinking.
- [ ] Mobile graph diagnostics remain usable.

## Privacy And Security QA
- [ ] No chain-of-thought is returned or displayed.
- [ ] No full prompt is returned or displayed.
- [ ] No raw embeddings are returned or displayed.
- [ ] No full private documents or chunks are returned in traces.
- [ ] No raw provider payload is returned or displayed.
- [ ] No exact provider model names are returned or displayed.
- [ ] No API key is returned or bundled for the browser.
- [ ] No service role key is returned or bundled for the browser.
- [ ] No cross-user graph data is visible.
- [ ] Derived graph facts and source chunks are treated as untrusted context.

## Regression QA
- [ ] Existing document CRUD works.
- [ ] Existing vectorization and re-vectorization work.
- [ ] Existing Standard RAG sessions and history work.
- [ ] Existing public blog works.
- [ ] Existing writer/moderation/community blog flows work.
- [ ] Existing public developer tools work without login.

## G1 Verification
- [ ] `npm run test:run`
- [ ] `npm run lint`
- [ ] `npm run build`
