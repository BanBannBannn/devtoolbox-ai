# RAG Product Spec

## Product Vision
DevToolBox AI will evolve from a public developer tools website into a user-based RAG platform where users can log in, create text or Markdown documents, vectorize their own knowledge base, and chat with it safely.

The current public tools remain available without login. The new platform layer adds personal documents, usage limits, vector search, and a logged-in RAG assistant while keeping API keys and private data server-side.

## Target Users
- Beginner software engineers who want to ask questions about their own notes.
- Students who want a lightweight knowledge base for programming concepts.
- Developers using AI coding tools who want a private project reference assistant.
- Solo builders who need a simple RAG workflow without setting up infrastructure.

## Core User Stories
- As an anonymous visitor, I can still use public DevToolBox AI tools without creating an account.
- As an anonymous visitor, I can use a public assistant that only answers general website and developer questions.
- As a user, I can sign up and log in.
- As a user, I can open a dashboard that shows my saved documents and usage.
- As a user, I can create and edit text or Markdown documents.
- As a user, I can save a document title and content.
- As a user, I can click "RAG hoa" / "Vectorize" to prepare a document for chat.
- As a user, I can see when a document is not vectorized, vectorizing, vectorized, or failed.
- As a user, I can ask questions against only my own document chunks.
- As a user, I can see an answer with cited sources and retrieval details.
- As a user, I can see my remaining monthly limits.

## MVP Scope
- Keep all current public tools and blog pages working.
- Add Supabase authentication later.
- Add a dashboard shell later.
- Add text and Markdown document CRUD later.
- Add dynamic usage limits stored in the database.
- Add document chunking and vectorization for saved text documents.
- Add RAG chat over chunks owned by the current authenticated user.
- Upgrade the global chatbox later:
  - Anonymous users get the public DevToolBox assistant.
  - Logged-in users get a personal RAG assistant option.
- Use Supabase for auth, relational data, storage if needed, and vector search if possible.
- Use `@supabase/ssr` for Supabase integration with the Next.js App Router when auth work begins.
- Use OpenRouter for LLM calls and embedding provider access.
- Keep provider API keys server-side only.
- Keep database changes migration-first, either through Supabase migrations or checked-in SQL scripts in the repo.
- Select the embedding model and vector dimension before implementing vector storage.
- Treat embedding model changes as schema and data migrations because existing documents may need to be re-vectorized.

## Out Of Scope For V1
- PDF upload.
- DOCX upload.
- Team accounts or workspaces.
- Payments or paid plans.
- Organization-level knowledge bases.
- Public sharing of private documents.
- Browser-to-provider LLM or embedding calls.
- Arbitrary file execution or code execution.
- Long-term chat memory outside explicitly stored chat sessions.
- Fine-tuning.
- Multiple vector stores unless Supabase vector search is not viable.

## Free Plan Starting Limits
- 30 RAG chat messages per month.
- 3 vectorize jobs per month.
- 10 saved documents total.
- 20,000 characters per document.
- 50 chunks per document.
- 100 chunks total per user.
- 3 retrieved chunks per answer.
- 800 max output tokens per answer.

These limits should be stored in `plan_limits`, not hardcoded in application logic.

Anonymous public chat and authenticated RAG chat should have separate quota and rate-limit handling. If abuse or cost risk is high, the public chat can stay disabled by default while authenticated RAG work continues behind login.

## Success Metrics
- Existing public tools keep passing tests and remain accessible without login.
- A new user can sign up, create a document, vectorize it, and ask a question.
- RAG answers include sources from the user's own documents.
- Retrieval never returns chunks owned by another user.
- Monthly usage limits are enforced from database configuration.
- The dashboard clearly shows document status and remaining usage.
- The system can handle invalid input, missing documents, failed vectorization, and exhausted quotas with clear errors.
- No provider API keys are exposed to the browser.
