const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GEMINI_MODEL = "gemini-2.0-flash-lite";

async function callGemini(prompt: string): Promise<string> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      }),
    },
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return text.trim();
}

// ─── LeetCode Fetch ───────────────────────────────────────────────────────

async function fetchLeetCodeProblem(slug: string) {
  const query = `
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        title
        content
        topicTags { name }
        difficulty
        hints
      }
    }
  `;

  const res = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { titleSlug: slug } }),
  });

  if (!res.ok) {
    throw new Error(`LeetCode API error: ${res.status}`);
  }

  const data = await res.json();
  const q = data?.data?.question;
  if (!q) {
    const errMsg = data?.errors?.[0]?.message ?? "Problem not found";
    throw new Error(`LeetCode: ${errMsg}`);
  }

  return {
    title: q.title,
    description: stripHtml(q.content),
    tags: q.topicTags.map((t: { name: string }) => t.name),
    difficulty: q.difficulty,
    hints: q.hints ?? [],
  };
}

function stripHtml(html: string): string {
  return html
    .replace(/<pre[^>]*>[\s\S]*?<\/pre>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractSlug(input: string): string {
  const match = input.match(/leetcode\.com\/problems\/([a-z0-9-]+)/i);
  if (match) return match[1];
  return input.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
}

// ─── AI Prompts ───────────────────────────────────────────────────────────

async function handleFirstQuestion(pattern: string, title: string, description: string): Promise<string> {
  const prompt = `You are a Socratic tutor helping a student solve a coding problem. 
The problem pattern is "${pattern}".
Problem title: "${title}"
Problem description: "${description.slice(0, 1000)}"

Ask ONE thought-provoking Socratic question that:
- Guides the student to discover the approach themselves
- Does NOT give away the solution
- Focuses on the core algorithmic insight needed
- Is specific to THIS problem, not generic
- Ends with a question mark

Return only the question, nothing else.`;

  return await callGemini(prompt);
}

async function handleFollowUp(
  pattern: string,
  title: string,
  conversation: { role: string; content: string }[],
): Promise<string> {
  const context = conversation
    .slice(-6)
    .map((m) => `${m.role === "user" ? "Student" : "Tutor"}: ${m.content}`)
    .join("\n");

  const prompt = `You are a Socratic tutor helping a student solve "${title}" (pattern: ${pattern}).

Recent conversation:
${context}

Based on what the student just said, ask ONE follow-up Socratic question that:
- Responds to their specific reasoning
- Encourages deeper thinking
- Points them toward the correct approach without revealing it
- Is concise and ends with a question mark

Return only the question, nothing else.`;

  return await callGemini(prompt);
}

async function handleHint(
  pattern: string,
  title: string,
  description: string,
  hintLevel: number,
  conversation: { role: string; content: string }[],
): Promise<string> {
  const context = conversation
    .slice(-4)
    .map((m) => `${m.role === "user" ? "Student" : "Tutor"}: ${m.content}`)
    .join("\n");

  const levels: Record<number, string> = {
    1: "a subtle nudge about what to think about — very vague, just hinting at the data structure or technique",
    2: "a moderate hint about the specific approach — mention the technique name and a general strategy",
    3: "a strong hint that almost gives away the algorithm — describe the steps but leave some implementation to the student",
  };

  const prompt = `You are a Socratic tutor helping a student solve "${title}" (pattern: ${pattern}).
Problem: "${description.slice(0, 500)}"

${context ? `Recent chat:\n${context}\n` : ""}
Give hint level ${hintLevel}: ${levels[hintLevel] || levels[1]}

Return only the hint text, nothing else.`;

  return await callGemini(prompt);
}

async function handleFeedback(
  code: string,
  language: string,
  pattern: string,
  title: string,
  description: string,
): Promise<string> {
  const prompt = `You are a coding interview coach analyzing a student's solution.

Problem: "${title}" (pattern: ${pattern})
Description: "${description.slice(0, 500)}"

Student's code (${language}):
\`\`\`${language}
${code.slice(0, 1500)}
\`\`\`

Provide concise feedback (3-4 sentences) covering:
1. Time and space complexity analysis
2. Whether their approach matches the optimal pattern
3. One specific thing they did well
4. One specific improvement they could make

Be encouraging but honest. Format naturally without bullet points.`;

  return await callGemini(prompt);
}

async function handleReveal(pattern: string, title: string, description: string): Promise<string> {
  const prompt = `You are a coding interview coach revealing the solution approach to a student.

Problem: "${title}" (pattern: ${pattern})
Description: "${description.slice(0, 800)}"

Write a concise solution reveal (4-6 sentences) that:
1. Names the pattern and explains why it fits
2. Describes the optimal approach at a high level
3. Gives the time and space complexity
4. Does NOT include code — keep it conceptual

Focus on the "why" behind the approach.`;

  return await callGemini(prompt);
}

// ─── Pattern Detection ────────────────────────────────────────────────────

function detectPattern(title: string, description: string, tags: string[]): string {
  const text = `${title} ${description} ${tags.join(" ")}`.toLowerCase();

  if (tags.some((t) => /trie|prefix/.test(t)) || /\b(trie|prefix)\b/.test(text)) return "Tries";
  if (tags.some((t) => /linked\s*list|node/.test(t)) || /\b(linked\s*list|listnode|reverse\s*list)\b/.test(text)) return "Linked List";
  if (tags.some((t) => /tree|bst/.test(t)) || /\b(tree|bst|binary\s*tree|invert|depth|travers)\b/.test(text)) return "Trees";
  if (tags.some((t) => /backtrack/.test(t)) || /\b(backtrack|permutation|combination|subset|n.?queens|sudoku)\b/.test(text)) return "Backtracking";
  if (tags.some((t) => /dp|dynamic/.test(t)) || /\b(dp|dynamic|memoiz|knapsack|longest\s*common|edit\s*distance|coin\s*change)\b/.test(text)) return "Dynamic Programming";
  if (tags.some((t) => /two\s*pointer/.test(t)) || /\b(two\s*pointer|pair\s*sum|three\s*sum|container\s*water)\b/.test(text)) return "Two Pointers";
  if (tags.some((t) => /sliding\s*window/.test(t)) || /\b(sliding\s*window|subarray|substring|max\s*sum|longest\s*sub)\b/.test(text)) return "Sliding Window";
  if (tags.some((t) => /stack|monotonic/.test(t)) || /\b(stack|monotonic|valid\s*parenthes|daily\s*temp|next\s*great)\b/.test(text)) return "Stack";
  if (tags.some((t) => /binary\s*search/.test(t)) || /\b(binary\s*search|search\s*rotated|find\s*peak|sqrt)\b/.test(text)) return "Binary Search";
  return "Arrays & Hashing";
}

// ─── Router ───────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action } = body;

    let result: unknown;

    switch (action) {
      case "leetcode-fetch": {
        const slug = extractSlug(body.url);
        const problem = await fetchLeetCodeProblem(slug);
        const pattern = detectPattern(problem.title, problem.description, problem.tags);
        result = { ...problem, pattern };
        break;
      }

      case "first-question": {
        const text = await handleFirstQuestion(body.pattern, body.title, body.description);
        result = { text };
        break;
      }

      case "follow-up": {
        const text = await handleFollowUp(body.pattern, body.title, body.conversation ?? []);
        result = { text };
        break;
      }

      case "hint": {
        const text = await handleHint(body.pattern, body.title, body.description, body.hintLevel, body.conversation ?? []);
        result = { text };
        break;
      }

      case "feedback": {
        const text = await handleFeedback(body.code, body.language, body.pattern, body.title, body.description);
        result = { text };
        break;
      }

      case "reveal": {
        const text = await handleReveal(body.pattern, body.title, body.description);
        result = { text };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("socratiq-api error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});