# JSON Formatter SPEC

## Goal
Build a browser-based JSON Formatter tool that helps users validate and format JSON.

## URL
`/tools/json-formatter`

## User Story
As a developer, I want to paste raw JSON and format it, so that I can read and debug it more easily.

## Functional Requirements
- User can paste raw JSON into a textarea.
- User can click a "Format JSON" button.
- If the input is valid JSON, the tool displays formatted JSON with 2-space indentation.
- If the input is invalid JSON, the tool displays a helpful error message.
- User can copy the formatted output.
- User can clear the input and output.
- The tool runs fully in the browser.
- The tool does not send input to any server.

## Non-Functional Requirements
- Fast response for normal JSON input.
- Mobile-friendly layout.
- Accessible labels.
- Clear error state.
- No backend dependency.

## Edge Cases
- Empty input.
- Invalid JSON.
- Valid JSON object.
- Valid JSON array.
- Nested JSON.
- JSON with whitespace.
- Large but reasonable JSON input.

## SEO Content Requirements
The page should include:
- What is a JSON formatter?
- How to use the JSON formatter.
- Example input and output.
- Common JSON syntax errors.
- FAQ.
- Related tools.

## Acceptance Criteria
- Valid JSON is formatted correctly.
- Invalid JSON shows an error.
- Empty input shows a helpful message.
- Copy output works when output exists.
- Clear button resets input, output, and error.
- No network request is needed to format JSON.
