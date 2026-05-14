import { describe, expect, it } from "vitest";
import { getGitCommandHelp } from "./git-command-helper";

describe("getGitCommandHelp", () => {
  it("returns help for checking status", () => {
    const result = getGitCommandHelp({ goal: "check status" });

    expect(result.command).toContain("git status");
    expect(result.explanation).toMatch(/working tree|changed files/i);
    expect(result.isRisky).toBe(false);
    expect(result.warning).toBeUndefined();
  });

  it("returns help for creating a branch", () => {
    const result = getGitCommandHelp({
      goal: "create a new branch",
      branchName: "feature/json-formatter",
    });

    expect(result.command).toContain("git checkout -b feature/json-formatter");
    expect(result.explanation).toContain("new branch");
    expect(result.isRisky).toBe(false);
  });

  it("returns a warning for undoing the last commit while keeping changes", () => {
    const result = getGitCommandHelp({
      goal: "undo last commit but keep changes",
    });

    expect(result.command).toContain("git reset --soft HEAD~1");
    expect(result.warning).toBeDefined();
    expect(result.isRisky).toBe(true);
  });

  it("returns a warning for discarding local file changes", () => {
    const result = getGitCommandHelp({
      goal: "discard local file changes",
      filePath: "app/page.tsx",
    });

    expect(result.command).toContain("git checkout -- app/page.tsx");
    expect(result.explanation).toMatch(/changes may be lost/i);
    expect(result.warning).toBeDefined();
    expect(result.isRisky).toBe(true);
  });

  it("uses a fallback branch name when branch name is missing", () => {
    const result = getGitCommandHelp({ goal: "switch branch" });

    expect(result.command).toContain("git checkout branch-name");
    expect(result.explanation).toContain("branch-name");
    expect(result.isRisky).toBe(false);
  });
});
