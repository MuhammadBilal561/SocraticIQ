import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { LinkedListVisualizationData } from "../../types";

interface Props {
  data: LinkedListVisualizationData;
}

export default function LinkedListVisualization({ data }: Props) {
  const { nodes, edges, highlights = [], pointers = [], operation, caption } = data;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

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

      {/* Nodes in horizontal layout */}
      <div className="flex items-center justify-center flex-wrap gap-0">
        {nodes.map((node, idx) => {
          const isHighlighted = highlights.includes(node.id);
          const pointerHere = pointers.filter((p) => p.nodeId === node.id);
          const edgeTo = edges.find((e) => e.from === node.id);

          return (
            <div key={node.id} className="flex items-center">
              <motion.div
                initial={{ opacity: 0, x: -12, scale: 0.9 }}
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
                transition={{ duration: 0.25, ease: "easeOut", delay: idx * 0.08 }}
                className="relative flex flex-col items-center"
              >
                {/* Pointer labels above */}
                {pointerHere.map((p) => (
                  <motion.span
                    key={p.label}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[9px] font-code text-neon-cyan px-1 py-0.5 mb-1 rounded bg-neon-cyan/10 border border-neon-cyan/30 whitespace-nowrap"
                  >
                    {p.label}
                  </motion.span>
                ))}

                {/* Node box */}
                <div
                  className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-sm font-code font-bold transition-all duration-150 ${
                    isHighlighted
                      ? "text-neon-green border-neon-green/80 bg-neon-green/15 shadow-[0_0_12px_rgba(0,255,65,0.3)]"
                      : "text-foreground/70 border-neon-green/25 bg-surface/60"
                  }`}
                >
                  {node.value}
                </div>

                {/* Node ID label */}
                <span className="text-[8px] font-code text-foreground/25 mt-0.5">
                  &lt;{node.id}&gt;
                </span>
              </motion.div>

              {/* Arrow to next node */}
              {edgeTo && nodeMap.has(edgeTo.to) && (
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.2, delay: idx * 0.08 + 0.1 }}
                  className="flex items-center mx-1"
                >
                  <div className="w-6 h-px bg-neon-green/30" />
                  <ArrowRight className="w-3.5 h-3.5 text-neon-green/40 -ml-1 shrink-0" />
                </motion.div>
              )}

              {/* Null next (tail) indicator */}
              {!edgeTo && idx < nodes.length - 1 && (
                <div className="flex items-center mx-1">
                  <div className="w-4 h-px bg-neon-green/15" />
                  <span className="text-[8px] font-code text-foreground/20 ml-1">
                    null
                  </span>
                </div>
              )}
            </div>
          );
        })}
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