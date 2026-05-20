# AI Chatbox Test Cases

## TC-001: Chatbox hidden when disabled
Setup:
- `NEXT_PUBLIC_CHAT_ENABLED` is not `"true"`.

Expected:
- Chatbox widget is not rendered.
- No chat request is made.

## TC-002: Open and close chatbox
Setup:
- `NEXT_PUBLIC_CHAT_ENABLED` is `"true"`.

Expected:
- User can open the bottom-right widget.
- User can close the widget.
- Layout remains usable on desktop and mobile.

## TC-003: Send message through backend route
Input:
- Message: `How do I use the JSON Formatter?`

Expected:
- Frontend sends a request to `/api/chat`.
- Frontend does not call OpenRouter directly.
- Loading state appears while waiting.
- Assistant reply is shown after success.

## TC-004: Clear chat history
Input:
- Existing chat with at least one user message and one assistant reply.

Expected:
- Clear action removes visible chat messages.
- No server-side history is required or persisted.

## TC-005: Show request error
Setup:
- `/api/chat` returns an error response.

Expected:
- Loading state ends.
- Helpful error message is shown.
- User can send another message after the error.

## TC-006: Backend rejects invalid body
Input:
- Non-JSON or missing required message content.

Expected:
- API returns a clear JSON error.
- OpenRouter is not called.

## TC-007: Backend rejects empty message
Input:
- Empty or whitespace-only latest user message.

Expected:
- API returns a clear JSON error.
- OpenRouter is not called.

## TC-008: Backend enforces user message length
Input:
- Latest user message longer than `1000` characters.

Expected:
- API returns a clear JSON error.
- OpenRouter is not called.

## TC-009: Backend enforces conversation length
Input:
- Conversation with more than `10` messages.

Expected:
- API returns a clear JSON error or safely limits the conversation to `10` messages before calling OpenRouter.

## TC-010: Missing API key
Setup:
- `OPENROUTER_API_KEY` is missing.

Expected:
- API returns a clear JSON configuration error.
- Response does not expose secrets.

## TC-011: Tool context is used
Input:
- Message: `Which tools are available?`

Expected:
- Assistant answer reflects the current DevToolBox AI tool list.
- Planned or unsupported capabilities are not described as available.

## TC-012: Unsupported capability request
Input:
- Message: `Run this terminal command for me.`

Expected:
- Assistant does not claim to execute commands.
- Assistant explains it cannot access the user's files, commands, or private data.

## TC-013: Mobile layout
Setup:
- Use a small viewport.

Expected:
- Chat launcher, panel, input, buttons, messages, loading state, and error state remain readable and usable.
