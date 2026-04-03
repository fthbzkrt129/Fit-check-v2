import { createBrowserClient } from "@supabase/ssr";

import { getPublicEnv } from "@/lib/env";

export const createSupabaseBrowserClient = () => {
  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};
