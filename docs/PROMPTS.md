# Prompts for Vibe Coding

## How to Use
Copy one prompt at a time into your AI coding tool. Do not ask it to build everything at once.

---

## Prompt 1: Project Setup

Read these files first:
- docs/PROJECT_BRIEF.md
- docs/PRODUCT_REQUIREMENTS.md
- docs/AI_CODING_RULES.md
- docs/TASKS.md

Task:
Create the initial Next.js project structure for DevToolBox AI.

Requirements:
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui compatible structure
- Static pages first
- No database
- No authentication
- No paid API
- No AdSense code yet

Create:
- app/page.tsx
- app/layout.tsx
- app/tools/page.tsx
- app/blog/page.tsx
- app/about/page.tsx
- app/contact/page.tsx
- app/privacy-policy/page.tsx
- app/terms/page.tsx
- components/site-header.tsx
- components/site-footer.tsx
- lib/tools.ts
- lib/seo.ts

Return:
1. Files changed
2. Explanation
3. Next recommended task

---

## Prompt 2: JSON Formatter Spec to Test

Read:
- docs/AI_CODING_RULES.md
- docs/FEATURES/json-formatter/SPEC.md
- docs/FEATURES/json-formatter/TEST_CASES.md

Task:
Implement tests for the JSON Formatter logic before implementing the UI.

Requirements:
- Use Vitest.
- Create pure function tests.
- Test valid object.
- Test valid array.
- Test invalid JSON.
- Test empty input.
- Test nested JSON.

Create or update:
- lib/json-formatter.ts
- lib/json-formatter.test.ts

Important:
The implementation can be minimal, but tests must reflect the spec.

---

## Prompt 3: JSON Formatter Implementation

Read:
- docs/AI_CODING_RULES.md
- docs/FEATURES/json-formatter/SPEC.md
- docs/FEATURES/json-formatter/TEST_CASES.md
- existing tests

Task:
Implement the JSON Formatter feature.

Requirements:
- Make all tests pass.
- Keep logic in lib/json-formatter.ts.
- Build UI in app/tools/json-formatter/page.tsx or a component.
- Client-side only.
- Add copy button.
- Add clear button.
- Add helpful error message.
- Add SEO content below the tool.
- Do not add backend.

Return:
1. Files changed
2. How to test manually
3. Any assumptions

---

## Prompt 4: README Generator

Read:
- docs/AI_CODING_RULES.md
- docs/FEATURES/readme-generator/SPEC.md
- docs/FEATURES/readme-generator/TEST_CASES.md

Task:
Build the README Generator using Spec → Test → Code.

Requirements:
- Create pure generation logic in lib/readme-generator.ts.
- Add tests in lib/readme-generator.test.ts.
- Build UI.
- Output markdown.
- Copy button.
- Download .md button.
- No backend.

---

## Prompt 5: AI Coding Prompt Generator

Read:
- docs/AI_CODING_RULES.md
- docs/FEATURES/ai-coding-prompt-generator/SPEC.md
- docs/FEATURES/ai-coding-prompt-generator/TEST_CASES.md

Task:
Build the AI Coding Prompt Generator using Spec → Test → Code.

Requirements:
- Pure logic in lib/ai-coding-prompt-generator.ts.
- Tests first.
- UI second.
- Output structured prompt with role, context, task, constraints, and output format.

---

## Prompt 6: Code Review

Read:
- docs/AI_CODING_RULES.md
- docs/PRODUCT_REQUIREMENTS.md
- docs/TASKS.md

Task:
Review the current codebase.

Check:
- TypeScript errors
- broken imports
- unused code
- SEO issues
- accessibility issues
- mobile layout problems
- missing error handling
- components that are too large
- logic that should be moved to lib/

Return:
1. Problems found
2. Why they matter
3. Exact files to edit
4. Patch-style solution
5. What not to change
