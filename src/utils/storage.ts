import type { Session } from "../types";

const LEGACY_SESSIONS_KEY = "socratiq_sessions";
const SESSIONS_KEY_PREFIX = "socratiq_sessions:";
const STORAGE_SCHEMA_VERSION = 1;

interface StoredSessionData {
  version: number;
  sessions: Session[];
}

/** Build the per-user storage key. */
export function sessionStorageKey(userId: string): string {
  return `${SESSIONS_KEY_PREFIX}${userId}`;
}

/**
 * Minimal structural validation for a single session record.
 * Loaded data that fails validation is dropped rather than trusted.
 */
function isValidSession(value: unknown): value is Session {
  if (typeof value !== "object" || value === null) return false;
  const s = value as Record<string, unknown>;
  return (
    typeof s.id === "string" &&
    typeof s.problemTitle === "string" &&
    typeof s.pattern === "string" &&
    typeof s.status === "string" &&
    Array.isArray(s.messages) &&
    Array.isArray(s.codeAttempts) &&
    typeof s.startedAt === "number"
  );
}

function isStoredData(value: unknown): value is StoredSessionData {
  if (typeof value !== "object" || value === null) return false;
  const d = value as Record<string, unknown>;
  return (
    d.version === STORAGE_SCHEMA_VERSION &&
    Array.isArray(d.sessions) &&
    d.sessions.every(isValidSession)
  );
}

/** Load sessions for a specific user. Returns [] on any invalid/missing data. */
export function loadSessions(userId: string): Session[] {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(sessionStorageKey(userId));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!isStoredData(parsed)) {
      console.warn(
        `[storage] Ignoring unreadable data in "${sessionStorageKey(userId)}" (missing or mismatched schema version).`,
      );
      return [];
    }
    return parsed.sessions;
  } catch {
    return [];
  }
}

/** Persist the full session list for a specific user. */
export function saveSessions(userId: string, sessions: Session[]): void {
  if (!userId) return;
  try {
    const data: StoredSessionData = { version: STORAGE_SCHEMA_VERSION, sessions };
    localStorage.setItem(sessionStorageKey(userId), JSON.stringify(data));
  } catch {
    console.warn("Failed to save sessions to localStorage");
  }
}

/** Insert or update a single session for a specific user. */
export function saveSession(userId: string, session: Session): Session[] {
  const sessions = loadSessions(userId);
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.unshift(session);
  }
  saveSessions(userId, sessions);
  return sessions;
}

/** Delete a single session for a specific user. */
export function deleteSession(userId: string, sessionId: string): Session[] {
  const sessions = loadSessions(userId).filter((s) => s.id !== sessionId);
  saveSessions(userId, sessions);
  return sessions;
}

/** Remove all persisted sessions for a specific user. */
export function clearSessions(userId: string): void {
  try {
    localStorage.removeItem(sessionStorageKey(userId));
  } catch {
    console.warn("Failed to clear sessions from localStorage");
  }
}

// ─── Legacy (pre-Phase 2) unscoped data ───────────────────────────────────

/**
 * Whether an unscoped legacy blob exists under the old global key.
 * Legacy data is never auto-attached to a user; it must be migrated
 * explicitly (or intentionally ignored).
 */
export function hasLegacySessions(): boolean {
  try {
    const raw = localStorage.getItem(LEGACY_SESSIONS_KEY);
    if (!raw) return false;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed);
  } catch {
    return false;
  }
}

/**
 * Explicitly migrate legacy unscoped sessions into a user's namespace.
 * Caller must be an authenticated user who explicitly opts in.
 */
export function migrateLegacySessions(userId: string): Session[] {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(LEGACY_SESSIONS_KEY);
    if (!raw) return loadSessions(userId);
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(isValidSession)) return loadSessions(userId);
    const current = loadSessions(userId);
    const merged: Session[] = [...parsed, ...current];
    saveSessions(userId, merged);
    localStorage.removeItem(LEGACY_SESSIONS_KEY);
    return merged;
  } catch {
    return loadSessions(userId);
  }
}