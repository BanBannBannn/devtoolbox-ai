import { describe, expect, it } from "vitest";
import {
  calculateReplacementChunkTotal,
  getVectorizationUserSafeError,
  isChunkTotalWithinLimit,
  isVectorizeQuotaAvailable,
} from "./vectorize-calculations";

describe("vectorize document helpers", () => {
  it("calculates replacement total chunks", () => {
    expect(
      calculateReplacementChunkTotal({
        currentTotalChunks: 20,
        oldChunksForDocument: 6,
        newChunkCount: 4,
      }),
    ).toBe(18);
  });

  it("detects exhausted vectorize quota before provider work", () => {
    expect(isVectorizeQuotaAvailable({ used: 2, limit: 3 })).toBe(true);
    expect(isVectorizeQuotaAvailable({ used: 3, limit: 3 })).toBe(false);
  });

  it("checks max total chunks after replacement", () => {
    expect(isChunkTotalWithinLimit({ newTotal: 100, maxChunksTotal: 100 })).toBe(
      true,
    );
    expect(isChunkTotalWithinLimit({ newTotal: 101, maxChunksTotal: 100 })).toBe(
      false,
    );
  });

  it("maps unknown errors to a user-safe fallback", () => {
    expect(getVectorizationUserSafeError(null)).toBe(
      "Could not vectorize the document. Please try again later.",
    );
  });

  it("maps known errors to concise user-safe messages", () => {
    expect(getVectorizationUserSafeError(new Error("Could not save chunks."))).toBe(
      "Could not save chunks.",
    );
  });
});
