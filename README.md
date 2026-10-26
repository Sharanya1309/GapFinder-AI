# 🚀 GapFinder AI — Personalized Learning Gap Detection System

> **GapFinder AI** is an AI-powered diagnostic learning system that identifies what students do **not** understand from their study materials. It generates diagnostic quizzes, evaluates answers deterministically and with an AI rubric, isolates weak topics, and constructs an adaptive, day-by-day revision plan.

---

## 🏆 Hackathon Judge Fast-Pass & Demo Access

GapFinder AI comes **preloaded with a complete, authentic Deep Learning curriculum** (CS-682 Course Reader & Specialized Module Notes).

- **URL (Local Dev):** `http://localhost:3000`
- **Judge 1-Click Fast Pass:** Navigate to `/login` and click **"1-Click Judge Demo Login"**
- **Documented Credentials:**
  - **Email:** `judge@gapfinder.ai`
  - **Password:** `GapFinderJudge2026!`
- **Preloaded Sample Data:**
  - **Artificial Neural Networks (ANN):** 90% (Strong)
  - **Convolutional Neural Networks (CNN):** 40% (Weak — spatial formula & max-pooling gradients)
  - **Recurrent Neural Networks (RNN):** 65% (Medium — LSTM gating)
  - **Transformers & Attention:** 80% (Strong)
  - **Autoencoders & Latent Space:** Insufficient Data (only 1 question attempted — below the 3-question statistical confidence threshold)

---

## 🌟 Key Differentiating Highlights

Unlike generic "Chat with PDF" wrappers that simply answer questions, **GapFinder AI is a diagnostic and adaptive remediation engine**:
1. **Evidence-Based Statistical Confidence:** Topics are not classified as Weak or Strong based on lucky or unlucky single answers. If fewer than 3 questions are attempted, it safely displays **Insufficient Data**.
2. **Deterministic & Rubric-Grounded Scoring:** MCQs are scored deterministically. Conceptual short-answers are evaluated against rubrics with keyword and misconception checks.
3. **Hidden Answers During Assessment:** Correct answers, rubric keys, and citations are strictly withheld until submission.
4. **Adaptive Day-by-Day Revision Planner:** Dynamically schedules tasks based on target exam date and daily study time, automatically prioritizing Weak topics first.
5. **Strict Grounding with Out-of-Context Refusal:** The "Explain This Topic" assistant refuses questions outside the uploaded materials and attaches verifiable page citations.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) + React 18 |
| **Language** | TypeScript (Strict mode) |
| **Styling & Design** | Tailwind CSS + Lucide Icons (Clean White & Light-Indigo Theme) |
| **Database & Vectors** | PostgreSQL + Supabase with `pgvector` extension |
| **Authentication** | Supabase Auth + 1-Click Judge Demo Session |
| **AI Generation** | Google Gemini API (`gemini-1.5-flash` / `@google/generative-ai`) |
| **Embeddings** | Google Gemini `text-embedding-004` (768 dimensions) |
| **Deployment** | Vercel Ready (Standalone output & zero-config) |

---

## 🔄 Retrieval-Augmented Generation (RAG) Pipeline

```
[Uploaded PDF / Text]
         │
         ▼
[Semantic Chunking Engine]  ─── Overlap (80 chars), Page & Section Tracking
         │
         ▼
[Vector Embeddings (768d)]  ─── Google text-embedding-004
         │
         ▼
[pgvector / HNSW Search]    ─── Cosine Similarity & match_document_chunks RPC
         │
         ├──────────────────────────────────┐
         ▼                                  ▼
[Diagnostic Question Generator]     [Grounded Topic Assistant]
 • Grounded MCQs & Rubrics           • Verifiable Page Citations
 • Citations hidden until submit     • Strict Out-of-Context Refusal
         │
         ▼
[Answer Evaluation Engine]
 • Deterministic MCQ Scoring
 • AI Rubric Partial Credit (0-100)
 • Misconception & Root Cause Extraction
         │
         ▼
[Topic Diagnostic Map Update]
 • Weak (<50%), Medium (50-75%), Strong (>75%)
 • Insufficient Data Guard (<3 attempts)
         │
         ▼
[Personalized Adaptive Revision Plan]
 • Exam Date Countdown + Daily Study Hours
 • Weak topics prioritized to Day 1
```

