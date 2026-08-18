export type PatternCategory =
  | "Arrays & Hashing"
  | "Two Pointers"
  | "Sliding Window"
  | "Stack"
  | "Binary Search"
  | "Linked List"
  | "Trees"
  | "Tries"
  | "Backtracking"
  | "Dynamic Programming";

export type HintLevel = 0 | 1 | 2 | 3;

export type SessionStatus =
  | "active"
  | "solved"
  | "revealed"
  | "submitted";

// ─── Visualization Data ──────────────────────────────────────────────────

export interface ArrayVisualizationData {
  type: "array";
  elements: (number | string | null)[];
  highlights?: number[];
  pointers?: { label: string; index: number }[];
  labels?: string[];
  operation?: string;
  caption?: string;
}

export interface LinkedListVisualizationData {
  type: "linked-list";
  nodes: { value: number | string; id: string }[];
  edges: { from: string; to: string }[];
  highlights?: string[];
  pointers?: { label: string; nodeId: string }[];
  operation?: string;
  caption?: string;
}

export interface TreeVisualizationData {
  type: "tree";
  nodes: { id: string; value: number | string; parentId: string | null }[];
  highlights?: string[];
  traversal?: string[];
  operation?: string;
  caption?: string;
}

export interface StackVisualizationData {
  type: "stack";
  items: (number | string)[];
  highlights?: number[];
  operation?: string;
  caption?: string;
}

export type VisualizationData =
  | ArrayVisualizationData
  | LinkedListVisualizationData
  | TreeVisualizationData
  | StackVisualizationData;

// ─── Message ─────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  role: "ai" | "user";
  type: "question" | "hint" | "feedback" | "reveal" | "code_submission";
  content: string;
  timestamp: number;
  hintLevel?: HintLevel;
  isCollapsed?: boolean;
  /** Optional data structure visualization to render inline */
  visualization?: VisualizationData;
}

export interface CodeAttempt {
  code: string;
  language: string;
  submittedAt: number;
}

export interface Session {
  id: string;
  problemTitle: string;
  problemDescription: string;
  pattern: PatternCategory;
  status: SessionStatus;
  messages: Message[];
  codeAttempts: CodeAttempt[];
  hintsUsed: number;
  startedAt: number;
  solvedAt?: number;
}

export interface PatternMastery {
  pattern: PatternCategory;
  attempted: number;
  solvedWithoutReveal: number;
  solvedWithReveal: number;
  givenUp: number;
  totalHintsUsed: number;
  masteryScore: number;
}

export type AppView = "problem" | "dashboard" | "history";

/** AI service response — text + optional visualization */
export interface AIResponse {
  text: string;
  visualization?: VisualizationData;
}