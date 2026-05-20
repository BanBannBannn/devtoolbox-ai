# Work Log

## 2026-05-20

### Next.js Code Demo Lab docs
- Added the Next.js Code Demo Lab feature spec, test cases, and QA checklist.
- Documented a client-side educational lab for predefined Next.js and React lessons with fixed code snippets, explanations, common mistakes, change notes, and live or simulated previews.
- Covered initial lessons for `useState`, props, conditional rendering, list rendering, Client Component vs Server Component, Route Handler GET response, and environment variable safety.
- Captured the v1 safety boundary: no free-form code runner, arbitrary code execution, `eval`, `Function` constructor, Sandpack, backend, database, AI API, or file creation.
- Kept the work documentation-only; no UI, app pages, tool registry entry, backend, database, AI API, or implementation code was added.

### Next.js File Tree Visualizer UI
- Added the `/tools/nextjs-file-tree-visualizer` page with metadata, a client-side visualizer UI, and SEO/help content.
- Wired the UI to the tested `generateNextjsFileTree` function.
- Added route path input, route type selector, Generate File Tree, Copy File Tree, Clear, quick examples, normalized route output, generated file tree, explanation list, and preview output.
- Marked Next.js File Tree Visualizer as available in `lib/tools.ts` under a Learning category.
- Kept the implementation browser-only and educational-only; no backend, database, AI API, file creation, code execution, unrelated pages, or existing tool logic changes were added.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

### Next.js File Tree Visualizer logic
- Added `generateNextjsFileTree` as a pure function in `lib/nextjs-file-tree-visualizer.ts`.
- Added typed support for page, layout, loading, error, and route handler file tree generation.
- Added route path validation, trailing slash normalization, repeated slash cleanup, safe segment validation, file tree output, educational explanations, and preview text.
- Added Vitest coverage for root page routes, nested page routes, dynamic routes, API route handlers, layout routes, loading routes, error routes, trailing slash normalization, and invalid paths.
- Kept the work logic-only; no UI, app pages, tool registry entry, backend, database, file creation, or code execution was added.
- Verified with `npm run test:run` and `npm run lint`.

### Next.js File Tree Visualizer docs
- Added the Next.js File Tree Visualizer feature spec, test cases, and QA checklist.
- Documented a client-side educational tool for mapping App Router route paths to `app` directory file trees.
- Covered page routes, layouts, loading UI, error UI, API route handlers, dynamic segments, explanations, previews, validation edge cases, mobile support, and SEO/help content.
- Kept the work documentation-only; no UI, app pages, tool registry entry, backend, database, AI API, file creation, or code execution was added.

### AI Chatbox UI
- Added `components/chatbox.tsx` as a gated client-side bottom-right chat widget.
- Wired the chatbox into `app/layout.tsx` so it can render globally when `NEXT_PUBLIC_CHAT_ENABLED` is `"true"`.
- Added open, close, send, clear, loading, error, mobile-friendly layout, frontend `1000` character input limit, and conversation trimming before POSTing to `/api/chat`.
- Kept the frontend from accessing `OPENROUTER_API_KEY` or calling OpenRouter directly.
- Did not add manual ad slots, database, persistent chat history, markdown rendering, tool logic changes, or AdSense script changes.

### AI Chatbox backend logic
- Added a POST-only App Router chat API route at `app/api/chat/route.ts`.
- Added `lib/chat-context.ts` to build the DevToolBox AI assistant system prompt from the current tool list.
- Added `lib/chat-validation.ts` with typed request validation for message arrays, supported roles, non-empty content, a maximum of `10` conversation messages, and user messages up to `1000` characters.
- Added Vitest coverage for valid chat bodies, missing messages, empty content, overlong user messages, too many messages, unsupported roles, and conversations without user messages.
- Updated `.env.example` with the OpenRouter and chat feature flag variables.
- Kept the work backend-only; no chatbox UI, layout wiring, database, auth, streaming, history persistence, or direct browser-to-OpenRouter call was added.

### AI Chatbox docs
- Added the AI Chatbox feature spec, test cases, and QA checklist.
- Documented a global bottom-right chat widget backed by `/api/chat`, with OpenRouter used only from the server.
- Captured the required model, environment variables, server-only API key boundary, request validation, input limits, JSON errors, and no-history requirements.
- Documented assistant behavior requirements, including tool-list context, concise practical replies, unsupported feature handling, and no claims of command, file, or private data access.
- Kept the work documentation-only; no API route, chatbox component, layout changes, environment file changes, backend calls, or OpenRouter calls were added.

