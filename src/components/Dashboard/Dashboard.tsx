// SocratIQ Dashboard - problem selection screen
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSession } from "../../store/SessionContext";
import { ALL_PATTERNS, calculateMasteryScore } from "../../utils/patterns";
import type { PatternMastery } from "../../types";
import { useMemo } from "react";
import { BarChart3, Sparkles, Hash, Terminal, Cpu, Zap } from "lucide-react";

function computeMastery(sessions: any[]): PatternMastery[] {
  const now = Date.now();
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

  return ALL_PATTERNS.map((pattern) => {
    const filtered = sessions.filter(
      (s: any) => s.pattern === pattern && s.status !== "active"
    );

    const decayedFiltered = filtered.map((s: any) => {
      const age = now - s.startedAt;
      if (age > THIRTY_DAYS_MS) return { ...s, _weight: 0.5 };
      return { ...s, _weight: 1 };
    });

    const attempted = decayedFiltered.reduce(
      (acc: number, s: any) => acc + (s._weight || 1),
      0
    );
    const solvedWithoutReveal = decayedFiltered
      .filter((s: any) => s.status === "solved")
      .reduce((acc: number, s: any) => acc + (s._weight || 1), 0);
    const solvedWithReveal = decayedFiltered
      .filter((s: any) => s.status === "submitted")
      .reduce((acc: number, s: any) => acc + (s._weight || 1), 0);
    const givenUp = decayedFiltered
      .filter((s: any) => s.status === "revealed")
      .reduce((acc: number, s: any) => acc + (s._weight || 1), 0);
    const totalHintsUsed = decayedFiltered.reduce(
      (acc: number, s: any) => acc + (s.hintsUsed || 0) * (s._weight || 1),
      0
    );

    return {
      pattern,
      attempted,
      solvedWithoutReveal,
      solvedWithReveal,
      givenUp,
      totalHintsUsed,
      masteryScore: calculateMasteryScore({
        attempted,
        solvedWithoutReveal,
        solvedWithReveal,
        givenUp,
        totalHintsUsed,
      }),
    };
  });
}

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
};

const cardItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

