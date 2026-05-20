# AI Chatbox QA Checklist

## Manual QA
- [ ] Chatbox is hidden when `NEXT_PUBLIC_CHAT_ENABLED` is not `"true"`.
- [ ] Chatbox appears as a bottom-right widget when enabled.
- [ ] User can open the chatbox.
- [ ] User can close the chatbox.
- [ ] User can send a message.
- [ ] Assistant replies are displayed.
- [ ] Loading state appears while waiting for a reply.
- [ ] Error state appears when the request fails.
- [ ] Clear action removes visible chat history.
- [ ] Chatbox remains usable on mobile.
- [ ] Frontend requests are sent to `/api/chat`.
- [ ] Frontend does not call OpenRouter directly.

## Backend QA
- [ ] API route exists at `app/api/chat/route.ts`.
- [ ] API validates request body.
- [ ] API rejects empty or whitespace-only messages.
- [ ] API enforces the `1000` character latest user message limit.
- [ ] API enforces the `10` message conversation limit.
- [ ] API returns clear JSON errors.
- [ ] API uses OpenRouter from the server only.
- [ ] `OPENROUTER_API_KEY` is never exposed to browser code.
- [ ] API does not log API keys.
- [ ] API does not log full user messages in production.
- [ ] API does not store chat history.
- [ ] API uses max output tokens around `500`.
- [ ] API uses temperature around `0.3`.

## Assistant Behavior QA
- [ ] Assistant identifies as the DevToolBox AI assistant.
- [ ] Assistant helps users understand and use website tools.
- [ ] Assistant answers simple developer questions concisely.
- [ ] Assistant uses the current tool list as context.
- [ ] Assistant says unsupported features are not available yet.
- [ ] Assistant does not claim to execute commands.
- [ ] Assistant does not claim to access user files.
- [ ] Assistant does not claim to access private data.

## Safety QA
- [ ] No streaming is added in v1.
- [ ] No database is added in v1.
- [ ] No authentication is added in v1.
- [ ] No chat history persistence is added in v1.
- [ ] No public debug endpoint is added.
- [ ] No direct browser-to-OpenRouter call is added.
