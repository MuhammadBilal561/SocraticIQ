import { motion } from "framer-motion";
import { Lightbulb, Eye, Bot, User, ChevronDown, Terminal } from "lucide-react";
import type { Message } from "../../types";
import VisualRenderer from "../Visualizations/VisualRenderer";

interface MessageBubbleProps {
  message: Message;
  onToggleCollapse?: (id: string) => void;
}

/** Renders inline visualization when the message has visual data */
function InlineVisual({ message }: { message: Message }) {
  if (!message.visualization) return null;
  return <VisualRenderer data={message.visualization} />;
}

function MessageAvatar({ role, icon }: { role: string; icon: React.ReactNode }) {
  const colorMap: Record<string, string> = {
    ai: "bg-neon-green/10 text-neon-green border border-neon-green/20",
    user: "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20",
    feedback: "bg-neon-green/10 text-neon-green border border-neon-green/20",
    reveal: "bg-destructive/10 text-destructive border border-destructive/20",
    hint: "bg-neon-amber/10 text-neon-amber border border-neon-amber/20",
  };
  return (
    <div
      className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${colorMap[role] || "bg-foreground/10 text-foreground/70"}`}
      aria-hidden="true"
    >
      {icon}
    </div>
  );
}

export function QuestionMessage({ message }: { message: Message }) {
  const isAi = message.role === "ai";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex gap-3 items-start"
      role="listitem"
    >
      <MessageAvatar
        role={isAi ? "ai" : "user"}
        icon={isAi ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
      />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-code text-neon-green/60 mb-1 font-medium">
          {isAi ? "$ socratiq" : "$ user"}
        </div>
        <div className={isAi ? "terminal-border rounded-xl px-3.5 py-2.5 bg-surface/40" : ""}>
          <p className="text-sm font-code leading-relaxed text-foreground/80 whitespace-pre-wrap">
            {message.content}
          </p>
          {isAi && <InlineVisual message={message} />}
        </div>
      </div>
    </motion.div>
  );
}

export function FeedbackMessage({ message }: { message: Message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex gap-3 items-start"
      role="listitem"
    >
      <MessageAvatar
        role="feedback"
        icon={<Terminal className="w-3.5 h-3.5" />}
      />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-code text-neon-green/60 mb-1 font-medium flex items-center gap-1.5">
          <Terminal className="w-3 h-3" />
          $ feedback
        </div>
        <div className="terminal-border rounded-xl px-3.5 py-2.5 bg-surface/40">
          <p className="text-sm font-code leading-relaxed text-foreground/80 whitespace-pre-wrap">
            {message.content}
          </p>
          <InlineVisual message={message} />
        </div>
      </div>
    </motion.div>
  );
}

export function RevealMessage({ message }: { message: Message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex gap-3 items-start"
      role="listitem"
    >
      <MessageAvatar
        role="reveal"
        icon={<Eye className="w-3.5 h-3.5" />}
      />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-code text-destructive/70 mb-1 font-medium flex items-center gap-1.5">
          <Eye className="w-3 h-3" />
          $ solution_revealed
        </div>
        <div className="terminal-border rounded-xl px-3.5 py-2.5 bg-surface/40 border-destructive/20">
          <p className="text-sm font-code leading-relaxed text-foreground/80 whitespace-pre-wrap">
            {message.content}
          </p>
          <InlineVisual message={message} />
        </div>
      </div>
    </motion.div>
  );
}

export function HintMessage({ message, onToggleCollapse }: MessageBubbleProps) {
  const isCollapsed = message.isCollapsed !== false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex gap-3 items-start"
      role="listitem"
    >
      <MessageAvatar
        role="hint"
        icon={<Lightbulb className="w-3.5 h-3.5" />}
      />
      <div className="flex-1 min-w-0">
        <button
          onClick={() => onToggleCollapse?.(message.id)}
          className="flex items-center gap-2 w-full text-left text-xs font-code text-neon-amber/70 mb-1 hover:text-neon-amber transition-colors duration-150 cursor-pointer"
          aria-expanded={!isCollapsed}
          aria-controls={`hint-content-${message.id}`}
        >
          <Lightbulb className="w-3 h-3 shrink-0" />
          <span className="flex-1">$ hint_{message.hintLevel}_of_3</span>
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-3 h-3" />
          </motion.div>
        </button>
        {!isCollapsed && (
          <motion.div
            id={`hint-content-${message.id}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl px-3.5 py-2.5 terminal-border border-neon-amber/20 bg-neon-amber/5"
          >
            <p className="text-sm font-code leading-relaxed text-neon-amber/80 whitespace-pre-wrap">
              {message.content}
            </p>
            <InlineVisual message={message} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default function MessageComponent({
  message,
  onToggleCollapse,
}: MessageBubbleProps) {
  switch (message.type) {
    case "hint":
      return <HintMessage message={message} onToggleCollapse={onToggleCollapse} />;
    case "feedback":
      return <FeedbackMessage message={message} />;
    case "reveal":
      return <RevealMessage message={message} />;
    default:
      return <QuestionMessage message={message} />;
  }
}