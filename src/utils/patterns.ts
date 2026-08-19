import type { PatternCategory, PatternMastery } from "../types";

export const ALL_PATTERNS: PatternCategory[] = [
  "Arrays & Hashing",
  "Two Pointers",
  "Sliding Window",
  "Stack",
  "Binary Search",
  "Linked List",
  "Trees",
  "Tries",
  "Backtracking",
  "Dynamic Programming",
];

export function calculateMasteryScore(stats: Omit<PatternMastery, "pattern" | "masteryScore">): number {
  const { attempted, solvedWithoutReveal, solvedWithReveal, givenUp, totalHintsUsed } = stats;
  if (attempted === 0) return 50; // default starting score

  let score = 50;
  score += solvedWithoutReveal * 10;
  score += solvedWithReveal * 3;
  score -= givenUp * 5;
  score -= Math.floor(totalHintsUsed / attempted) * 2;

  // Decay toward 50 — the more sessions, the less volatility
  const weight = Math.min(attempted / 5, 1);
  score = score * weight + 50 * (1 - weight);

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function inferPatternFromProblem(title: string, description: string): PatternCategory {
  const text = `${title} ${description}`.toLowerCase();

  if (/\b(linked\s*lists?|node|listnode|merge two|reverse\s*lists?)\b/.test(text)) return "Linked List";
  if (/\b(trees?|bst|binary\s*trees?|invert|depth|travers|dfs\s*trees?|bfs\s*trees?)\b/.test(text)) return "Trees";
  if (/\b(trie|prefix|dictionary\s*search|autocomplete)\b/.test(text)) return "Tries";
  if (/\b(backtrack|permutation|combination|subsets?|n.?queens|sudoku)\b/.test(text)) return "Backtracking";
  if (/\b(dp|dynamic|memoiz|knapsack|longest\s*common|edit\s*distance|coin\s*change)\b/.test(text)) return "Dynamic Programming";
  if (/\b(two\s*pointers?|pair\s*sums?|three\s*sums?|palindrome\s*checks?|container\s*water)\b/.test(text)) return "Two Pointers";
  if (/\b(sliding\s*windows?|subarray|substring|max\s*sum|longest\s*sub)\b/.test(text)) return "Sliding Window";
  if (/\b(stack|monotonic|valid\s*parenthes|daily\s*temp|next\s*great)\b/.test(text)) return "Stack";
  if (/\b(binary\s*search|search\s*rotated|find\s*peak|sqrt|search\s*range)\b/.test(text)) return "Binary Search";
  return "Arrays & Hashing";
}