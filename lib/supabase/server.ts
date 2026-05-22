import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function getSupabaseServerEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return {
    supabaseUrl,
    supabaseAnonKey,
    isConfigured: Boolean(supabaseUrl && supabaseAnonKey),
  };
}

export async function createServerSupabaseClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseServerEnv();

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies. Proxy and Server Actions handle writes.
        }
      },
    },
  });
}

export async function getCurrentSupabaseUser() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
