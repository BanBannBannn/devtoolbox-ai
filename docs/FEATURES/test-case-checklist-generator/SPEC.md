# Test Case Checklist Generator SPEC

## Goal
Build a browser-based generator that creates a manual QA checklist for a feature.

## URL
`/tools/test-case-checklist-generator`

## User Story
As a developer or student, I want to generate a test checklist for a feature, so that I can test my work more systematically.

## Functional Requirements
- User can enter feature name.
- User can enter main user flow.
- User can enter edge cases.
- User can enter platform.
- Tool generates a markdown QA checklist.
- User can copy checklist.
- User can download checklist as `.md`.
- Tool runs fully in the browser.

## Output Sections
Generated checklist should include:
- Feature name
- Smoke tests
- Happy path tests
- Edge case tests
- Error handling tests
- Mobile/responsive tests
- Accessibility checks
- Regression checks

## Edge Cases
- Missing feature name.
- Empty edge cases.
- Very short user flow.
- Multi-line edge cases.

## Acceptance Criteria
- Output is valid markdown.
- Output includes feature name or fallback.
- Output includes main user flow if provided.
- Output includes edge cases if provided.
- Copy button works.
- Download button works.
