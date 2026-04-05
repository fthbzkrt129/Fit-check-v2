import { createClient } from "@supabase/supabase-js";

import { getServerEnv, getSupabasePublicEnv } from "@/lib/env";

export const createSupabaseAdminClient = () => {
  const { supabaseUrl, supabaseAnonKey } = getSupabasePublicEnv();
  const { supabaseServiceRoleKey } = getServerEnv();

  return createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};
