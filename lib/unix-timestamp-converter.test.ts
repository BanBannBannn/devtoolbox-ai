import { describe, expect, it } from "vitest";
import {
  dateToTimestamp,
  timestampToDate,
} from "./unix-timestamp-converter";

describe("unix timestamp converter", () => {
  it("converts seconds timestamp to ISO date", () => {
    expect(timestampToDate("1700000000", "seconds")).toEqual({
      success: true,
      date: "2023-11-14T22:13:20.000Z",
    });
  });

  it("converts milliseconds timestamp to ISO date", () => {
    expect(timestampToDate("1700000000000", "milliseconds")).toEqual({
      success: true,
      date: "2023-11-14T22:13:20.000Z",
    });
  });

  it("converts ISO date to seconds timestamp", () => {
    expect(dateToTimestamp("2023-11-14T22:13:20.000Z", "seconds")).toEqual({
      success: true,
      timestamp: 1700000000,
    });
  });

  it("converts ISO date to milliseconds timestamp", () => {
    expect(dateToTimestamp("2023-11-14T22:13:20.000Z", "milliseconds")).toEqual({
      success: true,
      timestamp: 1700000000000,
    });
  });

  it("handles invalid timestamp input", () => {
    const result = timestampToDate("not-a-number", "seconds");

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error("Expected invalid timestamp to fail.");
    }

    expect(result.error).toContain("Invalid timestamp");
  });

  it("handles invalid date input", () => {
    const result = dateToTimestamp("not-a-date", "seconds");

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error("Expected invalid date to fail.");
    }

    expect(result.error).toContain("Invalid date");
  });
});
