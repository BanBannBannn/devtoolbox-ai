# AI Coding Prompt Generator SPEC

## Goal
Build a browser-based tool that generates structured prompts for AI coding tools.

## URL
`/tools/ai-coding-prompt-generator`

## User Story
As a developer using AI coding tools, I want to generate a clear prompt, so that the AI produces better code with fewer mistakes.

## Functional Requirements
- User can choose a task type.
- User can enter tech stack.
- User can enter feature description.
- User can enter constraints.
- User can enter expected output.
- Tool generates a structured prompt.
- User can copy the prompt.
- Tool runs fully in the browser.

## Prompt Output Structure
Generated prompt should include:
- Role
- Context
- Task
- Requirements
- Constraints
- Output format
- Things not to do

## Edge Cases
- Missing task type.
- Missing tech stack.
- Long feature description.
- Empty constraints.
- Empty expected output.

## Acceptance Criteria
- Output is clear and structured.
- Output includes the feature description.
- Output includes constraints when provided.
- Output tells the AI not to add extra features.
- Copy button works.
