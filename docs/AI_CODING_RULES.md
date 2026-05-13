# AI Coding Rules

## Main Workflow
Always follow this order:

1. Read the relevant spec.
2. Write or update test cases.
3. Write tests for pure logic.
4. Implement the smallest working solution.
5. Run checks.
6. Review against the spec.
7. Update QA checklist if needed.

This project follows:

Spec → Test → Code → QA → Deploy

## Tech Stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui when useful
- Markdown or MDX content
- Vitest for unit tests
- Static generation whenever possible

## Architecture Rules
- Prefer server components for static pages.
- Use client components only for interactive tools.
- Put reusable business logic in `lib/`.
- Put UI components in `components/`.
- Put tool definitions in `lib/tools.ts`.
- Put blog content in `content/blog/`.
- Put feature specs in `docs/FEATURES/`.

## V1 Restrictions
- Do not add authentication.
- Do not add a database.
- Do not add payment.
- Do not add user accounts.
- Do not add analytics until the base site works.
- Do not add AdSense code until the site is approved.
- Do not call external AI APIs in v1.

## Code Quality Rules
- Use TypeScript types.
- Avoid `any` unless necessary.
- Avoid large components.
- Avoid unused imports.
- Avoid duplicated logic.
- Handle invalid input.
- Show helpful error messages.
- Keep pure logic testable.
- Do not rely on random output for core logic.
- Do not silently fail.

## UI Rules
- Mobile-first.
- Clear spacing.
- Clear headings.
- Accessible labels.
- Buttons must describe their action.
- Error messages must be understandable.
- Tool pages should have a useful intro, the tool UI, examples, FAQs, and related tools.

## SEO Rules
Every important page should have:
- Unique title
- Unique description
- One H1
- Proper heading hierarchy
- Useful content
- Internal links
- Clean URL
- Metadata

## AdSense Rules
- Do not ask users to click ads.
- Do not place ads near buttons in a misleading way.
- Do not create fake traffic.
- Do not click your own ads.
- Do not add ads before approval.
- User experience comes before ad placement.

## AI Prompting Rules
When asking an AI coding tool to code:
- Tell it to read `docs/AI_CODING_RULES.md`.
- Tell it to read the feature SPEC.
- Tell it to implement only the requested task.
- Tell it not to add extra features.
- Tell it to return changed files.
- Tell it to explain important decisions briefly.