### UUID Generator logic
- Added the UUID Generator feature spec, test cases, and QA checklist.
- Added `generateUuidV4List` as a pure function in `lib/uuid-generator.ts`.
- Validated UUID count with a minimum of `1` and maximum of `100`.
- Used `crypto.randomUUID` when available, with a Web Crypto fallback for UUID v4 formatting.
- Added Vitest coverage for single UUID generation, multiple UUIDs, uppercase output, count below minimum, and count above maximum.
- Kept the work logic-only; no UI, backend, database, auth, or additional tools were added.
- Verified with `npm run test:run` and `npm run lint`.

### UUID Generator UI
- Added the `/tools/uuid-generator` page with metadata, a client-side UUID generator UI, and SEO/help content.
- Wired the UI to the tested `generateUuidV4List` function.
- Added count input, uppercase checkbox, Generate UUIDs, Copy All, Clear, readable output, and helpful copy/status messages.
- Marked UUID Generator as available in `lib/tools.ts`.
- Kept the implementation browser-only with no backend, database, auth, AdSense, or external API calls.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

### JWT Decoder logic
- Added the JWT Decoder feature spec, test cases, and QA checklist.
- Added `decodeJwt` as a pure function in `lib/jwt-decoder.ts`.
- Added typed success and failure result objects for decoded header, payload, signature, timestamps, and errors.
- Decoded Base64URL JWT header and payload safely without verifying signatures.
- Extracted `exp`, `iat`, and `nbf` timestamp claims when present.
- Added Vitest coverage for valid JWT decoding, empty input, malformed tokens, invalid Base64URL or JSON, and timestamp extraction.
- Kept the work logic-only; no UI, backend, database, auth, JWT signing, JWT generation, or external API calls were added.
- Verified with `npm run test:run` and `npm run lint`.

### JWT Decoder UI
- Added the `/tools/jwt-decoder` page with metadata, a client-side decoder UI, and SEO/help content.
- Wired the UI to the tested `decodeJwt` function.
- Added JWT input, Decode Token, Clear, formatted header JSON, formatted payload JSON, signature presence, timestamp claim date display, and decode-only warning.
- Marked JWT Decoder as available in `lib/tools.ts`.
- Kept the implementation browser-only with no backend, database, auth, JWT generator, JWT signing, JWT verification, AdSense, or external API calls.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

### Date Calculator logic
- Added the Date Calculator feature spec, test cases, and QA checklist.
- Added pure date helpers in `lib/date-calculator.ts` for adding days, months, years, and calculating days between dates.
- Used strict `YYYY-MM-DD` parsing and UTC date math to avoid timezone drift.
- Added clear errors for invalid dates and non-whole number offsets.
- Added Vitest coverage for adding 30 days, subtracting days, adding months, adding years, days between dates, and invalid date input.
- Kept the work logic-only; no UI, backend, database, auth, or external API calls were added.
- Verified with `npm run test:run` and `npm run lint`.

### Date Calculator UI
- Added the `/tools/date-calculator` page with metadata, a client-side calculator UI, and SEO/help content.
- Wired the UI to the tested date calculator functions.
- Added mode selector, date input, number input, days-between end date input, Calculate, Clear, visible result output, and 7/30/90 days-from-today quick buttons.
- Marked Date Calculator as available in `lib/tools.ts` under a new Calculators category.
- Kept the implementation browser-only with no backend, database, auth, AdSense, or external API calls.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

### Unix Timestamp Converter logic
- Added the Unix Timestamp Converter feature spec, test cases, and QA checklist.
- Added `timestampToDate` and `dateToTimestamp` as pure functions in `lib/unix-timestamp-converter.ts`.
- Supported Unix timestamp conversion in both seconds and milliseconds.
- Returned typed success and failure result objects with helpful invalid timestamp and invalid date errors.
- Added Vitest coverage for seconds-to-date, milliseconds-to-date, date-to-seconds, date-to-milliseconds, invalid timestamp input, and invalid date input.
- Kept the work logic-only; no UI, backend, database, auth, or external API calls were added.
- Verified with `npm run test:run` and `npm run lint`.

