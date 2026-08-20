import { describe, it, expect } from "vitest";
import {
  ALL_PATTERNS,
  calculateMasteryScore,
  inferPatternFromProblem,
} from "./patterns";

describe("calculateMasteryScore", () => {
  it("returns the default score when nothing was attempted", () => {
    expect(
      calculateMasteryScore({
        attempted: 0,
        solvedWithoutReveal: 0,
        solvedWithReveal: 0,
        givenUp: 0,
        totalHintsUsed: 0,
      }),
    ).toBe(50);
  });

  it("rewards solving without reveal more than with reveal", () => {
    const clean = calculateMasteryScore({
      attempted: 5,
      solvedWithoutReveal: 5,
      solvedWithReveal: 0,
      givenUp: 0,
      totalHintsUsed: 0,
    });
    const withReveal = calculateMasteryScore({
      attempted: 5,
      solvedWithoutReveal: 0,
      solvedWithReveal: 5,
      givenUp: 0,
      totalHintsUsed: 0,
    });
    expect(clean).toBeGreaterThan(withReveal);
  });

  it("penalizes give-ups and hint usage", () => {
    const base = calculateMasteryScore({
      attempted: 3,
      solvedWithoutReveal: 3,
      solvedWithReveal: 0,
      givenUp: 0,
      totalHintsUsed: 0,
    });
    const penalized = calculateMasteryScore({
      attempted: 3,
      solvedWithoutReveal: 3,
      solvedWithReveal: 0,
      givenUp: 3,
      totalHintsUsed: 6,
    });
    expect(penalized).toBeLessThan(base);
  });

  it("clamps the score to the 0..100 range", () => {
    const high = calculateMasteryScore({
      attempted: 1,
      solvedWithoutReveal: 100,
      solvedWithReveal: 0,
      givenUp: 0,
      totalHintsUsed: 0,
    });
    const low = calculateMasteryScore({
      attempted: 1,
      solvedWithoutReveal: 0,
      solvedWithReveal: 0,
      givenUp: 100,
      totalHintsUsed: 0,
    });
    expect(high).toBeLessThanOrEqual(100);
    expect(low).toBeGreaterThanOrEqual(0);
  });
});

describe("inferPatternFromProblem", () => {
  it("detects common patterns from problem text", () => {
    expect(inferPatternFromProblem("Two Sum", "find two numbers")).toBe("Arrays & Hashing");
    expect(inferPatternFromProblem("Reverse Linked List", "reverse a linked list")).toBe("Linked List");
    expect(inferPatternFromProblem("Invert Binary Tree", "invert a binary tree")).toBe("Trees");
    expect(inferPatternFromProblem("Subsets", "return all subsets")).toBe("Backtracking");
    expect(inferPatternFromProblem("Coin Change", "minimum number of coins with memoization")).toBe("Dynamic Programming");
    expect(inferPatternFromProblem("Container With Most Water", "two pointers")).toBe("Two Pointers");
    expect(inferPatternFromProblem("Longest Substring", "sliding window")).toBe("Sliding Window");
    expect(inferPatternFromProblem("Valid Parentheses", "use a stack")).toBe("Stack");
    expect(inferPatternFromProblem("Search Rotated Array", "binary search")).toBe("Binary Search");
  });

  it("falls back to Arrays & Hashing for unknown problems", () => {
    expect(inferPatternFromProblem("Mystery Problem", "no clear signal here")).toBe("Arrays & Hashing");
  });

  it("lists all 10 supported pattern categories", () => {
    expect(ALL_PATTERNS).toHaveLength(10);
    expect(ALL_PATTERNS).toContain("Dynamic Programming");
  });
});
