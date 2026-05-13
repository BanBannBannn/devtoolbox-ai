import { describe, expect, it } from "vitest";
import { formatJson } from "./json-formatter";

describe("formatJson", () => {
  it("formats a valid object with 2-space indentation", () => {
    expect(formatJson('{"name":"Ban"}')).toEqual({
      success: true,
      output: '{\n  "name": "Ban"\n}',
    });
  });

  it("formats a valid array with 2-space indentation", () => {
    expect(formatJson('[{"id":1},{"id":2}]')).toEqual({
      success: true,
      output:
        '[\n  {\n    "id": 1\n  },\n  {\n    "id": 2\n  }\n]',
    });
  });

  it("returns a helpful error for invalid JSON", () => {
    const result = formatJson('{"name":}');

    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid JSON");
  });

  it("returns a helpful error for empty input", () => {
    const result = formatJson("");

    expect(result.success).toBe(false);
    expect(result.error).toContain("Please enter JSON");
  });

  it("formats nested JSON", () => {
    expect(formatJson('{"user":{"name":"Ban","skills":["Next.js","AI"]}}')).toEqual({
      success: true,
      output:
        '{\n  "user": {\n    "name": "Ban",\n    "skills": [\n      "Next.js",\n      "AI"\n    ]\n  }\n}',
    });
  });

  it("trims surrounding whitespace before formatting", () => {
    expect(formatJson('   {"ok":true}   ')).toEqual({
      success: true,
      output: '{\n  "ok": true\n}',
    });
  });
});
