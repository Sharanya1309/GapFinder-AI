# GapFinder AI — System Architecture & Component Map

## 1. Executive Overview

**GapFinder AI** is a personalized diagnostic learning system engineered to detect, diagnose, and remediate knowledge gaps from students' own study materials. Unlike standard conversational "Chat with PDF" wrappers, GapFinder AI uses Retrieval-Augmented Generation (RAG) to generate grounded assessments, evaluate answers against scoring rubrics, diagnose topic-level misconceptions, and dynamically maintain an adaptive revision schedule.

---

## 2. Technology Stack & Specifications

| Layer | Technology | Details / Parameters |
|---|---|---|
| **Framework** | Next.js 14 | App Router (`src/app/`), React 18, React Server/Client Components |
| **Language** | TypeScript 5.7 | Strict type-safety, zero `any` in core data structures |
| **Styling** | Tailwind CSS 3.4 | Clean white & light-indigo design system (`brand-50` to `brand-950`, `surface-*`, `gap-*`) |
| **Icons** | Lucide React | Modern iconography throughout dashboards |
| **Database & Vector** | Supabase PostgreSQL | `pgvector` extension enabled, 768-dimensional vector cosine operations |
| **Vector Indexing** | HNSW Index | `document_chunks_embedding_idx USING hnsw (embedding vector_cosine_ops)` |
| **Vector Retrieval** | PostgreSQL RPC | `match_document_chunks(query_embedding, match_threshold, match_count, filter_user_id)` |
| **Security & Auth** | Supabase Auth + RLS | 11 relational tables with Row-Level Security (`auth.uid() = user_id`) |
| **AI / LLM** | Google Gemini API | `gemini-1.5-flash` for grounded synthesis & rubric evaluations |
| **Embeddings** | Google GenAI | `text-embedding-004` (768 dimensions) |
| **Persistence** | Dual-Tier Persistence | Live Supabase PostgreSQL + browser `localStorage` fallback for 100% demo resilience |

---

## 3. Core Libraries & State Management

```
src/
├── lib/
│   ├── types.ts                    # Single source of truth for all data contracts
│   ├── utils.ts                    # Classname merging, date & status badge formatting
│   ├── context/
│   │   └── AppContext.tsx          # Central client state & localStorage synchronization
│   ├── gap-diagnosis/
│   │   └── engine.ts               # Atomic cumulative scoring & dynamic diagnosis synthesizer
│   ├── rag/
│   │   └── chunking.ts             # 80-char sliding-window chunker with page/section parsing
│   ├── gemini/
│   │   └── client.ts               # Gemini 1.5 Flash client, vector cosine search, chunk retrieval
│   ├── demo/
│   │   └── sample-data.ts          # Authentic CS-682 Deep Learning course reader curriculum
│   └── supabase/
│       ├── client.ts               # Supabase browser client with live/demo detection
│       └── server.ts               # Server-side Supabase client
└── supabase/
    └── schema.sql                  # Complete SQL schema with pgvector, HNSW & 11 RLS tables
```

### Key Modules:
- **`src/lib/gap-diagnosis/engine.ts` (`processQuizAttemptForTopics`):**
  - Evaluates actual student answers against rubric criteria.
  - Updates topic cumulative scores using:
    $$\text{New Score} = \text{round}\left(\frac{\text{Prior Score} \times N_{\text{prior}} + \text{Attempt Score}}{N_{\text{prior}} + N_{\text{attempt}}}\right)$$
  - Enforces the statistical confidence threshold ($\ge 3$ attempts; otherwise `insufficient_data`).
  - Synthesizes diagnostic rationale, extracts actual student misconceptions, and preserves verifiable PDF citations.
- **`src/lib/context/AppContext.tsx`:**
  - Manages `user`, `topics`, `documents`, `chunks`, `quizzes`, `diagnoses`, and `revisionPlan`.
  - Atomically updates `topics` and `diagnoses` synchronously so all dashboard views stay identical.
  - Handles local storage synchronization under key prefix `gapfinder_v1_*`.
- **`src/lib/rag/chunking.ts` (`chunkTextWithMetadata`):**
  - Slices text into ~450–500 character chunks with 80-character sliding overlap.
  - Detects section headers via regex (`Chapter`, `Section`, `Module`, `#`).
  - Estimates page numbers based on cumulative character density (~1,800 chars/page).
- **`src/lib/demo/sample-data.ts`:**
  - Authentic Deep Learning curriculum (CS-682 Course Reader & Module 2 CNN Math).
  - Baseline diagnostic state:
    - **ANN:** 90% (Strong)
    - **CNN:** 40% (Weak — spatial convolution dimensions & max-pooling gradients)
    - **RNN:** 65% (Medium — LSTM gating mechanisms)
    - **Transformers:** 80% (Strong — scaled dot-product attention)
    - **Autoencoders:** 0% / 1 attempt (Insufficient Data — protected by statistical confidence threshold)

---

## 4. Route Groups & Component Responsibilities

