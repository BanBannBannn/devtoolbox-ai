# Next.js File Tree Visualizer QA Checklist

## Manual QA
- [ ] Page loads successfully at `/tools/nextjs-file-tree-visualizer`.
- [ ] User can enter a route path.
- [ ] User can choose Page route.
- [ ] User can choose Layout route.
- [ ] User can choose Loading UI.
- [ ] User can choose Error UI.
- [ ] User can choose API Route Handler.
- [ ] Root route `/` generates the correct file tree.
- [ ] Static route `/about` generates the correct file tree.
- [ ] Nested route `/dashboard/settings` generates the correct file tree.
- [ ] Dynamic route `/blog/[slug]` generates the correct file tree.
- [ ] API route `/api/health` generates a `route.ts` file tree.
- [ ] Missing leading slash is handled clearly.
- [ ] Repeated slashes and trailing slashes are handled clearly.
- [ ] Empty input shows a helpful error.
- [ ] Unsupported characters show a helpful error.
- [ ] Generated output explains what each file does.
- [ ] Output preview changes based on route type.
- [ ] Tool clearly communicates that it is educational only.
- [ ] Tool does not execute code.
- [ ] Tool does not create files.
- [ ] Page works on mobile.

## Content QA
- [ ] Page explains what the Next.js App Router is.
- [ ] Page explains how routes map to files.
- [ ] Page explains what `page.tsx` does.
- [ ] Page explains what `layout.tsx` does.
- [ ] Page explains what `route.ts` does for API routes.
- [ ] Page includes dynamic route examples.
- [ ] Page includes FAQ.
- [ ] Page includes related tools.

## Safety QA
- [ ] No backend is added.
- [ ] No database is added.
- [ ] No AI API call is added.
- [ ] No local file system access is added.
- [ ] No generated code is executed.
- [ ] No generated files are written.
