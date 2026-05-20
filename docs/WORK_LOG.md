# Work Log

## 2026-05-20

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
