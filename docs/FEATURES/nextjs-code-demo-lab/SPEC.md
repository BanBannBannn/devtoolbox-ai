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
  - Correct code.
  - Broken code or code without the key concept.
  - Correct output.
  - Broken output.
  - Simulated error when useful.
  - Explanation.
  - Live preview or simulated preview.
  - Common mistake.
  - What changes when the code changes.
  - Why the correct version works.
  - Why the broken or missing version fails.
  - Beginner mental model.
  - Preview type: `live` or `simulated`.
  - Optional live preview ID for fixed built-in live demos.
- UI should show comparison sections or tabs:
  - Working code.
  - Without / broken code.
  - Why it matters.
- Some lessons can have a real interactive preview.
- Some lessons can have a simulated preview.
- User can copy the code snippet.
- User can copy the working code.
- User can copy the broken or missing-code example.
- User can reset the demo when useful.
- Page is mobile-friendly.

## Data Model Requirements
Each lesson should support:
- `id`
- `title`
- `difficulty`
- `concept`
- `correctCode`
- `withoutCode` or `brokenCode`
- `correctOutput`
- `brokenOutput`
- `simulatedError`
- `whyItWorks`
- `whyItBreaks`
- `mentalModel`
- `previewType: "live" | "simulated"`
- Optional `livePreviewId`

## Initial Lessons
1. `useState` Counter
2. Props Example
3. Conditional Rendering
4. List Rendering
5. Client Component vs Server Component
6. `page.tsx` creates a route
7. `layout.tsx` wraps child pages
8. Route Handler GET response
9. Environment Variable Safety

## Comparison Lessons To Emphasize First
- `useState` Counter:
  - With `"use client"` works.
  - Without `"use client"` breaks because hooks and event handlers need a Client Component.
- `page.tsx`:
  - With `page.tsx` creates a route.
  - Without `page.tsx` the route has no page to render.
- `layout.tsx`:
  - With `layout.tsx` wraps child pages.
  - Without `layout.tsx` pages render without shared layout.
- Route Handler:
  - With `route.ts` creates an API endpoint.
  - Without `route.ts` there is no API route.
- Environment Variables:
  - Server environment variables can keep secrets.
  - Client-exposed environment variables must use `NEXT_PUBLIC_` and are visible to the browser.

## Lesson Behavior Requirements
- `useState` Counter can include a real interactive counter preview.
- Props Example can include a simulated or simple live preview with fixed props.
- Conditional Rendering can include a safe toggle that switches predefined UI states.
- List Rendering can include a fixed list preview.
- Correct code examples can have real live previews when they map to known built-in demo components.
- Broken or missing-code examples must not run; they should show simulated error or output panels.
- Client Component vs Server Component should explain the difference and show a simulated preview.
- Route Handler GET response should show a simulated JSON response preview only.
- Environment Variable Safety should show safe public/server-only examples without exposing real secrets.

## Educational Output Requirements
Each selected lesson should help the user understand:
- What concept the snippet demonstrates.
- Which part of the code matters most.
- How the visual output connects to the code.
- What happens with the important code.
- What happens without the important code.
- What output appears.
- What simulated error or warning would happen.
- A common beginner mistake.
- What would change if a specific safe part of the example changed.
- A beginner-friendly mental model.

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
- Working examples can use fixed live previews when available.
- Broken or missing-code examples show simulated errors or output instead of running.
- Future implementation clearly distinguishes live previews from simulated previews.
- Future implementation includes copy buttons for working and broken code, plus reset demo actions where useful.
- Future implementation is mobile-friendly.
- Future implementation does not execute arbitrary code, run user-provided code, use `eval`, use the `Function` constructor, add Sandpack, add backend, add database, or call an AI API.
