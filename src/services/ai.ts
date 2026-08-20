import type { PatternCategory, HintLevel, Message, AIResponse } from "../types";
import { supabase, EDGE_FUNCTION_URL } from "../lib/supabase";
import { env } from "../config/env";
import {
  generateFirstQuestion as mockFirstQuestion,
  generateFollowUpQuestion as mockFollowUp,
  generateHint as mockHint,
  generateFeedback as mockFeedback,
  generateReveal as mockReveal,
} from "../utils/mockAI";

// ─── Edge Function client ────────────────────────────────────────────────

let _available: boolean | null = null;

export class AIBackendUnavailableError extends Error {
  constructor(action: string) {
    super(`AI backend unavailable for action "${action}".`);
    this.name = "AIBackendUnavailableError";
  }
}

/** Whether the mock AI fallback is explicitly enabled (development only). */
export function isMockAIEnabled(): boolean {
  return env.enableMockAi;
}

async function checkAvailability(): Promise<boolean> {
  if (_available !== null) return _available;
  try {
    const res = await fetch(EDGE_FUNCTION_URL, {
      method: "OPTIONS",
      signal: AbortSignal.timeout(3000),
    });
    _available = res.ok || res.status === 200;
  } catch {
    _available = false;
  }
  return _available;
}

/** Retrieves the current Supabase session access token for authenticated requests. */
async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function callEdge(action: string, payload: Record<string, unknown>): Promise<AIResponse> {
  const token = await getAccessToken();
  if (!token) {
    throw new AIBackendUnavailableError(action);
  }

  const res = await fetch(EDGE_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action, ...payload }),
    signal: AbortSignal.timeout(15000),
  });

  if (res.status === 401) {
    throw new AIBackendUnavailableError(action);
  }

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Edge Function error (${res.status}): ${errBody}`);
  }

  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return { text: data.text };
}

/**
 * Invoke the edge function with mock fallback.
 *
 * When `VITE_ENABLE_MOCK_AI` is false (the production-safe default), a
 * backend failure throws so the UI can surface a real error instead of
 * silently showing fabricated AI responses.
 */
async function callWithMock(
  action: string,
  payload: Record<string, unknown>,
  mock: () => AIResponse,
): Promise<AIResponse> {
  const available = await checkAvailability();
  if (!available) {
    if (isMockAIEnabled()) return mock();
    throw new AIBackendUnavailableError(action);
  }

  try {
    return await callEdge(action, payload);
  } catch (err) {
    if (isMockAIEnabled()) return mock();
    throw err;
  }
}

// ─── LeetCode Problem Fetch ──────────────────────────────────────────────

export async function fetchLeetCodeProblem(url: string): Promise<{
  title: string;
  description: string;
  pattern: PatternCategory;
  difficulty: string;
  hints: string[];
} | null> {
  try {
    const token = await getAccessToken();
    if (!token) return null;

    const res = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: "leetcode-fetch", url }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (data.error) return null;

    return {
      title: data.title,
      description: data.description,
      pattern: data.pattern as PatternCategory,
      difficulty: data.difficulty,
      hints: data.hints ?? [],
    };
  } catch {
    return null;
  }
}

// ─── AI Service Functions ────────────────────────────────────────────────

export async function getFirstQuestion(
  pattern: PatternCategory,
  title: string,
  description: string,
): Promise<AIResponse> {
  return callWithMock(
    "first-question",
    { pattern, title, description },
    () => mockFirstQuestion(pattern),
  );
}

export async function getFollowUp(
  pattern: PatternCategory,
  title: string,
  conversation: Message[],
): Promise<AIResponse> {
  return callWithMock(
    "follow-up",
    { pattern, title, conversation: conversation.map((m) => ({ role: m.role, content: m.content })) },
    () => mockFollowUp(conversation.map((m) => m.content)),
  );
}

export async function getHint(
  pattern: PatternCategory,
  title: string,
  description: string,
  hintLevel: Exclude<HintLevel, 0>,
  conversation: Message[],
): Promise<AIResponse> {
  return callWithMock(
    "hint",
    {
      pattern,
      title,
      description,
      hintLevel,
      conversation: conversation.map((m) => ({ role: m.role, content: m.content })),
    },
    () => mockHint(hintLevel),
  );
}

export async function getFeedback(
  code: string,
  language: string,
  pattern: PatternCategory,
  title: string,
  description: string,
): Promise<AIResponse> {
  return callWithMock(
    "feedback",
    { code, language, pattern, title, description },
    () => mockFeedback(code),
  );
}

export async function getReveal(
  pattern: PatternCategory,
  title: string,
  description: string,
): Promise<AIResponse> {
  return callWithMock(
    "reveal",
    { pattern, title, description },
    () => mockReveal(pattern),
  );
}

export function resetAvailability() {
  _available = null;
}