# Next.js Code Demo Lab Test Cases

## TC-001: Lesson selector loads initial lessons
Input:
- Open `/tools/nextjs-code-demo-lab`.

Expected:
- Lesson selector is visible.
- Selector includes all initial lessons:
  - `useState` Counter
  - Props Example
  - Conditional Rendering
  - List Rendering
  - Client Component vs Server Component
  - Route Handler GET response
  - Environment Variable Safety
  - `page.tsx` creates a route
  - `layout.tsx` wraps child pages

## TC-002: Select useState Counter lesson
Input:
- Select `useState` Counter.

Expected:
- Lesson title, difficulty, concept, code snippet, explanation, common mistake, change notes, and preview are shown.
- Working code, Without / broken code, and Why it matters sections are shown.
- Preview is safe and interactive if implemented as a real counter.
- Broken version is not run and shows a simulated missing `"use client"` error.
- No arbitrary code is executed.

## TC-003: Select Props Example lesson
Input:
- Select Props Example.

Expected:
- Fixed code snippet is shown.
- Working code and Without / broken code sections explain the difference.
- Preview uses predefined props only.
- Broken version shows what happens when required props are missing or undefined.
- Explanation describes how props pass data to a component.

## TC-004: Select Conditional Rendering lesson
Input:
- Select Conditional Rendering.

Expected:
- Fixed code snippet is shown.
- Working code and Without / broken code sections explain the difference.
- Preview demonstrates switching between predefined UI states.
- Broken version shows confusing output when the condition is not handled.
- Explanation describes rendering different UI based on a condition.

## TC-005: Select List Rendering lesson
Input:
- Select List Rendering.

Expected:
- Fixed code snippet is shown.
- Working code and Without / broken code sections explain the difference.
- Preview displays a fixed list.
- Broken version shows a simulated warning for a missing key.
- Explanation mentions mapping arrays and using stable keys.

## TC-006: Select Client Component vs Server Component lesson
Input:
- Select Client Component vs Server Component.

Expected:
- Fixed code snippet is shown.
- Working code and Without / broken code sections explain the difference.
- Preview or explanation is simulated.
- Lesson explains when a Client Component needs `"use client"`.

## TC-007: Select page.tsx route lesson
Input:
- Select `page.tsx` creates a route.

Expected:
- Working code section shows a route with `page.tsx`.
- Without / broken code section explains that the segment has no page to render.
- Why it matters explains that folders decide the URL and `page.tsx` provides UI.

## TC-008: Select layout.tsx wrapper lesson
Input:
- Select `layout.tsx` wraps child pages.

Expected:
- Working code section shows shared layout code.
- Without / broken code section explains that child pages render without the shared shell.
- Why it matters explains that layout is a wrapper for child pages.

## TC-009: Select Route Handler GET response lesson
Input:
- Select Route Handler GET response.

Expected:
- Fixed code snippet is shown.
- Working code section shows `route.ts`.
- Without / broken code section explains there is no API endpoint.
- Preview shows a simulated JSON response.
- Tool does not create or call a backend route.

## TC-010: Select Environment Variable Safety lesson
Input:
- Select Environment Variable Safety.

Expected:
- Fixed code snippet is shown.
- Working code section shows server-only and public environment variable usage.
- Without / broken code section explains unsafe public secret exposure.
- Explanation distinguishes public `NEXT_PUBLIC_*` variables from server-only variables.
- No real environment variable value is displayed.

## TC-011: Copy working and broken code
Input:
- Select any lesson.
- Click Copy Working Code.
- Click Copy Broken Code.

Expected:
- Working and broken snippets can be copied separately.
- Helpful success message is shown.
- If copy fails, helpful fallback message is shown.

## TC-012: Reset demo
Input:
- Interact with a lesson preview that has state.
- Click Reset Demo.

Expected:
- Demo state returns to the initial state.
- Selected lesson remains selected.
- Code snippet and explanation remain visible.

## TC-013: Switch lessons after interacting
Input:
- Interact with `useState` Counter.
- Switch to another lesson.

Expected:
- Previous demo state does not leak into the next lesson.
- New lesson content and preview are shown.

## TC-014: No arbitrary code execution
Input:
- Inspect UI for free-form code input.

Expected:
- No free-form code editor is available.
- User cannot run custom code.
- Implementation does not use `eval`, the `Function` constructor, Sandpack, backend execution, database, or AI API.

## TC-015: Mobile layout
Setup:
- Use the page on a small viewport.

Expected:
- Lesson selector, Working code, Without / broken code, Why it matters, preview, copy buttons, reset action, FAQ, and related tools remain readable and usable.
