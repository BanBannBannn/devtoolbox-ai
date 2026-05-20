"use client";

import { useState } from "react";
import { decodeJwt, type DecodeJwtResult } from "@/lib/jwt-decoder";

const emptyJson = "{}";

export function JwtDecoderTool() {
  const [jwt, setJwt] = useState("");
  const [result, setResult] = useState<DecodeJwtResult | null>(null);

  const decodedSuccessfully = result?.success === true;
  const headerJson = decodedSuccessfully
    ? JSON.stringify(result.header, null, 2)
    : emptyJson;
  const payloadJson = decodedSuccessfully
    ? JSON.stringify(result.payload, null, 2)
    : emptyJson;

  function handleDecode() {
    setResult(decodeJwt(jwt));
  }

  function handleClear() {
    setJwt("");
    setResult(null);
  }

  return (
    <section
      aria-labelledby="jwt-decoder-tool-heading"
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="jwt-decoder-tool-heading"
            className="text-2xl font-semibold tracking-tight text-slate-950"
          >
            Decode a JWT
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Paste a token to decode its Base64URL header and payload locally.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleDecode}
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Decode Token
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-900">
        This tool decodes JWT content only. It does not verify the signature or
        prove that the token is valid, trusted, or unmodified.
      </div>

      <div className="mt-6">
        <label htmlFor="jwt-input" className="text-sm font-semibold text-slate-900">
          JWT input
        </label>
        <textarea
          id="jwt-input"
          value={jwt}
          onChange={(event) => {
            setJwt(event.target.value);
            setResult(null);
          }}
          placeholder="Paste a JWT here."
          className="mt-2 min-h-36 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          spellCheck={false}
        />
      </div>

      <div aria-live="polite" className="mt-4">
        {result && !result.success ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {result.error}
          </p>
        ) : null}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div>
          <label
            htmlFor="jwt-header-output"
            className="text-sm font-semibold text-slate-900"
          >
            Decoded header
          </label>
          <textarea
            id="jwt-header-output"
            value={headerJson}
            readOnly
            className="mt-2 min-h-64 w-full resize-y rounded-md border border-slate-300 bg-slate-50 p-3 font-mono text-sm leading-6 text-slate-900 outline-none"
            spellCheck={false}
          />
        </div>

        <div>
          <label
            htmlFor="jwt-payload-output"
            className="text-sm font-semibold text-slate-900"
          >
            Decoded payload
          </label>
          <textarea
            id="jwt-payload-output"
            value={payloadJson}
            readOnly
            className="mt-2 min-h-64 w-full resize-y rounded-md border border-slate-300 bg-slate-50 p-3 font-mono text-sm leading-6 text-slate-900 outline-none"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-950">
            Signature presence
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {decodedSuccessfully
              ? result.signature
                ? "Signature segment is present."
                : "Signature segment is missing."
              : "Decode a token to check whether a signature segment is present."}
          </p>
        </div>

        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-950">
            Timestamp claims
          </h3>
          {decodedSuccessfully ? (
            <TimestampList timestamps={result.timestamps} />
          ) : (
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Decode a token to see `exp`, `iat`, and `nbf` as readable dates.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function TimestampList({
  timestamps,
}: {
  timestamps: { exp?: number; iat?: number; nbf?: number };
}) {
  const entries = [
    ["exp", timestamps.exp],
    ["iat", timestamps.iat],
    ["nbf", timestamps.nbf],
  ] as const;
  const availableEntries = entries.filter(([, value]) => value !== undefined);

  if (availableEntries.length === 0) {
    return (
      <p className="mt-2 text-sm leading-6 text-slate-600">
        No `exp`, `iat`, or `nbf` timestamp claims were found.
      </p>
    );
  }

  return (
    <dl className="mt-2 space-y-2 text-sm leading-6">
      {availableEntries.map(([label, value]) => (
        <div key={label}>
          <dt className="font-semibold text-slate-900">{label}</dt>
          <dd className="text-slate-600">{formatUnixTimestamp(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function formatUnixTimestamp(timestamp: number | undefined): string {
  if (timestamp === undefined) {
    return "";
  }

  const date = new Date(timestamp * 1000);

  if (Number.isNaN(date.getTime())) {
    return `${timestamp} seconds since Unix epoch`;
  }

  return `${date.toLocaleString()} (${timestamp})`;
}
