# README Generator Test Cases

## TC-001: Generate README with all fields
Input:
- Project name: DevToolBox AI
- Description: Free developer tools for students and software engineers.
- Tech stack: Next.js, TypeScript, Tailwind CSS
- Install command: npm install
- Run command: npm run dev
- Features:
  - JSON Formatter
  - README Generator

Expected:
- Output contains `# DevToolBox AI`
- Output contains description
- Output contains `## Tech Stack`
- Output contains `Next.js`
- Output contains `## Installation`
- Output contains `npm install`
- Output contains `## Usage`
- Output contains `npm run dev`
- Output contains both features

## TC-002: Missing project name
Input:
- Project name: empty

Expected:
- Uses fallback title `Untitled Project`

## TC-003: Empty features
Input:
- Features: empty

Expected:
- Output does not break.
- Output may include a placeholder or omit features section.

## TC-004: Commands with special characters
Input:
- Install command: pnpm install
- Run command: pnpm dev --turbo

Expected:
- Commands are wrapped in markdown code blocks.
