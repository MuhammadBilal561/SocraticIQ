import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  sessionStorageKey,
  loadSessions,
  saveSessions,
  saveSession,
  deleteSession,
  clearSessions,
  hasLegacySessions,
  migrateLegacySessions,
} from "./storage";
import type { Session } from "../types";

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: `s-${Math.random().toString(36).slice(2, 8)}`,
    problemTitle: "Two Sum",
    problemDescription: "Find two numbers that add to a target.",
    pattern: "Arrays & Hashing",
    status: "solved",
    messages: [],
    codeAttempts: [],
    hintsUsed: 0,
    startedAt: 1_700_000_000_000,
    ...overrides,
  };
}

const USER_A = "user-a";
const USER_B = "user-b";

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

describe("user-scoped storage", () => {
  it("round-trips a session for a single user", () => {
    const s = makeSession();
    saveSessions(USER_A, [s]);
    expect(loadSessions(USER_A)).toEqual([s]);
  });

  it("keeps user A and user B data isolated", () => {
    saveSessions(USER_A, [makeSession()]);
    saveSessions(USER_B, [makeSession()]);
    expect(loadSessions(USER_A)).toHaveLength(1);
    expect(loadSessions(USER_B)).toHaveLength(1);
  });

  it("does not expose one user's data under another key", () => {
    const a = makeSession();
    saveSessions(USER_A, [a]);
    expect(loadSessions(USER_B)).toEqual([]);
    expect(localStorage.getItem(sessionStorageKey(USER_B))).toBeNull();
  });

  it("saveSession inserts new sessions and updates existing ones", () => {
    const s1 = makeSession();
    const s2 = makeSession({ status: "active" });
    saveSession(USER_A, s1);
    saveSession(USER_A, s2);
    expect(loadSessions(USER_A)).toHaveLength(2);

    const updated = saveSession(USER_A, { ...s1, status: "revealed" });
    expect(updated).toHaveLength(2);
    expect(loadSessions(USER_A).find((x) => x.id === s1.id)?.status).toBe("revealed");
  });
});

describe("deletion / clear-all", () => {
  it("deleteSession removes exactly the selected session", () => {
    const keep = makeSession({ id: "keep" });
    const drop = makeSession({ id: "drop" });
    saveSessions(USER_A, [keep, drop]);

    const result = deleteSession(USER_A, "drop");
    expect(result.map((s) => s.id)).toEqual(["keep"]);
    expect(loadSessions(USER_A).map((s) => s.id)).toEqual(["keep"]);
  });

  it("deleteSession is a no-op for an unknown id", () => {
    const s = makeSession();
    saveSessions(USER_A, [s]);
    const result = deleteSession(USER_A, "missing");
    expect(result).toHaveLength(1);
  });

  it("clearSessions removes only the current user's data", () => {
    saveSessions(USER_A, [makeSession()]);
    saveSessions(USER_B, [makeSession()]);

    clearSessions(USER_A);

    expect(loadSessions(USER_A)).toEqual([]);
    expect(loadSessions(USER_B)).toHaveLength(1);
  });
});

describe("schema validation", () => {
  it("returns [] for invalid JSON instead of throwing", () => {
    localStorage.setItem(sessionStorageKey(USER_A), "{not json");
    expect(loadSessions(USER_A)).toEqual([]);
  });

  it("returns [] for a future schema version", () => {
    const s = makeSession();
    localStorage.setItem(
      sessionStorageKey(USER_A),
      JSON.stringify({ version: 999, sessions: [s] }),
    );
    expect(loadSessions(USER_A)).toEqual([]);
  });

  it("returns [] for an object missing the sessions array", () => {
    localStorage.setItem(sessionStorageKey(USER_A), JSON.stringify({ version: 1 }));
    expect(loadSessions(USER_A)).toEqual([]);
  });

  it("rejects a blob containing any entry with missing required fields", () => {
    const good = makeSession();
    const bad = { id: "bad", problemTitle: "x" };
    localStorage.setItem(
      sessionStorageKey(USER_A),
      JSON.stringify({ version: 1, sessions: [good, bad] }),
    );
    // All-or-nothing: a malformed entry invalidates the stored blob so
    // corrupted data is never partially trusted.
    expect(loadSessions(USER_A)).toEqual([]);
  });

  it("returns [] when the stored sessions value is not an array", () => {
    localStorage.setItem(sessionStorageKey(USER_A), JSON.stringify({ version: 1, sessions: "nope" }));
    expect(loadSessions(USER_A)).toEqual([]);
  });
});

describe("legacy (unscoped) data", () => {
  it("does not auto-attach legacy data to a user", () => {
    const legacy = [makeSession()];
    localStorage.setItem("socratiq_sessions", JSON.stringify(legacy));
    expect(hasLegacySessions()).toBe(true);
    expect(loadSessions(USER_A)).toEqual([]);
  });

  it("migrates legacy data only through the explicit function", () => {
    const legacy = [makeSession({ id: "legacy-1" })];
    localStorage.setItem("socratiq_sessions", JSON.stringify(legacy));

    const migrated = migrateLegacySessions(USER_A);
    expect(migrated.map((s) => s.id)).toEqual(["legacy-1"]);
    expect(loadSessions(USER_A).map((s) => s.id)).toEqual(["legacy-1"]);
    expect(localStorage.getItem("socratiq_sessions")).toBeNull();
  });
});
