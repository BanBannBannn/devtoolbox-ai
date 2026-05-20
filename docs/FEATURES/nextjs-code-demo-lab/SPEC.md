# Next.js Code Demo Lab SPEC

## Goal
Build a client-side educational tool that helps beginners learn Next.js and React concepts with fixed code examples and visual outputs.

## URL
`/tools/nextjs-code-demo-lab`

## User Story
As a beginner learning Next.js and React, I want to choose a safe predefined lesson, read the code, and see a live or simulated preview, so that I can understand the concept without running arbitrary code.

## Core Safety Requirements
- Client-side only in v1.
- This is not a free-form code runner.
- Users must not be able to execute arbitrary code.
- Lessons are predefined and safe.
- Do not use `eval`.
- Do not use the `Function` constructor.
- Do not run user-provided code.
- Do not add Sandpack in v1.
- Do not add backend.
- Do not add database.
- Do not add AI API.

## Functional Requirements
- User can select a lesson from a lesson selector.
- Each lesson includes:
  - Title.
  - Difficulty.
  - Concept.
  - Code snippet.
  - Explanation.
  - Live preview or simulated preview.
  - Common mistake.
  - What changes when the code changes.
- Some lessons can have a real interactive preview.
- Some lessons can have a simulated preview.
- User can copy the code snippet.
- User can reset the demo when useful.
- Page is mobile-friendly.

## Initial Lessons
1. `useState` Counter
2. Props Example
3. Conditional Rendering
4. List Rendering
5. Client Component vs Server Component
6. Route Handler GET response
7. Environment Variable Safety

## Lesson Behavior Requirements
- `useState` Counter can include a real interactive counter preview.
- Props Example can include a simulated or simple live preview with fixed props.
- Conditional Rendering can include a safe toggle that switches predefined UI states.
- List Rendering can include a fixed list preview.
- Client Component vs Server Component should explain the difference and show a simulated preview.
- Route Handler GET response should show a simulated JSON response preview only.
- Environment Variable Safety should show safe public/server-only examples without exposing real secrets.

## Educational Output Requirements
Each selected lesson should help the user understand:
- What concept the snippet demonstrates.
- Which part of the code matters most.
- How the visual output connects to the code.
- A common beginner mistake.
- What would change if a specific safe part of the example changed.

## SEO/Help Content Requirements
The page should include helpful content for:
- What a code demo lab is.
- How to learn Next.js using examples.
- Difference between live preview and simulated preview.
- Why arbitrary code execution is not supported in v1.
- FAQ.
- Related tools.

## Edge Cases
- No lesson selected.
- Copy code before a lesson loads.
- Reset demo before interacting.
- Switching lessons after interacting with a live preview.
- Long code snippet on mobile.
- Simulated preview lesson selected.
- Real interactive preview lesson selected.
- User expects to edit and run custom code.

## Non-Goals
- No free-form editor in v1.
- No arbitrary JavaScript, React, or Next.js execution.
- No file creation.
- No backend route execution.
- No API calls.
- No Sandpack.
- No database.
- No AI-generated lesson content.
- No modification to `lib/tools.ts` or app pages during documentation-only planning.

## Acceptance Criteria
- Spec, test cases, and QA checklist exist for the feature.
- Future implementation can render predefined lessons with code, explanations, mistakes, change notes, and previews.
- Future implementation clearly distinguishes live previews from simulated previews.
- Future implementation includes copy code and reset demo actions where useful.
- Future implementation is mobile-friendly.
- Future implementation does not execute arbitrary code, run user-provided code, use `eval`, use the `Function` constructor, add Sandpack, add backend, add database, or call an AI API.
