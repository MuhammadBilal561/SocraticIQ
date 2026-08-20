import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "../_shared/cors.ts";

const GEMINI_MODEL = "gemini-3.5-flash-lite";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models";

const ALL_PATTERNS = [
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

// ─── Validation / Error types ─────────────────────────────────────────────

class AppError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AppError";
  }
}

class AuthError extends AppError {
  constructor(message: string) {
    super(message, 401);
    this.name = "AuthError";
  }
}

class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
    this.name = "ValidationError";
  }
}

// Reasonable client-side limits (kept intentionally simple; the UI enforces
// its own stricter UX limits).
const MAX_TITLE = 300;
const MAX_DESCRIPTION = 6000;
const MAX_CODE = 20000;
const MAX_URL = 500;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_CONVERSATION = 50;

function assertString(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== "string") {
    throw new ValidationError(`Field "${field}" must be a string.`);
  }
  if (value.length > maxLength) {
    throw new ValidationError(`Field "${field}" exceeds the maximum length.`);
  }
  if (!value.trim()) {
    throw new ValidationError(`Field "${field}" is required.`);
  }
  return value;
}

function assertPattern(value: unknown): string {
  const pattern = assertString(value, "pattern", 50);
  if (!ALL_PATTERNS.includes(pattern)) {
    throw new ValidationError("Field \"pattern\" is not a supported category.");
  }
  return pattern;
}

function assertConversation(value: unknown): { role: string; content: string }[] {
  if (!Array.isArray(value)) {
    throw new ValidationError("Field \"conversation\" must be an array.");
  }
  if (value.length > MAX_CONVERSATION) {
    throw new ValidationError("Field \"conversation\" has too many messages.");
  }
  return value.map((item, i) => {
    if (typeof item !== "object" || item === null) {
      throw new ValidationError(`conversation[${i}] must be an object.`);
    }
    const role = assertString((item as Record<string, unknown>).role, `conversation[${i}].role`, 10);
    if (role !== "user" && role !== "ai") {
      throw new ValidationError(`conversation[${i}].role must be "user" or "ai".`);
    }
    const content = assertString((item as Record<string, unknown>).content, `conversation[${i}].content`, MAX_MESSAGE_LENGTH);
    return { role, content };
  });
}

function assertHintLevel(value: unknown): number {
  if (value !== 1 && value !== 2 && value !== 3) {
    throw new ValidationError("Field \"hintLevel\" must be 1, 2, or 3.");
  }
  return value;
}

function assertUrl(value: unknown): string {
  return assertString(value, "url", MAX_URL);
}

function assertCode(value: unknown): string {
  return assertString(value, "code", MAX_CODE);
}

// ─── Authentication ───────────────────────────────────────────────────────

/**
 * Validate the bearer token against Supabase Auth.
 *
 * `SUPABASE_URL` and `SUPABASE_ANON_KEY` are injected automatically into
 * every Supabase Edge Function. Only the anon key is used — never the
 * service-role key, which must stay out of any code path reachable by the
 * browser. The request's token is validated with `auth.getUser`, so a
 * client can never claim another user's identity via the request body.
 */
async function requireAuth(req: Request): Promise<void> {
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;

  if (!token) {
    throw new AuthError("Missing bearer token.");
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment is not configured.");
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${supabaseAnonKey}` } },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    throw new AuthError("Invalid or expired bearer token.");
  }
}

// ─── Gemini ───────────────────────────────────────────────────────────────

async function callGemini(prompt: string): Promise<string> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured on the server.");

  const res = await fetch(`${GEMINI_URL}/${GEMINI_MODEL}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    }),
  });

  if (!res.ok) {
    // Diagnostic detail stays server-side; never echo provider error bodies.
    const errBody = (await res.text()).slice(0, 500);
    console.error(`[socratiq-api] Gemini error (${res.status}): ${errBody}`);
    throw new Error("The AI service could not complete the request.");
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!text.trim()) {
    throw new Error("The AI service returned an empty response.");
  }
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
    console.error(`[socratiq-api] LeetCode fetch error (${res.status}) for slug "${slug}".`);
    throw new Error("Could not fetch the problem from LeetCode.");
  }

  const data = await res.json();
  const q = data?.data?.question;
  if (!q) {
    throw new Error("The requested problem was not found on LeetCode.");
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
  const url = assertUrl(input);
  const match = url.match(/leetcode\.com\/problems\/([a-z0-9-]+)/i);
  if (match) return match[1];
  const slug = url.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (!slug) throw new ValidationError("Invalid LeetCode problem URL.");
  return slug;
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

function jsonResponse(body: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  const cors = corsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: cors });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405, cors);
  }

  try {
    await requireAuth(req);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "Request body must be valid JSON." }, 400, cors);
    }

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return jsonResponse({ error: "Request body must be a JSON object." }, 400, cors);
    }
    const b = body as Record<string, unknown>;
    const action = b.action;

    let result: unknown;

    switch (action) {
      case "leetcode-fetch": {
        const slug = extractSlug(b.url);
        const problem = await fetchLeetCodeProblem(slug);
        const pattern = detectPattern(problem.title, problem.description, problem.tags);
        result = { ...problem, pattern };
        break;
      }

      case "first-question": {
        const pattern = assertPattern(b.pattern);
        const title = assertString(b.title, "title", MAX_TITLE);
        const description = assertString(b.description, "description", MAX_DESCRIPTION);
        const text = await handleFirstQuestion(pattern, title, description);
        result = { text };
        break;
      }

      case "follow-up": {
        const pattern = assertPattern(b.pattern);
        const title = assertString(b.title, "title", MAX_TITLE);
        const conversation = assertConversation(b.conversation);
        const text = await handleFollowUp(pattern, title, conversation);
        result = { text };
        break;
      }

      case "hint": {
        const pattern = assertPattern(b.pattern);
        const title = assertString(b.title, "title", MAX_TITLE);
        const description = assertString(b.description, "description", MAX_DESCRIPTION);
        const hintLevel = assertHintLevel(b.hintLevel);
        const conversation = assertConversation(b.conversation);
        const text = await handleHint(pattern, title, description, hintLevel, conversation);
        result = { text };
        break;
      }

      case "feedback": {
        const pattern = assertPattern(b.pattern);
        const title = assertString(b.title, "title", MAX_TITLE);
        const description = assertString(b.description, "description", MAX_DESCRIPTION);
        const code = assertCode(b.code);
        const language = assertString(b.language, "language", 50);
        const text = await handleFeedback(code, language, pattern, title, description);
        result = { text };
        break;
      }

      case "reveal": {
        const pattern = assertPattern(b.pattern);
        const title = assertString(b.title, "title", MAX_TITLE);
        const description = assertString(b.description, "description", MAX_DESCRIPTION);
        const text = await handleReveal(pattern, title, description);
        result = { text };
        break;
      }

      default:
        return jsonResponse({ error: `Unknown action: ${String(action)}` }, 400, cors);
    }

    return jsonResponse(result, 200, cors);
  } catch (err) {
    if (err instanceof AppError) {
      return jsonResponse({ error: err.message }, err.status, cors);
    }
    // Unknown error: log diagnostics, return a safe generic message.
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[socratiq-api] Internal error: ${message}`);
    return jsonResponse({ error: "Internal server error." }, 500, cors);
  }
});
