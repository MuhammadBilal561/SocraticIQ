import React, { createContext, useContext, useReducer, useCallback, useEffect } from "react";
import type { Session, Message, PatternCategory, CodeAttempt } from "../types";
import { inferPatternFromProblem } from "../utils/patterns";
import { useAuth } from "./AuthContext";
import { loadSessions, saveSession, deleteSession, clearSessions } from "../utils/storage";
import {
  getFirstQuestion,
  getFollowUp,
  getHint,
  getFeedback,
  getReveal,
} from "../services/ai";

// ─── State ───────────────────────────────────────────────────────────────

interface SessionState {
  /** The authenticated user's id, or null when signed out. */
  userId: string | null;
  currentSession: Session | null;
  sessions: Session[];
  isLoading: boolean;
  /** Hint points earned through thoughtful engagement (max 3) */
  hintPoints: number;
  /** Whether AI is currently generating a response */
  isAiResponding: boolean;
}

const initialState: SessionState = {
  userId: null,
  currentSession: null,
  sessions: [],
  isLoading: false,
  hintPoints: 0,
  isAiResponding: false,
};

// ─── Actions ─────────────────────────────────────────────────────────────

type SessionAction =
  | { type: "START_SESSION"; session: Session }
  | { type: "ADD_MESSAGE"; message: Message }
  | { type: "SUBMIT_CODE"; attempt: CodeAttempt }
  | { type: "MARK_SOLVED"; status: "solved" | "submitted" }
  | { type: "MARK_REVEALED" }
  | { type: "SET_HINT_POINTS"; count: number }
  | { type: "EARN_HINT_POINT" }
  | { type: "TOGGLE_HINT_COLLAPSE"; messageId: string }
  | { type: "SET_LOADING"; isLoading: boolean }
  | { type: "SET_AI_RESPONDING"; isResponding: boolean }
  | { type: "SET_USER_ID"; userId: string | null }
  | { type: "LOAD_SESSIONS"; sessions: Session[] }
  | { type: "REMOVE_SESSION"; sessionId: string }
  | { type: "RESTORE_SESSION"; session: Session | null }
  | { type: "RESET_SESSION" };

// ─── Helpers ─────────────────────────────────────────────────────────────

function uid(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function computeHintsLeft(session: Session): number {
  const hintsUsed = session.messages.filter((m) => m.type === "hint").length;
  return Math.max(0, 3 - hintsUsed);
}

function aiErrorMessage(action: string): Message {
  return {
    id: uid(),
    role: "ai",
    type: "question",
    content:
      `I couldn't reach the AI service (${action}). ` +
      `Make sure you're signed in and the backend is available, then try again.`,
    timestamp: Date.now(),
  };
}

// ─── Reducer ─────────────────────────────────────────────────────────────

function reducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case "SET_USER_ID":
      return { ...state, userId: action.userId };

    case "START_SESSION":
      return { ...state, currentSession: action.session, hintPoints: 0 };

    case "ADD_MESSAGE": {
      if (!state.currentSession) return state;
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          messages: [...state.currentSession.messages, action.message],
        },
      };
    }

    case "SUBMIT_CODE": {
      if (!state.currentSession) return state;
      const updated: Session = {
        ...state.currentSession,
        codeAttempts: [...state.currentSession.codeAttempts, action.attempt],
        solvedAt: Date.now(),
      };
      return { ...state, currentSession: updated };
    }

    case "MARK_SOLVED": {
      if (!state.currentSession) return state;
      const updated: Session = {
        ...state.currentSession,
        status: action.status,
      };
      if (state.userId) {
        const sessions = saveSession(state.userId, updated);
        return { ...state, currentSession: updated, sessions };
      }
      return { ...state, currentSession: updated };
    }

    case "MARK_REVEALED": {
      if (!state.currentSession) return state;
      const updated: Session = {
        ...state.currentSession,
        status: "revealed",
        hintsUsed: 3,
      };
      if (state.userId) {
        const sessions = saveSession(state.userId, updated);
        return { ...state, currentSession: updated, hintPoints: 0, sessions };
      }
      return { ...state, currentSession: updated, hintPoints: 0 };
    }

    case "SET_HINT_POINTS":
      return { ...state, hintPoints: action.count };

    case "EARN_HINT_POINT":
      return { ...state, hintPoints: Math.min(3, state.hintPoints + 1) };

    case "TOGGLE_HINT_COLLAPSE": {
      if (!state.currentSession) return state;
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          messages: state.currentSession.messages.map((m) =>
            m.id === action.messageId ? { ...m, isCollapsed: !m.isCollapsed } : m,
          ),
        },
      };
    }

    case "SET_LOADING":
      return { ...state, isLoading: action.isLoading };

    case "SET_AI_RESPONDING":
      return { ...state, isAiResponding: action.isResponding };

    case "LOAD_SESSIONS":
      return { ...state, sessions: action.sessions };

    case "REMOVE_SESSION": {
      const sessions = state.sessions.filter((s) => s.id !== action.sessionId);
      const currentSession =
        state.currentSession?.id === action.sessionId ? null : state.currentSession;
      return { ...state, sessions, currentSession, hintPoints: 0 };
    }

    case "RESTORE_SESSION":
      if (!action.session) return state;
      return {
        ...state,
        currentSession: action.session,
        hintPoints: Math.max(0, 3 - computeHintsLeft(action.session)),
      };

    case "RESET_SESSION":
      return { ...state, currentSession: null, hintPoints: 0 };

    default:
      return state;
  }
}

