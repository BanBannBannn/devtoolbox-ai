"use client";

import { useState } from "react";
import {
  dateToTimestamp,
  timestampToDate,
  type TimestampUnit,
} from "@/lib/unix-timestamp-converter";

type ConverterMode = "timestamp-to-date" | "date-to-timestamp";

type ConversionResult = {
  seconds: number;
  milliseconds: number;
  localDateTime: string;
  isoDateTime: string;
  utcDateTime: string;
};

const modeOptions: { value: ConverterMode; label: string }[] = [
  { value: "timestamp-to-date", label: "Unix timestamp to date" },
  { value: "date-to-timestamp", label: "Date to Unix timestamp" },
];

const unitOptions: { value: TimestampUnit; label: string }[] = [
  { value: "seconds", label: "Seconds" },
  { value: "milliseconds", label: "Milliseconds" },
];

export function UnixTimestampConverterTool() {
  const [mode, setMode] = useState<ConverterMode>("timestamp-to-date");
  const [unit, setUnit] = useState<TimestampUnit>("seconds");
  const [timestampInput, setTimestampInput] = useState("1700000000");
  const [dateTimeInput, setDateTimeInput] = useState(getLocalDateTimeInputValue());
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const formattedResult = result ? formatResultForCopy(result) : "";

  function handleConvert() {
    const conversionResult =
      mode === "timestamp-to-date"
        ? convertTimestampToResult(timestampInput, unit)
        : convertDateToResult(dateTimeInput);

    if (conversionResult.success) {
      setResult(conversionResult.result);
      setError("");
      setStatus("Conversion complete.");
      return;
    }

    setResult(null);
    setError(conversionResult.error);
    setStatus("");
  }

  function handleUseCurrentTime() {
    const now = new Date();
    const milliseconds = now.getTime();

    setTimestampInput(
      unit === "seconds"
        ? String(Math.floor(milliseconds / 1000))
        : String(milliseconds),
    );
    setDateTimeInput(getLocalDateTimeInputValue(now));
    setResult(createResultFromDate(now));
    setError("");
    setStatus("Current time loaded.");
  }

  async function handleCopyResult() {
    if (!formattedResult) {
      return;
    }

    try {
      await navigator.clipboard.writeText(formattedResult);
      setStatus("Result copied.");
    } catch {
      setStatus("Copy failed. Select the result and copy it manually.");
    }
  }

  function handleClear() {
    setMode("timestamp-to-date");
    setUnit("seconds");
    setTimestampInput("");
    setDateTimeInput("");
    setResult(null);
    setError("");
    setStatus("");
  }

  return (
    <section
      aria-labelledby="unix-timestamp-converter-tool-heading"
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="unix-timestamp-converter-tool-heading"
            className="text-2xl font-semibold tracking-tight text-slate-950"
          >
            Convert timestamps
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Convert Unix time to readable dates or convert a date/time back to
            Unix timestamps.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleConvert}
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Convert
          </button>
          <button
            type="button"
            onClick={handleUseCurrentTime}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100"
          >
            Use Current Time
          </button>
          <button
            type="button"
            onClick={handleCopyResult}
            disabled={!formattedResult}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Copy Result
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

      <div className="mt-6 grid gap-5 lg:grid-cols-[20rem_1fr]">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="timestamp-converter-mode"
              className="text-sm font-semibold text-slate-900"
            >
              Mode
            </label>
            <select
              id="timestamp-converter-mode"
              value={mode}
              onChange={(event) => {
                setMode(event.target.value as ConverterMode);
                setResult(null);
                setError("");
                setStatus("");
              }}
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            >
              {modeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="timestamp-unit"
              className="text-sm font-semibold text-slate-900"
            >
              Timestamp unit
            </label>
            <select
              id="timestamp-unit"
              value={unit}
              onChange={(event) => {
                setUnit(event.target.value as TimestampUnit);
                setResult(null);
                setError("");
                setStatus("");
              }}
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            >
              {unitOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {mode === "timestamp-to-date" ? (
            <div>
              <label
                htmlFor="timestamp-input"
                className="text-sm font-semibold text-slate-900"
              >
                Unix timestamp
              </label>
              <input
                id="timestamp-input"
                value={timestampInput}
                onChange={(event) => {
                  setTimestampInput(event.target.value);
                  setResult(null);
                  setError("");
                  setStatus("");
                }}
                placeholder={unit === "seconds" ? "1700000000" : "1700000000000"}
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                spellCheck={false}
              />
            </div>
          ) : (
            <div>
              <label
                htmlFor="date-time-input"
                className="text-sm font-semibold text-slate-900"
              >
                Date/time
              </label>
              <input
                id="date-time-input"
                type="datetime-local"
                value={dateTimeInput}
                onChange={(event) => {
                  setDateTimeInput(event.target.value);
                  setResult(null);
                  setError("");
                  setStatus("");
                }}
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          )}
        </div>

        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-950">Result</h3>
          {result ? (
            <dl className="mt-4 grid gap-3">
              <ResultRow label="Unix timestamp in seconds" value={String(result.seconds)} />
              <ResultRow
                label="Unix timestamp in milliseconds"
                value={String(result.milliseconds)}
              />
              <ResultRow label="Local date/time" value={result.localDateTime} />
              <ResultRow label="ISO date/time" value={result.isoDateTime} />
              <ResultRow label="UTC date/time" value={result.utcDateTime} />
            </dl>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Enter a timestamp or date/time, then click Convert.
            </p>
          )}

          <div aria-live="polite" className="mt-4 space-y-2">
            {error ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {error}
              </p>
            ) : null}
            {status ? (
              <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                {status}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 break-words font-mono text-sm font-semibold text-slate-950">
        {value}
      </dd>
    </div>
  );
}

function convertTimestampToResult(
  timestamp: string,
  unit: TimestampUnit,
):
  | { success: true; result: ConversionResult }
  | { success: false; error: string } {
  const convertedDate = timestampToDate(timestamp, unit);

  if (!convertedDate.success) {
    return convertedDate;
  }

  return {
    success: true,
    result: createResultFromDate(new Date(convertedDate.date)),
  };
}

function convertDateToResult(
  dateInput: string,
): { success: true; result: ConversionResult } | { success: false; error: string } {
  const convertedTimestamp = dateToTimestamp(dateInput, "milliseconds");

  if (!convertedTimestamp.success) {
    return convertedTimestamp;
  }

  return {
    success: true,
    result: createResultFromDate(new Date(convertedTimestamp.timestamp)),
  };
}

function createResultFromDate(date: Date): ConversionResult {
  const milliseconds = date.getTime();
  const seconds = Math.floor(milliseconds / 1000);

  return {
    seconds,
    milliseconds,
    localDateTime: date.toLocaleString(),
    isoDateTime: date.toISOString(),
    utcDateTime: date.toUTCString(),
  };
}

function formatResultForCopy(result: ConversionResult): string {
  return [
    `Unix timestamp in seconds: ${result.seconds}`,
    `Unix timestamp in milliseconds: ${result.milliseconds}`,
    `Local date/time: ${result.localDateTime}`,
    `ISO date/time: ${result.isoDateTime}`,
    `UTC date/time: ${result.utcDateTime}`,
  ].join("\n");
}

function getLocalDateTimeInputValue(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
