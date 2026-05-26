import { describe, expect, it } from "vitest";
import { isRagAdminEmail, parseRagAdminEmails } from "./rag-admin";

describe("rag admin helpers", () => {
  it("parses admin emails with trimming and lowercasing", () => {
    expect(
      parseRagAdminEmails(" Admin@Example.com, second@example.com ,, "),
    ).toEqual(["admin@example.com", "second@example.com"]);
  });

  it("matches admin email case-insensitively", () => {
    expect(
      isRagAdminEmail("ADMIN@example.com", {
        RAG_ADMIN_EMAILS: "admin@example.com",
      }),
    ).toBe(true);
  });

  it("rejects missing and non-admin emails", () => {
    expect(isRagAdminEmail(null, { RAG_ADMIN_EMAILS: "admin@example.com" }))
      .toBe(false);
    expect(
      isRagAdminEmail("user@example.com", {
        RAG_ADMIN_EMAILS: "admin@example.com",
      }),
    ).toBe(false);
  });
});
