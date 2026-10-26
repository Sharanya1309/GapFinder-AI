# Rule 03: UI State, Design System & Judge Demo Mode

> **Context:** This rule governs the design system tokens, hackathon judging features, UI accessibility, state persistence, and build stability across GapFinder AI. All engineers, agents, and subagents MUST preserve these invariants when modifying [`src/components/layout/Sidebar.tsx`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/components/layout/Sidebar.tsx), [`src/components/layout/Navbar.tsx`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/components/layout/Navbar.tsx), [`src/lib/context/AppContext.tsx`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/lib/context/AppContext.tsx), [`src/app/(auth)/login/page.tsx`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/app/(auth)/login/page.tsx), or any UI page.

---

## 1. Judge Fast-Pass & Demo Reset Invariants

To guarantee an effortless, frictionless evaluation experience for hackathon judges without requiring complex authentication or database setup:

### Invariant 1.1: 1-Click Judge Demo Login on `/login`
[`src/app/(auth)/login/page.tsx`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/app/(auth)/login/page.tsx) MUST always prominently display:
1. **The Hackathon Judge Fast-Pass Card:**
   - A dedicated card with `ShieldCheck` and `Sparkles` badges.
   - The primary **"1-Click Judge Demo Login"** button that immediately authenticates as `Dr. Alex Rivera (Hackathon Judge)` and redirects to `/dashboard` with 0 friction.
2. **Prominently Documented Credentials Box:**
   - For judges who prefer typing their login credentials:
     - **Email:** `judge@gapfinder.ai`
     - **Password:** `GapFinderJudge2026!`
3. **Graceful Fallback:** If Supabase is offline or unconfigured, standard login with these demo credentials must automatically grant entry rather than throwing an error.

### Invariant 1.2: 1-Click Demo Reset in `Sidebar.tsx`
[`src/components/layout/Sidebar.tsx`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/components/layout/Sidebar.tsx) MUST always retain the **"Reset Demo Data"** button in its footer:
1. **Action:** Invokes `resetToDemoData()` from [`src/lib/context/AppContext.tsx`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/lib/context/AppContext.tsx).
2. **Wipes Overrides:** Cleanses all `localStorage` state keys (`gapfinder_v1_*`).
3. **Restores Exact Hackathon Baseline:**
   - **ANN:** 90% (Strong — 10 questions attempted)
   - **CNN:** 40% (Weak — 8 questions attempted, primary gap target)
   - **RNN:** 65% (Medium — 6 questions attempted, developing)
   - **Transformers:** 80% (Strong — 6 questions attempted)
   - **Autoencoders:** Insufficient Data (1 question attempted, triggers confidence guard)
   - **Course Materials:** Preloads `CS682_Deep_Learning_Course_Reader.pdf` and verified RAG chunks.

### Invariant 1.3: Judge Context in `Navbar.tsx`
[`src/components/layout/Navbar.tsx`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/components/layout/Navbar.tsx) displays:
- Real-time exam countdown pill (`daysLeft` computed dynamically from `user.examDate`).
- Daily study target badge (`user.dailyStudyMinutes` m / day).
- Verified judge identity badge (`ShieldCheck` icon, `Judge Demo Account` label).

---

## 2. Design System & Semantic Mastery Tokens

The visual design system of GapFinder AI conveys premium academic rigor through a clean white and light-indigo palette with semantic mastery indicators.

### 2.1 Base Palette Tokens
- **Canvas / Backgrounds:** Clean slate-50 (`#f8fafc`), pure white (`#ffffff`), and soft indigo tint (`bg-indigo-50/50`).
- **Primary Brand Indigo:**
  - `brand-50`: `#eef2ff`
  - `brand-100`: `#e0e7ff`
  - `brand-500`: `#6366f1`
  - `brand-600`: `#4f46e5` (Primary Interactive Actions)
  - `brand-700`: `#4338ca` (Active / Hover States)