// ─── Context type ────────────────────────────────────────────────────────

interface SessionContextType {
  state: SessionState;
  startSession: (title: string, description: string, pattern?: PatternCategory) => Promise<void>;
  addUserMessage: (content: string) => Promise<void>;
  submitCode: (code: string, language: string) => Promise<void>;
  useHint: () => Promise<void>;
  toggleHintCollapse: (messageId: string) => void;
  giveUp: () => Promise<void>;
  resetSession: () => void;
  restoreSession: (session: Session) => void;
  removeSession: (sessionId: string) => void;
  clearAllSessions: () => void;
  fetchProblem: (url: string) => Promise<{
    title: string;
    description: string;
    pattern: PatternCategory;
  } | null>;
}

const SessionContext = createContext<SessionContextType | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);
  const userId = user?.id ?? null;

  // Keep the storage namespace in sync with the signed-in user.
  useEffect(() => {
    dispatch({ type: "SET_USER_ID", userId });

    if (!userId) {
      // Signed out (or loading): never expose another user's sessions.
      dispatch({ type: "RESET_SESSION" });
      dispatch({ type: "LOAD_SESSIONS", sessions: [] });
      return;
    }

    dispatch({ type: "RESET_SESSION" });
    const sessions = loadSessions(userId);
    dispatch({ type: "LOAD_SESSIONS", sessions });
  }, [userId]);

  // ── Start session ────────────────────────────────────────────────────

  const startSession = useCallback(
    async (title: string, description: string, pattern?: PatternCategory) => {
      const detectedPattern: PatternCategory = pattern ?? inferPatternFromProblem(title, description);

      const session: Session = {
        id: uid(),
        problemTitle: title,
        problemDescription: description,
        pattern: detectedPattern,
        status: "active",
        messages: [],
        codeAttempts: [],
        hintsUsed: 0,
        startedAt: Date.now(),
      };

      dispatch({ type: "START_SESSION", session });
      dispatch({ type: "SET_LOADING", isLoading: true });

      try {
        const aiResponse = await getFirstQuestion(detectedPattern, title, description);
        const firstMsg: Message = {
          id: uid(),
          role: "ai",
          type: "question",
          content: aiResponse.text,
          timestamp: Date.now(),
          visualization: aiResponse.visualization,
        };
        dispatch({ type: "ADD_MESSAGE", message: firstMsg });
      } catch {
        dispatch({ type: "ADD_MESSAGE", message: aiErrorMessage("first-question") });
      } finally {
        dispatch({ type: "SET_LOADING", isLoading: false });
      }
    },
    [],
  );

  // ── Add user message + AI follow-up ──────────────────────────────────

  const addUserMessage = useCallback(
    async (content: string) => {
      if (!state.currentSession) return;

      const userMsg: Message = {
        id: uid(),
        role: "user",
        type: "question",
        content,
        timestamp: Date.now(),
      };
      dispatch({ type: "ADD_MESSAGE", message: userMsg });
      dispatch({ type: "SET_AI_RESPONDING", isResponding: true });

      // Earn a hint point for thoughtful engagement (cap 3)
      if (state.hintPoints < 3) {
        dispatch({ type: "EARN_HINT_POINT" });
      }

      try {
        const session = state.currentSession;
        const allMessages = [...session.messages, userMsg];
        const aiResponse = await getFollowUp(session.pattern, session.problemTitle, allMessages);
        const aiMsg: Message = {
          id: uid(),
          role: "ai",
          type: "question",
          content: aiResponse.text,
          timestamp: Date.now(),
          visualization: aiResponse.visualization,
        };
        dispatch({ type: "ADD_MESSAGE", message: aiMsg });
      } catch {
        dispatch({ type: "ADD_MESSAGE", message: aiErrorMessage("follow-up") });
      } finally {
        dispatch({ type: "SET_AI_RESPONDING", isResponding: false });
      }
    },
    [state.currentSession, state.hintPoints],
  );

  // ── Submit code ──────────────────────────────────────────────────────

  const submitCode = useCallback(
    async (code: string, language: string) => {
      if (!state.currentSession) return;

      const attempt: CodeAttempt = { code, language, submittedAt: Date.now() };
      dispatch({ type: "SUBMIT_CODE", attempt });
      dispatch({ type: "SET_LOADING", isLoading: true });

      try {
        const session = state.currentSession;
        const aiResponse = await getFeedback(code, language, session.pattern, session.problemTitle, session.problemDescription);
        const feedbackMsg: Message = {
          id: uid(),
          role: "ai",
          type: "feedback",
          content: aiResponse.text,
          timestamp: Date.now(),
          visualization: aiResponse.visualization,
        };
        dispatch({ type: "ADD_MESSAGE", message: feedbackMsg });
        dispatch({ type: "MARK_SOLVED", status: "submitted" });
      } catch {
        dispatch({ type: "ADD_MESSAGE", message: aiErrorMessage("feedback") });
      } finally {
        dispatch({ type: "SET_LOADING", isLoading: false });
      }
    },
    [state.currentSession],
  );

  // ── Hint ─────────────────────────────────────────────────────────────

  const useHintCallback = useCallback(async () => {
    if (!state.currentSession || state.hintPoints <= 0) return;

    const hintsUsedSoFar = state.currentSession.messages.filter((m) => m.type === "hint").length;
    const hintLevel = (hintsUsedSoFar + 1) as 1 | 2 | 3;
    const isLastHint = hintLevel >= 3;

    dispatch({ type: "SET_AI_RESPONDING", isResponding: true });

    try {
      const session = state.currentSession;
      const hintResponse = await getHint(session.pattern, session.problemTitle, session.problemDescription, hintLevel, session.messages);

      const hintMsg: Message = {
        id: uid(),
        role: "ai",
        type: "hint",
        content: hintResponse.text,
        timestamp: Date.now(),
        hintLevel,
        isCollapsed: true,
        visualization: hintResponse.visualization,
      };

      dispatch({ type: "ADD_MESSAGE", message: hintMsg });

      if (isLastHint) {
        const revealResponse = await getReveal(session.pattern, session.problemTitle, session.problemDescription);
        const revealMsg: Message = {
          id: uid(),
          role: "ai",
          type: "reveal",
          content: revealResponse.text,
          timestamp: Date.now() + 1,
          visualization: revealResponse.visualization,
        };
        dispatch({ type: "ADD_MESSAGE", message: revealMsg });
        dispatch({ type: "MARK_REVEALED" });
      } else {
        dispatch({ type: "SET_HINT_POINTS", count: state.hintPoints - 1 });
      }
    } catch {
      dispatch({ type: "ADD_MESSAGE", message: aiErrorMessage("hint") });
    } finally {
      dispatch({ type: "SET_AI_RESPONDING", isResponding: false });
    }
  }, [state.currentSession, state.hintPoints]);

  // ── Give up ──────────────────────────────────────────────────────────

  const giveUp = useCallback(async () => {
    if (!state.currentSession) return;
    dispatch({ type: "SET_LOADING", isLoading: true });

    try {
      const session = state.currentSession;
      const revealResponse = await getReveal(session.pattern, session.problemTitle, session.problemDescription);
      const revealMsg: Message = {
        id: uid(),
        role: "ai",
        type: "reveal",
        content: revealResponse.text,
        timestamp: Date.now(),
        visualization: revealResponse.visualization,
      };
      dispatch({ type: "ADD_MESSAGE", message: revealMsg });
      dispatch({ type: "MARK_REVEALED" });
    } catch {
      dispatch({ type: "ADD_MESSAGE", message: aiErrorMessage("reveal") });
    } finally {
      dispatch({ type: "SET_LOADING", isLoading: false });
    }
  }, [state.currentSession]);

  // ── Toggle collapse ──────────────────────────────────────────────────

  const toggleHintCollapse = useCallback((messageId: string) => {
    dispatch({ type: "TOGGLE_HINT_COLLAPSE", messageId });
  }, []);

  // ── Restore / Reset / Delete ─────────────────────────────────────────

  const restoreSession = useCallback((session: Session) => {
    dispatch({ type: "RESTORE_SESSION", session });
  }, []);

  const resetSession = useCallback(() => {
    dispatch({ type: "RESET_SESSION" });
  }, []);

  const removeSession = useCallback(
    (sessionId: string) => {
      if (!state.userId) return;
      dispatch({ type: "REMOVE_SESSION", sessionId });
      deleteSession(state.userId, sessionId);
    },
    [state.userId],
  );

  const clearAllSessions = useCallback(() => {
    if (!state.userId) return;
    dispatch({ type: "LOAD_SESSIONS", sessions: [] });
    dispatch({ type: "RESET_SESSION" });
    clearSessions(state.userId);
  }, [state.userId]);

  // ── Fetch LeetCode problem ───────────────────────────────────────────

  const fetchProblem = useCallback(async (url: string): Promise<{
    title: string;
    description: string;
    pattern: PatternCategory;
  } | null> => {
    try {
      const { fetchLeetCodeProblem } = await import("../services/ai");
      const result = await fetchLeetCodeProblem(url);
      if (!result) return null;
      return { title: result.title, description: result.description, pattern: result.pattern };
    } catch {
      return null;
    }
  }, []);

  return (
    <SessionContext.Provider
      value={{
        state,
        startSession,
        addUserMessage,
        submitCode,
        useHint: useHintCallback,
        toggleHintCollapse,
        giveUp,
        resetSession,
        restoreSession,
        removeSession,
        clearAllSessions,
        fetchProblem,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextType {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}