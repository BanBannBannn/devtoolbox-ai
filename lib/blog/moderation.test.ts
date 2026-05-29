import { describe, expect, it } from "vitest";
import {
  canArchiveFromStatus,
  canPublishFromStatus,
  canRejectFromStatus,
  validateRejectionReason,
} from "./moderation";

describe("blog moderation helpers", () => {
  it("allows only pending review posts to be published", () => {
    expect(canPublishFromStatus("pending_review")).toBe(true);
    expect(canPublishFromStatus("draft")).toBe(false);
    expect(canPublishFromStatus("rejected")).toBe(false);
    expect(canPublishFromStatus("published")).toBe(false);
    expect(canPublishFromStatus("archived")).toBe(false);
  });

  it("allows only pending review posts to be rejected", () => {
    expect(canRejectFromStatus("pending_review")).toBe(true);
    expect(canRejectFromStatus("draft")).toBe(false);
    expect(canRejectFromStatus("published")).toBe(false);
  });

  it("allows only published posts to be archived", () => {
    expect(canArchiveFromStatus("published")).toBe(true);
    expect(canArchiveFromStatus("pending_review")).toBe(false);
    expect(canArchiveFromStatus("archived")).toBe(false);
  });

  it("validates rejection reasons", () => {
    expect(validateRejectionReason("Needs a clearer code sample.")).toEqual({
      success: true,
      reason: "Needs a clearer code sample.",
    });
    expect(validateRejectionReason("   ")).toMatchObject({
      success: false,
    });
    expect(validateRejectionReason("a".repeat(1001))).toMatchObject({
      success: false,
    });
  });
});
