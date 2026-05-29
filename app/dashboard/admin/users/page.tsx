import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminUserRoleForm } from "@/components/blog/admin-user-role-form";
import { requireAdmin, userRoles, type UserRole } from "@/lib/auth/roles";
import {
  getRoleUpdateErrorMessage,
  listAdminUserProfiles,
} from "@/lib/blog/admin-users";
import { createMetadata } from "@/lib/seo";
import { updateUserRoleAction } from "./actions";

type AdminUsersPageProps = {
  searchParams: Promise<{
    q?: string;
    role?: string;
    error?: string;
    message?: string;
  }>;
};

const messages: Record<string, string> = {
  role_saved: "User role updated.",
};

export const metadata = createMetadata({
  title: "Admin Users",
  description: "Admin-only blog platform user role management.",
  path: "/dashboard/admin/users",
});

function formatDate(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function shortId(id: string) {
  return id.length > 12 ? `${id.slice(0, 8)}...${id.slice(-4)}` : id;
}

function roleLabel(role: UserRole) {
  switch (role) {
    case "admin":
      return "Admin";
    case "moderator":
      return "Moderator";
    default:
      return "User";
  }
}

function roleBadgeClass(role: UserRole) {
  switch (role) {
    case "admin":
      return "border-purple-200 bg-purple-50 text-purple-800";
    case "moderator":
      return "border-sky-200 bg-sky-50 text-sky-800";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof Error && error.name === "RoleAuthenticationError") {
      redirect("/login");
    }

    notFound();
  }

  const params = await searchParams;
  const activeRole = userRoles.includes(params.role as UserRole)
    ? (params.role as UserRole)
    : undefined;
  const result = await listAdminUserProfiles({
    query: params.q,
    role: activeRole,
  });
  const users = result.success ? result.users : [];
  const successMessage = params.message ? messages[params.message] : undefined;
  const errorMessage = getRoleUpdateErrorMessage(params.error);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/dashboard"
        className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
      >
        Back to dashboard
      </Link>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Admin
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          User roles
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
          Manage blog platform roles for writers, moderators, and admins. Role
          changes are checked server-side and normal users cannot self-promote.
        </p>
      </div>

      <section className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
        <h2 className="font-semibold">Safety boundaries</h2>
        <p className="mt-2">
          Admins can manage roles, moderators cannot. The last admin cannot be
          demoted. Service-role access is used only on the server after the
          current session is verified as admin.
        </p>
      </section>

      <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <form className="grid gap-4 md:grid-cols-[1fr_180px_auto] md:items-end">
          <div>
            <label htmlFor="q" className="text-sm font-semibold text-slate-950">
              Search
            </label>
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={params.q ?? ""}
              placeholder="Email, display name, or user ID"
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div>
            <label
              htmlFor="role"
              className="text-sm font-semibold text-slate-950"
            >
              Role
            </label>
            <select
              id="role"
              name="role"
              defaultValue={activeRole ?? ""}
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="">All roles</option>
              {userRoles.map((role) => (
                <option key={role} value={role}>
                  {roleLabel(role)}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded-md bg-slate-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Filter
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
          <Link
            href="/dashboard/admin/users"
            className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 transition hover:bg-slate-200"
          >
            Clear filters
          </Link>
          <Link
            href="/dashboard/moderation/blog"
            className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 transition hover:bg-emerald-200"
          >
            Open moderation
          </Link>
        </div>
      </section>

      {successMessage ? (
        <p className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {successMessage}
        </p>
      ) : null}
      {errorMessage ? (
        <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {errorMessage}
        </p>
      ) : null}
      {!result.success ? (
        <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {result.error}
        </p>
      ) : null}

      <section className="mt-8 grid gap-4">
        {users.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <h2 className="text-xl font-semibold text-slate-950">
              No users found
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
              Try a different search or role filter.
            </p>
          </div>
        ) : (
          users.map((user) => (
            <article
              key={user.id}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold text-slate-950">
                      {user.display_name || user.email || "Unnamed user"}
                    </h2>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${roleBadgeClass(
                        user.role,
                      )}`}
                    >
                      {roleLabel(user.role)}
                    </span>
                  </div>
                  <dl className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <dt className="font-semibold text-slate-900">Email</dt>
                      <dd className="mt-1 break-all">
                        {user.email || "Not available"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-900">User ID</dt>
                      <dd className="mt-1 font-mono" title={user.id}>
                        {shortId(user.id)}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-900">Created</dt>
                      <dd className="mt-1">{formatDate(user.created_at)}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-900">Updated</dt>
                      <dd className="mt-1">{formatDate(user.updated_at)}</dd>
                    </div>
                  </dl>
                </div>

                <AdminUserRoleForm
                  userId={user.id}
                  currentRole={user.role}
                  action={updateUserRoleAction}
                />
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
