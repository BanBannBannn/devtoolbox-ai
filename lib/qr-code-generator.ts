import { toDataURL, type QRCodeErrorCorrectionLevel } from "qrcode";

export type QrCodeErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export type GenerateQrCodeInput = {
  value: string;
  size: number;
  errorCorrectionLevel: QrCodeErrorCorrectionLevel;
};

export type GenerateQrCodeResult =
  | {
      success: true;
      dataUrl: string;
    }
  | {
      success: false;
      error: string;
    };

const minQrSize = 128;
const maxQrSize = 1024;
const validErrorCorrectionLevels = new Set<string>(["L", "M", "Q", "H"]);

export async function generateQrCodeDataUrl(
  input: GenerateQrCodeInput,
): Promise<GenerateQrCodeResult> {
  const value = input.value.trim();

  if (!value) {
    return {
      success: false,
      error: "Please enter text or a URL to generate a QR code.",
    };
  }

  if (!validErrorCorrectionLevels.has(input.errorCorrectionLevel)) {
    return {
      success: false,
      error: "Invalid error correction level. Use L, M, Q, or H.",
    };
  }

  try {
    const dataUrl = await toDataURL(value, {
      errorCorrectionLevel:
        input.errorCorrectionLevel as QRCodeErrorCorrectionLevel,
      margin: 2,
      type: "image/png",
      width: normalizeSize(input.size),
    });

    return {
      success: true,
      dataUrl,
    };
  } catch {
    return {
      success: false,
      error: "Could not generate QR code. Try shorter text or a different option.",
    };
  }
}

function normalizeSize(size: number): number {
  if (!Number.isFinite(size)) {
    return minQrSize;
  }

  const wholeSize = Math.round(size);

  return Math.min(Math.max(wholeSize, minQrSize), maxQrSize);
}
