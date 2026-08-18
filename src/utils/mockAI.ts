import type { PatternCategory, HintLevel, VisualizationData } from "../types";

// ─── Socratic Openers ─────────────────────────────────────────────────────

const SocraticOpeners: Record<string, string[]> = {
  "Arrays & Hashing": [
    "What patterns in how the data is stored make you think this could be solved efficiently with a hash map?",
    "Consider what information you need to track as you iterate — could a single pass be enough?",
  ],
  "Two Pointers": [
    "If you had two pointers moving through the array, what condition would tell each one when to move?",
    "Think about the sorted property — what does the relative ordering tell you about where to look?",
  ],
  "Sliding Window": [
    "As you expand your window, what condition tells you it's time to shrink from the left?",
    "What information do you need to maintain about the current window to check validity in O(1)?",
  ],
  Stack: [
    "Think about the last-in-first-out nature — what relationships in the data have a 'most recent' ordering?",
    "When you encounter an element, what previously seen elements might it relate to?",
  ],
  "Binary Search": [
    "What's the monotonic property in this problem that lets you eliminate half the search space?",
    "If you had a function that checks whether a candidate value works, what would its input and output be?",
  ],
  "Linked List": [
    "If you traverse the list, what information from earlier nodes do you need to remember?",
    "Could manipulating the pointers between nodes be enough, or do you need additional data structures?",
  ],
  Trees: [
    "What does the tree's structure tell you about which traversal order would be most useful here?",
    "Think about the relationship between a node and its children — does the answer at a node depend on its subtrees?",
  ],
  Tries: [
    "How could you organize the characters of the strings so that common prefixes are shared?",
    "What operations would need to be fast for this problem — insertions, lookups, or prefix searches?",
  ],
  Backtracking: [
    "If you made a choice at each step, what condition would tell you to undo that choice and try another?",
    "Think about the decision tree — how can you prune branches that can't possibly lead to a valid solution?",
  ],
  "Dynamic Programming": [
    "What's the smallest subproblem you can solve trivially? How does a larger solution build from smaller ones?",
    "Can you define a recurrence relation — if you know the answer for n-1, how do you compute it for n?",
  ],
};

const HintMessages: Record<Exclude<HintLevel, 0>, string[]> = {
  1: [
    "Consider what data structure is best suited for fast lookups in this scenario.",
    "Think about whether the order of elements matters for your approach.",
  ],
  2: [
    "You might want to consider a two-pass approach — one to gather information, another to use it.",
    "Try visualizing the problem as a diagram — the spatial arrangement often reveals the pattern.",
  ],
  3: [
    "The pattern here involves tracking running information as you traverse — think prefix sums or cumulative counts.",
    "Consider whether the problem reduces to finding a relationship between two elements that satisfy a condition.",
  ],
};

const FeedbackTemplates = [
  "Your solution has a time complexity of O(n) and space complexity of O(n), which is reasonable. The optimal approach also runs in O(n) but uses O(1) space by leveraging the two-pointer technique. The key insight you missed was that since the array is sorted, you can adjust pointers from both ends rather than using extra memory.",
  "Your brute force approach runs in O(n²) time. The optimal solution uses a sliding window to achieve O(n). The key was recognizing that as the window expands, you only need to track whether adding the new element violates your constraint — not re-check the entire window each time.",
  "Your recursive solution is correct and runs in O(n) time with O(n) call stack space. An iterative approach could achieve O(1) extra space. Consider how you might traverse the tree without recursion by maintaining your own stack explicitly.",
];

// ─── Visualization Generators ─────────────────────────────────────────────

