import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "../../store/SessionContext";
import { ALL_PATTERNS } from "../../utils/patterns";
import type { Session, PatternCategory } from "../../types";
import MessageComponent from "../ProblemScreen/Message";
import {
  History,
  Search,
  ChevronLeft,
  Code2,
  Lightbulb,
  Clock,
  Terminal,
  Trash2,
} from "lucide-react";

/* ─── Pattern color mapping ─── */
const patternColors: Record<string, string> = {
  "Arrays & Hashing": "border-neon-green/30 text-neon-green bg-neon-green/10",
  "Two Pointers": "border-neon-cyan/30 text-neon-cyan bg-neon-cyan/10",
  "Sliding Window": "border-neon-green/30 text-neon-green bg-neon-green/10",
  Stack: "border-neon-cyan/30 text-neon-cyan bg-neon-cyan/10",
  "Binary Search": "border-neon-green/30 text-neon-green bg-neon-green/10",
  "Linked List": "border-neon-pink/30 text-neon-pink bg-neon-pink/10",
  Trees: "border-neon-green/30 text-neon-green bg-neon-green/10",
  Tries: "border-neon-cyan/30 text-neon-cyan bg-neon-cyan/10",
  Backtracking: "border-neon-pink/30 text-neon-pink bg-neon-pink/10",
  "Dynamic Programming": "border-neon-purple/30 text-neon-purple bg-neon-purple/10",
};

function getPatternColor(pattern: string): string {
  return patternColors[pattern] || "border-neon-green/30 text-neon-green bg-neon-green/10";
}

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.04 },
  },
};

const listItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" as const } },
};

