# Work Log

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
