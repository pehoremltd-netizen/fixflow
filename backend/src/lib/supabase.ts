import { createClient, SupabaseClient } from "@supabase/supabase-js";
import crossFetch from "cross-fetch";
import { config } from "../config";

let _supabase: SupabaseClient | null = null;

const handler: ProxyHandler<SupabaseClient> = {
  get(_, prop: string | symbol) {
    if (!_supabase) {
      _supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
        global: { fetch: crossFetch as any },
      });
    }
    const value = (_supabase as any)[prop];
    return typeof value === "function" ? value.bind(_supabase) : value;
  },
};

export const supabase = new Proxy({} as SupabaseClient, handler);
