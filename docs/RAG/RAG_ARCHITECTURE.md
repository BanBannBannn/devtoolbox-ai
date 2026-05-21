# RAG Architecture

## High-Level Architecture
DevToolBox AI should become a layered platform:

1. Public layer:
   - Static pages, blog, SEO content, and existing browser-first tools.
   - Anonymous global chatbox with the current public assistant behavior.
2. Authenticated app layer:
   - Supabase auth through `@supabase/ssr` for Next.js App Router session handling.
   - Dashboard pages.
   - User-owned documents.
   - Usage and plan limit display.
3. RAG backend layer:
   - Server-only API routes.
   - Quota checks.
   - Chunking.
   - Embedding calls through OpenRouter.
   - Supabase vector search.
   - LLM answer generation through OpenRouter.

## Frontend Pages
Planned pages:

- `/login`: sign in and sign up entry.
- `/dashboard`: overview of documents, usage, and recent chat sessions.
- `/dashboard/documents`: list saved documents and vectorization status.
- `/dashboard/documents/new`: create a text or Markdown document.
- `/dashboard/documents/[id]`: view, edit, and vectorize a document.
- `/dashboard/chat`: personal RAG chat over the user's vectorized documents.
- Existing public routes remain unchanged:
  - `/`
  - `/tools`
  - `/tools/*`
  - `/blog`
  - `/blog/*`

## Backend API Routes
Planned API routes:

- `POST /api/documents`: create a document.
- `GET /api/documents`: list current user's documents.
- `GET /api/documents/[id]`: read one current-user document.
- `PATCH /api/documents/[id]`: update one current-user document.
- `DELETE /api/documents/[id]`: delete one current-user document and its chunks.
- `POST /api/documents/[id]/vectorize`: quota-check, chunk, embed, and store document chunks.
- `POST /api/rag/chat`: ask a question against current-user chunks.
- `GET /api/usage`: return current plan limits and usage summary.

All authenticated API routes must derive the user from the Supabase auth session. They must never trust a `user_id` submitted by the client.

## Supabase App Router Integration
When implementation starts, use `@supabase/ssr` for Supabase auth/session integration with the Next.js App Router.

Expected client boundaries:

- Server-side Supabase client for Route Handlers, Server Components, and protected data access.
- Browser Supabase client only where interactive auth UI needs it.
- Middleware may be needed later to refresh sessions and protect dashboard routes.

Do not use a legacy auth helper pattern unless the installed Supabase package documentation explicitly requires it.

## Database Change Management
Database changes should be migration-first.

Acceptable approaches:

- Supabase migrations checked into the repo.
- SQL scripts checked into the repo if migrations are not introduced immediately.

Schema changes should not be applied only through the Supabase dashboard without a matching repo artifact. This is especially important for RLS policies, vector indexes, RPC functions, and plan limit seed data.

## Supabase Usage
Use Supabase for:

- Authentication and user sessions.
- Postgres relational data.
- Row Level Security for user-owned rows.
- Vector storage and search through `pgvector` if available.
- Optional storage later for uploaded files, outside v1.

Core tables:

- `profiles`
- `documents`
- `document_chunks`
- `document_vector_jobs` optional later for progress and retries
- `chat_sessions`
- `chat_messages`
- `plan_limits`
- `usage_events`
- `app_config`

## OpenRouter Usage
Use OpenRouter from server-side API routes only:

- LLM generation for public chat and RAG answers.
- Embeddings for documents and questions if OpenRouter embedding provider support is selected.
- Model/provider config can be stored in `app_config` or environment variables, but API keys stay in server-only environment variables.

Client components must call DevToolBox AI API routes, not OpenRouter directly.

Before implementing `document_chunks.embedding`, choose the embedding model and its vector dimension. The `pgvector` column dimension, vector index, RPC function signatures, and any test fixtures depend on that choice.

Changing embedding models later may require:

- Adding a new embedding dimension or table/column.
- Re-vectorizing existing document chunks.
- Tracking which chunks were embedded by which model.
- Temporarily supporting multiple embedding models during migration.

## RAG Pipeline
Vectorization flow:

1. User logs in.
2. User creates or edits a text/Markdown document.
3. User clicks "RAG hoa" / "Vectorize".
4. Backend loads the authenticated user from Supabase auth.
5. Backend checks document ownership.
6. Backend checks `plan_limits` and `usage_events`.
7. Backend validates document length.
8. Backend chunks the document.
9. Backend limits chunks per document and total chunks per user.
10. Backend calls the embedding provider through OpenRouter.
11. Backend stores chunks and embeddings in `document_chunks`.
12. Backend writes a `usage_events` row for the vectorize job.
13. Backend updates document vectorization status.

RAG chat flow:

1. User asks a question in the RAG chat UI.
2. Backend loads the authenticated user from Supabase auth.
3. Backend checks monthly RAG chat quota.
4. Backend validates message length and conversation size.
5. Backend embeds the question.
6. Backend searches only chunks where `user_id = auth.uid()`.
7. Backend retrieves up to the user's configured `retrieved_chunks_per_answer`.
8. Backend builds a prompt with retrieved chunks and source metadata.
9. Backend calls the LLM through OpenRouter.
10. Backend stores chat messages if chat persistence is enabled for the authenticated dashboard.
11. Backend returns answer, sources, usage, and retrieval details.

## RAG API Response Contract
`POST /api/rag/chat` should return a typed JSON response.

Success shape:

```json
{
  "success": true,
  "answer": "Concise answer grounded in retrieved sources.",
  "sources": [
    {
      "documentId": "uuid",
      "documentTitle": "Project Notes",
      "chunkId": "uuid",
      "chunkIndex": 0,
      "snippet": "Short source excerpt...",
      "score": 0.82
    }
  ],
  "usage": {
    "ragMessagesUsed": 12,
    "ragMessagesLimit": 30,
    "retrievedChunks": 3,
    "maxOutputTokens": 800
  },
  "retrievalDetails": {
    "query": "User question or normalized query summary",
    "embeddingModel": "selected-embedding-model",
    "llmModel": "selected-llm-model",
    "searchedChunks": 100,
    "returnedChunks": 3,
    "noRelevantSources": false
  }
}
```

Failure shape:

```json
{
  "success": false,
  "error": "Clear user-safe error message.",
  "code": "quota_exceeded"
}
```

`retrievalDetails` are source and search diagnostics only. They are not model chain-of-thought and must not expose hidden prompts, provider traces, or private reasoning.

## Anonymous Chat vs Logged-In RAG Chat
Anonymous global chat:

- Uses the public assistant.
- Helps users understand DevToolBox AI tools and simple developer topics.
- Does not access documents.
- Does not store private history.
- Uses public tool list context only.
- Uses separate public-chat rate limits from authenticated RAG quotas.
- Can be disabled by default if abuse or cost risk is high.

Logged-in RAG chat:

- Uses the authenticated user session.
- Searches only chunks owned by the current user.
- Returns source snippets and document references.
- Applies dynamic monthly usage limits.
- Uses authenticated RAG quotas from `plan_limits` and `usage_events`, not anonymous public-chat limits.
- Should make it clear when no relevant chunks are found.

The global chatbox can later detect auth state:

- Anonymous: public assistant mode.
- Logged in: offer personal RAG mode, or route the user to `/dashboard/chat`.
