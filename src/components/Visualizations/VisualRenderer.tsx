import type { VisualizationData } from "../../types";
import ArrayVisualization from "./ArrayVisualization";
import LinkedListVisualization from "./LinkedListVisualization";
import TreeVisualization from "./TreeVisualization";
import StackVisualization from "./StackVisualization";

interface Props {
  data: VisualizationData;
}

export default function VisualRenderer({ data }: Props) {
  switch (data.type) {
    case "array":
      return (
        <div className="visualization-container terminal-border rounded-xl p-4 bg-surface/30 my-3">
          <div className="text-[10px] font-code text-neon-green/50 uppercase tracking-widest mb-3 font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
            $ memory_visualization
          </div>
          <ArrayVisualization data={data} />
        </div>
      );

    case "linked-list":
      return (
        <div className="visualization-container terminal-border rounded-xl p-4 bg-surface/30 my-3">
          <div className="text-[10px] font-code text-neon-green/50 uppercase tracking-widest mb-3 font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
            $ memory_visualization
          </div>
          <LinkedListVisualization data={data} />
        </div>
      );

    case "tree":
      return (
        <div className="visualization-container terminal-border rounded-xl p-4 bg-surface/30 my-3">
          <div className="text-[10px] font-code text-neon-green/50 uppercase tracking-widest mb-3 font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
            $ memory_visualization
          </div>
          <TreeVisualization data={data} />
        </div>
      );

    case "stack":
      return (
        <div className="visualization-container terminal-border rounded-xl p-4 bg-surface/30 my-3">
          <div className="text-[10px] font-code text-neon-green/50 uppercase tracking-widest mb-3 font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
            $ memory_visualization
          </div>
          <StackVisualization data={data} />
        </div>
      );

    default:
      return null;
  }
}