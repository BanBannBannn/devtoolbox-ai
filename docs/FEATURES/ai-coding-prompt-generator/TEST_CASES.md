# AI Coding Prompt Generator Test Cases

## TC-001: Generate basic coding prompt
Input:
- Task type: Build feature
- Tech stack: Next.js, TypeScript
- Feature: JSON Formatter
- Constraints: No backend, client-side only
- Expected output: Changed files and explanation

Expected:
- Output contains role.
- Output contains context.
- Output contains task.
- Output contains Next.js and TypeScript.
- Output contains JSON Formatter.
- Output contains no backend.
- Output contains expected output instructions.

## TC-002: Empty constraints
Input:
- Constraints: empty

Expected:
- Output still includes a constraints section with default constraints.

## TC-003: Missing expected output
Input:
- Expected output: empty

Expected:
- Output includes default output format.