export default function HistoryPage() {
  const { state, removeSession, clearAllSessions } = useSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") as PatternCategory | null;
  const [filter, setFilter] = useState<PatternCategory | "All">(
    initialCategory && ALL_PATTERNS.includes(initialCategory) ? initialCategory : "All"
  );
  const [search, setSearch] = useState("");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  useEffect(() => {
    if (filter === "All") {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ category: filter }, { replace: true });
    }
  }, [filter, setSearchParams]);

  const filtered = useMemo(() => {
    let result = state.sessions;
    if (filter !== "All") {
      result = result.filter((s) => s.pattern === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((s) => s.problemTitle.toLowerCase().includes(q));
    }
    return [...result].sort((a, b) => b.startedAt - a.startedAt);
  }, [state.sessions, filter, search]);

  /* ── Empty state ── */
  if (state.sessions.length === 0) {
    return (
      <div className="h-full overflow-y-auto p-6 max-w-3xl mx-auto">
        <h1 className="text-lg font-heading font-semibold text-neon-green mb-6 flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          <span>$ ls /var/log/sessions</span>
        </h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-12 h-12 rounded-full bg-neon-green/10 border border-neon-green/20 flex items-center justify-center mb-4" aria-hidden="true">
            <History className="w-6 h-6 text-neon-green/50" />
          </div>
          <p className="text-sm font-code font-medium text-foreground/60">$ no sessions — empty</p>
          <p className="text-xs font-code text-foreground/40 mt-1 max-w-xs leading-relaxed">
            Start a problem from the <strong className="text-neon-green">Problem</strong> page to build your session history.
          </p>
        </motion.div>
      </div>
    );
  }

  /* ── Detail view ── */
  if (selectedSession) {
    return (
      <div className="h-full overflow-y-auto p-6 max-w-3xl mx-auto">
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setSelectedSession(null)}
          className="flex items-center gap-1.5 text-xs font-code text-foreground/50 hover:text-neon-green mb-4 transition-colors duration-150 cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          $ cd ..
        </motion.button>

        {/* Session header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 rounded-xl terminal-border bg-surface/50 mb-4"
        >
          <h2 className="text-base font-code font-medium text-foreground/90">{selectedSession.problemTitle}</h2>
          <div className="flex items-center flex-wrap gap-2 mt-2">
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md border font-code font-medium ${getPatternColor(selectedSession.pattern)}`}
            >
              {selectedSession.pattern}
            </span>
            <span className="text-xs font-code text-foreground/40 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(selectedSession.startedAt).toLocaleString()}
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md font-code font-medium border ${
                selectedSession.status === "solved"
                  ? "bg-neon-green/10 text-neon-green border-neon-green/20"
                  : selectedSession.status === "revealed"
                    ? "bg-destructive/10 text-destructive border-destructive/20"
                    : selectedSession.status === "submitted"
                      ? "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20"
                      : "bg-foreground/5 text-foreground/50 border-border/30"
              }`}
            >
              {selectedSession.status === "solved" && "SOLVED ✓"}
              {selectedSession.status === "revealed" && "REVEALED"}
              {selectedSession.status === "submitted" && "SUBMITTED"}
              {selectedSession.status === "active" && "IN PROGRESS"}
            </span>
          </div>
        </motion.div>

        {/* Chat transcript */}
        <div className="space-y-4 mb-4" role="log" aria-label="Session chat transcript">
          {selectedSession.messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
            >
              <MessageComponent key={msg.id} message={msg} />
            </motion.div>
          ))}
        </div>

        {/* Code attempts */}
        {selectedSession.codeAttempts.length > 0 && (
          <div className="space-y-3 mb-4">
            <h3 className="text-sm font-code font-medium text-foreground/80 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-neon-green/60" />
              $ code_attempts
            </h3>
            {selectedSession.codeAttempts.map((attempt, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                className="rounded-xl terminal-border overflow-hidden bg-surface/30"
              >
                <div className="flex items-center justify-between px-3 py-1.5 bg-neon-green/5 border-b border-neon-green/10">
                  <span className="text-[10px] font-code font-medium text-neon-green/60 uppercase tracking-wider">
                    $ attempt_{i + 1}
                  </span>
                  <span className="text-[10px] font-code text-foreground/40">
                    {attempt.language}
                  </span>
                </div>
                <pre className="p-3 text-xs font-code text-foreground/60 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                  {attempt.code}
                </pre>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── List view ── */
  return (
    <div className="h-full overflow-y-auto p-6 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-lg font-heading font-semibold text-neon-green mb-4 flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          <span>$ ls /var/log/sessions</span>
        </h1>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="flex flex-col sm:flex-row gap-3 mb-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neon-green/30 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="$ grep -i problem_name"
            className="w-full pl-8 pr-3 py-1.5 text-sm font-code border border-neon-green/20 rounded-lg bg-black/50 placeholder:text-neon-green/20 focus:outline-none focus:ring-2 focus:ring-neon-green/30 focus:border-neon-green/50 transition-all duration-150 text-neon-green/80"
            aria-label="Search sessions by problem title"
          />
        </div>
      </motion.div>

      {/* Pattern filter chips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-wrap gap-1.5 mb-4"
        role="group"
        aria-label="Filter by pattern category"
      >
        <button
          onClick={() => setFilter("All")}
          className={`text-xs font-code px-2 py-1 rounded-md border transition-all duration-150 cursor-pointer ${
            filter === "All"
              ? "bg-neon-green/10 border-neon-green/30 text-neon-green font-medium"
              : "border-neon-green/15 text-foreground/50 hover:text-neon-green/70 hover:border-neon-green/30"
          }`}
        >
          All
        </button>
        {ALL_PATTERNS.map((p) => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            className={`text-xs font-code px-2 py-1 rounded-md border transition-all duration-150 cursor-pointer ${
              filter === p
                ? "bg-neon-green/10 border-neon-green/30 text-neon-green font-medium"
                : "border-neon-green/15 text-foreground/50 hover:text-neon-green/70 hover:border-neon-green/30"
            }`}
          >
            {p}
          </button>
        ))}
      </motion.div>

      {/* Session count */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-code text-foreground/40">
          $ wc -l: {filtered.length === state.sessions.length
            ? `${state.sessions.length} session${state.sessions.length !== 1 ? "s" : ""}`
            : `${filtered.length} of ${state.sessions.length} session${state.sessions.length !== 1 ? "s" : ""}`}
        </p>
        <button
          onClick={() => {
            if (window.confirm("Clear all sessions? This cannot be undone.")) {
              clearAllSessions();
            }
          }}
          className="text-xs font-code text-destructive/70 hover:text-destructive flex items-center gap-1 transition-colors duration-150 cursor-pointer"
          aria-label="Clear all sessions"
        >
          <Trash2 className="w-3 h-3" />
          $ clear all
        </button>
      </div>

      {/* Session list */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <Search className="w-6 h-6 text-neon-green/30 mb-2" />
          <p className="text-sm font-code text-foreground/50">$ grep: no matches found</p>
          <button
            onClick={() => { setSearch(""); setFilter("All"); }}
            className="mt-2 text-xs font-code text-neon-green hover:underline cursor-pointer"
          >
            $ clear_filters
          </button>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-2"
          role="list"
          aria-label="Session list"
        >
          <AnimatePresence>
            {filtered.map((session) => (
              <motion.div key={session.id} variants={listItem} layout>
                <div
                  onClick={() => setSelectedSession(session)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedSession(session);
                    }
                  }}
                  tabIndex={0}
                  role="listitem"
                  className="w-full text-left p-3 pb-10 rounded-xl terminal-border border-neon-green/10 hover:border-neon-green/25 focus:outline-none focus:ring-2 focus:ring-neon-green/40 transition-all duration-150 cursor-pointer bg-surface/30 hover:bg-surface-hover/60 group relative"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {/* Title */}
                      <p className="text-sm font-code font-medium text-foreground/70 truncate group-hover:text-neon-green/90 transition-colors duration-150">
                        {session.problemTitle}
                      </p>

                      {/* Tags row */}
                      <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
                        {/* Pattern badge */}
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md border font-code font-medium ${getPatternColor(session.pattern)}`}
                        >
                          {session.pattern}
                        </span>

                        {/* Hints used */}
                        {session.hintsUsed > 0 && (
                          <span className="text-[10px] font-code text-neon-cyan/60 flex items-center gap-0.5">
                            <Lightbulb className="w-3 h-3" />
                            {session.hintsUsed} hint{session.hintsUsed !== 1 ? "s" : ""}
                          </span>
                        )}

                        {/* Status badge */}
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-code font-medium ${
                            session.status === "solved"
                              ? "bg-neon-green/10 text-neon-green"
                              : session.status === "revealed"
                                ? "bg-destructive/10 text-destructive"
                                : session.status === "submitted"
                                  ? "bg-neon-cyan/10 text-neon-cyan"
                                  : "bg-foreground/5 text-foreground/50"
                          }`}
                        >
                          {session.status === "solved" && "SOLVED ✓"}
                          {session.status === "revealed" && "REVEALED"}
                          {session.status === "submitted" && "SUBMITTED"}
                          {session.status === "active" && "IN PROGRESS"}
                        </span>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="text-xs font-code text-foreground/40 shrink-0 whitespace-nowrap pt-0.5">
                      {new Date(session.startedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete session "${session.problemTitle}"?`)) {
                        removeSession(session.id);
                      }
                    }}
                    className="absolute right-2.5 bottom-2.5 w-6 h-6 rounded-md flex items-center justify-center text-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-colors duration-150 cursor-pointer opacity-0 group-hover:opacity-100"
                    aria-label={`Delete session ${session.problemTitle}`}
                    title="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}