import { motion, AnimatePresence } from "framer-motion";
import type { StackVisualizationData } from "../../types";

interface Props {
  data: StackVisualizationData;
}

export default function StackVisualization({ data }: Props) {
  const { items, highlights = [], operation, caption } = data;
  const reversed = [...items].reverse();

  return (
    <div className="space-y-3">
      {/* Operation badge */}
      {operation && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-code text-neon-cyan/70 bg-neon-cyan/5 px-2 py-0.5 rounded border border-neon-cyan/20">
            $ {operation}
          </span>
        </div>
      )}

      <div className="flex flex-col items-center">
        {/* TOP label */}
        {items.length > 0 && (
          <div className="mb-1">
            <span className="text-[9px] font-code text-neon-cyan/60 px-1.5 py-0.5 rounded bg-neon-cyan/10 border border-neon-cyan/30">
              TOP → [{items.length - 1}]
            </span>
          </div>
        )}

        {/* Stack elements rendered top-to-bottom */}
        <div className="flex flex-col-reverse gap-1">
          <AnimatePresence mode="popLayout">
            {reversed.map((item, revIdx) => {
              const realIdx = items.length - 1 - revIdx;
              const isHighlighted = highlights.includes(realIdx);

              return (
                <motion.div
                  key={`${realIdx}-${item}`}
                  layout
                  initial={{ opacity: 0, x: items.length > 1 && revIdx === 0 ? 30 : -12, scale: 0.9 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    scale: 1,
                    borderColor: isHighlighted
                      ? "oklch(0.72 0.22 150 / 0.8)"
                      : "oklch(0.72 0.22 150 / 0.25)",
                    backgroundColor: isHighlighted
                      ? "oklch(0.72 0.22 150 / 0.15)"
                      : "oklch(0.04 0.01 150 / 0.6)",
                    boxShadow: isHighlighted
                      ? "0 0 12px oklch(0.72 0.22 150 / 0.3)"
                      : "none",
                  }}
                  exit={{ opacity: 0, x: -20, scale: 0.9 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className={`w-28 px-4 py-2 rounded-lg border-2 flex items-center justify-between transition-all duration-150 ${
                    isHighlighted
                      ? "text-neon-green border-neon-green/80 bg-neon-green/15"
                      : "text-foreground/70 border-neon-green/25 bg-surface/60"
                  }`}
                >
                  <span className="text-[10px] font-code font-bold">
                    {String(item)}
                  </span>
                  <span className="text-[8px] font-code text-foreground/30">
                    [{realIdx}]
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* BOTTOM indicator */}
        {items.length > 0 && (
          <div className="mt-1 flex flex-col items-center">
            <div className="w-28 h-px bg-neon-green/30" />
            <span className="text-[9px] font-code text-foreground/30 mt-0.5">
              [0] BOTTOM
            </span>
          </div>
        )}
      </div>

      {/* Caption */}
      {caption && (
        <p className="text-[11px] font-code text-foreground/50 text-center italic leading-relaxed">
          $ echo "{caption}"
        </p>
      )}
    </div>
  );
}