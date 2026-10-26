# Rule 03: UI Design, Global State & Judge Demo Mode

When touching UI components, styling, global state (`AppContext.tsx`), local storage sync, or authentication (`/login`, `/register`, `Sidebar.tsx`, `Navbar.tsx`), you MUST strictly enforce the following rules:

---

## 1. Design System & Aesthetic Standard
- **Clean White & Light-Indigo Theme:**
  - Backgrounds: `bg-slate-50`, `bg-white`, `bg-indigo-50/50`.
  - Primary Brand Colors: Tailwind `brand-*` (indigo-600 `#4f46e5`, indigo-700 `#4338ca`, indigo-50 `#eef2ff`).
  - Text: `text-slate-900` for primary headings, `text-slate-600` for body, `text-slate-400` for captions.
  - Shadows: `shadow-sm`, `shadow-card`, `shadow-elevated`.
- **Status Badges & Tokens:**
  - Weak: `bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20`
  - Medium: `bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20`
  - Strong: `bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20`
  - Insufficient Data: `bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/10`
- **UI Preservation Rule:** Never overhaul or redesign the UI layout without explicit user request. Maintain clean spacing and responsive cards.

---

## 2. Global State & LocalStorage Synchronization
- All client state lives in `AppContext.tsx` and is synchronized to `localStorage` under prefix `gapfinder_v1_*`:
  - `gapfinder_v1_user`
  - `gapfinder_v1_topics`
  - `gapfinder_v1_docs`
  - `gapfinder_v1_chunks`
  - `gapfinder_v1_quizzes`
  - `gapfinder_v1_diagnoses`
  - `gapfinder_v1_plan`
- **Reconciliation Protocol on Load:**
  - In `useEffect` on load, always reconcile `diagnoses` with `topics` so that `score`, `status`, and `questionsAttempted` are mathematically identical across all records.

---

## 3. Judge Demo Mode & 1-Click Fast-Pass
- **1-Click Judge Demo Login:** The `/login` page must always provide a prominent **"1-Click Judge Demo Login"** button that immediately loads the application as `Dr. Alex Rivera (Hackathon Judge)`.
- **Documented Credentials:** Prominently display demo credentials (`judge@gapfinder.ai` / `GapFinderJudge2026!`) for judges who prefer typing.
- **1-Click Demo Reset:** The sidebar must always retain the **"Reset Demo Data"** button to allow judges to reset the curriculum to the initial Deep Learning baseline at any point during evaluation.
- **Pre-seeded Baseline:**
  - ANN: 90% (Strong)
  - CNN: 40% (Weak)
  - RNN: 65% (Medium)
  - Transformers: 80% (Strong)
  - Autoencoders: Insufficient Data (1 question attempted)

---

## 4. Micro-Interactions & Accessible Feedback
- All buttons must provide hover states, active transitions (`active:scale-[0.98]`), and disabled states.
- Submissions must display active loading feedback (e.g. *"Evaluating with AI Rubric..."*, *"Extracting Text & Generating Chunks..."*).
- Never allow unhandled promise rejections or blank screens on failed network requests.
