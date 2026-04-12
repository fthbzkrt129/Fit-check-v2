import { createClient } from "@supabase/supabase-js";

import { getSupabaseAdminEnv, getSupabasePublicEnv } from "@/lib/env";

export const createSupabaseAdminClient = () => {
  const { supabaseUrl, supabaseAnonKey } = getSupabasePublicEnv();
  const { supabaseServiceRoleKey } = getSupabaseAdminEnv();

  return createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};
