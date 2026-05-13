# README Generator SPEC

## Goal
Build a browser-based README Generator that creates a clean markdown README from user inputs.

## URL
`/tools/readme-generator`

## User Story
As a developer, I want to generate a basic README file quickly, so that I can document my project faster.

## Functional Requirements
- User can enter project name.
- User can enter project description.
- User can enter tech stack.
- User can enter installation command.
- User can enter run command.
- User can enter feature list.
- Tool generates markdown README.
- User can copy the markdown.
- User can download the output as `README.md`.
- Tool runs fully in the browser.

## Output Sections
Generated README should include:
- Project title
- Description
- Tech Stack
- Features
- Installation
- Usage
- License placeholder

## Edge Cases
- Missing project name.
- Missing description.
- Empty feature list.
- Multi-line features.
- Commands with special characters.

## Acceptance Criteria
- Generated README is valid markdown.
- Output includes project name.
- Output includes description when provided.
- Output includes install command when provided.
- Output includes run command when provided.
- Copy button works.
- Download button works.
