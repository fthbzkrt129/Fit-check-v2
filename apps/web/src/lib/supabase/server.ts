import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabasePublicEnv } from "@/lib/env";
import { getSupabaseCookieOptions } from "@/lib/supabase/cookieOptions";

type CookieMutation = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

type CreateSupabaseServerClientOptions = {
  allowCookieWrites?: boolean;
};

export const createSupabaseServerClient = async ({ allowCookieWrites = true }: CreateSupabaseServerClientOptions = {}) => {
  const cookieStore = await cookies();
  const { supabaseUrl, supabaseAnonKey } = getSupabasePublicEnv();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: getSupabaseCookieOptions(),
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieMutation[]) {
        if (!allowCookieWrites) {
          return;
        }

        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // Server Components can read cookies but cannot write refreshed auth cookies.
            // Route handlers and middleware still persist them when Next allows mutation.
          }
        });
      }
    }
  });
};