- **Typography:** Modern sans typography (Inter / system), `text-slate-900` for titles, `text-slate-600` for body, `text-slate-400` for metadata.
- **Card Styling:** `rounded-2xl border border-slate-200 bg-white p-6 shadow-sm` with smooth transitions (`transition-all duration-200`).

### 2.2 Semantic Mastery Badge Tokens
Proficiency badges across **all 10 pages** (`/dashboard`, `/materials`, `/topics`, `/quiz`, `/quiz/[id]`, `/quiz/[id]/results`, `/gap-report`, `/revision-plan`, `/assistant`, `/analytics`) MUST be sourced exclusively via `getStatusBadgeInfo(status)` in [`src/lib/utils.ts`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/lib/utils.ts):

| Status | Semantic Meaning | Badge Classes | Progress Bar | Subtle Card |
| :--- | :--- | :--- | :--- | :--- |
| **`weak`** | Critical Knowledge Gap | `bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20` | `bg-rose-500` | `bg-rose-50/50 border-rose-200` |
| **`medium`** | Developing / Consolidating | `bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20` | `bg-amber-500` | `bg-amber-50/50 border-amber-200` |
| **`strong`** | Mastered / Verified | `bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20` | `bg-emerald-500` | `bg-emerald-50/50 border-emerald-200` |
| **`insufficient_data`** | Insufficient Evidence (< 3 questions) | `bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/10` | `bg-slate-400` | `bg-slate-50 border-slate-200` |

### 2.3 Layout Integrity
- Do NOT randomly change colors or inject ad-hoc utility shades (e.g. arbitrary `purple-400`, `cyan-300`, or raw unstyled elements).
- Do NOT overhaul or break the established two-column card hierarchies, responsive navigation drawer, or progress meters.

---

## 3. Global State & LocalStorage Persistence

Client-side state persistence in [`src/lib/context/AppContext.tsx`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/lib/context/AppContext.tsx) isolates user interactions and survives page refreshes:

1. **Storage Keys Prefix:** All keys use the standard prefix `gapfinder_v1_*`:
   - `gapfinder_v1_user`: User profile, exam date, daily study target.
   - `gapfinder_v1_topics`: Syllabus topics with cumulative scores, attempts, and thresholds.
   - `gapfinder_v1_docs`: Uploaded course reader and lecture notes metadata.
   - `gapfinder_v1_chunks`: RAG document chunks with page and section metadata.
   - `gapfinder_v1_quizzes`: Historical diagnostic quiz attempts with evaluated answers.
   - `gapfinder_v1_diagnoses`: In-depth topic diagnoses with dynamic rationales and citations.
   - `gapfinder_v1_plan`: Adaptive daily revision schedule.

2. **Mount Reconciliation Protocol:**
   - In `useEffect` on mount, `AppContext.tsx` runs an automatic reconciliation pass:
     ```typescript
     // Align diagnoses with topics to eliminate any possibility of score divergence
     const alignedDiagnoses = loadedDiagnoses.map((d) => {
       const matchingTopic = loadedTopics.find((t) => t.id === d.topicId);
       if (matchingTopic) {
         return {
           ...d,
           score: matchingTopic.latestScore,
           status: matchingTopic.status,
           questionsAttempted: matchingTopic.questionsAttempted,
         };
       }
       return d;
     });
     ```

---

## 4. TypeScript & Production Build Zero-Tolerance

GapFinder AI maintains a strict zero-tolerance quality standard:

1. **0 TypeScript Compiler Errors:**
   - All interfaces in [`src/lib/types.ts`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/lib/types.ts) must be respected.
   - No `any` type escapes on core data models.
   - Strict typing on component props and route params.
2. **Deterministic Fallbacks:**
   - Network requests and AI calls must be wrapped in `try/catch` with local fallbacks.
   - Zero unhandled promise rejections.
3. **Mandatory Build Verification:**
   - Every commit must successfully compile via `npm run build` with exit code `0`.
   - All 14 routes (static and dynamic) must generate cleanly without warnings or runtime errors.
