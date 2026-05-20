"use client";

import Image from "next/image";
import { useState } from "react";
import {
  generateQrCodeDataUrl,
  type QrCodeErrorCorrectionLevel,
} from "@/lib/qr-code-generator";

const sizeOptions = [128, 256, 384, 512, 768, 1024];
const errorCorrectionOptions: {
  value: QrCodeErrorCorrectionLevel;
  label: string;
}[] = [
  { value: "L", label: "L - Low" },
  { value: "M", label: "M - Medium" },
  { value: "Q", label: "Q - Quartile" },
  { value: "H", label: "H - High" },
];

export function QrCodeGeneratorTool() {
  const [value, setValue] = useState("");
  const [size, setSize] = useState("256");
  const [errorCorrectionLevel, setErrorCorrectionLevel] =
    useState<QrCodeErrorCorrectionLevel>("M");
  const [dataUrl, setDataUrl] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  async function handleGenerate() {
    const result = await generateQrCodeDataUrl({
      value,
      size: Number(size),
      errorCorrectionLevel,
    });

    if (result.success) {
      setDataUrl(result.dataUrl);
      setError("");
      setStatus("QR code generated.");
      return;
    }

    setDataUrl("");
    setError(result.error);
    setStatus("");
  }

  function handleDownload() {
    if (!dataUrl) {
      return;
    }

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "qr-code.png";
    link.click();
    setStatus("QR code PNG downloaded.");
  }

  function handleClear() {
    setValue("");
    setSize("256");
    setErrorCorrectionLevel("M");
    setDataUrl("");
    setError("");
    setStatus("");
  }

  return (
    <section
      aria-labelledby="qr-code-generator-tool-heading"
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="qr-code-generator-tool-heading"
            className="text-2xl font-semibold tracking-tight text-slate-950"
          >
            Generate a QR code
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter text or a URL, choose the output settings, and download a PNG.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleGenerate}
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Generate QR Code
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!dataUrl}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Download PNG
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

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="qr-code-value"
              className="text-sm font-semibold text-slate-900"
            >
              Text or URL
            </label>
            <textarea
              id="qr-code-value"
              value={value}
              onChange={(event) => {
                setValue(event.target.value);
                setError("");
                setStatus("");
              }}
              placeholder="https://example.com"
              className="mt-2 min-h-40 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="qr-code-size"
                className="text-sm font-semibold text-slate-900"
              >
                QR size
              </label>
              <select
                id="qr-code-size"
                value={size}
                onChange={(event) => {
                  setSize(event.target.value);
                  setStatus("");
                }}
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              >
                {sizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option} x {option}px
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="qr-code-error-correction"
                className="text-sm font-semibold text-slate-900"
              >
                Error correction
              </label>
              <select
                id="qr-code-error-correction"
                value={errorCorrectionLevel}
                onChange={(event) => {
                  setErrorCorrectionLevel(
                    event.target.value as QrCodeErrorCorrectionLevel,
                  );
                  setStatus("");
                }}
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              >
                {errorCorrectionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-950">Preview</h3>
          {dataUrl ? (
            <div className="mt-4 flex justify-center">
              <div className="rounded-md border border-slate-200 bg-white p-3">
                <Image
                  src={dataUrl}
                  alt="Generated QR code preview"
                  width={Number(size)}
                  height={Number(size)}
                  unoptimized
                  className="h-auto max-h-72 w-auto max-w-full"
                />
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Generated QR code preview will appear here.
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
