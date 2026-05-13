# Product Requirements

## Product
DevToolBox AI

## V1 Scope
Build a free developer tools website with 5 initial tools and supporting SEO content.

## Required Public Pages

### Home Page
URL: `/`

Requirements:
- Explain what the website does.
- Show featured tools.
- Show latest articles.
- Link to tools page.
- Link to blog page.

### Tools Page
URL: `/tools`

Requirements:
- List all available tools.
- Each tool card should show title, description, and link.
- Tools should be grouped by category if needed.

### Blog Page
URL: `/blog`

Requirements:
- List all blog articles.
- Show title, description, date, and tags.
- Link to individual blog posts.

### Blog Detail Page
URL: `/blog/[slug]`

Requirements:
- Render markdown content.
- Show metadata.
- Include related articles or related tools.
- Use SEO metadata.

### About Page
URL: `/about`

Requirements:
- Explain the purpose of the website.
- Explain that tools are free and browser-based where possible.

### Contact Page
URL: `/contact`

Requirements:
- Provide a simple contact method.
- No contact form required in v1.

### Privacy Policy Page
URL: `/privacy-policy`

Requirements:
- Explain basic privacy practices.
- Mention that v1 tools run mostly in the browser.
- Mention that analytics/ads may be added later.

### Terms Page
URL: `/terms`

Requirements:
- Explain that tools are provided as-is.
- Users are responsible for checking outputs.

## First 5 Tools

### 1. JSON Formatter
URL: `/tools/json-formatter`

Input:
- Raw JSON text

Output:
- Pretty formatted JSON or error message

Requirements:
- Client-side only.
- Validate JSON.
- Format with 2-space indentation.
- Copy output button.
- Clear button.
- Helpful error messages.

### 2. README Generator
URL: `/tools/readme-generator`

Input:
- Project name
- Description
- Tech stack
- Installation command
- Run command
- Features

Output:
- Markdown README

Requirements:
- Client-side only.
- Generate structured markdown.
- Copy output button.
- Download `.md` button.

### 3. AI Coding Prompt Generator
URL: `/tools/ai-coding-prompt-generator`

Input:
- Task type
- Tech stack
- Feature description
- Constraints
- Expected output

Output:
- Structured prompt for AI coding tools

Requirements:
- Client-side only.
- Include role, context, task, constraints, output format.
- Copy output button.

### 4. Git Command Helper
URL: `/tools/git-command-helper`

Input:
- User goal selected from predefined options

Output:
- Suggested Git command and explanation

Requirements:
- Client-side only.
- Do not execute commands.
- Warn users to understand commands before running them.

### 5. Test Case Checklist Generator
URL: `/tools/test-case-checklist-generator`

Input:
- Feature name
- Main user flow
- Edge cases
- Platform

Output:
- Manual QA checklist in markdown

Requirements:
- Client-side only.
- Generate structured checklist.
- Copy output button.
- Download `.md` button.