---

## 📁 Project Directory Structure

```
gapfinder-ai/
├── src/
│   ├── app/
│   │   ├── (app)/
│   │   │   ├── layout.tsx             # Sidebar + Navbar app shell
│   │   │   ├── dashboard/page.tsx     # Main learning gap dashboard
│   │   │   ├── materials/page.tsx     # Material upload & chunk inspector
│   │   │   ├── topics/page.tsx        # Topic knowledge map & threshold config
│   │   │   ├── quiz/
│   │   │   │   ├── page.tsx           # Diagnostic quiz hub & presets
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx       # Active test taking interface
│   │   │   │       └── results/page.tsx # Evaluation & rubric review
│   │   │   ├── gap-report/page.tsx    # Topic diagnosis & misconception report
│   │   │   ├── revision-plan/page.tsx # Adaptive daily study schedule
│   │   │   ├── assistant/page.tsx     # Grounded Explain This Topic RAG
│   │   │   └── analytics/page.tsx     # Diagnostic attempts & score trajectories
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx         # Login with 1-Click Judge Demo
│   │   │   └── register/page.tsx      # Student registration & exam setup
│   │   ├── globals.css                # Custom tokens & indigo theme
│   │   ├── layout.tsx                 # Root layout with AppProvider
│   │   └── page.tsx                   # Root redirect to /dashboard
│   ├── components/
│   │   └── layout/
│   │       ├── Sidebar.tsx            # Navigation, topic badges, reset button
│   │       └── Navbar.tsx             # Exam countdown, daily target, user chip
│   └── lib/
│       ├── context/AppContext.tsx     # Unified state & localStorage sync
│       ├── demo/sample-data.ts        # Preloaded Deep Learning course reader
│       ├── gemini/client.ts           # Gemini AI & RAG retrieval engine
│       ├── rag/chunking.ts            # Text chunker with semantic overlap
│       ├── supabase/client.ts         # Supabase client & fallback
│       ├── types.ts                   # Strict TypeScript interfaces
│       └── utils.ts                   # Helper functions
├── supabase/
│   └── schema.sql                     # Full PostgreSQL schema with pgvector & RLS
├── .env.example                       # Environment variables template
├── next.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## ⚙️ Environment Variables

Create `.env.local` for local development:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Gemini API
GEMINI_API_KEY=your-google-gemini-api-key

# App Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_DEMO_MODE=true
```

> **Note:** If `GEMINI_API_KEY` or `SUPABASE_URL` are omitted or set to placeholders, GapFinder AI seamlessly falls back to its local grounded synthesizer and in-memory vector store, ensuring **100% uptime and testability for hackathon judges**.

---

## 🚀 Getting Started Locally

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Production Build & Linting
```bash
npm run build
```

---

## 🗄️ Supabase PostgreSQL Setup (Optional for Live DB)

1. Create a new Supabase project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Paste and run the contents of [`supabase/schema.sql`](supabase/schema.sql).
4. Copy your **Project URL** and **Anon Key** to `.env.local`.

---

## ☁️ Deployment on Vercel

1. Push your repository to GitHub.
2. Import the repository into [Vercel](https://vercel.com).
3. Add the environment variables from `.env.example`.
4. Click **Deploy**. Vercel will automatically build the Next.js App Router application.

---

## 🔮 Future Enhancements
- Multi-modal question generation from diagrams, charts, and equations.
- Audio flashcard reviews for on-the-go revision.
- Collaborative study groups with shared knowledge gap heatmaps.
