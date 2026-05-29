import { describe, expect, it } from "vitest";
import {
  getReportErrorMessage,
  getReportStatusLabel,
  isReportReason,
  isReportStatus,
  sortReportsForModeration,
  validateReportDetails,
  type ModerationReport,
} from "./reports";

const baseReport: ModerationReport = {
  id: "report-1",
  reporterDisplayName: "Ada",
  targetType: "post",
  targetId: "post-1",
  targetLabel: "Post: Hello",
  targetHref: "/blog/hello",
  targetSnippet: null,
  reason: "spam",
  details: null,
  status: "open",
  createdAt: "2026-05-29T00:00:00.000Z",
  reviewedAt: null,
};

describe("blog report helpers", () => {
  it("validates report reasons", () => {
    expect(isReportReason("spam")).toBe(true);
    expect(isReportReason("sexual_content")).toBe(true);
    expect(isReportReason("bad_reason")).toBe(false);
    expect(isReportReason(null)).toBe(false);
  });

  it("validates report statuses", () => {
    expect(isReportStatus("open")).toBe(true);
    expect(isReportStatus("action_taken")).toBe(true);
    expect(isReportStatus("pending")).toBe(false);
  });

  it("validates report details length", () => {
    expect(validateReportDetails(" Helpful context ")).toEqual({
      success: true,
      details: "Helpful context",
    });
    expect(validateReportDetails("   ")).toEqual({
      success: true,
      details: null,
    });
    expect(validateReportDetails("a".repeat(1001))).toMatchObject({
      success: false,
    });
  });

  it("sorts open reports first and newest first inside groups", () => {
    expect(
      sortReportsForModeration([
        {
          ...baseReport,
          id: "reviewed-old",
          status: "reviewed",
          createdAt: "2026-05-27T00:00:00.000Z",
        },
        {
          ...baseReport,
          id: "open-new",
          status: "open",
          createdAt: "2026-05-29T00:00:00.000Z",
        },
        {
          ...baseReport,
          id: "open-old",
          status: "open",
          createdAt: "2026-05-28T00:00:00.000Z",
        },
      ]).map((report) => report.id),
    ).toEqual(["open-new", "open-old", "reviewed-old"]);
  });

  it("maps safe report labels and errors", () => {
    expect(getReportStatusLabel("action_taken")).toBe("Action taken");
    expect(getReportErrorMessage("invalid_reason")).toBe(
      "Select a valid report reason.",
    );
    expect(getReportErrorMessage("unknown")).toBeUndefined();
  });
});
