# Test Case Checklist Generator Test Cases

## TC-001: Generate checklist with all fields
Input:
- Feature name: JSON Formatter
- Main user flow: User pastes JSON, clicks format, sees formatted output.
- Edge cases:
  - Empty input
  - Invalid JSON
  - Large JSON
- Platform: Web

Expected:
- Output contains `# QA Checklist: JSON Formatter`
- Output contains smoke tests.
- Output contains happy path tests.
- Output contains edge cases.
- Output contains mobile/responsive tests.
- Output contains accessibility checks.

## TC-002: Missing feature name
Input:
- Feature name: empty

Expected:
- Output uses fallback `Untitled Feature`.

## TC-003: Empty edge cases
Input:
- Edge cases: empty

Expected:
- Output still includes generic edge case checklist.
