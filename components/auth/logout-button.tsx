import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type LogoutButtonProps = {
  variant?: "default" | "menu";
};

async function logoutAction() {
  "use server";

  const supabase = await createServerSupabaseClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/login?message=signed_out");
}

export function LogoutButton({ variant = "default" }: LogoutButtonProps) {
  const className =
    variant === "menu"
      ? "w-full rounded-md px-3 py-2 text-left text-sm font-medium text-red-700 transition hover:bg-red-50"
      : "rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100";

  return (
    <form action={logoutAction}>
      <button type="submit" className={className}>
        Sign out
      </button>
    </form>
  );
}
