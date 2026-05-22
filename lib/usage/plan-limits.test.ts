import { describe, expect, it } from "vitest";
import {
  checkDocumentCountLimit,
  checkMaxDocumentLength,
  getCurrentMonthPeriodStartUtc,
  summarizeUsageEvents,
} from "./usage-calculations";

describe("usage plan limits", () => {
  it("calculates the current month period start in UTC", () => {
    const date = new Date("2026-05-22T23:30:00.000Z");

    expect(getCurrentMonthPeriodStartUtc(date)).toBe("2026-05-01");
  });

  it("keeps UTC month boundaries independent of local time", () => {
    const date = new Date("2026-06-01T00:30:00.000Z");

    expect(getCurrentMonthPeriodStartUtc(date)).toBe("2026-06-01");
  });

  it("allows document creation below the saved document limit", () => {
    expect(checkDocumentCountLimit(9, 10)).toBe(true);
  });

  it("blocks document creation at the saved document limit", () => {
    expect(checkDocumentCountLimit(10, 10)).toBe(false);
  });

  it("allows content at the max document length", () => {
    expect(checkMaxDocumentLength(20000, 20000)).toBe(true);
  });

  it("blocks content over the max document length", () => {
    expect(checkMaxDocumentLength(20001, 20000)).toBe(false);
  });

  it("summarizes usage event quantities by type", () => {
    expect(
      summarizeUsageEvents([
        { event_type: "rag_message", quantity: 2 },
        { event_type: "rag_message", quantity: 3 },
        { event_type: "vectorize_job", quantity: 1 },
      ]),
    ).toMatchObject({
      rag_message: 5,
      vectorize_job: 1,
      embedding_tokens: 0,
    });
  });
});