function arrayVis(text: string): VisualizationData | undefined {
  // Common array examples in Socratic questions: hash map, complement, iteration
  if (text.includes("hash map") || text.includes("complement") || text.includes("iterate") || text.includes("single pass")) {
    return {
      type: "array",
      elements: [3, 2, 4, null, 7, 1, 5],
      highlights: [0, 2],
      pointers: [
        { label: "i", index: 0 },
        { label: "j", index: 2 },
      ],
      labels: ["seen", "target", "", "…", "complement"],
      operation: "hash_map_lookup",
      caption: "Iterate once, storing complements in a hash map for O(1) lookup",
    };
  }
  if (text.includes("two-pointer") || text.includes("pointers moving") || text.includes("sorted")) {
    return {
      type: "array",
      elements: [1, 3, 4, 6, 8, 11, 15],
      highlights: [1, 5],
      pointers: [
        { label: "left", index: 1 },
        { label: "right", index: 5 },
      ],
      labels: ["", "3", "", "", "", "11", ""],
      operation: "two_pointers",
      caption: "Move pointers inward based on sum comparison with target",
    };
  }
  if (text.includes("window") || text.includes("expand") || text.includes("shrink")) {
    return {
      type: "array",
      elements: [2, 5, 1, 3, 6, 2, 4],
      highlights: [2, 3, 4],
      pointers: [
        { label: "L", index: 2 },
        { label: "R", index: 4 },
      ],
      operation: "sliding_window",
      caption: "Expand right boundary, shrink left when constraint is violated",
    };
  }
  return undefined;
}

function linkedListVis(text: string): VisualizationData | undefined {
  if (text.includes("traverse") || text.includes("pointer") || text.includes("node") || text.includes("list")) {
    return {
      type: "linked-list",
      nodes: [
        { id: "a", value: 3 },
        { id: "b", value: 7 },
        { id: "c", value: 2 },
        { id: "d", value: 9 },
        { id: "e", value: 5 },
      ],
      edges: [
        { from: "a", to: "b" },
        { from: "b", to: "c" },
        { from: "c", to: "d" },
        { from: "d", to: "e" },
      ],
      highlights: ["a", "c"],
      pointers: [
        { label: "slow", nodeId: "a" },
        { label: "fast", nodeId: "c" },
      ],
      operation: "tortoise_and_hare",
      caption: "Fast pointer moves twice as fast — they meet if a cycle exists",
    };
  }
  return undefined;
}

function stackVis(_text: string): VisualizationData | undefined {
  return {
    type: "stack",
    items: [5, 3, 7],
    highlights: [2],
    operation: "push_pop",
    caption: "Most recent element is on top — LIFO ordering",
  };
}

function treeVis(text: string): VisualizationData | undefined {
  if (text.includes("tree") || text.includes("traversal") || text.includes("recursive") || text.includes("subtree")) {
    return {
      type: "tree",
      nodes: [
        { id: "r", value: 8, parentId: null },
        { id: "a", value: 3, parentId: "r" },
        { id: "b", value: 10, parentId: "r" },
        { id: "c", value: 1, parentId: "a" },
        { id: "d", value: 6, parentId: "a" },
        { id: "e", value: 14, parentId: "b" },
        { id: "f", value: 4, parentId: "d" },
        { id: "g", value: 7, parentId: "d" },
      ],
      highlights: ["r", "a", "d"],
      operation: "dfs_inorder",
      caption: "Inorder traversal visits left → root → right (sorted order in BST)",
    };
  }
  return undefined;
}

