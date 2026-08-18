import { motion } from "framer-motion";
import { Lightbulb, Code2, ChevronRight, XCircle, Terminal, Loader2 } from "lucide-react";

interface ControlsProps {
  hintPoints: number;
  sessionStatus: string;
  onUseHint: () => void;
  onSubmit: () => void;
  onGiveUp: () => void;
  isAiResponding?: boolean;
}

export default function Controls({
  hintPoints,
  sessionStatus,
  onUseHint,
  onSubmit,
  onGiveUp,
  isAiResponding,
}: ControlsProps) {
  const isSessionActive = sessionStatus === "active";
  const isFinished = sessionStatus === "solved" || sessionStatus === "revealed" || sessionStatus === "submitted";

  if (!isSessionActive && !isFinished) {
    return null;
  }

  if (isFinished) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-2 px-4 py-3 border-t border-neon-green/15 bg-surface/30 backdrop-blur-sm"
      >
        {sessionStatus === "solved" && (
          <span className="text-xs font-code text-neon-green/70 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" />
            $ session_solved — great work!
          </span>
        )}
        {sessionStatus === "revealed" && (
          <span className="text-xs font-code text-destructive/70 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" />
            $ solution_revealed — review and learn.
          </span>
        )}
        {sessionStatus === "submitted" && (
          <span className="text-xs font-code text-neon-cyan/70 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" />
            $ code_submitted — review feedback above.
          </span>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-4 py-2.5 border-t border-neon-green/15 bg-surface/30 backdrop-blur-sm"
    >
      <div className="flex items-center gap-2">
        {/* Hint button */}
        <motion.button
          onClick={onUseHint}
          disabled={hintPoints <= 0 || isAiResponding}
          whileTap={hintPoints > 0 ? { scale: 0.95 } : undefined}
          className="relative px-3 py-1.5 text-xs font-code font-medium rounded-lg border border-neon-amber/30 text-neon-amber bg-neon-amber/10 hover:bg-neon-amber/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer flex items-center gap-1.5 overflow-hidden"
          aria-label={`Use hint (${hintPoints} available)`}
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>Hint</span>
          <span className="text-[10px] bg-neon-amber/20 rounded-full px-1.5 py-0.5 font-mono text-neon-amber/80">
            {hintPoints}
          </span>
        </motion.button>

        {/* Submit button */}
        <motion.button
          onClick={onSubmit}
          disabled={isAiResponding}
          whileTap={{ scale: 0.95 }}
          className="px-3 py-1.5 text-xs font-code font-medium rounded-lg bg-neon-green text-black hover:shadow-[0_0_12px_rgba(0,255,65,0.3)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer flex items-center gap-1.5"
        >
          {isAiResponding ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Code2 className="w-3.5 h-3.5" />
          )}
          <span>Submit</span>
          <ChevronRight className="w-3 h-3" />
        </motion.button>
      </div>

      <button
        onClick={onGiveUp}
        disabled={isAiResponding}
        className="px-3 py-1.5 text-xs font-code text-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-150 cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
      >
        <XCircle className="w-3.5 h-3.5" />
        Give up
      </button>
    </motion.div>
  );
}