"use client";

import { useState } from "react";
import {
  addDaysToDate,
  addMonthsToDate,
  addYearsToDate,
  daysBetweenDates,
} from "@/lib/date-calculator";

type Mode = "days" | "months" | "years" | "between";

const modeOptions: { value: Mode; label: string }[] = [
  { value: "days", label: "Add/subtract days" },
  { value: "months", label: "Add/subtract months" },
  { value: "years", label: "Add/subtract years" },
  { value: "between", label: "Days between dates" },
];

export function DateCalculatorTool() {
  const [mode, setMode] = useState<Mode>("days");
  const [date, setDate] = useState(getTodayIsoDate());
  const [endDate, setEndDate] = useState("");
  const [amount, setAmount] = useState("30");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  function handleCalculate() {
    try {
      const calculatedResult =
        mode === "between"
          ? `${daysBetweenDates(date, endDate)} days`
          : calculateDateResult(mode, date, Number(amount));

      setResult(calculatedResult);
      setError("");
    } catch (caughtError) {
      setResult("");
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to calculate the date.",
      );
    }
  }

  function handleQuickDays(days: number) {
    const today = getTodayIsoDate();
    const calculatedResult = addDaysToDate(today, days);

    setMode("days");
    setDate(today);
    setEndDate("");
    setAmount(String(days));
    setResult(calculatedResult);
    setError("");
  }

  function handleClear() {
    setMode("days");
    setDate(getTodayIsoDate());
    setEndDate("");
    setAmount("30");
    setResult("");
    setError("");
  }

  return (
    <section
      aria-labelledby="date-calculator-tool-heading"
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="date-calculator-tool-heading"
            className="text-2xl font-semibold tracking-tight text-slate-950"
          >
            Calculate dates
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Add or subtract time from a date, or count the days between dates.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCalculate}
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Calculate
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

      <div className="mt-6 flex flex-wrap gap-2">
        {[7, 30, 90].map((days) => (
          <button
            key={days}
            type="button"
            onClick={() => handleQuickDays(days)}
            className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100"
          >
            {days} days from today
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[20rem_1fr]">
        <div className="space-y-4">
          <div>
            <label htmlFor="date-mode" className="text-sm font-semibold text-slate-900">
              Mode
            </label>
            <select
              id="date-mode"
              value={mode}
              onChange={(event) => {
                setMode(event.target.value as Mode);
                setResult("");
                setError("");
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
            <label htmlFor="start-date" className="text-sm font-semibold text-slate-900">
              {mode === "between" ? "Start date" : "Date"}
            </label>
            <input
              id="start-date"
              type="date"
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                setResult("");
                setError("");
              }}
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {mode === "between" ? (
            <div>
              <label htmlFor="end-date" className="text-sm font-semibold text-slate-900">
                End date
              </label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(event) => {
                  setEndDate(event.target.value);
                  setResult("");
                  setError("");
                }}
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="date-amount" className="text-sm font-semibold text-slate-900">
                Number
              </label>
              <input
                id="date-amount"
                type="number"
                step="1"
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value);
                  setResult("");
                  setError("");
                }}
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Use a positive number to add and a negative number to subtract.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-950">Result</h3>
          {result ? (
            <p className="mt-3 break-words font-mono text-2xl font-semibold text-slate-950">
              {result}
            </p>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Choose a mode, enter dates, and click Calculate.
            </p>
          )}

          <div aria-live="polite" className="mt-4">
            {error ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {error}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function calculateDateResult(mode: Mode, date: string, amount: number): string {
  if (mode === "days") {
    return addDaysToDate(date, amount);
  }

  if (mode === "months") {
    return addMonthsToDate(date, amount);
  }

  return addYearsToDate(date, amount);
}

function getTodayIsoDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
