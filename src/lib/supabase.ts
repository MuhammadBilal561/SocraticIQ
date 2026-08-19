import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env";

export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);

/** Supabase Edge Function URL, derived from the Supabase project URL. */
export const EDGE_FUNCTION_URL = `${env.supabaseUrl}/functions/v1/socratiq-api`;