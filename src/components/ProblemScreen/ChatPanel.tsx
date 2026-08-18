import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, MessageCircle } from "lucide-react";
import type { Message } from "../../types";
import MessageComponent from "./Message";

interface ChatPanelProps {
  messages: Message[];
  onToggleHintCollapse: (id: string) => void;
  isAiResponding?: boolean;
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className="flex gap-3 items-start"
      role="status"
      aria-label="SocratIQ is thinking"
    >
      <div className="shrink-0 w-7 h-7 rounded-full bg-neon-green/10 text-neon-green border border-neon-green/20 flex items-center justify-center" aria-hidden="true">
        <Bot className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-code text-neon-green/60 mb-1.5 font-medium">$ socratiq</div>
        <div className="flex items-center gap-1.5 px-3 py-2">
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-neon-green/60"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
          />
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-neon-green/60"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
          />
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-neon-green/60"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function ChatPanel({ messages, onToggleHintCollapse, isAiResponding }: ChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiResponding]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-sm"
        >
          <div className="w-10 h-10 rounded-full bg-neon-green/10 border border-neon-green/20 flex items-center justify-center mx-auto mb-3" aria-hidden="true">
            <MessageCircle className="w-5 h-5 text-neon-green/40" />
          </div>
          <p className="text-foreground/40 text-sm font-code leading-relaxed">
            $ echo "start the conversation" &gt; /dev/chat
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" role="log" aria-label="Chat messages" aria-live="polite">
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <MessageComponent
            key={msg.id}
            message={msg}
            onToggleCollapse={onToggleHintCollapse}
          />
        ))}
        {isAiResponding && <TypingIndicator key="__typing__" />}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  );
}