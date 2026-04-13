import { createBrowserClient } from "@supabase/ssr";

import { getSupabasePublicEnv } from "@/lib/env";
import { getSupabaseCookieOptions } from "@/lib/supabase/cookieOptions";

export const createSupabaseBrowserClient = () => {
  const { supabaseUrl, supabaseAnonKey } = getSupabasePublicEnv();

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: getSupabaseCookieOptions(),
  });
};