### Auth Routes
- **`/login` (`src/app/(auth)/login/page.tsx`):**
  - Features **1-Click Judge Demo Login** for instant access without credentials.
  - Documented demo credentials: `judge@gapfinder.ai` / `GapFinderJudge2026!`.
  - Supabase Auth email/password login with fallback for offline hackathon testing.
- **`/register` (`src/app/(auth)/register/page.tsx`):**
  - Student onboarding: captures target exam date and daily available study minutes.

### Main Application Routes (`src/app/(app)/`)
- **`/dashboard` (`page.tsx`):**
  - Overview hero banner with exam countdown.
  - Metric summary cards (Total Topics, Critical Gaps, Developing, Mastered).
  - Topic Diagnostic Map bars with live dynamic scores.
  - Recent diagnostic assessment cards with direct review links.
  - Upcoming revision tasks checklist.
- **`/materials` (`page.tsx`):**
  - Drag-and-drop file upload with 10MB limit and format validation.
  - Text extraction for `.txt` and `.md` files.
  - **Interactive Chunk Inspector Modal** to view all indexed chunks with page/section metadata.
- **`/topics` (`page.tsx`):**
  - Topic Diagnostic Knowledge Map.
  - Configurable threshold sliders: Weak ($<50\%$), Medium ($50–75\%$), Strong ($>75\%$).
  - Statistical confidence threshold configuration (min questions for confidence, default 3).
  - Topic-specific launch buttons to trigger targeted quizzes.
- **`/quiz` (`page.tsx`):**
  - Diagnostic Quiz Hub with fast-launch presets:
    1. *Autoencoders Assessment:* Resolve Insufficient Data ($3$ Qs).
    2. *CNN Remediation Test:* Re-test critical knowledge gap ($3$ Qs).
    3. *Full Deep Learning Mock:* Comprehensive syllabus assessment ($5$ Qs).
  - Custom quiz builder with topic selectors and question count slider ($2$ to $6$).
- **`/quiz/[id]` (`page.tsx`):**
  - Active test-taking interface with timer and question navigation.
  - Radio buttons for MCQs; textarea for conceptual short answers.
  - **Strict Security Rule:** Correct answers, rubric criteria, and citations are **hidden** until submission.
- **`/quiz/[id]/results` (`page.tsx`):**
  - Post-submission evaluation review.
  - Deterministic MCQ scoring (100% or 0%) with reference derivations.
  - AI rubric scoring for short answers with keyword concept coverage.
  - Verifiable citation cards showing document title, page number, and section title.
- **`/gap-report` (`page.tsx`):**
  - In-depth topic-level diagnosis.
  - Shows current score, questions attempted, and evidence level.
  - Rationale synthesized from student answers.
  - Status-adaptive misconception breakdown (rose for weak, amber for medium, emerald for resolved).
  - Recommended revision action and course reader citations.
- **`/revision-plan` (`page.tsx`):**
  - Day-by-day adaptive revision timeline distributed over exam countdown.
  - Weak topics prioritized to Day 1 with high-priority remediation tasks and re-tests.
  - Interactive checkboxes with live completion progress bar.
  - Parameter drawer to adjust exam date and daily study budget with live rebalancing.
- **`/assistant` (`page.tsx`):**
  - Explain This Topic assistant grounded in uploaded course material.
  - Attached verifiable citation cards with page badges.
  - **Zero-Hallucination Refusal:** Explicitly refuses queries unsupported by uploaded chunks.
- **`/analytics` (`page.tsx`):**
  - Diagnostic average score and revision plan completion percentage.
  - Topic mastery progression bars.
  - **Dynamic Knowledge Gap Reduction Trajectory** showing live score, status, and citation.
  - Full diagnostic attempt history table.

---

## 5. End-to-End Data Flow

```
[Student Uploads Notes] 
         │
         ▼
[chunking.ts] ──> Chunks (450 chars, 80-char overlap, page/section citations)
         │
         ▼
[gemini/client.ts] ──> Vector similarity / chunk relevance matching
         │
         ▼
[quiz/generator.ts] ──> Grounded Questions (MCQ + Short Answer) with citations
         │
         ▼
[quiz/[id]/page.tsx] ──> Student Takes Quiz (Citations & Answers HIDDEN)
         │
         ▼
[quiz/[id]/results/page.tsx] ──> Deterministic + Rubric Evaluation
         │
         ▼
[gap-diagnosis/engine.ts] ──> processQuizAttemptForTopics()
  ├── Computes cumulative weighted score
  ├── Assigns status (<3: Insufficient Data, <50: Weak, <75: Medium, >=75: Strong)
  ├── Synthesizes dynamic diagnostic rationale
  └── Extracts actual student misconceptions & PDF citations
         │
         ▼
[AppContext.tsx] ──> Updates `topics`, `diagnoses`, & `revisionPlan` atomically
         │
         ├──> /dashboard     (Live scores & gap metrics)
         ├──> /topics        (Live status & threshold map)
         ├──> /gap-report    (Live rationale & misconception list)
         ├──> /revision-plan (Rebalanced Day 1 priority tasks)
         └──> /analytics     (Live trajectory & attempt log)
```
