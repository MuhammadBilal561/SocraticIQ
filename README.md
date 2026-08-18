# SocratIQ — Socratic DSA Tutor for Interview Prep

> **Master data structures & algorithms through guided questions, not answers.**

SocratIQ is an AI-powered learning platform that teaches DSA interview preparation using the **Socratic method**. Instead of handing you solutions, the AI tutor asks thought-provoking questions, offers progressive hints, and provides targeted feedback that guides you to discover the answer yourself.

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>

- [Overview](#overview)
- [Features](#features)
- [Demo](#demo)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Configuration](#configuration)
  - [Supabase Setup](#supabase-setup)
  - [Gemini API Key](#gemini-api-key)
  - [Deploying Edge Functions](#deploying-edge-functions)
- [Usage Guide](#usage-guide)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Data Structure Visualizations](#data-structure-visualizations)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

</details>

---

## Overview

Preparing for coding interviews often means memorizing solutions — but research shows that **active problem-solving with guided discovery** leads to 91% better retention. SocratIQ flips the script:

| Traditional Approach | SocratIQ Approach |
|---|---|
| Watches solution videos | Gets asked guiding questions |
| Memorizes patterns | Discovers patterns through reasoning |
| Forgets after the interview | Retains concepts long-term |

The platform integrates with **LeetCode** (paste any problem URL), uses **Google's Gemini** model via **Supabase Edge Functions**, and includes a **mock AI fallback** so you can practice offline or without an API key.

---

## Features

### 🔮 Socratic AI Tutoring
The AI tutor asks one thought-provoking question at a time — never giving away the full solution. Follow-up questions adapt to your responses, deepening your understanding at every step.

### 🧠 Pattern Recognition Engine
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

### 💻 Live Code Editor
Built on the **Monaco Editor** (same engine as VS Code) with syntax highlighting, auto-completion, and a cyberpunk terminal aesthetic.

### 📊 Mastery Tracking
A gamified dashboard tracks your progress across all patterns using a **decay-adjusted mastery score** that weights recent performance more heavily.

### 🖼️ Inline Data Structure Visualizations
Array traversals, linked-list pointer dances, binary tree traversals, and stack operations render as interactive ASCII-style visualizations directly in the chat.

### 🌌 3D Hero Experience
A reactive Three.js scene with a torus-knot, 3,000 floating particles, and mouse-driven physics powers the landing page.

### 🔄 LeetCode Integration
Paste any LeetCode problem URL and the system automatically fetches the title, description, tags, and difficulty — then detects the underlying DSA pattern.

### 🔌 Offline-First with Mock AI
All sessions are persisted to `localStorage`. When the edge function is unavailable, a curated mock AI continues the tutorial seamlessly.

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
| **Persistence** | localStorage (session storage) |
| **Edge Runtime** | Supabase Edge Functions (Deno) |
| **External APIs** | LeetCode GraphQL API |

---

## Getting Started
### Prerequisites

Ensure you have the following installed:

- **Node.js** ≥ 18
- **npm** ≥ 9 (or yarn/pnpm)
- **Git** (for version control)
- *(Optional)* A **Supabase project** and **Google Gemini API key** for full AI features

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/socratiq.git
cd socratiq

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment Variables

Create a `.env.local` file in the project root for local development:

```bash
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```

> **Note:** Credentials are currently hardcoded in [`src/lib/supabase.ts`](src/lib/supabase.ts) for this prototype. For production, migrate these to environment variables loaded at build time.

### Running Locally

```bash
npm run dev        # Start Vite dev server
npm run build      # Build for production
npm run preview    # Preview the production build locally
```

---

## Configuration
### Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Navigate to **Authentication → Settings** and configure your auth providers.
3. Copy your **Project URL** and **anon public key**.

### Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Create a new API key with access to the Gemini API.
3. Add it as a Supabase secret (required for edge functions to work).

### Deploying Edge Functions

The AI logic runs in a Supabase Edge Function written in **Deno / TypeScript**. To deploy:

```bash
# Install the Supabase CLI
npm install -g supabase

# Link your local project to your Supabase project
supabase link --project-ref <your-project-ref>

# Set the Gemini API key as a secret
supabase secrets set GEMINI_API_KEY=<your-gemini-api-key>

# Deploy the edge function
supabase functions deploy socratiq-api

# (Optional) Serve functions locally for development
supabase functions serve
```

---

## Usage Guide
### Starting a Session

1. Sign up or log in through the auth flow.
2. Navigate to `/practice` or click **Start Your First Session**.
3. Paste a **LeetCode problem URL** (e.g., `https://leetcode.com/problems/two-sum/`) or manually enter a problem title and description.
4. The AI will greet you with a **Socratic opening question** tailored to the problem's pattern.

### The Socratic Flow

Each session follows this interactive cycle:

1. **AI asks** a guiding question → you reason through it.
2. **You respond** in the chat with your thoughts.
3. **AI follows up** — probing deeper or steering you toward the insight.
4. **Hints** (3 available) can be unlocked progressively when you're stuck.
5. **Code editor** — implement your solution.
6. **Submit** → get complexity analysis and feedback.
7. **Solve or Reveal** — the AI reveals the pattern and optimal approach with a data-structure visualization.

### Mastery Dashboard

The dashboard (`/dashboard`) computes a **decay-adjusted mastery score** (0–100) for each pattern using:

- Problems attempted, solved, given up on
- Hints consumed per attempt
- Session recency (decays 50% weight after 30 days)

Cards are color-coded: green for high mastery, cyan for mid, red for needs practice.

### Session History

The history view (`/history`) lets you:

- Search past sessions by problem title
- Filter by DSA pattern category
- Click into any session to **restore and resume** it
- Review hints, code submissions, and AI feedback

---

## Project Structure
```
socratiq/
├── public/                    # Static assets
│   ├── nativelyai.svg         # Favicon
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── App.tsx                # Root router (public + protected routes)
│   ├── main.tsx               # React entry point
│   ├── index.css              # Tailwind + custom cyberpunk theme
│   ├── vite-env.d.ts          # Vite type declarations
│   ├── components/
│   │   ├── Layout.tsx         # Sidebar nav + user panel
│   │   ├── Auth/              # Login / Signup / ProtectedRoute
│   │   ├── Landing/           # Hero, features, CTA sections
│   │   ├── Dashboard/         # Mastery scorecards
│   │   ├── History/           # Session history & search
│   │   ├── ProblemScreen/     # Chat + CodeEditor + Controls
│   │   └── Visualizations/    # Array, LinkedList, Stack, Tree renderers
│   ├── store/                 # React Context providers (Auth, Session)
│   ├── services/              # AI service client (edge function calls)
│   ├── utils/                 # Patterns, mock AI, localStorage storage
│   ├── lib/                   # Supabase client configuration
│   └── types/                 # Shared TypeScript interfaces
├── supabase/
│   └── functions/
│       ├── _shared/
│       │   └── cors.ts        # CORS headers
│       └── socratiq-api/      # Main edge function (Deno/TypeScript)
│           ├── deno.json
│           └── index.ts       # Gemini + LeetCode + Socratic prompts
├── .gitignore
├── package.json
├── tsconfig.json
└── vite.config.ts
```

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
│          │ (Auth)   │   │(fallback) │                  │
│          └─────┬────┘   └─────┬────┘                  │
│                │              │                        │
│          ┌─────▼──────────────▼──────┐                 │
│          │  AI Service Layer          │                 │
│          │  (src/services/ai.ts)      │                 │
│          └────────────┬───────────────┘                 │
└──────────────────────┼─────────────────────────────────┘
                       │
                       ▼
       ┌──────────────────────────────────┐
       │  Supabase Edge Function          │
       │  (Deno / socratiq-api)           │
       │                                  │
       │  ┌────────────────────┐        │
       │  │ Gemini 2.0 Flash   │        │
       │  │ (Socratic prompts) │        │
       │  └────────────────────┘        │
       │                                  │
       │  ┌────────────────────┐        │
       │  │ LeetCode GraphQL   │        │
       │  │ (problem fetch)    │        │
       │  └────────────────────┘        │
       └──────────────────────────────────┘
```

---

## Data Structure Visualizations

When the AI provides hints, feedback, or reveals, it can include structured **visualization data** that renders as interactive diagrams:

| Type | Renders |
|---|---|
| **Array** | Memory-address grid with highlighted indices, pointer labels, and index annotations |
| **Linked List** | Horizontal node chain with arrows, `null` tail indicators, and pointer labels |
| **Tree** | SVG-rendered binary tree with computed DFS layout, highlightable nodes, and traversal paths |
| **Stack** | Vertical stack (top→bottom) with `TOP` pointer and index labels |

All visualizations follow the terminal/cyberpunk aesthetic with neon-green highlights and monospace fonts.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server at `http://localhost:5173` |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build locally |

---

## Deployment

### Frontend (Recommended: Vercel or Netlify)

```bash
npm run build
```

Then deploy the `dist/` folder to your preferred host:

- **Vercel**: `vercel --prod`
- **Netlify**: Drop the `dist/` folder or use `netlify deploy --prod`
- **GitHub Pages**: Push `dist/` as the `gh-pages` branch

### Backend (Supabase Edge Functions)

```bash
supabase functions deploy socratiq-api
supabase secrets set GEMINI_API_KEY=<your-key>
```

---

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make your changes with clear, descriptive commit messages
4. Run the type checker: `npx tsc --noEmit`
5. **Push** to your branch: `git push origin feat/your-feature`
6. Open a **Pull Request** with a clear description of your changes

### Development Guidelines

- **Type safety first** — this project uses strict TypeScript with `noUnusedLocals` and `noUnusedParameters` enabled.
- **Match the aesthetic** — follow the cyberpunk terminal style in components.
- **Socratic AI** — when adding prompts, ensure they ask questions rather than giving answers.
- **Accessibility** — maintain `aria-*` attributes and keyboard navigation in UI components.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <sub>Built with ❤️ and a terminal aesthetic by engineers who truly understand.</sub>
</p>

<details>
  <summary align="center">🌟 Support the project</summary>

If you find SocratIQ helpful, consider giving it a star on GitHub — it helps others discover it!

</details>