import { describe, expect, it } from "vitest";
import {
  getRoleInputFromFormData,
  getRoleUpdateErrorMessage,
  isValidUserRole,
  shouldBlockLastAdminDemotion,
} from "./admin-users";

describe("admin user role helpers", () => {
  it("validates allowed roles only", () => {
    expect(isValidUserRole("user")).toBe(true);
    expect(isValidUserRole("moderator")).toBe(true);
    expect(isValidUserRole("admin")).toBe(true);
    expect(isValidUserRole("owner")).toBe(false);
    expect(isValidUserRole(null)).toBe(false);
  });

  it("parses role update form data without trusting invalid roles", () => {
    const validForm = new FormData();
    validForm.set("user_id", " user-1 ");
    validForm.set("role", "moderator");

    expect(getRoleInputFromFormData(validForm)).toEqual({
      userId: "user-1",
      role: "moderator",
    });

    const invalidForm = new FormData();
    invalidForm.set("user_id", "user-1");
    invalidForm.set("role", "super_admin");

    expect(getRoleInputFromFormData(invalidForm)).toEqual({
      userId: "user-1",
      role: null,
    });
  });

  it("blocks demoting the last admin", () => {
    expect(
      shouldBlockLastAdminDemotion({
        currentRole: "admin",
        nextRole: "user",
        adminCount: 1,
      }),
    ).toBe(true);
    expect(
      shouldBlockLastAdminDemotion({
        currentRole: "admin",
        nextRole: "moderator",
        adminCount: 1,
      }),
    ).toBe(true);
  });

  it("allows admin demotion when another admin remains", () => {
    expect(
      shouldBlockLastAdminDemotion({
        currentRole: "admin",
        nextRole: "moderator",
        adminCount: 2,
      }),
    ).toBe(false);
  });

  it("does not block non-demotion role changes", () => {
    expect(
      shouldBlockLastAdminDemotion({
        currentRole: "user",
        nextRole: "moderator",
        adminCount: 1,
      }),
    ).toBe(false);
    expect(
      shouldBlockLastAdminDemotion({
        currentRole: "admin",
        nextRole: "admin",
        adminCount: 1,
      }),
    ).toBe(false);
  });

  it("maps safe role update errors", () => {
    expect(getRoleUpdateErrorMessage("last_admin")).toBe(
      "The last admin cannot be demoted.",
    );
    expect(getRoleUpdateErrorMessage("invalid_role")).toBe(
      "Select a valid role.",
    );
    expect(getRoleUpdateErrorMessage("unknown")).toBeUndefined();
  });
});
