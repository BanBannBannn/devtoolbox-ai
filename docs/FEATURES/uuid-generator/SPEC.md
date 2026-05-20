# UUID Generator SPEC

## Goal
Build a browser-based generator that creates UUID v4 strings for developers.

## URL
`/tools/uuid-generator`

## User Story
As a developer, I want to generate one or more UUID v4 strings, so that I can quickly use them in tests, seed data, or configuration.

## Functional Requirements
- User can choose how many UUIDs to generate.
- User can choose lowercase or uppercase output.
- Tool generates UUID v4 strings.
- Count is validated with a safe minimum of `1`.
- Count is capped at a safe maximum of `100`.
- UUID generation uses `crypto.randomUUID` when available.
- Tool runs fully in the browser.

## Logic Requirements
- Create a pure function named `generateUuidV4List`.
- Function accepts:
  - `count`
  - `uppercase` boolean
- Function returns an array of UUID v4 strings.

## Edge Cases
- Count below `1`.
- Count above `100`.
- Uppercase output.
- Multiple UUIDs generated in one call.

## Acceptance Criteria
- One UUID can be generated.
- Multiple UUIDs can be generated.
- Uppercase option returns uppercase UUID strings.
- Count below minimum falls back to `1`.
- Count above maximum caps at `100`.
- No backend, database, auth, or external API is required.
