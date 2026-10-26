# Skill: Verify Hackathon Judge Readiness

Run this comprehensive verification workflow before demonstrating GapFinder AI to evaluators or deploying to production.

---

## 📋 Hackathon Verification Checklist

### 1. Build & Typecheck Validation
Run the full production compiler:
```bash
npm run build
```
- [ ] Exit code must be `0`.
- [ ] Zero TypeScript errors.
- [ ] All 14 routes generated successfully (`/`, `/analytics`, `/assistant`, `/dashboard`, `/gap-report`, `/login`, `/materials`, `/quiz`, `/quiz/[id]`, `/quiz/[id]/results`, `/register`, `/revision-plan`, `/topics`).

---

### 2. Judge Fast-Pass Authentication Test
1. Navigate to `http://localhost:3000/login`.
2. Confirm the **"1-Click Judge Demo Login"** button is prominent.
3. Click the button.
- [ ] Confirms instant navigation to `/dashboard`.
- [ ] User profile displays: `Dr. Alex Rivera (Hackathon Judge)`.
- [ ] Badge displays `Judge Demo Account`.
- [ ] Fallback credentials `judge@gapfinder.ai` / `GapFinderJudge2026!` are clearly displayed.

---

### 3. Baseline Curriculum Integrity
On `/dashboard` and `/topics`, confirm initial baseline metrics:
- [ ] **ANN:** 90% (Strong, 10 attempts)
- [ ] **CNN:** 40% (Weak, 8 attempts)
- [ ] **RNN:** 65% (Medium, 6 attempts)
- [ ] **Transformers:** 80% (Strong, 8 attempts)
- [ ] **Autoencoders:** Insufficient Data (1 attempt, below the 3-question confidence threshold)

---

### 4. End-to-End Quiz & Score Synchronization Test
1. Navigate to `/quiz`.
2. Click **"CNN Remediation Diagnostic Quiz"** (or preset).
3. Confirm that on `/quiz/[id]`, **correct answers and citations are hidden**.
4. Answer the questions and click **Submit Diagnostic Answers**.
5. On `/quiz/[id]/results`, verify:
   - [ ] Question-level evaluation displays score, feedback, and citation cards.
6. Verify score synchronization across all 4 dashboard views:
   - [ ] `/dashboard`: Topic Diagnostic Map shows CNN with new score (e.g. 56% Medium).
   - [ ] `/topics`: Topic card shows CNN with new score (e.g. 56% Medium).
   - [ ] `/gap-report`: CNN shows new score (e.g. 56% Medium) with updated rationale.
   - [ ] `/analytics`: Mastery bars and Knowledge Gap Reduction Trajectory show new score (e.g. 56% Medium).
   - [ ] **No page displays stale or conflicting 40% cards.**

---

### 5. Grounded Assistant & Zero-Hallucination Refusal Test
1. Navigate to `/assistant`.
2. Click test prompt: **"Explain the CNN output dimension formula"**.
   - [ ] Response cites `Module_2_CNN_Math_And_Receptive_Fields.pdf`, Page 14.
3. Click test prompt: **"Explain Quantum Key Distribution (Strict Refusal Test)"**.
   - [ ] Assistant explicitly refuses: *"I cannot find sufficient evidence in your uploaded study material to answer this question."*
   - [ ] Displayed in an amber warning box with `grounded: false`.

---

### 6. Adaptive Revision Plan Test
1. Navigate to `/revision-plan`.
   - [ ] Top priority weak topic is scheduled for **Day 1**.
   - [ ] Daily tasks show estimated time, priority badges, and citations.
2. Click task checkboxes:
   - [ ] Plan completion percentage increases in real time.
3. Open **Plan Parameters** drawer:
   - [ ] Adjust daily study time slider or exam date.
   - [ ] Click **Apply & Rebalance Schedule** to confirm instant rebalancing.

---

### 7. Demo Reset Safety Test
1. In the sidebar, click **"Reset Demo Data"** and confirm.
   - [ ] State immediately reverts to the initial Deep Learning baseline (CNN 40% Weak, Autoencoders Insufficient Data).
