import type { PatternCategory, HintLevel, Message, AIResponse } from "../types";
import { EDGE_FUNCTION_URL } from "../lib/supabase";
import {
  generateFirstQuestion as mockFirstQuestion,
  generateFollowUpQuestion as mockFollowUp,
  generateHint as mockHint,
  generateFeedback as mockFeedback,
  generateReveal as mockReveal,
} from "../utils/mockAI";

// ─── Edge Function client ────────────────────────────────────────────────

let _available: boolean | null = null;

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

async function callEdge(action: string, payload: Record<string, unknown>): Promise<AIResponse> {
  const res = await fetch(EDGE_FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Edge Function error (${res.status}): ${errBody}`);
  }

  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return { text: data.text };
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
    const res = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
  const available = await checkAvailability();
  if (!available) return mockFirstQuestion(pattern);

  try {
    return await callEdge("first-question", { pattern, title, description });
  } catch {
    return mockFirstQuestion(pattern);
  }
}

export async function getFollowUp(
  pattern: PatternCategory,
  title: string,
  conversation: Message[],
): Promise<AIResponse> {
  const available = await checkAvailability();
  if (!available) {
    const convText = conversation.map((m) => m.content);
    return mockFollowUp(convText);
  }

  try {
    const serialized = conversation.map((m) => ({ role: m.role, content: m.content }));
    return await callEdge("follow-up", { pattern, title, conversation: serialized });
  } catch {
    const convText = conversation.map((m) => m.content);
    return mockFollowUp(convText);
  }
}

export async function getHint(
  pattern: PatternCategory,
  title: string,
  description: string,
  hintLevel: Exclude<HintLevel, 0>,
  conversation: Message[],
): Promise<AIResponse> {
  const available = await checkAvailability();
  if (!available) return mockHint(hintLevel);

  try {
    const serialized = conversation.map((m) => ({ role: m.role, content: m.content }));
    return await callEdge("hint", { pattern, title, description, hintLevel, conversation: serialized });
  } catch {
    return mockHint(hintLevel);
  }
}

export async function getFeedback(
  code: string,
  language: string,
  pattern: PatternCategory,
  title: string,
  description: string,
): Promise<AIResponse> {
  const available = await checkAvailability();
  if (!available) return mockFeedback(code);

  try {
    return await callEdge("feedback", { code, language, pattern, title, description });
  } catch {
    return mockFeedback(code);
  }
}

export async function getReveal(
  pattern: PatternCategory,
  title: string,
  description: string,
): Promise<AIResponse> {
  const available = await checkAvailability();
  if (!available) return mockReveal(pattern);

  try {
    return await callEdge("reveal", { pattern, title, description });
  } catch {
    return mockReveal(pattern);
  }
}

export function resetAvailability() {
  _available = null;
}