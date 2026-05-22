import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

type CookieToSet = {
  name: string;
  value: string;
  options: Parameters<NextResponse["cookies"]["set"]>[2];
};

function getSupabaseProxyEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return {
    supabaseUrl,
    supabaseAnonKey,
    isConfigured: Boolean(supabaseUrl && supabaseAnonKey),
  };
}

function copyCookies(
  response: NextResponse,
  cookiesToSet: CookieToSet[],
  headersToSet: Record<string, string>,
) {
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  Object.entries(headersToSet).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export async function proxy(request: NextRequest) {
  const { supabaseUrl, supabaseAnonKey, isConfigured } = getSupabaseProxyEnv();
  const { pathname } = request.nextUrl;
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAuthRoute = pathname === "/login" || pathname === "/signup";

  if (!supabaseUrl || !supabaseAnonKey || !isConfigured) {
    if (isDashboardRoute) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("error", "auth_config");
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });
  let cookiesToSet: CookieToSet[] = [];
  let headersToSet: Record<string, string> = {};

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(newCookies, newHeaders) {
        cookiesToSet = newCookies;
        headersToSet = newHeaders;
        supabaseResponse = copyCookies(
          NextResponse.next({ request }),
          cookiesToSet,
          headersToSet,
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isDashboardRoute && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return copyCookies(
      NextResponse.redirect(redirectUrl),
      cookiesToSet,
      headersToSet,
    );
  }

  if (isAuthRoute && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";
    return copyCookies(
      NextResponse.redirect(redirectUrl),
      cookiesToSet,
      headersToSet,
    );
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};
