import { describe, it, expect } from "vitest";
import { resolveEnv } from "./env";

describe("resolveEnv", () => {
  it("throws when VITE_SUPABASE_URL is missing", () => {
    expect(() =>
      resolveEnv({ VITE_SUPABASE_ANON_KEY: "key" }),
    ).toThrow(/VITE_SUPABASE_URL/);
  });

  it("throws when VITE_SUPABASE_ANON_KEY is missing", () => {
    expect(() =>
      resolveEnv({ VITE_SUPABASE_URL: "https://project.supabase.co" }),
    ).toThrow(/VITE_SUPABASE_ANON_KEY/);
  });

  it("rejects non-Supabase project URLs", () => {
    expect(() =>
      resolveEnv({
        VITE_SUPABASE_URL: "https://example.com",
        VITE_SUPABASE_ANON_KEY: "key",
      }),
    ).toThrow(/Invalid VITE_SUPABASE_URL/);
  });

  it("builds a typed config from valid input (mock disabled by default)", () => {
    const config = resolveEnv({
      VITE_SUPABASE_URL: "https://my-project.supabase.co",
      VITE_SUPABASE_ANON_KEY: "anon-key",
    });
    expect(config.supabaseUrl).toBe("https://my-project.supabase.co");
    expect(config.supabaseAnonKey).toBe("anon-key");
    expect(config.enableMockAi).toBe(false);
  });

  it("enables mock AI only for the literal value true", () => {
    expect(
      resolveEnv({
        VITE_SUPABASE_URL: "https://my-project.supabase.co",
        VITE_SUPABASE_ANON_KEY: "anon-key",
        VITE_ENABLE_MOCK_AI: "true",
      }).enableMockAi,
    ).toBe(true);

    expect(
      resolveEnv({
        VITE_SUPABASE_URL: "https://my-project.supabase.co",
        VITE_SUPABASE_ANON_KEY: "anon-key",
        VITE_ENABLE_MOCK_AI: "1",
      }).enableMockAi,
    ).toBe(false);
  });
});
