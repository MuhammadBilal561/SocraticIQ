import { motion } from "framer-motion";
import type { TreeVisualizationData } from "../../types";

interface Props {
  data: TreeVisualizationData;
}

interface LayoutNode {
  id: string;
  value: number | string;
  x: number;
  y: number;
  parentId: string | null;
}

function buildLayout(data: TreeVisualizationData): LayoutNode[] {
  const { nodes } = data;
  if (nodes.length === 0) return [];

  // Build adjacency
  const children = new Map<string, string[]>();
  const rootId = nodes.find((n) => n.parentId === null)?.id || nodes[0].id;
  for (const n of nodes) {
    if (n.parentId) {
      const list = children.get(n.parentId) || [];
      list.push(n.id);
      children.set(n.parentId, list);
    }
  }

  const layout: LayoutNode[] = [];
  const SPACING_X = 56;
  const SPACING_Y = 64;

  function dfs(nodeId: string, x: number, y: number, left: number, right: number) {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    layout.push({ id: node.id, value: node.value, x, y, parentId: node.parentId });

    const kids = children.get(nodeId) || [];
    if (kids.length === 0) return;

    const mid = (left + right) / 2;
    if (kids.length === 1) {
      dfs(kids[0], mid, y + SPACING_Y, left, right);
    } else if (kids.length >= 2) {
      const third = (right - left) / (kids.length + 1);
      kids.forEach((kid, i) => {
        const kx = left + third * (i + 1);
        dfs(kid, kx, y + SPACING_Y, kx - SPACING_X / 2, kx + SPACING_X / 2);
      });
    }
  }

  dfs(rootId, 0, 0, -SPACING_X * 2, SPACING_X * 2);
  return layout;
}

export default function TreeVisualization({ data }: Props) {
  const { highlights = [], operation, caption } = data;
  const layout = buildLayout(data);
  if (layout.length === 0) return null;

  // Normalize coordinates
  const minX = Math.min(...layout.map((n) => n.x));
  const maxX = Math.max(...layout.map((n) => n.x));
  const maxY = Math.max(...layout.map((n) => n.y));

  const width = Math.max(maxX - minX + 100, 280);
  const height = maxY + 80;

  const toSvgX = (x: number) => x - minX + 50;
  const toSvgY = (y: number) => y + 16;

  return (
    <div className="space-y-3">
      {operation && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-code text-neon-cyan/70 bg-neon-cyan/5 px-2 py-0.5 rounded border border-neon-cyan/20">
            $ {operation}
          </span>
        </div>
      )}

      <div className="flex justify-center">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible"
          aria-label="Tree visualization"
        >
          {/* Edges */}
          {layout.map((node) => {
            if (!node.parentId) return null;
            const parent = layout.find((n) => n.id === node.parentId);
            if (!parent) return null;
            return (
              <motion.line
                key={`edge-${node.id}`}
                initial={{ opacity: 0, pathLength: 0 }}
                animate={{ opacity: 1, pathLength: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                x1={toSvgX(parent.x)}
                y1={toSvgY(parent.y)}
                x2={toSvgX(node.x)}
                y2={toSvgY(node.y)}
                stroke="oklch(0.72 0.22 150 / 0.25)"
                strokeWidth={2}
                strokeDasharray={node.parentId ? "4 2" : undefined}
              />
            );
          })}

          {/* Nodes */}
          {layout.map((node, idx) => {
            const isHighlighted = highlights.includes(node.id);
            return (
              <motion.g
                key={node.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, delay: idx * 0.06, ease: "easeOut" }}
              >
                {/* Node circle */}
                <circle
                  cx={toSvgX(node.x)}
                  cy={toSvgY(node.y)}
                  r={20}
                  fill={
                    isHighlighted
                      ? "oklch(0.72 0.22 150 / 0.15)"
                      : "oklch(0.04 0.01 150 / 0.6)"
                  }
                  stroke={
                    isHighlighted
                      ? "oklch(0.72 0.22 150 / 0.8)"
                      : "oklch(0.72 0.22 150 / 0.25)"
                  }
                  strokeWidth={isHighlighted ? 2.5 : 1.5}
                  style={{
                    filter: isHighlighted
                      ? "drop-shadow(0 0 6px oklch(0.72 0.22 150 / 0.4))"
                      : undefined,
                  }}
                />
                {/* Value text */}
                <text
                  x={toSvgX(node.x)}
                  y={toSvgY(node.y) + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-[11px] font-code font-bold"
                  fill={
                    isHighlighted
                      ? "oklch(0.72 0.22 150)"
                      : "oklch(0.92 0.04 150 / 0.7)"
                  }
                  style={{ fontFamily: "JetBrains Mono, monospace" }}
                >
                  {String(node.value)}
                </text>
              </motion.g>
            );
          })}
        </svg>
      </div>

      {caption && (
        <p className="text-[11px] font-code text-foreground/50 text-center italic leading-relaxed">
          $ echo "{caption}"
        </p>
      )}
    </div>
  );
}