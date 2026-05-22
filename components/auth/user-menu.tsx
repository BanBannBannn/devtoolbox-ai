import Link from "next/link";
import { User } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";

type UserMenuProps = {
  email?: string | null;
  avatarUrl?: string | null;
};

function getInitials(email?: string | null) {
  if (!email) {
    return "";
  }

  const [name] = email.split("@");
  return name
    .split(/[._-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function UserMenu({ email, avatarUrl }: UserMenuProps) {
  const initials = getInitials(email);

  return (
    <details className="group relative">
      <summary
        className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 [&::-webkit-details-marker]:hidden"
        aria-label="Open user menu"
      >
        {avatarUrl ? (
          <span
            aria-hidden="true"
            className="h-full w-full rounded-full bg-cover bg-center"
            style={{ backgroundImage: `url(${avatarUrl})` }}
          />
        ) : initials ? (
          <span>{initials}</span>
        ) : (
          <User aria-hidden="true" className="h-4 w-4" />
        )}
      </summary>

      <div className="absolute right-0 z-20 mt-3 w-64 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
        <div className="border-b border-slate-100 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Signed in
          </p>
          <p className="mt-1 truncate text-sm font-medium text-slate-950">
            {email ?? "DevToolBox user"}
          </p>
        </div>
        <div className="py-2">
          <Link
            href="/dashboard"
            className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
          >
            Dashboard
          </Link>
          <LogoutButton variant="menu" />
        </div>
      </div>
    </details>
  );
}
