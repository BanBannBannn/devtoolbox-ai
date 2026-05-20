# Unix Timestamp Converter SPEC

## Goal
Build a browser-based converter for Unix timestamps and ISO date/time strings.

## URL
`/tools/unix-timestamp-converter`

## User Story
As a developer, I want to convert Unix timestamps to readable dates and dates back to Unix timestamps, so that I can debug logs, APIs, tokens, and database values.

## Functional Requirements
- User can convert a Unix timestamp to an ISO date/time string.
- User can convert an ISO date/time string to a Unix timestamp.
- Tool supports timestamps in seconds.
- Tool supports timestamps in milliseconds.
- Tool handles invalid input with a clear error.
- Tool runs fully in the browser.

## Logic Requirements
- Create pure functions:
  - `timestampToDate`
  - `dateToTimestamp`
- Functions support units:
  - `seconds`
  - `milliseconds`
- `timestampToDate` returns an ISO date/time string on success.
- `dateToTimestamp` returns a numeric timestamp on success.

## Edge Cases
- Empty timestamp input.
- Non-numeric timestamp input.
- Invalid date input.
- Seconds vs milliseconds conversion.

## Acceptance Criteria
- Timestamp in seconds converts to an ISO date/time string.
- Timestamp in milliseconds converts to an ISO date/time string.
- ISO date/time string converts to seconds.
- ISO date/time string converts to milliseconds.
- Invalid input returns a helpful error.
- No UI, backend, database, auth, or external API is required for this logic task.
