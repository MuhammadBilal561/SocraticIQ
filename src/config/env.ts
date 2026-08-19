/**
 * Central frontend configuration boundary.
 *
 * Reads Vite environment variables, validates that required values are
 * present, and exposes a typed configuration object to the rest of the app.
 *
 * Vite statically replaces `import.meta.env.VITE_*` references at build time,
 * so this module must read env values directly (no dynamic property access).
 */

export interface RawEnv {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  VITE_ENABLE_MOCK_AI?: string | boolean;
}

export interface AppConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  enableMockAi: boolean;
}

/**
 * Validate raw environment values and build the typed application config.
 * Throws a descriptive error when a required variable is missing so the
 * application fails clearly instead of silently substituting fake values.
 */
export function resolveEnv(raw: RawEnv): AppConfig {
  const supabaseUrl = raw.VITE_SUPABASE_URL?.trim();
  const supabaseAnonKey = raw.VITE_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl) {
    throw new Error(
      "Missing required environment variable: VITE_SUPABASE_URL. Add it to your .env.local (see .env.example).",
    );
  }
  if (!supabaseAnonKey) {
    throw new Error(
      "Missing required environment variable: VITE_SUPABASE_ANON_KEY. Add it to your .env.local (see .env.example).",
    );
  }

  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(supabaseUrl)) {
    throw new Error(
      "Invalid VITE_SUPABASE_URL: expected a Supabase project URL (https://<ref>.supabase.co).",
    );
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    enableMockAi: raw.VITE_ENABLE_MOCK_AI === "true",
  };
}

/**
 * The typed application configuration, resolved once at module load.
 * Missing required variables surface as an explicit startup error.
 */
export const env: AppConfig = resolveEnv({
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  VITE_ENABLE_MOCK_AI: import.meta.env.VITE_ENABLE_MOCK_AI,
});