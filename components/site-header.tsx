import Link from "next/link";
import { UserMenu } from "@/components/auth/user-menu";
import { getCurrentSupabaseUser } from "@/lib/supabase/server";

const navItems = [
  { href: "/dashboard", label: "Workspace" },
  { href: "/tools", label: "Tools" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export async function SiteHeader() {
  const user = await getCurrentSupabaseUser();
  const avatarUrl =
    typeof user?.user_metadata.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : typeof user?.user_metadata.picture === "string"
        ? user.user_metadata.picture
        : null;

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-slate-950"
        >
          DevToolBox AI
        </Link>
        <nav
          aria-label="Main navigation"
          className="flex flex-wrap items-center gap-4"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <UserMenu email={user.email} avatarUrl={avatarUrl} />
          ) : (
            <Link
              href="/login"
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
