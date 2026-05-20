# AI Chatbox SPEC

## Goal
Add a global AI Chatbox that helps users understand and use DevToolBox AI tools, and answers simple general developer questions.

## Surface
The AI Chatbox should appear globally as a small bottom-right chat widget when chat is enabled.

## Components
- Chatbox component: `components/chatbox.tsx`
- API route: `app/api/chat/route.ts`
- Frontend endpoint: `/api/chat`
- API provider: OpenRouter
- Default model: `nvidia/nemotron-3-super-120b-a12b:free`

## Environment Variables
- `OPENROUTER_API_KEY=`
- `OPENROUTER_MODEL=nvidia/nemotron-3-super-120b-a12b:free`
- `NEXT_PUBLIC_CHAT_ENABLED=false`
- `NEXT_PUBLIC_SITE_URL=`

## Architecture Requirements
- The chatbox must be disabled unless `NEXT_PUBLIC_CHAT_ENABLED` is `"true"`.
- The frontend must call `/api/chat`.
- The frontend must never call OpenRouter directly.
- The OpenRouter API key must remain server-side only.
- The API route should call OpenRouter from the server.
- The API route should use `OPENROUTER_MODEL`, falling back to the default model when appropriate.
- The API route should include the current DevToolBox AI tool list as context for the assistant.

## Functional Requirements
- User can open and close the chatbox.
- User can send a message.
- User can see assistant replies.
- User can clear chat history.
- Chatbox includes a loading state while a reply is pending.
- Chatbox includes an error state when the request fails.
- Chatbox works well on mobile.

## API Requirements
- Backend validates the request body.
- Backend accepts a limited conversation history from the browser.
- Backend limits the latest user message to `1000` characters.
- Backend limits the conversation to `10` messages.
- Backend returns clear JSON errors.
- Backend does not store chat history.
- Backend does not log API keys.
- Backend does not log full user messages in production.
- Backend uses max output tokens around `500`.
- Backend uses temperature around `0.3`.
- No streaming in v1.

## System Prompt Requirements
The assistant should:
- Identify as the DevToolBox AI assistant.
- Help users use DevToolBox AI website tools.
- Answer simple general developer questions.
- Keep answers concise and practical.
- Use the current tool list as context.
- Say unsupported features are not available yet when asked about unavailable tools or capabilities.
- Not claim to execute commands.
- Not claim to access user files.
- Not claim to access private data.

## Safety and Cost Requirements
- No database in v1.
- No authentication in v1.
- No chat history persistence in v1.
- No public debug endpoint.
- No OpenRouter API key exposure to the browser.
- Basic abuse controls through input length and message count limits.

## Edge Cases
- Chat disabled by environment variable.
- Missing OpenRouter API key.
- Empty message.
- Message longer than `1000` characters.
- Conversation longer than `10` messages.
- Invalid request body.
- OpenRouter error response.
- Network failure.
- User asks about a planned or unsupported feature.
- User asks the assistant to run commands or access private files.

## Acceptance Criteria
- Chatbox renders only when `NEXT_PUBLIC_CHAT_ENABLED` is `"true"`.
- User can open, close, send, receive, clear, and recover from errors.
- Frontend requests go only to `/api/chat`.
- Server-side route validates input and returns JSON success or error responses.
- Server-side route calls OpenRouter without exposing `OPENROUTER_API_KEY`.
- Server-side route enforces the `1000` character message limit and `10` message conversation limit.
- Assistant answers use the current DevToolBox AI tool list as context.
- Assistant refuses or corrects unsupported capability claims.
- No database, authentication, streaming, history persistence, public debug endpoint, or direct browser-to-OpenRouter calls are added.
