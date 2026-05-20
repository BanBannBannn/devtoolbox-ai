const minUuidCount = 1;
const maxUuidCount = 100;

export function generateUuidV4List(
  count: number,
  uppercase: boolean,
): string[] {
  const safeCount = normalizeCount(count);

  return Array.from({ length: safeCount }, () => {
    const uuid = createUuidV4();

    return uppercase ? uuid.toUpperCase() : uuid.toLowerCase();
  });
}

function normalizeCount(count: number): number {
  if (!Number.isFinite(count)) {
    return minUuidCount;
  }

  const wholeCount = Math.floor(count);

  if (wholeCount < minUuidCount) {
    return minUuidCount;
  }

  return Math.min(wholeCount, maxUuidCount);
}

function createUuidV4(): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  if (!globalThis.crypto?.getRandomValues) {
    throw new Error("UUID generation requires Web Crypto support.");
  }

  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  );

  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join(""),
  ].join("-");
}
