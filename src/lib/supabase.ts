import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://rjxyovlvitsanhjistej.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqeHlvdmx2aXRzYW5oamlzdGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODAwMTgsImV4cCI6MjEwMjM1NjAxOH0.aXD29r4uhZXRH-G2C78ZXCStRItHQO3wXjM545-mNjc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/socratiq-api`;