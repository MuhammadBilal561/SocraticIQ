import { motion, AnimatePresence } from "framer-motion";
import type { ArrayVisualizationData } from "../../types";

interface Props {
  data: ArrayVisualizationData;
}

export default function ArrayVisualization({ data }: Props) {
  const { elements, highlights = [], pointers = [], labels, operation, caption } = data;

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

      {/* Memory address row */}
      <div className="flex gap-1 items-end justify-center">
        {elements.map((_, idx) => (
          <span key={idx} className="text-[9px] font-code text-foreground/25 w-10 text-center">
            0x{(0x7fff + idx * 4).toString(16).toUpperCase()}
          </span>
        ))}
      </div>

      {/* Array elements */}
      <div className="flex gap-1 justify-center">
        <AnimatePresence mode="popLayout">
          {elements.map((el, idx) => {
            const isHighlighted = highlights.includes(idx);
            const pointerHere = pointers.filter((p) => p.index === idx);
            return (
              <motion.div
                key={idx}
                layout
                initial={{ opacity: 0, scale: 0.8, y: -8 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
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
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="relative flex flex-col items-center"
              >
                {/* Pointer arrows */}
                {pointerHere.map((p) => (
                  <motion.div
                    key={p.label}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-1"
                  >
                    <span className="text-[9px] font-code text-neon-cyan px-1 py-0.5 rounded bg-neon-cyan/10 border border-neon-cyan/30 whitespace-nowrap">
                      ↓ {p.label}
                    </span>
                  </motion.div>
                ))}

                {/* Index label */}
                <span className="text-[9px] font-code text-foreground/30 mb-0.5">
                  [{idx}]
                </span>

                {/* Box */}
                <div
                  className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-sm font-code font-bold transition-all duration-150 ${
                    isHighlighted
                      ? "text-neon-green border-neon-green/80 bg-neon-green/15 shadow-[0_0_12px_rgba(0,255,65,0.3)]"
                      : "text-foreground/70 border-neon-green/25 bg-surface/60"
                  }`}
                >
                  {el !== null ? String(el) : "—"}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Custom labels row */}
      {labels && labels.length > 0 && (
        <div className="flex gap-1 justify-center">
          {labels.map((label, idx) => (
            <span
              key={idx}
              className="text-[9px] font-code text-neon-green/50 w-10 text-center truncate"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Caption */}
      {caption && (
        <p className="text-[11px] font-code text-foreground/50 text-center italic leading-relaxed">
          $ echo "{caption}"
        </p>
      )}
    </div>
  );
}