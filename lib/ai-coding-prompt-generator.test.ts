import { describe, expect, it } from "vitest";
import { generateAiCodingPrompt } from "./ai-coding-prompt-generator";

describe("generateAiCodingPrompt", () => {
  it("generates a basic structured coding prompt", () => {
    const prompt = generateAiCodingPrompt({
      taskType: "Build feature",
      techStack: "Next.js, TypeScript",
      featureDescription: "JSON Formatter",
      constraints: "No backend, client-side only",
      expectedOutput: "Changed files and explanation",
    });

    expect(prompt).toContain("## Role");
    expect(prompt).toContain("## Context");
    expect(prompt).toContain("## Task");
    expect(prompt).toContain("## Requirements");
    expect(prompt).toContain("## Constraints");
    expect(prompt).toContain("## Output format");
    expect(prompt).toContain("## Things not to do");
    expect(prompt).toContain("Next.js, TypeScript");
    expect(prompt).toContain("JSON Formatter");
    expect(prompt).toContain("No backend");
    expect(prompt).toContain("client-side only");
    expect(prompt).toContain("Changed files and explanation");
    expect(prompt).toContain("Do not add extra features");
  });

  it("uses default constraints when constraints are empty", () => {
    const prompt = generateAiCodingPrompt({
      taskType: "Fix bug",
      techStack: "TypeScript",
      featureDescription: "Resolve a formatting issue",
      constraints: "",
      expectedOutput: "Patch summary",
    });

    expect(prompt).toContain("## Constraints");
    expect(prompt).toContain("Keep the solution simple and scoped");
    expect(prompt).toContain("Do not add extra features");
  });

  it("uses default output format when expected output is missing", () => {
    const prompt = generateAiCodingPrompt({
      taskType: "Refactor code",
      techStack: "Next.js",
      featureDescription: "Clean up a utility module",
      constraints: "Preserve behavior",
      expectedOutput: "   ",
    });

    expect(prompt).toContain("## Output format");
    expect(prompt).toContain("Return changed files");
    expect(prompt).toContain("brief explanation");
  });
});
