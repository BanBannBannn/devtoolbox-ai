# Next.js File Tree Visualizer Test Cases

## TC-001: Generate root page route tree
Input:
- Route path: `/`
- Route type: Page route

Expected:
- Output includes `app/page.tsx`.
- Explanation says `page.tsx` renders the route UI.
- Preview shows a simple page route preview.

## TC-002: Generate static nested page route tree
Input:
- Route path: `/dashboard/settings`
- Route type: Page route

Expected:
- Output includes `app/dashboard/settings/page.tsx`.
- Explanation describes the nested route segments.
- Preview shows a page route preview for `/dashboard/settings`.

## TC-003: Generate dynamic route tree
Input:
- Route path: `/blog/[slug]`
- Route type: Page route

Expected:
- Output includes `app/blog/[slug]/page.tsx`.
- Explanation describes `[slug]` as a dynamic route segment.
- Preview shows a page route preview for a dynamic route.

## TC-004: Generate layout route tree
Input:
- Route path: `/dashboard`
- Route type: Layout route

Expected:
- Output includes `app/dashboard/layout.tsx`.
- Explanation says `layout.tsx` wraps child routes in that segment.

## TC-005: Generate loading UI tree
Input:
- Route path: `/blog`
- Route type: Loading UI

Expected:
- Output includes `app/blog/loading.tsx`.
- Explanation says `loading.tsx` displays while route content is loading.
- Preview explains loading UI behavior.

## TC-006: Generate error UI tree
Input:
- Route path: `/dashboard/settings`
- Route type: Error UI

Expected:
- Output includes `app/dashboard/settings/error.tsx`.
- Explanation says `error.tsx` handles rendering errors for that segment.
- Preview explains error UI behavior.

## TC-007: Generate API route handler tree
Input:
- Route path: `/api/health`
- Route type: API Route Handler

Expected:
- Output includes `app/api/health/route.ts`.
- Explanation says `route.ts` handles HTTP requests.
- Preview shows a simple JSON API response example.

## TC-008: Normalize missing leading slash
Input:
- Route path: `about`
- Route type: Page route

Expected:
- Output treats the route as `/about`.
- Output includes `app/about/page.tsx`.

## TC-009: Normalize repeated and trailing slashes
Input:
- Route path: `//dashboard/settings/`
- Route type: Page route

Expected:
- Output treats the route as `/dashboard/settings`.
- Output includes `app/dashboard/settings/page.tsx`.

## TC-010: Empty route path
Input:
- Route path: empty
- Route type: Page route

Expected:
- Tool shows a helpful validation error.
- No file tree is generated.

## TC-011: Unsupported characters
Input:
- Route path: `/blog/<slug>`
- Route type: Page route

Expected:
- Tool shows a helpful validation error.
- No unsafe file tree is generated.

## TC-012: API type with non-API path
Input:
- Route path: `/health`
- Route type: API Route Handler

Expected:
- Tool either maps to `app/health/route.ts` with a clear explanation or suggests using `/api/health`.
- Tool does not execute code or create files.

## TC-013: Mobile layout
Setup:
- Use the page on a small viewport.

Expected:
- Route input, route type selector, generated file tree, explanations, previews, and help content remain readable and usable.
