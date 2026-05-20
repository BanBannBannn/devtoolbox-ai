import { describe, expect, it } from "vitest";
import { decodeJwt } from "./jwt-decoder";

const validJwt =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkJhbiIsImFkbWluIjp0cnVlfQ.signature";

const jwtWithTimestamps =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDAwMDAwMDAsImlhdCI6MTY5OTk5MDAwMCwibmJmIjoxNjk5OTkwMDAwfQ.signature";

describe("decodeJwt", () => {
  it("decodes valid JWT header and payload", () => {
    const result = decodeJwt(validJwt);

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error(result.error);
    }

    expect(result.header).toEqual({
      alg: "HS256",
      typ: "JWT",
    });
    expect(result.payload).toEqual({
      sub: "1234567890",
      name: "Ban",
      admin: true,
    });
    expect(result.signature).toBe("signature");
  });

  it("rejects empty input", () => {
    const result = decodeJwt("   ");

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error("Expected empty input to fail.");
    }

    expect(result.error).toContain("Please enter a JWT");
  });

  it("rejects malformed token with fewer than 2 parts", () => {
    const result = decodeJwt("header-only");

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error("Expected malformed token to fail.");
    }

    expect(result.error).toContain("Invalid JWT format");
  });

  it("handles invalid base64/json", () => {
    const result = decodeJwt("not-json.eyJzdWIiOiIxMjMifQ.signature");

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error("Expected invalid JSON to fail.");
    }

    expect(result.error).toContain("Could not decode JWT");
  });

  it("extracts exp/iat/nbf if present", () => {
    const result = decodeJwt(jwtWithTimestamps);

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error(result.error);
    }

    expect(result.timestamps).toEqual({
      exp: 1700000000,
      iat: 1699990000,
      nbf: 1699990000,
    });
  });
});
