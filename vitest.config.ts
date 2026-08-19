import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    env: {
      // Provide non-empty values so the app config module can be imported in
      // tests. These are test-only placeholders, not real credentials.
      VITE_SUPABASE_URL: "https://test-project.supabase.co",
      VITE_SUPABASE_ANON_KEY: "test-anon-key",
    },
  },
});
