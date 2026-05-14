import { describe, expect, it } from "vitest";
import { generateTestCaseChecklist } from "./test-case-checklist-generator";

describe("generateTestCaseChecklist", () => {
  it("generates a checklist with all fields", () => {
    const checklist = generateTestCaseChecklist({
      featureName: "JSON Formatter",
      mainUserFlow:
        "User pastes JSON, clicks format, sees formatted output.",
      edgeCases: "Empty input\nInvalid JSON\nLarge JSON",
      platform: "Web",
    });

    expect(checklist).toContain("# QA Checklist: JSON Formatter");
    expect(checklist).toContain("## Smoke Tests");
    expect(checklist).toContain("## Happy Path Tests");
    expect(checklist).toContain("User pastes JSON");
    expect(checklist).toContain("## Edge Case Tests");
    expect(checklist).toContain("- [ ] Empty input");
    expect(checklist).toContain("- [ ] Invalid JSON");
    expect(checklist).toContain("- [ ] Large JSON");
    expect(checklist).toContain("## Error Handling Tests");
    expect(checklist).toContain("## Mobile/Responsive Tests");
    expect(checklist).toContain("## Accessibility Checks");
    expect(checklist).toContain("## Regression Checks");
    expect(checklist).toContain("Web");
  });

  it("uses Untitled Feature when the feature name is missing", () => {
    const checklist = generateTestCaseChecklist({
      featureName: "   ",
      mainUserFlow: "",
      edgeCases: "",
      platform: "",
    });

    expect(checklist).toContain("# QA Checklist: Untitled Feature");
  });

  it("uses generic edge cases when edge cases are empty", () => {
    const checklist = generateTestCaseChecklist({
      featureName: "Login",
      mainUserFlow: "User signs in.",
      edgeCases: "",
      platform: "Web",
    });

    expect(checklist).toContain("## Edge Case Tests");
    expect(checklist).toContain("- [ ] Empty or missing input is handled.");
    expect(checklist).toContain("- [ ] Invalid input shows a helpful message.");
    expect(checklist).toContain("- [ ] Very large or unexpected input does not break the feature.");
  });
});
