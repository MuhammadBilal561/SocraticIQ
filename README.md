# SocratIQ — Socratic DSA Tutor for Interview Prep

> **Master data structures & algorithms through guided questions, not answers.**

SocratIQ is an AI-powered learning platform that teaches DSA interview preparation using the **Socratic method**. Instead of handing you solutions, the AI tutor asks thought-provoking questions, offers progressive hints, and provides targeted feedback that guides you to discover the answer yourself.

## Table of Contents

- [Product Overview](#product-overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Requirements](#requirements)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Supabase Setup](#supabase-setup)
- [Edge Function Setup](#edge-function-setup)
- [Gemini Secret Setup](#gemini-secret-setup)
- [Development Commands](#development-commands)
- [Test / Lint / Typecheck Commands](#test--lint--typecheck-commands)
- [Production Build](#production-build)
- [Deployment Architecture](#deployment-architecture)
- [Git Workflow](#git-workflow)
- [License](#license)

---

## Product Overview

Preparing for coding interviews often means memorizing solutions — but research shows that **active problem-solving with guided discovery** leads to better long-term retention. SocratIQ flips the script:

| Traditional Approach | SocratIQ Approach |
|---|---|
| Watches solution videos | Gets asked guiding questions |
| Memorizes patterns | Discovers patterns through reasoning |
| Forgets after the interview | Retains concepts long-term |

The platform integrates with **LeetCode** (paste any problem URL), uses **Google's Gemini** model via a **Supabase Edge Function**, and stores your session history **locally in the browser**.

---

## Features

### Socratic AI Tutoring
The AI tutor asks one thought-provoking question at a time — never giving away the full solution. Follow-up questions adapt to your responses, deepening your understanding at every step.

### Pattern Recognition Engine
Problems are automatically classified into **10 core DSA categories**:

- Arrays & Hashing
- Two Pointers
- Sliding Window
- Stack
- Binary Search
- Linked List
- Trees
- Tries
- Backtracking
- Dynamic Programming

### Live Code Editor
Built on the **Monaco Editor** (same engine as VS Code) with syntax highlighting, auto-completion, and a cyberpunk terminal aesthetic.

### Mastery Tracking
A gamified dashboard tracks your progress across all patterns using a **decay-adjusted mastery score** that weights recent performance more heavily.

### Inline Data Structure Visualizations
Array traversals, linked-list pointer dances, binary tree traversals, and stack operations render as interactive ASCII-style visualizations directly in the chat.

### LeetCode Integration
Paste any LeetCode problem URL and the system automatically fetches the title, description, tags, and difficulty — then detects the underlying DSA pattern.

### Authenticated AI Backend
All AI requests are authenticated with your Supabase session. The browser sends a short-lived **access token** (Bearer) that the Edge Function validates before serving any AI response. The Gemini API key never leaves the server.

### Per-User Session History
Session history is stored in `localStorage` under a **user-scoped key** (`socratiq_sessions:<userId>`). Signing out clears the in-memory history so one user's data never appears in another user's UI.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (SPA)                       │
│                                                         │
│  ┌──────────┐   ┌──────────────┐   ┌─────────────────┐ │
│  │ Landing  │   │ ProblemScreen │  │  Dashboard        │ │
│  │ (3D Hero)│   │ (Chat+Editor) │  │  (Mastery)       │ │
│  └────┬─────┘   └──────┬───────┘  └────────┬─────────┘ │
│       │                │                   │           │
│       │         SessionContext            │           │
│       │         (useReducer)              │           │
│       └──────────┬──────────┬──────────────┘           │
│                  │          │                            │
│          ┌───────▼──┐   ┌───▼───────┐                 │
│          │ Supabase │   │Mock AI    │                  │
│          │ (Auth)   │   │(opt-in)   │                  │
│          └─────┬────┘   └─────┬────┘                  │
│                │              │                        │
│          ┌─────▼──────────────▼──────┐                 │
│          │  AI Service Layer          │                 │
│          │  (src/services/ai.ts)      │                 │
│          └────────────┬───────────────┘                 │
└──────────────────────┼─────────────────────────────────┘
                       │  (Bearer access token)
                       ▼
       ┌──────────────────────────────────┐
       │  Supabase Edge Function          │
       │  (Deno / socratiq-api)           │
       │  - verifies Supabase JWT        │
       │  - CORS allow-list              │
       │  - input validation             │
       │  ┌────────────────────┐        │
       │  │ Gemini (server-side │        │
       │  │ API key, never in  │        │
       │  │ client)            │        │
       │  └────────────────────┘        │
       │  ┌────────────────────┐        │
       │  │ LeetCode GraphQL   │        │
       │  └────────────────────┘        │
       └──────────────────────────────────┘
```

Key properties:

- **Frontend** is a static Vite application. It can be hosted on any static host.
- **Backend** is a Supabase Edge Function — separate infrastructure that handles AI requests and is only reachable with a valid Supabase session token.
- **Application session history** is browser-local (per-user `localStorage`), not stored in a database in this phase.
- **Gemini secret** stays server-side as a Supabase secret; it is never exposed to the browser.

---

## Tech Stack

| Category | Technology |
|---|---|
| **Frontend** | React 18 · TypeScript · Vite 7 |
| **Styling** | Tailwind CSS 4 (custom OKLCH neon theme) |
| **Animations** | Framer Motion |
| **3D Graphics** | Three.js · @react-three/fiber · @react-three/drei |
| **Code Editor** | @monaco-editor/react |
| **Icons** | Lucide React |
| **Routing** | React Router 7 |
| **Backend / Auth** | Supabase (Auth + Edge Functions) |
| **AI Model** | Google Gemini 2.0 Flash Lite |
| **State Management** | React Context API (`useReducer`) |
| **Persistence** | localStorage (user-scoped session storage) |
| **Edge Runtime** | Supabase Edge Functions (Deno) |
| **External APIs** | LeetCode GraphQL API |
| **Tooling** | ESLint · Vitest · TypeScript |

---

## Requirements

- **Node.js** ≥ 20.19 (required by Vite 7)
- **npm** ≥ 10
- **Git** (for version control)
- A **Supabase project** and **Google Gemini API key** for full AI features

---

## Local Setup

```bash
# Clone the repository
git clone https://github.com/MuhammadBilal561/SocraticIQ.git
cd SocratIQ

# Install dependencies
npm install

# Configure environment variables (see below)
cp .env.example .env.local

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your own values. **Never commit real credentials.**

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL, e.g. `https://<project-ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Yes | Your Supabase **anon** (public) key. Safe for the browser. |
| `VITE_ENABLE_MOCK_AI` | No | `true` enables the offline mock-AI fallback during local development. Leave unset or `false` for production. |

> The app fails with a clear startup error if `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` are missing — it never silently substitutes fake credentials.

---

## Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Note your **Project URL** (`Settings → API`) and **anon public key**.
3. Fill them into `.env.local` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Navigate to **Authentication → Settings** and configure your auth providers (email/password is sufficient to get started).

---

## Edge Function Setup

The AI logic runs in a Supabase Edge Function written in **Deno / TypeScript**.

```bash
# Install the Supabase CLI
npm install -g supabase

# Link your local project to your Supabase project
supabase link --project-ref <your-project-ref>

# Deploy the edge function
supabase functions deploy socratiq-api

# (Optional) Set allowed browser origins for CORS
supabase secrets set ALLOWED_ORIGINS="https://your-frontend-domain.example"

# (Optional) Serve functions locally for development
supabase functions serve
```

The function reads `SUPABASE_URL` and `SUPABASE_ANON_KEY` automatically from the Supabase runtime to validate each request's bearer token. No service-role key is used or exposed.

---

## Gemini Secret Setup

The Gemini API key is **server-only**. It lives as a Supabase secret and is never sent to, or stored in, the browser.

```bash
supabase secrets set GEMINI_API_KEY=<your-gemini-api-key>
```

The Edge Function reads `GEMINI_API_KEY` from its environment and sends it to Google via an `x-goog-api-key` request header — never in a URL query string.

---

## Development Commands

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server at `http://localhost:5173` |
| `npm run build` | Build the production bundle |
| `npm run preview` | Preview the production build locally |

---

## Test / Lint / Typecheck Commands

| Command | Description |
|---|---|
| `npm run typecheck` | Run `tsc --noEmit` |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Vitest suite (once) |
| `npm run test:watch` | Run Vitest in watch mode |

Tests cover the high-value logic: storage parsing/validation, user-scoped storage, deletion/clear-all, pattern/mastery utilities, and environment validation.

---

## Production Build

```bash
npm run build
```

Output goes to `dist/`. The build has no server-side dependencies; the AI and auth backends are provided by Supabase Edge Functions at runtime.

---

## Deployment Architecture

No production hosting provider has been selected yet. The deployment model is:

- **Frontend** — a Vite static application. Deploy `dist/` to any static host (the hosting decision is still open).
- **Backend** — the Supabase Edge Function (`socratiq-api`) is separate infrastructure deployed via the Supabase CLI.
- **Session history** — browser-local and user-scoped; not stored in a database in this phase.

To point the app at your deployed Edge Function, the frontend derives its URL from `VITE_SUPABASE_URL` — no extra configuration is required beyond the env vars above.

For production, set `ALLOWED_ORIGINS` on the Edge Function to your real frontend origin so CORS works for your deployed site.

---

## Git Workflow

1. Create a feature branch from `main`: `git checkout -b feat/your-feature`
2. Make your changes with clear, descriptive commit messages.
3. Run the checks: `npm run typecheck`, `npm run lint`, `npm test`.
4. Push to your branch and open a Pull Request.

### Development Guidelines

- **Type safety first** — this project uses strict TypeScript with `noUnusedLocals` and `noUnusedParameters` enabled.
- **Match the aesthetic** — follow the cyberpunk terminal style in components.
- **Socratic AI** — when adding prompts, ensure they ask questions rather than giving answers.
- **Accessibility** — maintain `aria-*` attributes and keyboard navigation in UI components.
- **Secrets** — never commit real credentials, tokens, or API keys. Env vars and Supabase secrets are the only supported channels.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
