import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { config } from "../config";

export const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  realtime: {
    transport: ws as any,
  },
});
