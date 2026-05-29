"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import {
  reportReasons,
  type ReportTargetType,
} from "@/lib/blog/report-constants";

type ReportContentFormProps = {
  targetType: ReportTargetType;
  targetId: string;
  slug: string;
  isLoggedIn: boolean;
  action: (formData: FormData) => void;
  label?: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Reporting..." : "Submit report"}
    </button>
  );
}

function reasonLabel(reason: string) {
  return reason
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export function ReportContentForm({
  targetType,
  targetId,
  slug,
  isLoggedIn,
  action,
  label = "Report",
}: ReportContentFormProps) {
  if (!isLoggedIn) {
    return (
      <Link
        href={`/login?next=/blog/${slug}`}
        className="text-sm font-semibold text-slate-600 underline-offset-4 hover:text-slate-950 hover:underline"
      >
        {label}
      </Link>
    );
  }

  return (
    <details className="rounded-md border border-slate-200 bg-white p-3">
      <summary className="cursor-pointer text-sm font-semibold text-slate-700">
        {label}
      </summary>
      <form action={action} className="mt-3 space-y-3">
        <input type="hidden" name="target_type" value={targetType} />
        <input type="hidden" name="target_id" value={targetId} />
        <input type="hidden" name="slug" value={slug} />
        <label className="block text-sm font-semibold text-slate-950">
          Reason
          <select
            name="reason"
            required
            defaultValue=""
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="" disabled>
              Select a reason
            </option>
            {reportReasons.map((reason) => (
              <option key={reason} value={reason}>
                {reasonLabel(reason)}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-semibold text-slate-950">
          Details
          <textarea
            name="details"
            maxLength={1000}
            rows={3}
            placeholder="Optional context for moderators."
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </label>
        <SubmitButton />
      </form>
    </details>
  );
}
