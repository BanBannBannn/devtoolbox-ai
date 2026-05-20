import { describe, expect, it } from "vitest";
import { generateQrCodeDataUrl } from "./qr-code-generator";

describe("generateQrCodeDataUrl", () => {
  it("generates a data URL for valid text", async () => {
    const result = await generateQrCodeDataUrl({
      value: "Hello from DevToolBox AI",
      size: 256,
      errorCorrectionLevel: "M",
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error(result.error);
    }

    expect(result.dataUrl).toMatch(/^data:image\/png;base64,/);
  });

  it("rejects empty input", async () => {
    const result = await generateQrCodeDataUrl({
      value: "   ",
      size: 256,
      errorCorrectionLevel: "M",
    });

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error("Expected empty input to fail.");
    }

    expect(result.error).toContain("Please enter text or a URL");
  });

  it("clamps size below min", async () => {
    const result = await generateQrCodeDataUrl({
      value: "https://example.com",
      size: 20,
      errorCorrectionLevel: "M",
    });

    expect(result.success).toBe(true);
  });

  it("clamps size above max", async () => {
    const result = await generateQrCodeDataUrl({
      value: "https://example.com",
      size: 5000,
      errorCorrectionLevel: "M",
    });

    expect(result.success).toBe(true);
  });

  it("accepts valid error correction levels", async () => {
    const levels = ["L", "M", "Q", "H"] as const;

    for (const errorCorrectionLevel of levels) {
      const result = await generateQrCodeDataUrl({
        value: "https://example.com",
        size: 256,
        errorCorrectionLevel,
      });

      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid error correction level if applicable", async () => {
    const result = await generateQrCodeDataUrl({
      value: "https://example.com",
      size: 256,
      errorCorrectionLevel: "X" as "M",
    });

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error("Expected invalid error correction level to fail.");
    }

    expect(result.error).toContain("Invalid error correction level");
  });
});
