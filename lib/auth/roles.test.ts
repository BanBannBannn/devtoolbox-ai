import { describe, expect, it } from "vitest";
import {
  RolePermissionError,
  assertAdmin,
  assertModeratorOrAdmin,
  canManageUserRoles,
  canModerateBlog,
  isAdmin,
  isModerator,
  isModeratorOrAdmin,
  parseUserRole,
} from "./roles";

describe("role helpers", () => {
  it("parses supported roles", () => {
    expect(parseUserRole("user")).toBe("user");
    expect(parseUserRole("moderator")).toBe("moderator");
    expect(parseUserRole("admin")).toBe("admin");
  });

  it("falls back to user for invalid or missing roles", () => {
    expect(parseUserRole("owner")).toBe("user");
    expect(parseUserRole(null)).toBe("user");
    expect(parseUserRole(undefined)).toBe("user");
    expect(parseUserRole(123)).toBe("user");
  });

  it("does not elevate invalid roles", () => {
    const parsedRole = parseUserRole("super_admin");

    expect(parsedRole).toBe("user");
    expect(canModerateBlog(parsedRole)).toBe(false);
    expect(canManageUserRoles(parsedRole)).toBe(false);
  });

  it("detects moderator role only", () => {
    expect(isModerator("user")).toBe(false);
    expect(isModerator("moderator")).toBe(true);
    expect(isModerator("admin")).toBe(false);
  });

  it("detects moderator or admin roles", () => {
    expect(isModeratorOrAdmin("user")).toBe(false);
    expect(isModeratorOrAdmin("moderator")).toBe(true);
    expect(isModeratorOrAdmin("admin")).toBe(true);
  });

  it("detects admin role", () => {
    expect(isAdmin("user")).toBe(false);
    expect(isAdmin("moderator")).toBe(false);
    expect(isAdmin("admin")).toBe(true);
  });

  it("allows blog moderation for moderators and admins only", () => {
    expect(canModerateBlog("user")).toBe(false);
    expect(canModerateBlog("moderator")).toBe(true);
    expect(canModerateBlog("admin")).toBe(true);
  });

  it("allows user role management for admins only", () => {
    expect(canManageUserRoles("user")).toBe(false);
    expect(canManageUserRoles("moderator")).toBe(false);
    expect(canManageUserRoles("admin")).toBe(true);
  });

  it("throws for moderator/admin permission failures", () => {
    expect(() => assertModeratorOrAdmin("user")).toThrow(RolePermissionError);
    expect(() => assertModeratorOrAdmin("moderator")).not.toThrow();
    expect(() => assertModeratorOrAdmin("admin")).not.toThrow();
  });

  it("throws for admin permission failures", () => {
    expect(() => assertAdmin("user")).toThrow(RolePermissionError);
    expect(() => assertAdmin("moderator")).toThrow(RolePermissionError);
    expect(() => assertAdmin("admin")).not.toThrow();
  });
});
