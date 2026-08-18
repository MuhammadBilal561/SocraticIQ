// SocratIQ Problem Screen - interactive problem solving with AI tutoring
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ALL_PATTERNS } from "../../utils/patterns";
import { useSession } from "../../store/SessionContext";
import ChatPanel from "./ChatPanel";
import CodeEditor from "./CodeEditor";
import Controls from "./Controls";
import { Loader2, Send, Trash2, ExternalLink, Terminal } from "lucide-react";

// Monaco loads async; this prevents issues
import "@monaco-editor/react";

function ProblemInputForm() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const { startSession, fetchProblem } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) {
      setError("Please paste a problem title and description.");
      return;
    }

    setError("");

    // Check for LeetCode URL
    const leetCodeMatch = trimmed.match(/leetcode\.com\/problems\/([a-z0-9-]+)/i);
    if (leetCodeMatch) {
      setIsFetching(true);
      const result = await fetchProblem(trimmed);
      setIsFetching(false);

      if (result) {
        await startSession(result.title, result.description, result.pattern);
        setInput("");
        return;
      }

      setError("Couldn't auto-fetch from LeetCode. You can paste the problem text manually instead.");
      return;
    }

    await startSession(trimmed, trimmed);
    setInput("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col h-full items-center justify-center p-6"
    >
      <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-5">
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1, type: "spring", stiffness: 200 }}
          >
            <div className="w-12 h-12 rounded-xl bg-neon-green text-black flex items-center justify-center mx-auto shadow-[0_0_16px_rgba(0,255,65,0.3)] mb-3">
              <Terminal className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-heading font-bold text-neon-green glow-text">socratiq</h1>
          </motion.div>
          <p className="text-sm font-code text-foreground/50 max-w-sm mx-auto leading-relaxed">
            $ echo "paste a problem" &gt; /dev/tutor
          </p>
        </div>

        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError("");
            }}
            disabled={isFetching}
            placeholder="$ Paste a LeetCode URL or problem title + description here..."
            rows={5}
            className="w-full px-4 py-3 text-sm font-code border border-neon-green/20 rounded-xl bg-black/50 placeholder:text-neon-green/20 focus:outline-none focus:ring-2 focus:ring-neon-green/30 focus:border-neon-green/50 resize-none transition-all duration-150 disabled:opacity-50 text-neon-green/80"
            aria-label="Problem input"
          />
          <AnimatePresence>
            {input.trim() && !isFetching && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                type="button"
                onClick={() => setInput("")}
                className="absolute top-2.5 right-2.5 p-1.5 rounded-md text-neon-green/30 hover:text-neon-green/60 hover:bg-neon-green/10 transition-colors duration-150 cursor-pointer"
                aria-label="Clear input"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-xs font-code text-destructive flex items-center gap-1.5"
              role="alert"
            >
              <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          type="submit"
          disabled={isFetching}
          whileTap={{ scale: 0.97 }}
          className="w-full py-2.5 text-sm font-code font-semibold rounded-xl bg-neon-green text-black hover:shadow-[0_0_16px_rgba(0,255,65,0.3)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer flex items-center justify-center gap-2"
        >
          {isFetching ? (
            <>
              <Loader2 className="animate-spin h-4 w-4" />
              $ fetching...
            </>
          ) : (
            <>
              <Terminal className="w-4 h-4" />
              $ start_session
            </>
          )}
        </motion.button>

        <div className="text-center pt-2">
          <p className="text-[10px] font-code text-neon-green/30 uppercase tracking-widest mb-3 font-medium">$ patterns_available</p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {ALL_PATTERNS.map((p, i) => (
              <motion.span
                key={p}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.3 + i * 0.03 }}
                className="text-[10px] font-code px-2 py-0.5 rounded-full bg-neon-green/5 text-neon-green/50 border border-neon-green/15"
              >
                {p}
              </motion.span>
            ))}
          </div>
        </div>
      </form>
    </motion.div>
  );
}

export default function ProblemScreen() {
  const { state, addUserMessage, submitCode, useHint, toggleHintCollapse, giveUp, resetSession } = useSession();
  const [code, setCode] = useState("# Write your solution here\n\ndef solve():\n    pass\n");

  const handleSubmitCode = () => {
    if (code.trim() && state.currentSession) {
      submitCode(code, "python");
    }
  };

  if (!state.currentSession) {
    return <ProblemInputForm />;
  }

  const session = state.currentSession;
  const isActive = session.status === "active";

  return (
    <div className="h-full flex flex-col">
      {/* Problem header — hacker style */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="px-4 py-2.5 border-b border-neon-green/15 bg-surface/30 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-code font-medium text-foreground/80 truncate">
                {session.problemTitle}
              </h2>
              <button
                onClick={resetSession}
                className="shrink-0 p-1 rounded-md text-neon-green/40 hover:text-neon-green/70 hover:bg-neon-green/10 transition-all duration-150 cursor-pointer"
                aria-label="Start new problem"
                title="New problem"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-code px-1.5 py-0.5 rounded-md bg-neon-green/10 text-neon-green font-medium border border-neon-green/20">
                {session.pattern}
              </span>
              <span className="text-[10px] font-code text-foreground/40">
                {session.status === "active" && "$ in_progress"}
                {session.status === "solved" && "$ SOLVED ✓"}
                {session.status === "revealed" && "$ REVEALED"}
                {session.status === "submitted" && "$ SUBMITTED"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Split pane: chat left, code right */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Chat panel */}
        <div className="flex-1 flex flex-col min-h-[300px] md:min-h-0 border-b md:border-b-0 md:border-r border-neon-green/15">
          {isActive && (
            <div className="px-4 py-2.5 border-b border-neon-green/15 bg-surface/20">
              <ChatInput onSend={addUserMessage} isResponding={state.isAiResponding} />
            </div>
          )}
          <ChatPanel
            messages={session.messages}
            onToggleHintCollapse={toggleHintCollapse}
            isAiResponding={state.isAiResponding}
          />
        </div>

        {/* Code editor */}
        <div className="flex-1 flex flex-col min-h-[300px] md:min-h-0">
          <CodeEditor
            value={code}
            onChange={setCode}
            sessionStatus={session.status}
          />
        </div>
      </div>

      {/* Controls */}
      <Controls
        hintPoints={state.hintPoints}
        sessionStatus={session.status}
        onUseHint={useHint}
        onSubmit={handleSubmitCode}
        onGiveUp={giveUp}
        isAiResponding={state.isAiResponding}
      />
    </div>
  );
}

function ChatInput({ onSend, isResponding }: { onSend: (msg: string) => void; isResponding?: boolean }) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isResponding}
        placeholder="$ type your thoughts here..."
        className="flex-1 px-3 py-1.5 text-sm font-code border border-neon-green/20 rounded-lg bg-black/50 placeholder:text-neon-green/20 focus:outline-none focus:ring-2 focus:ring-neon-green/30 focus:border-neon-green/50 transition-all duration-150 disabled:opacity-50 text-neon-green/80"
        aria-label="Chat message input"
      />
      <motion.button
        type="submit"
        disabled={!input.trim() || isResponding}
        whileTap={input.trim() && !isResponding ? { scale: 0.95 } : undefined}
        className="px-3 py-1.5 text-xs font-code font-medium rounded-lg bg-neon-green text-black hover:shadow-[0_0_8px_rgba(0,255,65,0.3)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer flex items-center gap-1.5"
      >
        {isResponding ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Send className="w-3.5 h-3.5" />
        )}
        Send
      </motion.button>
    </form>
  );
}