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

## TC-002: Select useState Counter lesson
Input:
- Select `useState` Counter.

Expected:
- Lesson title, difficulty, concept, code snippet, explanation, common mistake, change notes, and preview are shown.
- Preview is safe and interactive if implemented as a real counter.
- No arbitrary code is executed.

## TC-003: Select Props Example lesson
Input:
- Select Props Example.

Expected:
- Fixed code snippet is shown.
- Preview uses predefined props only.
- Explanation describes how props pass data to a component.

## TC-004: Select Conditional Rendering lesson
Input:
- Select Conditional Rendering.

Expected:
- Fixed code snippet is shown.
- Preview demonstrates switching between predefined UI states.
- Explanation describes rendering different UI based on a condition.

## TC-005: Select List Rendering lesson
Input:
- Select List Rendering.

Expected:
- Fixed code snippet is shown.
- Preview displays a fixed list.
- Explanation mentions mapping arrays and using stable keys.

## TC-006: Select Client Component vs Server Component lesson
Input:
- Select Client Component vs Server Component.

Expected:
- Fixed code snippet is shown.
- Preview or explanation is simulated.
- Lesson explains when a Client Component needs `"use client"`.

## TC-007: Select Route Handler GET response lesson
Input:
- Select Route Handler GET response.

Expected:
- Fixed code snippet is shown.
- Preview shows a simulated JSON response.
- Tool does not create or call a backend route.

## TC-008: Select Environment Variable Safety lesson
Input:
- Select Environment Variable Safety.

Expected:
- Fixed code snippet is shown.
- Explanation distinguishes public `NEXT_PUBLIC_*` variables from server-only variables.
- No real environment variable value is displayed.

## TC-009: Copy code
Input:
- Select any lesson.
- Click Copy Code.

Expected:
- Code snippet is copied to the clipboard.
- Helpful success message is shown.
- If copy fails, helpful fallback message is shown.

## TC-010: Reset demo
Input:
- Interact with a lesson preview that has state.
- Click Reset Demo.

Expected:
- Demo state returns to the initial state.
- Selected lesson remains selected.
- Code snippet and explanation remain visible.

## TC-011: Switch lessons after interacting
Input:
- Interact with `useState` Counter.
- Switch to another lesson.

Expected:
- Previous demo state does not leak into the next lesson.
- New lesson content and preview are shown.

## TC-012: No arbitrary code execution
Input:
- Inspect UI for free-form code input.

Expected:
- No free-form code editor is available.
- User cannot run custom code.
- Implementation does not use `eval`, the `Function` constructor, Sandpack, backend execution, database, or AI API.

## TC-013: Mobile layout
Setup:
- Use the page on a small viewport.

Expected:
- Lesson selector, code snippet, explanation, preview, copy button, reset action, FAQ, and related tools remain readable and usable.
