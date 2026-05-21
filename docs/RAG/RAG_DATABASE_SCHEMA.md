# RAG Database Schema

## Notes
This is a planning schema for Supabase Postgres. Exact SQL should be created in a later implementation task after choosing embedding dimensions and Supabase vector search details.

Database changes should be migration-first. Use Supabase migrations when available, or checked-in SQL scripts in the repo as an interim step. RLS policies, RPC functions, vector indexes, extensions, and seed rows should all be reproducible from repo-managed database artifacts.

Before implementing vector storage, choose the embedding model and vector dimension. The value in `embedding vector(...)` is not a placeholder to fill casually; it must match the selected embedding model.

Changing embedding models later can require re-vectorizing documents, adding new vector columns or tables, rebuilding indexes, and updating retrieval functions. Store `embedding_model` on chunks so migration state is visible.

All user-owned tables should enable Row Level Security.

## `profiles`
Stores user profile metadata linked to Supabase auth.

Important fields:

- `id uuid primary key references auth.users(id)`
- `email text`
- `display_name text`
- `plan_key text default 'free'`
- `created_at timestamptz`
- `updated_at timestamptz`

RLS notes:

- Users can select and update only their own profile.
- The app should create profile rows from a trusted server path or auth trigger.

Indexes:

- Primary key on `id`.
- Optional index on `plan_key`.

## `documents`
Stores user-created text or Markdown documents.

Important fields:

- `id uuid primary key`
- `user_id uuid not null references auth.users(id)`
- `title text not null`
- `content text not null`
- `content_type text not null default 'markdown'`
- `character_count integer not null`
- `vector_status text not null default 'not_vectorized'`
- `vectorized_at timestamptz`
- `last_vectorize_error text`
- `created_at timestamptz`
- `updated_at timestamptz`

Suggested `vector_status` values:

- `not_vectorized`
- `vectorizing`
- `vectorized`
- `failed`

Relationships:

- One profile has many documents.
- One document has many document chunks.

RLS notes:

- Users can select, insert, update, and delete only documents where `user_id = auth.uid()`.
- API routes must set `user_id` from the session, not from the request body.

Indexes:

- `documents_user_id_idx` on `user_id`.
- `documents_user_updated_idx` on `(user_id, updated_at desc)`.
- Optional `documents_vector_status_idx` on `(user_id, vector_status)`.

## `document_chunks`
Stores chunked document text and embeddings.

Important fields:

- `id uuid primary key`
- `user_id uuid not null references auth.users(id)`
- `document_id uuid not null references documents(id) on delete cascade`
- `chunk_index integer not null`
- `content text not null`
- `character_count integer not null`
- `token_estimate integer`
- `embedding vector(...)`
- `embedding_model text not null`
- `source_title text`
- `source_anchor text`
- `created_at timestamptz`

Relationships:

- Many chunks belong to one document.
- `user_id` is duplicated intentionally to simplify RLS and vector search filtering.

RLS notes:

- Users can select chunks where `user_id = auth.uid()`.
- Normal users should not insert chunks directly from the browser. Chunk inserts should happen through trusted server API routes.

Indexes:

- `document_chunks_user_id_idx` on `user_id`.
- `document_chunks_document_id_idx` on `document_id`.
- Unique index on `(document_id, chunk_index)`.
- Vector index on `embedding`, filtered by query-time `user_id`.

Vector search notes:

- Choose the vector dimension based on the selected embedding model.
- Do not create the vector column until the embedding dimension is selected.
- Store the embedding model per chunk so future re-vectorization can identify stale chunks.
- Changing embedding models may require re-vectorizing all chunks for affected users or documents.
- Search must filter by `user_id` before or during similarity search.
- Use a Supabase RPC function for match queries if needed, for example `match_document_chunks(query_embedding, match_user_id, match_count)`.
- RPC must not allow arbitrary user IDs from the client; server routes should pass the authenticated user's ID.

## `document_vector_jobs` Optional Future Table
Tracks vectorization progress, retries, and provider failures when vectorization becomes asynchronous or needs better observability.

Important fields:

- `id uuid primary key`
- `user_id uuid not null references auth.users(id)`
- `document_id uuid not null references documents(id) on delete cascade`
- `status text not null default 'queued'`
- `embedding_model text not null`
- `requested_chunk_count integer`
- `processed_chunk_count integer default 0`
- `attempt_count integer default 0`
- `last_error text`
- `started_at timestamptz`
- `finished_at timestamptz`
- `created_at timestamptz`
- `updated_at timestamptz`