function revealVis(pattern: PatternCategory): VisualizationData {
  switch (pattern) {
    case "Arrays & Hashing":
      return {
        type: "array",
        elements: [2, 7, 11, 15],
        highlights: [0, 1],
        pointers: [
          { label: "i", index: 0 },
        ],
        operation: "hash_map",
        caption: "Store complement in map: target - nums[i] → check existence in O(1)",
      };
    case "Two Pointers":
      return {
        type: "array",
        elements: [-4, -1, -1, 0, 1, 2],
        highlights: [1, 3, 5],
        pointers: [
          { label: "i", index: 1 },
          { label: "L", index: 3 },
          { label: "R", index: 5 },
        ],
        operation: "three_sum",
        caption: "Fix one element, use two pointers on the rest",
      };
    case "Sliding Window":
      return {
        type: "array",
        elements: [1, 3, -1, -3, 5, 3, 6, 7],
        highlights: [2, 3, 4],
        pointers: [
          { label: "L", index: 2 },
          { label: "R", index: 4 },
        ],
        operation: "max_sliding_window",
        caption: "Maintain deque of indices where values are in decreasing order",
      };
    case "Stack":
      return {
        type: "stack",
        items: [34, 35, 42, 65],
        highlights: [2],
        operation: "monotonic_stack",
        caption: "Pop while stack top < current — maintains decreasing order",
      };
    case "Linked List":
      return {
        type: "linked-list",
        nodes: [
          { id: "a", value: 1 },
          { id: "b", value: 2 },
          { id: "c", value: 3 },
          { id: "d", value: 4 },
          { id: "e", value: 5 },
        ],
        edges: [
          { from: "a", to: "b" },
          { from: "b", to: "c" },
          { from: "c", to: "d" },
          { from: "d", to: "e" },
        ],
        highlights: ["b", "c"],
        pointers: [
          { label: "prev", nodeId: "a" },
          { label: "curr", nodeId: "b" },
        ],
        operation: "reverse",
        caption: "Reverse pointers one node at a time: prev ← curr ← next",
      };
    case "Trees":
      return {
        type: "tree",
        nodes: [
          { id: "r", value: 4, parentId: null },
          { id: "a", value: 2, parentId: "r" },
          { id: "b", value: 7, parentId: "r" },
          { id: "c", value: 1, parentId: "a" },
          { id: "d", value: 3, parentId: "a" },
          { id: "e", value: 6, parentId: "b" },
          { id: "f", value: 9, parentId: "b" },
        ],
        highlights: ["b", "e"],
        operation: "bst_search",
        caption: "Compare target with root — go left if smaller, right if larger",
      };
    default:
      return {
        type: "array",
        elements: [1, 2, 3, 4, 5],
        highlights: [0],
        operation: pattern.toLowerCase().replace(/\s+/g, "_"),
        caption: `Visualizing the ${pattern} pattern in action`,
      };
  }
}

// ─── Generate visualization for follow-up questions ──────────────────────

function generateVisualization(
  pattern: PatternCategory,
  text: string,
): VisualizationData | undefined {
  switch (pattern) {
    case "Arrays & Hashing":
    case "Two Pointers":
    case "Sliding Window":
    case "Binary Search":
      return arrayVis(text);
    case "Linked List":
      return linkedListVis(text);
    case "Trees":
    case "Tries":
      return treeVis(text);
    case "Stack":
      return stackVis(text);
    case "Backtracking":
      return treeVis(text);
    case "Dynamic Programming":
      return {
        type: "array",
        elements: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34],
        highlights: [6, 7],
        labels: ["dp[0]", "dp[1]", "dp[2]", "dp[3]", "dp[4]", "dp[5]", "dp[6]", "dp[7]", "dp[8]", "dp[9]"],
        operation: "dp_tabulation",
        caption: "DP[i] = DP[i-1] + DP[i-2] — each subproblem builds on previous ones",
      };
    default:
      return undefined;
  }
}

// ─── Text Generators ─────────────────────────────────────────────────────

export function generateFirstQuestion(pattern: PatternCategory): { text: string; visualization?: VisualizationData } {
  const questions = SocraticOpeners[pattern] || SocraticOpeners["Arrays & Hashing"];
  const text = questions[Math.floor(Math.random() * questions.length)];
  const visualization = generateVisualization(pattern, text) || (pattern === "Stack" ? stackVis(text) : undefined);
  return { text, visualization };
}

export function generateFollowUpQuestion(conversation?: string[]): { text: string; visualization?: VisualizationData } {
  const followUps = [
    "Can you think of a different way to approach this that might be more efficient?",
    "What trade-offs does your current approach make in terms of time vs space?",
    "If the input size grew by 10x, would your solution still perform well?",
    "What happens with edge cases — empty input, duplicates, or negative numbers?",
    "Could you solve this without using extra data structures?",
    "How would your approach change if the data were sorted?",
    "What's the simplest test case you can think of? Does your logic handle it?",
    "Are there any constraints in the problem that you haven't used yet?",
  ];
  // Pick a follow-up that's not too similar to recent messages
  const recent = conversation?.slice(-3).join(" ").toLowerCase() || "";
  const candidates = followUps.filter(
    (f) => !recent.includes(f.slice(0, 20).toLowerCase()),
  );
  const text = (candidates.length ? candidates : followUps)[
    Math.floor(Math.random() * (candidates.length || followUps.length))
  ];

  // Occasionally show a visualization with follow-up
  const visualization = Math.random() > 0.4
    ? undefined
    : generateVisualization(
        (conversation?.[0] as PatternCategory) || "Arrays & Hashing",
        text,
      );

  return { text, visualization };
}