### Unix Timestamp Converter UI
- Added the `/tools/unix-timestamp-converter` page with metadata, a client-side converter UI, and SEO/help content.
- Wired the UI to the tested `timestampToDate` and `dateToTimestamp` functions.
- Added mode selector, seconds/milliseconds unit selector, timestamp input, date/time input, Convert, Use Current Time, Copy Result, Clear, visible result fields, and helpful errors.
- Marked Unix Timestamp Converter as available in `lib/tools.ts` under Calculators.
- Kept the implementation browser-only with no backend, database, auth, AdSense, or external API calls.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

### QR Code Generator docs
- Added the QR Code Generator feature spec, test cases, and QA checklist.
- Documented client-side text/URL QR generation, size selection, error correction level selection, PNG download, clear action, mobile support, and SEO/help content requirements.
- Kept the work documentation-only; no UI, app route, tool registry entry, backend, database, auth, AdSense, or implementation code was added.

### QR Code Generator logic
- Added `generateQrCodeDataUrl` as a pure async function in `lib/qr-code-generator.ts`.
- Used the existing `qrcode` package to generate PNG data URLs.
- Added typed input and result objects for QR value, size, error correction level, generated data URL, and errors.
- Validated empty input, clamped QR size to a safe range, and restricted error correction levels to `L`, `M`, `Q`, and `H`.
- Added Vitest coverage for valid text generation, empty input, size below minimum, size above maximum, valid error correction levels, and invalid error correction level handling.
- Kept the work logic-only; no UI, app route, tool registry entry, backend, database, auth, AdSense, or external API calls were added.
- Verified with `npm run test:run` and `npm run lint`.

### QR Code Generator UI
- Added the `/tools/qr-code-generator` page with metadata, a client-side QR generator UI, and SEO/help content.
- Wired the UI to the tested `generateQrCodeDataUrl` function.
- Added text/URL input, QR size selector, error correction level selector, Generate QR Code, Download PNG, Clear, generated QR preview, and helpful error/status messages.
- Marked QR Code Generator as available in `lib/tools.ts`.
- Kept the implementation browser-only with no backend, database, auth, AdSense, or external API calls.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

### Home and tools visual refresh
- Installed `lucide-react` for reusable icons.
- Added `lib/tool-visuals.ts` to map tool slugs to icons, accent gradients, and icon badge styles.
- Added a reusable `ToolCard` component for available and planned tool cards.
- Added a CSS/Tailwind-only `HeroVisual` component for the home page.
- Updated the home page with a visual hero, registry-backed stats, icon buttons, and reusable tool cards while preserving existing content.
- Updated the tools page with a stronger visual header and reusable icon tool cards while keeping available tools clickable and planned tools non-clickable.
- Kept the work frontend-only with no backend, database, AdSense, individual tool logic changes, or individual tool page changes.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

### AdSense ownership verification
- Added the global `google-adsense-account` ownership verification meta tag through the App Router metadata export in `app/layout.tsx`.
- Used the public publisher ID `ca-pub-7384886862638631`.
- Did not add AdSense scripts, Auto Ads, manual ad slots, backend, database, or unrelated changes.
- Verified with `npm run lint` and `npm run build`.

### AdSense ads.txt
- Added `public/ads.txt` with the Google AdSense authorized seller entry.
- The file will be publicly served at `/ads.txt` after deployment.
- Did not add AdSense scripts, Auto Ads, manual ad slots, backend, database, or unrelated changes.
- Verified with `npm run lint` and `npm run build`.

### AdSense Auto Ads script support
- Added `components/adsense-script.tsx` using `next/script`.
- Wired the script loader into `app/layout.tsx` so it can apply globally when enabled.
- Added `.env.example` with `NEXT_PUBLIC_ADSENSE_ENABLED=false` and `NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-7384886862638631`.
- Updated `.gitignore` so `.env.example` can be tracked while other `.env*` files remain ignored.
- Kept Auto Ads disabled by default and rendered the script only when `NEXT_PUBLIC_ADSENSE_ENABLED` is `"true"` and a client ID is present.
- Did not add manual ad slots, `ins adsbygoogle` blocks, backend, database, or individual tool page changes.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

## 2026-05-14

### Vitest setup
- Installed Vitest as a development dependency.
- Added `test` and `test:run` scripts to `package.json`.
- Added a minimal `vitest.config.ts` using the Node test environment for future pure logic tests.
- Configured Vitest to pass when no tests exist yet.
- Did not add React Testing Library, tool implementations, or tool tests.

### JSON Formatter logic
- Added `formatJson` as a pure function in `lib/json-formatter.ts`.
- Added Vitest coverage for valid objects, valid arrays, invalid JSON, empty input, nested JSON, and whitespace trimming.
- Kept the work logic-only; no UI, backend, auth, database, or tool page implementation was added.
- Verified with `npm run test:run` and `npm run lint`.

