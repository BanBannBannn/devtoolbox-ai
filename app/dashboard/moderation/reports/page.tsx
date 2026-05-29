import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FileWarning, ShieldCheck } from "lucide-react";
import { updateReportStatusAction } from "./actions";
import {
  getReportErrorMessage,
  getReportStatusLabel,
  listContentReportsForModeration,
  reportStatuses,
  type ReportStatus,
} from "@/lib/blog/reports";
import {
  RoleAuthenticationError,
  RolePermissionError,
  requireModeratorOrAdmin,
} from "@/lib/auth/roles";
import { createMetadata } from "@/lib/seo";

type ModerationReportsPageProps = {
  searchParams: Promise<{
    status?: string;
    error?: string;
    message?: string;
  }>;
};

const messages: Record<string, string> = {
  report_updated: "Report status updated.",
};

export const metadata = createMetadata({
  title: "Content Reports",
  description: "Review blog content reports.",
  path: "/dashboard/moderation/reports",
});

async function requireModerationAccess() {
  try {
    await requireModeratorOrAdmin();
  } catch (error) {
    if (error instanceof RoleAuthenticationError) {
      redirect("/login");
    }

    if (error instanceof RolePermissionError) {
      notFound();
    }

    throw error;
  }
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function reasonLabel(reason: string) {
  return reason
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function ModerationReportsPage({
  searchParams,
}: ModerationReportsPageProps) {
  const params = await searchParams;
  await requireModerationAccess();
  const activeStatus = reportStatuses.includes(params.status as ReportStatus)
    ? (params.status as ReportStatus)
    : undefined;
  const reports = await listContentReportsForModeration(activeStatus);
  const openCount = reports.filter((report) => report.status === "open").length;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Back to dashboard
          </Link>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <ShieldCheck aria-hidden="true" className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                Moderation
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
                Content reports
              </h1>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Review private reports for posts and comments. Reporter emails and
            private profile data are not shown in this queue.
          </p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
          {openCount} open
        </div>
      </div>

      {params.error ? (
        <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {getReportErrorMessage(params.error)}
        </p>
      ) : null}
      {params.message ? (
        <p className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {messages[params.message]}
        </p>
      ) : null}

      <nav className="mt-8 flex flex-wrap gap-2 text-sm font-semibold">
        <Link
          href="/dashboard/moderation/reports"
          className={`rounded-full border px-3 py-1 transition ${
            !activeStatus
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
          }`}
        >
          All
        </Link>
        {reportStatuses.map((status) => (
          <Link
            key={status}
            href={`/dashboard/moderation/reports?status=${status}`}
            className={`rounded-full border px-3 py-1 transition ${
              activeStatus === status
                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            {getReportStatusLabel(status)}
          </Link>
        ))}
      </nav>

      {reports.length === 0 ? (
        <section className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <FileWarning
            aria-hidden="true"
            className="mx-auto h-10 w-10 text-slate-400"
          />
          <h2 className="mt-4 text-xl font-semibold text-slate-950">
            No reports in this queue
          </h2>
        </section>
      ) : (
        <section className="mt-8 grid gap-4">
          {reports.map((report) => {
            const action = updateReportStatusAction.bind(null, report.id);

            return (
              <article
                key={report.id}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                        {report.targetType}
                      </span>
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
                        {getReportStatusLabel(report.status)}
                      </span>
                    </div>
                    <h2 className="mt-3 text-xl font-semibold text-slate-950">
                      {report.targetLabel}
                    </h2>
                    {report.targetSnippet ? (
                      <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {report.targetSnippet}
                      </p>
                    ) : null}
                  </div>
                  {report.targetHref ? (
                    <Link
                      href={report.targetHref}
                      className="inline-flex justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100"
                    >
                      View target
                    </Link>
                  ) : null}
                </div>

                <dl className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-4">
                  <div>
                    <dt className="font-semibold text-slate-900">Reason</dt>
                    <dd className="mt-1">{reasonLabel(report.reason)}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">Reporter</dt>
                    <dd className="mt-1">{report.reporterDisplayName}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">Created</dt>
                    <dd className="mt-1">{formatDate(report.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">Reviewed</dt>
                    <dd className="mt-1">{formatDate(report.reviewedAt)}</dd>
                  </div>
                </dl>

                {report.details ? (
                  <p className="mt-4 whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                    {report.details}
                  </p>
                ) : null}

                <form action={action} className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    name="status"
                    value="reviewed"
                    className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100"
                  >
                    Mark reviewed
                  </button>
                  <button
                    type="submit"
                    name="status"
                    value="dismissed"
                    className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100"
                  >
                    Dismiss
                  </button>
                  <button
                    type="submit"
                    name="status"
                    value="action_taken"
                    className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Mark action taken
                  </button>
                </form>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