export function generateHint(hintLevel: 1 | 2 | 3): { text: string; visualization?: VisualizationData } {
  const messages = HintMessages[hintLevel];
  const text = messages[Math.floor(Math.random() * messages.length)];

  // Hints at level 2 suggest visualizing — add a visual
  const visualization = hintLevel >= 2
    ? {
        type: "array" as const,
        elements: [null, null, null, null, null],
        highlights: [],
        operation: "visualize",
        caption: "Try drawing this on paper — the spatial layout reveals the pattern",
      }
    : undefined;

  return { text, visualization };
}

export function generateFeedback(_code: string): { text: string; visualization?: VisualizationData } {
  const idx = Math.floor(Math.random() * FeedbackTemplates.length);
  const text = FeedbackTemplates[idx];
  return {
    text,
    visualization: {
      type: "array",
      elements: [45, 23, 78, 12, 56],
      highlights: [1, 3],
      operation: "complexity_analysis",
      caption: `Time: O(n) | Space: O(n) — can we optimise?`,
    },
  };
}

export function generateReveal(
  pattern: PatternCategory,
): { text: string; visualization?: VisualizationData } {
  const reveals: Record<string, string> = {
    "Arrays & Hashing":
      "This problem falls under **Arrays & Hashing**. The key pattern is using a hash map to store complements for O(n) lookup. The optimal approach iterates once, checking if the complement of the current element exists in the map — if so, you've found your pair. This trades O(n) space for O(n) time, avoiding the O(n²) brute force.",
    "Two Pointers":
      "This is a **Two Pointers** problem. The pattern involves placing one pointer at the start and one at the end, moving them toward each other based on a condition. The key insight is that the sorted order (or a two-pass transformation) lets you narrow down the search space in O(n) instead of O(n²).",
    "Sliding Window":
      "This uses the **Sliding Window** pattern. The core idea is maintaining a window that satisfies a constraint, expanding the right boundary and shrinking the left when the constraint is violated. This converts O(n²) nested loops into a single O(n) pass.",
    Stack:
      "This is a **Stack** problem. The LIFO nature of the stack is perfect for problems involving nested structures or finding the 'next greater element.' The pattern is to push elements while maintaining a monotonic property, popping when the condition is triggered.",
    "Binary Search":
      "This is a **Binary Search** problem. The key is finding the monotonic predicate — a condition that flips from true to false (or vice versa) at exactly one point. Once you have that, you can binary search on the answer space in O(log n).",
    "Linked List":
      "This is a **Linked List** problem. The core technique is the fast-and-slow pointer (tortoise and hare) where two pointers traverse at different speeds. This detects cycles, finds the middle, or finds the nth from end — all in O(n) time and O(1) space.",
    Trees:
      "This problem is about **Trees**. The pattern is choosing the right traversal — preorder for top-down construction, inorder for sorted output in BSTs, postorder for bottom-up computation. The recursive structure of trees naturally maps to divide-and-conquer.",
    Tries:
      "This is a **Trie** problem. Tries are trees of characters optimized for prefix operations. The pattern involves inserting all words into a trie once (O(total characters)), then using the trie structure for fast prefix lookups in O(word length).",
    Backtracking:
      "This uses **Backtracking**. The pattern is a depth-first search of the decision space: make a choice, recurse, undo the choice. The optimization is pruning branches that can't lead to a solution (bounding) — this turns exponential enumeration into tractable search.",
    "Dynamic Programming":
      "This is a **Dynamic Programming** problem. The key is recognizing overlapping subproblems and optimal substructure. Define a recurrence relation, then solve bottom-up (tabulation) or top-down with memoization. The state is usually defined by (index, remaining capacity) or similar.",
  };
  const text = reveals[pattern] || reveals["Arrays & Hashing"];
  return { text, visualization: revealVis(pattern) };
}