export default function Dashboard() {
  const { state } = useSession();
  const navigate = useNavigate();
  const mastery = useMemo(() => computeMastery(state.sessions), [state.sessions]);
  const weakest = [...mastery].sort((a, b) => a.masteryScore - b.masteryScore)[0];
  const hasSessions = mastery.some((m) => m.attempted > 0);

  /* ── Empty state ── */
  if (!hasSessions) {
    return (
      <div className="h-full overflow-y-auto p-6 max-w-4xl mx-auto">
        <h1 className="text-lg font-heading font-semibold text-neon-green mb-6 flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          <span>$ cat mastery_data.log</span>
        </h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-12 h-12 rounded-full bg-neon-green/10 border border-neon-green/20 flex items-center justify-center mb-4" aria-hidden="true">
            <BarChart3 className="w-6 h-6 text-neon-green/50" />
          </div>
          <p className="text-sm font-code font-medium text-foreground/60">$ no data — empty</p>
          <p className="text-xs font-code text-foreground/40 mt-1 max-w-xs leading-relaxed">
            Complete a few problems to unlock your mastery dashboard.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-lg font-heading font-semibold text-neon-green mb-6 flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          <span>$ cat mastery_data.log</span>
        </h1>
      </motion.div>

      {/* Recommended Next */}
      {weakest && (
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          onClick={() => navigate("/")}
          className="w-full text-left mb-6 p-4 rounded-xl terminal-border bg-surface/50 hover:bg-surface-hover/80 hover:border-neon-green/30 transition-all duration-150 cursor-pointer group"
        >
          <p className="text-xs font-code font-medium text-neon-green/70 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            $ recommended
          </p>
          <p className="text-sm font-code text-foreground/60 group-hover:text-foreground/80 transition-colors duration-150">
            <span className="font-semibold text-neon-green">{weakest.pattern}</span>
            {" — "}Score: {weakest.masteryScore}/100. Practice more{" "}
            {weakest.pattern.toLowerCase()} problems.
          </p>
        </motion.button>
      )}

      {/* Stats summary bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="flex items-center gap-4 mb-4 text-xs font-code text-foreground/40"
      >
        <span className="flex items-center gap-1">
          <Hash className="w-3 h-3 text-neon-green/60" />
          <strong className="text-neon-green/80">{mastery.reduce((a, m) => a + m.attempted, 0)}</strong> total
        </span>
        <span className="flex items-center gap-1">
          <Cpu className="w-3 h-3 text-neon-green/60" />
          <strong className="text-neon-green/80">
            {mastery.reduce((a, m) => a + m.solvedWithoutReveal, 0)}
          </strong> solved
        </span>
        <span className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-neon-cyan/60" />
          <strong className="text-neon-cyan/80">
            {mastery.reduce((a, m) => a + m.solvedWithReveal, 0)}
          </strong> with hints
        </span>
      </motion.div>

      {/* Pattern grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
      >
        {mastery.map((m) => (
          <motion.div key={m.pattern} variants={cardItem}>
            <PatternCard mastery={m} onClick={() => navigate(`/history?category=${encodeURIComponent(m.pattern)}`)} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function PatternCard({ mastery, onClick }: { mastery: PatternMastery; onClick: () => void }) {
  const isHigh = mastery.masteryScore >= 70;
  const isMid = mastery.masteryScore >= 40;

  const borderStyle = isHigh
    ? "border-neon-green/25"
    : isMid
      ? "border-neon-cyan/20"
      : "border-destructive/20";

  const barColor = isHigh
    ? "bg-neon-green"
    : isMid
      ? "bg-neon-cyan"
      : "bg-destructive";

  const glowStyle = isHigh
    ? "shadow-[0_0_12px_rgba(0,255,65,0.1)]"
    : isMid
      ? "shadow-[0_0_12px_rgba(0,212,255,0.1)]"
      : "";

  const scoreColor = isHigh
    ? "text-neon-green"
    : isMid
      ? "text-neon-cyan"
      : "text-destructive";

  const avgHints =
    mastery.attempted > 0
      ? (mastery.totalHintsUsed / mastery.attempted).toFixed(1)
      : "—";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl terminal-border ${borderStyle} ${glowStyle} bg-surface/40 transition-all duration-150 hover:bg-surface-hover/80 active:scale-[0.98] cursor-pointer`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-code font-medium text-foreground/80">{mastery.pattern}</h3>
        <span className={`text-lg font-bold font-code ${scoreColor}`}>
          {mastery.masteryScore}
        </span>
      </div>

      {/* Score bar */}
      <div className="h-1.5 rounded-full bg-neon-green/10 mb-3 overflow-hidden">
        <motion.div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${mastery.masteryScore}%` }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          style={{ opacity: 0.6 }}
        />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-1 text-center">
        <div>
          <div className="text-xs font-medium text-foreground/70 font-code">{Math.round(mastery.attempted)}</div>
          <div className="text-[10px] font-code text-foreground/40">Problems</div>
        </div>
        <div>
          <div className="text-xs font-medium text-neon-green font-code">
            {Math.round(mastery.solvedWithoutReveal)}
          </div>
          <div className="text-[10px] font-code text-foreground/40">Solved</div>
        </div>
        <div>
          <div className="text-xs font-medium text-foreground/70 font-code">{Math.round(mastery.givenUp)}</div>
          <div className="text-[10px] font-code text-foreground/40">Given up</div>
        </div>
        <div>
          <div className="text-xs font-medium text-foreground/70 font-code">{avgHints}</div>
          <div className="text-[10px] font-code text-foreground/40">Avg hints</div>
        </div>
      </div>
    </button>
  );
}