Suggested `status` values:

- `queued`
- `running`
- `succeeded`
- `failed`
- `cancelled`

RLS notes:

- Users can read jobs where `user_id = auth.uid()`.
- Inserts and updates should be controlled by trusted server routes or background workers.

Indexes:

- `document_vector_jobs_user_created_idx` on `(user_id, created_at desc)`.
- `document_vector_jobs_document_idx` on `document_id`.
- Optional index on `(status, created_at)` for worker polling if background jobs are added.

## `chat_sessions`
Stores authenticated dashboard chat sessions if persistence is enabled.

Important fields:

- `id uuid primary key`
- `user_id uuid not null references auth.users(id)`
- `title text`
- `mode text not null default 'rag'`
- `created_at timestamptz`
- `updated_at timestamptz`

RLS notes:

- Users can only access sessions where `user_id = auth.uid()`.

Indexes:

- `chat_sessions_user_updated_idx` on `(user_id, updated_at desc)`.

## `chat_messages`
Stores authenticated chat messages and source metadata.

Important fields:

- `id uuid primary key`
- `user_id uuid not null references auth.users(id)`
- `session_id uuid not null references chat_sessions(id) on delete cascade`
- `role text not null`
- `content text not null`
- `sources jsonb`
- `retrieval_details jsonb`
- `usage jsonb`
- `created_at timestamptz`

Allowed roles:

- `user`
- `assistant`
- `system` only if server-generated and never displayed as private chain-of-thought.

RLS notes:

- Users can select messages where `user_id = auth.uid()`.
- Inserts should be controlled by server routes.

Indexes:

- `chat_messages_session_created_idx` on `(session_id, created_at asc)`.
- `chat_messages_user_created_idx` on `(user_id, created_at desc)`.

## `plan_limits`
Stores dynamic plan limits instead of hardcoding quotas.

Important fields:

- `id uuid primary key`
- `plan_key text not null unique`
- `monthly_rag_messages integer not null`
- `monthly_vectorize_jobs integer not null`
- `max_saved_documents integer not null`
- `max_document_characters integer not null`
- `max_chunks_per_document integer not null`
- `max_chunks_total integer not null`
- `retrieved_chunks_per_answer integer not null`
- `max_output_tokens integer not null`
- `is_active boolean not null default true`
- `created_at timestamptz`
- `updated_at timestamptz`

Free plan starting values:

- `monthly_rag_messages`: `30`
- `monthly_vectorize_jobs`: `3`
- `max_saved_documents`: `10`
- `max_document_characters`: `20000`
- `max_chunks_per_document`: `50`
- `max_chunks_total`: `100`
- `retrieved_chunks_per_answer`: `3`
- `max_output_tokens`: `800`

RLS notes:

- Public read may be acceptable for active plan limits.
- Writes must be admin-only.

Indexes:

- Unique index on `plan_key`.

## `usage_events`
Stores monthly usage for quota checks and audits.

Important fields:

- `id uuid primary key`
- `user_id uuid not null references auth.users(id)`
- `event_type text not null`
- `quantity integer not null default 1`
- `period_start date not null`
- `metadata jsonb`
- `created_at timestamptz`

Suggested event types:

- `rag_message`
- `vectorize_job`
- `embedding_tokens`
- `llm_output_tokens`
- `document_created`
- `chunk_created`

RLS notes:

- Users can read their own usage summary if useful.
- Inserts should be server-only.

Indexes:

- `usage_events_user_period_type_idx` on `(user_id, period_start, event_type)`.
- `usage_events_created_idx` on `created_at`.

## `app_config`
Stores server-read configuration that may change without deployment.

Important fields:

- `key text primary key`
- `value jsonb not null`
- `is_public boolean not null default false`
- `updated_at timestamptz`

Possible keys:

- `rag_llm_model`
- `rag_embedding_model`
- `rag_embedding_dimension`
- `rag_chunk_size`
- `rag_chunk_overlap`
- `public_chat_model`

RLS notes:

- Public reads only for rows where `is_public = true`.
- Secret values and provider keys do not belong here.
- Admin-only writes.
