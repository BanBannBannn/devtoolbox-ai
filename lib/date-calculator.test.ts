import { describe, expect, it } from "vitest";
import {
  addDaysToDate,
  addMonthsToDate,
  addYearsToDate,
  daysBetweenDates,
} from "./date-calculator";

describe("date calculator", () => {
  it("calculates 30 days from a fixed date", () => {
    expect(addDaysToDate("2026-01-01", 30)).toBe("2026-01-31");
  });

  it("subtracts days", () => {
    expect(addDaysToDate("2026-01-10", -5)).toBe("2026-01-05");
  });

  it("adds months", () => {
    expect(addMonthsToDate("2026-01-15", 2)).toBe("2026-03-15");
  });

  it("adds years", () => {
    expect(addYearsToDate("2024-02-29", 1)).toBe("2025-02-28");
  });

  it("calculates days between two dates", () => {
    expect(daysBetweenDates("2026-01-01", "2026-01-31")).toBe(30);
  });

  it("handles invalid date input", () => {
    expect(() => addDaysToDate("not-a-date", 1)).toThrow("Invalid date");
  });
});
