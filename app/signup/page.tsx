import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createMetadata } from "@/lib/seo";
import {
  createServerSupabaseClient,
  getCurrentSupabaseUser,
  getSupabaseServerEnv,
} from "@/lib/supabase/server";

type SignupPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  auth_config:
    "Supabase is not configured yet. Add the public Supabase URL and anon key to continue.",
  signup_failed:
    "We could not create that account. The email may already be registered, or the password may not meet the project requirements.",
  oauth_failed:
    "Google sign-up could not be started. Please try again or use email and password.",
};

export const metadata = createMetadata({
  title: "Sign Up",
  description: "Create a DevToolBox AI account for the future RAG dashboard.",
  path: "/signup",
});

async function signupAction(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/signup?error=signup_failed");
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    redirect("/signup?error=auth_config");
  }

  let signupFailed = false;
  let hasSession = false;

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    signupFailed = Boolean(error);
    hasSession = Boolean(data.session);
  } catch {
    signupFailed = true;
  }

  if (signupFailed) {
    redirect("/signup?error=signup_failed");
  }

  if (hasSession) {
    redirect("/dashboard");
  }

  redirect("/login?message=signup_success");
}

async function googleSignupAction() {
  "use server";

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    redirect("/signup?error=auth_config");
  }

  const origin = (await headers()).get("origin") ?? "";
  const redirectTo = `${origin}/auth/callback?next=/dashboard`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  });

  if (error || !data.url) {
    redirect("/signup?error=oauth_failed");
  }

  redirect(data.url);
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const user = await getCurrentSupabaseUser();

  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const authConfig = getSupabaseServerEnv();
  const errorMessage = params.error ? errorMessages[params.error] : undefined;
  const isAuthDisabled = !authConfig.isConfigured;

  return (
    <div className="mx-auto flex w-full max-w-6xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Account
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            Create your DevToolBox AI account
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Sign up for the dashboard foundation. Documents, usage tracking,
            and personal RAG chat arrive in later phases.
          </p>
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {errorMessage ? (
            <p className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
              {errorMessage}
            </p>
          ) : null}
          {isAuthDisabled ? (
            <p className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
              Authentication is not configured for this environment yet.
            </p>
          ) : null}

          <form action={signupAction} className="space-y-5">
            <fieldset disabled={isAuthDisabled} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-slate-900"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-slate-900"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Use at least 6 characters. If email confirmation is enabled,
                  Supabase may ask you to verify your inbox before login.
                </p>
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                Sign up
              </button>
            </fieldset>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Or
            </p>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <form action={googleSignupAction}>
            <button
              type="submit"
              disabled={isAuthDisabled}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
            >
              Continue with Google
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Log in
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
