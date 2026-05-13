import { describe, expect, it } from "vitest";
import { generateReadme } from "./readme-generator";

describe("generateReadme", () => {
  it("generates a README with all fields", () => {
    const readme = generateReadme({
      projectName: "DevToolBox AI",
      description: "Free developer tools for students and software engineers.",
      techStack: "Next.js, TypeScript, Tailwind CSS",
      installCommand: "npm install",
      runCommand: "npm run dev",
      features: "JSON Formatter\nREADME Generator",
    });

    expect(readme).toContain("# DevToolBox AI");
    expect(readme).toContain(
      "Free developer tools for students and software engineers.",
    );
    expect(readme).toContain("## Tech Stack");
    expect(readme).toContain("Next.js");
    expect(readme).toContain("## Installation");
    expect(readme).toContain("npm install");
    expect(readme).toContain("## Usage");
    expect(readme).toContain("npm run dev");
    expect(readme).toContain("- JSON Formatter");
    expect(readme).toContain("- README Generator");
  });

  it("uses Untitled Project when the project name is missing", () => {
    const readme = generateReadme({
      projectName: "   ",
      description: "",
      techStack: "",
      installCommand: "",
      runCommand: "",
      features: "",
    });

    expect(readme).toContain("# Untitled Project");
  });

  it("handles empty features without breaking the README", () => {
    const readme = generateReadme({
      projectName: "No Feature Project",
      description: "A project without a feature list yet.",
      techStack: "TypeScript",
      installCommand: "npm install",
      runCommand: "npm run dev",
      features: "",
    });

    expect(readme).toContain("## Features");
    expect(readme).toContain("Add your project features here.");
  });

  it("wraps commands with special characters in markdown code blocks", () => {
    const readme = generateReadme({
      projectName: "Turbo App",
      description: "",
      techStack: "",
      installCommand: "pnpm install",
      runCommand: "pnpm dev --turbo",
      features: "",
    });

    expect(readme).toContain("```bash\npnpm install\n```");
    expect(readme).toContain("```bash\npnpm dev --turbo\n```");
  });
});
