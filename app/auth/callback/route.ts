import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function getSafeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = getSafeNextPath(requestUrl.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=oauth_failed", requestUrl.origin),
    );
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.redirect(
      new URL("/login?error=auth_config", requestUrl.origin),
    );
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL("/login?error=oauth_failed", requestUrl.origin),
    );
  }

  return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
}
