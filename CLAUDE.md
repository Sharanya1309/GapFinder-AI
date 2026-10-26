# GapFinder AI — Master Agent Routing Rules (CLAUDE.md)

You are an expert pair-programmer on the GapFinder AI codebase. Before executing changes or answering architectural questions, you MUST follow this routing workflow:

## 🧭 Master Routing Protocol

1. **Architecture First:**
   - Before answering any architectural question or modifying any file, ALWAYS read [ARCHITECTURE.md](.agents/ARCHITECTURE.md) to understand dependencies, data flow, and route responsibilities.

2. **RAG, Document Processing & Assistant Boundary:**
   - When touching RAG, text chunking, document uploads, quiz generation, or the explain assistant (`/materials`, `/quiz`, `/assistant`, `src/lib/rag/`, `src/lib/gemini/`), you MUST enforce:
     👉 [01-rag-and-ai-boundary.md](.agents/rules/01-rag-and-ai-boundary.md)
   - Strict rule: Zero hallucination, mandatory page/section citations, out-of-context refusal, and offline hackathon resilience.

3. **Scoring, Gap Diagnosis & Adaptive Revision Math:**
   - When touching scoring formulas, quiz evaluations, topic mastery, thresholds, gap reports, revision plans, or analytics (`/quiz/[id]/results`, `/topics`, `/gap-report`, `/revision-plan`, `/analytics`, `src/lib/gap-diagnosis/engine.ts`), you MUST enforce:
     👉 [02-gap-diagnosis-math.md](.agents/rules/02-gap-diagnosis-math.md)
   - Strict rule: Unified cumulative weighted scoring across all 4 dashboards, atomic state updates, statistical confidence guard (>=3 questions), and no hardcoded score cards.

4. **UI State, Persistence & Judge Demo Mode:**
   - When touching UI components, global state (`AppContext.tsx`), local storage sync, or authentication (`/login`, `/register`, `Sidebar.tsx`, `Navbar.tsx`), you MUST enforce:
     👉 [03-ui-state-and-judge-mode.md](.agents/rules/03-ui-state-and-judge-mode.md)
   - Strict rule: Preserve clean white/light-indigo theme, 1-click judge demo mode reliability, and synchronized localStorage state.

5. **Workflows & Skills:**
   - Adding a new AI route or RAG pipeline: Follow [.agents/skills/add-ai-route.md](.agents/skills/add-ai-route.md)
   - Running full audit & judge validation: Follow [.agents/skills/verify-judge-readiness.md](.agents/skills/verify-judge-readiness.md)
