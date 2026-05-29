"use client";

import { useFormStatus } from "react-dom";
import type { UserRole } from "@/lib/auth/roles";

const roleOptions: UserRole[] = ["user", "moderator", "admin"];

type AdminUserRoleFormProps = {
  userId: string;
  currentRole: UserRole;
  action: (formData: FormData) => void;
};

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving..." : "Save"}
    </button>
  );
}

export function AdminUserRoleForm({
  userId,
  currentRole,
  action,
}: AdminUserRoleFormProps) {
  return (
    <form
      action={action}
      className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end"
      onSubmit={(event) => {
        const formData = new FormData(event.currentTarget);
        const nextRole = formData.get("role");

        if (
          (currentRole === "admin" && nextRole !== "admin") ||
          (currentRole !== "admin" && nextRole === "admin")
        ) {
          const confirmed = window.confirm(
            "This changes elevated blog platform permissions. Continue?",
          );

          if (!confirmed) {
            event.preventDefault();
          }
        }
      }}
    >
      <input type="hidden" name="user_id" value={userId} />
      <label className="sr-only" htmlFor={`role-${userId}`}>
        Role
      </label>
      <select
        id={`role-${userId}`}
        name="role"
        defaultValue={currentRole}
        className="min-w-36 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      >
        {roleOptions.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
      <SaveButton />
    </form>
  );
}
