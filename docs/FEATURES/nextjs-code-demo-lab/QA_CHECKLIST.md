# Next.js Code Demo Lab QA Checklist

## Manual QA
- [ ] Page loads successfully at `/tools/nextjs-code-demo-lab`.
- [ ] Lesson selector is visible.
- [ ] All initial lessons are available.
- [ ] User can select `useState` Counter.
- [ ] User can select Props Example.
- [ ] User can select Conditional Rendering.
- [ ] User can select List Rendering.
- [ ] User can select Client Component vs Server Component.
- [ ] User can select Route Handler GET response.
- [ ] User can select Environment Variable Safety.
- [ ] Each lesson shows title, difficulty, concept, code snippet, explanation, preview, common mistake, and change notes.
- [ ] Copy Code works.
- [ ] Copy failure shows a helpful fallback message.
- [ ] Reset Demo works for lessons where reset is useful.
- [ ] Switching lessons resets lesson-specific demo state.
- [ ] Long code snippets remain readable on mobile.
- [ ] Page works on mobile.

## Lesson QA
- [ ] `useState` Counter preview is safe and interactive if live.
- [ ] Props Example uses predefined props only.
- [ ] Conditional Rendering uses predefined states only.
- [ ] List Rendering uses a fixed safe list.
- [ ] Client Component vs Server Component lesson explains `"use client"`.
- [ ] Route Handler GET response uses a simulated preview only.
- [ ] Environment Variable Safety does not expose real secrets.
- [ ] Live preview lessons are clearly distinguished from simulated preview lessons.

## Content QA
- [ ] Page explains what a code demo lab is.
- [ ] Page explains how to learn Next.js using examples.
- [ ] Page explains live preview vs simulated preview.
- [ ] Page explains why arbitrary code execution is not supported in v1.
- [ ] Page includes FAQ.
- [ ] Page includes related tools.

## Safety QA
- [ ] No free-form code runner is added.
- [ ] No arbitrary code execution is possible.
- [ ] No user-provided code is run.
- [ ] No `eval` is used.
- [ ] No `Function` constructor is used.
- [ ] No Sandpack is added.
- [ ] No backend is added.
- [ ] No database is added.
- [ ] No AI API is added.
- [ ] No files are created by the tool.