### JSON Formatter UI
- Added the `/tools/json-formatter` page with metadata, a client-side formatter UI, and SEO/help content.
- Wired the UI to the tested `formatJson` function.
- Added input, Format JSON, Copy Output, Clear, readable output, and helpful error/copy status messages.
- Marked JSON Formatter as available in `lib/tools.ts`.
- Kept the implementation browser-only with no backend, database, auth, or AdSense.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

### Tools listing link fix
- Updated `/tools` so available tools render as clickable cards.
- JSON Formatter now links to `/tools/json-formatter` and shows as available.
- Kept all other tools marked as planned.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

### README Generator logic
- Added `generateReadme` as a pure function in `lib/readme-generator.ts`.
- Added Vitest coverage for all fields, missing project name fallback, empty features, and commands with special characters.
- Kept the work logic-only; no UI, backend, database, auth, or additional tools were added.
- Verified with `npm run test:run` and `npm run lint`.

### README Generator UI
- Added the `/tools/readme-generator` page with metadata, a client-side README form, and SEO/help content.
- Wired the UI to the tested `generateReadme` function.
- Added project name, description, tech stack, install command, run command, features, generated markdown output, copy, download, and clear actions.
- Marked README Generator as available in `lib/tools.ts`; other unfinished tools remain planned.
- Kept the implementation browser-only with no backend, database, auth, or AdSense.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

### AI Coding Prompt Generator logic
- Added `generateAiCodingPrompt` as a pure function in `lib/ai-coding-prompt-generator.ts`.
- Added Vitest coverage for basic prompt generation, empty constraints fallback, and missing expected output fallback.
- Kept the work logic-only; no UI, backend, database, auth, external AI API calls, or additional tools were added.
- Verified with `npm run test:run` and `npm run lint`.

### AI Coding Prompt Generator UI
- Added the `/tools/ai-coding-prompt-generator` page with metadata, a client-side prompt form, and SEO/help content.
- Wired the UI to the tested `generateAiCodingPrompt` function.
- Added task type, tech stack, feature description, constraints, expected output, generated prompt output, copy, and clear actions.
- Marked AI Coding Prompt Generator as available in `lib/tools.ts`; unfinished tools remain planned.
- Kept the implementation browser-only with no backend, database, auth, AdSense, or external AI API calls.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

### Git Command Helper logic
- Added `getGitCommandHelp` as a pure function in `lib/git-command-helper.ts`.
- Added typed support for all predefined Git helper goals.
- Added warnings and `isRisky` flags for risky commands.
- Added Vitest coverage for status, create branch, undo last commit while keeping changes, discard local file changes, and missing branch name fallback.
- Kept the work logic-only; no UI, backend, database, auth, or command execution was added.
- Verified with `npm run test:run` and `npm run lint`.

### Git Command Helper UI
- Added the `/tools/git-command-helper` page with metadata, a client-side goal selector, and SEO/help content.
- Wired the UI to the tested `getGitCommandHelp` function.
- Added conditional branch name, commit message, and file path inputs, plus generate, copy, and clear actions.
- Displayed command, explanation, and warning messages for risky commands without executing anything.
- Marked Git Command Helper as available in `lib/tools.ts`; unfinished tools remain planned.
- Kept the implementation browser-only with no backend, database, auth, or AdSense.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

### Test Case Checklist Generator logic
- Added `generateTestCaseChecklist` as a pure function in `lib/test-case-checklist-generator.ts`.
- Added markdown sections for smoke tests, happy path tests, edge case tests, error handling tests, mobile/responsive tests, accessibility checks, and regression checks.
- Added Vitest coverage for all fields, missing feature name fallback, and empty edge cases fallback.
- Kept the work logic-only; no UI, backend, database, auth, or additional tools were added.
- Verified with `npm run test:run` and `npm run lint`.

### Test Case Checklist Generator UI
- Added the `/tools/test-case-checklist-generator` page with metadata, a client-side checklist form, and SEO/help content.
- Wired the UI to the tested `generateTestCaseChecklist` function.
- Added feature name, main user flow, edge cases, platform, generated checklist output, copy, download, and clear actions.
- Marked Test Case Checklist Generator as available in `lib/tools.ts`.
- Kept the implementation browser-only with no backend, database, auth, or AdSense.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.
