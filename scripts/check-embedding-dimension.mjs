import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const DEFAULT_MODEL = "nvidia/llama-nemotron-embed-vl-1b-v2:free";
const OPENROUTER_EMBEDDINGS_URL =
  "https://openrouter.ai/api/v1/embeddings";
const TEST_INPUT = "DevToolBox AI embedding dimension test.";

loadLocalEnvFile(".env.local");
loadLocalEnvFile(".env");

const apiKey = process.env.OPENROUTER_API_KEY;
const model = process.env.RAG_EMBEDDING_MODEL || DEFAULT_MODEL;

if (!apiKey) {
  exitWithError(
    "Missing OPENROUTER_API_KEY. Add it to your local environment before running this preflight script.",
  );
}

const headers = {
  Authorization: `Bearer ${apiKey}`,
  "Content-Type": "application/json",
  "X-Title": "DevToolBox AI",
};

if (process.env.NEXT_PUBLIC_SITE_URL) {
  headers["HTTP-Referer"] = process.env.NEXT_PUBLIC_SITE_URL;
}

try {
  const response = await fetch(OPENROUTER_EMBEDDINGS_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      input: TEST_INPUT,
      encoding_format: "float",
    }),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      getProviderErrorMessage(body) ||
      `OpenRouter embeddings request failed with status ${response.status}.`;
    exitWithError(message);
  }

  const embedding = body?.data?.[0]?.embedding;

  if (!Array.isArray(embedding)) {
    exitWithError(
      "OpenRouter response did not contain data[0].embedding as an array.",
    );
  }

  console.log("Selected model:", model);
  console.log("Embedding dimension:", embedding.length);
  console.log("First 5 values:", embedding.slice(0, 5));
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  exitWithError(`Embedding dimension preflight failed: ${message}`);
}

function loadLocalEnvFile(filename) {
  const envPath = resolve(process.cwd(), filename);

  if (!existsSync(envPath)) {
    return;
  }

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = stripEnvQuotes(trimmed.slice(separatorIndex + 1).trim());

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function stripEnvQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function getProviderErrorMessage(body) {
  if (!body || typeof body !== "object") {
    return null;
  }

  const error = body.error;

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && typeof error.message === "string") {
    return error.message;
  }

  return null;
}

function exitWithError(message) {
  console.error(message);
  process.exit(1);
}
