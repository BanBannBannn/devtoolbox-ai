# Start Here

This is a documentation starter kit for building DevToolBox AI using:

Spec → Test → Code → QA → Deploy

## Step 1: Create Next.js Project

```bash
npx create-next-app@latest devtoolbox-ai --ts --tailwind --eslint --app --src-dir false
cd devtoolbox-ai
```

Recommended answers:
- TypeScript: Yes
- ESLint: Yes
- Tailwind: Yes
- App Router: Yes
- src directory: No or Yes, but keep it consistent
- import alias: Yes

## Step 2: Add These Docs

Copy the `docs/` folder from this starter kit into your project root.

Your project should look like:

```txt
devtoolbox-ai/
  app/
  components/
  lib/
  content/
  docs/
  package.json
```

## Step 3: Install Test Tools

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Add scripts to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

## Step 4: Install shadcn/ui

```bash
npx shadcn@latest init
```

Then add useful components:

```bash
npx shadcn@latest add button card textarea input label select
```

## Step 5: Start Vibe Coding

Use this first prompt in your AI coding tool:

```txt
Read these files first:
- docs/PROJECT_BRIEF.md
- docs/PRODUCT_REQUIREMENTS.md
- docs/AI_CODING_RULES.md
- docs/TASKS.md

Task:
Create the initial Next.js project structure for DevToolBox AI.

Follow docs/AI_CODING_RULES.md strictly.
Do not add authentication.
Do not add database.
Do not add paid API.
Do not add AdSense code yet.
Return changed files and a short explanation.
```

## Step 6: Build the First Feature

After setup, build JSON Formatter first.

Use:

```txt
Read:
- docs/AI_CODING_RULES.md
- docs/FEATURES/json-formatter/SPEC.md
- docs/FEATURES/json-formatter/TEST_CASES.md

Follow Spec → Test → Code.
First write tests for the pure JSON formatter logic.
Then implement the smallest code to pass tests.
Then build the UI.
Do not add backend.
```

## Step 7: Deploy

After the first 3-5 tools:

```bash
npm run build
```

Then deploy to Vercel or Cloudflare Pages.

## Recommended Rule
Do not ask AI to build the whole website in one prompt. Build one feature at a time.
