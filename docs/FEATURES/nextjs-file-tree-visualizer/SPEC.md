# Next.js File Tree Visualizer SPEC

## Goal
Build a client-side educational tool that helps beginners understand how Next.js App Router file structure maps to routes.

## URL
`/tools/nextjs-file-tree-visualizer`

## User Story
As a beginner learning the Next.js App Router, I want to enter a route path and choose a route type, so that I can see which files belong in the `app` directory and understand what each file does.

## Functional Requirements
- User can input a route path, such as:
  - `/`
  - `/about`
  - `/blog/[slug]`
  - `/api/health`
  - `/dashboard/settings`
- User can choose route type:
  - Page route
  - Layout route
  - Loading UI
  - Error UI
  - API Route Handler
- Tool generates a file tree for the Next.js `app` directory.
- Tool explains what each generated file does.
- Tool shows a simple output preview:
  - Page route preview.
  - API route response preview.
  - Loading UI explanation.
  - Error UI explanation.
- Tool is educational only.
- Tool does not execute code.
- Tool does not create files.
- Tool runs fully in the browser.
- Tool works well on mobile.

## Route Mapping Behavior
- `/` should map to `app/page.tsx` for page routes.
- `/about` should map to `app/about/page.tsx` for page routes.
- `/blog/[slug]` should map to `app/blog/[slug]/page.tsx` for page routes.
- `/dashboard/settings` should map to `app/dashboard/settings/page.tsx` for page routes.
- Layout route type should map to `layout.tsx` at the selected route segment.
- Loading UI route type should map to `loading.tsx` at the selected route segment.
- Error UI route type should map to `error.tsx` at the selected route segment.
- API Route Handler type should map to `route.ts` at the selected API route segment, such as `app/api/health/route.ts`.

## Educational Output Requirements
The generated output should explain:
- What the route path means.
- Which file path Next.js uses.
- What `page.tsx` does.
- What `layout.tsx` does.
- What `loading.tsx` does.
- What `error.tsx` does.
- What `route.ts` does for API routes.
- How dynamic route segments like `[slug]` work.
- That the tool is a guide only and does not create files.

## SEO/Help Content Requirements
The page should include helpful content for:
- What the Next.js App Router is.
- How routes map to files.
- What `page.tsx` does.
- What `layout.tsx` does.
- What `route.ts` does for API routes.
- Dynamic route examples.
- FAQ.
- Related tools.

## Edge Cases
- Empty route path.
- Route path without a leading slash.
- Root route `/`.
- Nested route path.
- Dynamic segment route path.
- API route path.
- API Route Handler selected for a non-API route.
- Page route selected for an `/api/*` path.
- Repeated slashes.
- Trailing slash.
- Route path with unsupported characters.

## Non-Goals
- Do not execute generated code.
- Do not create files.
- Do not read the user's local project.
- Do not add backend.
- Do not add database.
- Do not call an AI API.
- Do not modify `lib/tools.ts` or app pages during documentation-only planning.

## Acceptance Criteria
- Spec, test cases, and QA checklist exist for the feature.
- Future implementation can generate an App Router file tree from a route path and route type.
- Future implementation can explain each generated file.
- Future implementation can show a simple preview for page, API, loading, and error outputs.
- Future implementation remains client-side only, educational only, mobile-friendly, and does not execute code or create files.
