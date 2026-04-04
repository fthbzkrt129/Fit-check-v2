import { createClient } from "@supabase/supabase-js";

import { getPublicEnv, getServerEnv } from "@/lib/env";

export const createSupabaseAdminClient = () => {
  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();
  const { supabaseServiceRoleKey } = getServerEnv();

  return createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};
