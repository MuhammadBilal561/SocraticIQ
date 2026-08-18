import Editor from "@monaco-editor/react";
import { Lock, Terminal } from "lucide-react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  sessionStatus: string;
}

export default function CodeEditor({ value, onChange, sessionStatus }: CodeEditorProps) {
  const isLocked = sessionStatus === "solved" || sessionStatus === "revealed" || sessionStatus === "submitted";

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-neon-green/15 bg-surface/30">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-neon-green/60" />
          <span className="text-xs font-code font-medium text-neon-green/70">code</span>
          <span className="text-[10px] font-code text-neon-green/40 bg-neon-green/10 px-1.5 py-0.5 rounded font-medium">Python</span>
          {isLocked && (
            <span className="text-[10px] font-code text-foreground/40 flex items-center gap-1 ml-1">
              <Lock className="w-3 h-3" /> read-only
            </span>
          )}
        </div>
      </div>
      <div className="flex-1 relative">
        {isLocked && (
          <div className="absolute inset-0 z-10 pointer-events-none bg-background/0" aria-hidden="true" />
        )}
        <Editor
          height="100%"
          defaultLanguage="python"
          language="python"
          theme="hc-black"
          value={value}
          onChange={(v) => onChange(v ?? "")}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            readOnly: isLocked,
            wordWrap: "on",
            padding: { top: 12 },
            renderLineHighlight: "line",
            cursorBlinking: "smooth",
            smoothScrolling: true,
          }}
        />
      </div>
    </div>
  );
}