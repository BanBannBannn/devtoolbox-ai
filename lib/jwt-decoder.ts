export type JwtJsonValue =
  | string
  | number
  | boolean
  | null
  | JwtJsonValue[]
  | { [key: string]: JwtJsonValue };

export type JwtJsonObject = Record<string, JwtJsonValue>;

export type JwtTimestamps = {
  exp?: number;
  iat?: number;
  nbf?: number;
};

export type DecodeJwtResult =
  | {
      success: true;
      header: JwtJsonObject;
      payload: JwtJsonObject;
      signature: string;
      timestamps: JwtTimestamps;
    }
  | {
      success: false;
      error: string;
    };

export function decodeJwt(jwt: string): DecodeJwtResult {
  const trimmedJwt = jwt.trim();

  if (!trimmedJwt) {
    return {
      success: false,
      error: "Please enter a JWT to decode.",
    };
  }

  const parts = trimmedJwt.split(".");

  if (parts.length < 2) {
    return {
      success: false,
      error: "Invalid JWT format. Expected at least header and payload parts.",
    };
  }

  if (parts.length > 3) {
    return {
      success: false,
      error: "Invalid JWT format. Expected header, payload, and optional signature.",
    };
  }

  const [encodedHeader, encodedPayload, signature = ""] = parts;

  try {
    const header = decodeJwtPart(encodedHeader, "header");
    const payload = decodeJwtPart(encodedPayload, "payload");

    return {
      success: true,
      header,
      payload,
      signature,
      timestamps: extractTimestamps(payload),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Could not decode JWT. Check the token and try again.",
    };
  }
}

function decodeJwtPart(encodedPart: string, partName: string): JwtJsonObject {
  if (!encodedPart) {
    throw new Error(`Could not decode JWT ${partName}. The part is empty.`);
  }

  try {
    const decodedPart = decodeBase64Url(encodedPart);
    const parsedValue: unknown = JSON.parse(decodedPart);

    if (!isJsonObject(parsedValue)) {
      throw new Error(`Decoded JWT ${partName} is not a JSON object.`);
    }

    return parsedValue;
  } catch {
    throw new Error(`Could not decode JWT ${partName}. Check its Base64URL JSON.`);
  }
}

function decodeBase64Url(input: string): string {
  if (!/^[A-Za-z0-9_-]+$/.test(input)) {
    throw new Error("Invalid Base64URL characters.");
  }

  const base64 = input.replaceAll("-", "+").replaceAll("_", "/");
  const paddedBase64 = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );
  const binary = globalThis.atob(paddedBase64);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

function isJsonObject(value: unknown): value is JwtJsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractTimestamps(payload: JwtJsonObject): JwtTimestamps {
  return {
    ...extractTimestamp(payload, "exp"),
    ...extractTimestamp(payload, "iat"),
    ...extractTimestamp(payload, "nbf"),
  };
}

function extractTimestamp(
  payload: JwtJsonObject,
  key: keyof JwtTimestamps,
): JwtTimestamps {
  const value = payload[key];

  return typeof value === "number" && Number.isFinite(value)
    ? { [key]: value }
    : {};
}
