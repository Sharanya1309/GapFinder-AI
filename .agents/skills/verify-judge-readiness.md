# Skill: Verify Hackathon Judge Readiness

> **Context:** Execute this verification playbook on command to validate that GapFinder AI is 100% stable, fully synchronized, mathematically sound, and ready for evaluator examination.

---

## 📋 Comprehensive 4-Point Verification Checklist

---

### Check 1: Production Build & Route Generation Verification

Run the full Next.js production compiler to verify 0 TypeScript errors and static generation:

```powershell
npm run build
```

#### Acceptance Criteria:
- [ ] Command exits with **code 0**.
- [ ] Zero TypeScript or lint errors.
- [ ] All **14 routes** are compiled and generated cleanly:
  1. `/` (Root redirect / Home)
  2. `/_not-found` (404 Error handler)
  3. `/analytics` (Progress & Diagnostic Performance Analytics)
  4. `/assistant` (Explain This Topic Assistant)
  5. `/dashboard` (Diagnostic Overview & Knowledge Map)
  6. `/gap-report` (Diagnostic Gap Breakdown & Citations)
  7. `/login` (Judge Fast-Pass & Student Authentication)
  8. `/materials` (Study Material Upload & Interactive Chunk Inspector)
  9. `/quiz` (Diagnostic Quiz Hub & Custom Builder)
  10. `/quiz/[id]` (Active Quiz Interface)
  11. `/quiz/[id]/results` (Diagnostic Evaluation & Citation Cards)
  12. `/register` (Student Onboarding & Study Targets)
  13. `/revision-plan` (Adaptive Daily Schedule)
  14. `/topics` (Knowledge Map & Configurable Thresholds)

---

### Check 2: Initial Curriculum Baseline Verification

Inspect [`src/lib/demo/sample-data.ts`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/lib/demo/sample-data.ts) and verify the pre-seeded curriculum baseline:

| Topic Code | Topic Name | Baseline Score | Questions Attempted | Expected Status | Reason / Justification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ANN** | Artificial Neural Networks | **90%** | 10 | `strong` | High mastery confirmed ($>75\%$) |
| **CNN** | Convolutional Neural Networks | **40%** | 8 | `weak` | Primary diagnostic gap ($<50\%$) |
| **RNN** | Recurrent Neural Networks | **65%** | 6 | `medium` | Developing conceptual grasp ($50\% - 75\%$) |
| **Transformers** | Transformers & Self-Attention | **80%** | 6 | `strong` | High accuracy on QKV matrix math |
| **Autoencoders** | Autoencoders & Latent Space | **100% (or N/A)** | 1 | `insufficient_data` | **Confidence Guard Triggered:** Only 1 attempt (< 3 questions required) |

#### Verification Procedure:
1. Navigate to `/login` and click **"1-Click Judge Demo Login"**.
2. On `/dashboard`, confirm:
   - CNN shows **40%** and **Weak** badge (`bg-rose-50 text-rose-700`).
   - Autoencoders shows **Insufficient Data** badge (`bg-slate-100 text-slate-700`).
3. Click **Topic Map** (`/topics`) and confirm identical scores and badges.

---

### Check 3: Autoencoders 3-Question Assessment & State Flip Trace

Trace the quiz submission lifecycle to confirm that answering 3 questions on an `insufficient_data` topic unlocks its true proficiency status and propagates across all 5 dashboard pages.

#### Mathematical Trace:
- **Prior State:** $S_{\text{old}} = 100\%$, $N_{\text{old}} = 1$ question, Status = `'insufficient_data'`.
- **New Quiz Attempt:** Answering 3 Autoencoder questions with scores [100, 100, 100] ($S_{\text{new}} = 300$, $N_{\text{attempt}} = 3$).
- **Recalculation via [`src/lib/gap-diagnosis/engine.ts`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/lib/gap-diagnosis/engine.ts):**
  $$N_{\text{total}} = 1 + 3 = 4$$
  $$S_{\text{updated}} = \text{round}\left(\frac{100 \cdot 1 + 300}{4}\right) = 100\%$$
- **Confidence Guard Check:** $N_{\text{total}} = 4 \ge 3 \implies$ **Confidence condition satisfied!**
- **Threshold Evaluation:** $S_{\text{updated}} = 100\% \ge \text{mediumMax} (75\%) \implies$ Status flips to **`strong`**.

#### Cross-Page Propagation Checks:
1. **`/quiz/[id]/results`:** Shows 100/100, feedback, and citations (`Module_5_Autoencoders_And_Latent_Spaces.pdf`, Page 61).
2. **`/dashboard`:** Autoencoders progress bar elevates to 100% with `Strong` emerald badge.
3. **`/topics`:** Autoencoders displays `Strong (100%)` across 4 attempted questions.
4. **`/gap-report`:** Rationale elevates from *"Assessed 1 question... Insufficient data"* to *"Mastery confirmed with 100% proficiency across 4 assessed questions."*
5. **`/revision-plan`:** Autoencoders diagnostic task (`task-diag-topic-autoencoders`) is marked resolved and re-prioritized to low-frequency spaced retention.
6. **`/analytics`:** Knowledge Gap Reduction Trajectory updates Autoencoders to Mastered.

---

### Check 4: Grounded Assistant & Zero-Hallucination Refusal Verification

Test the strict RAG boundary and refusal protocol on [`src/app/(app)/assistant/page.tsx`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/app/(app)/assistant/page.tsx).

#### A. In-Syllabus Grounded Query Test:
1. Query: *"Explain the CNN output dimension formula and Valid vs Same padding"*
2. **Expected Behavior:**
   - Assistant returns grounded answer utilizing retrieved chunks.
   - Clickable citation chips appear:
     - Document: `Module_2_CNN_Math_And_Receptive_Fields.pdf`
     - Section: `Section 2.1: Spatial Dimension Formula`
     - Page: `Page 14`
   - `grounded: true` badge displayed.

#### B. Out-of-Syllabus Refusal Protocol Test:
1. Query: *"Explain Quantum Key Distribution (Strict Refusal Test)"*
2. **Expected Behavior:**
   - Vector / lexical match score is `0` against Deep Learning chunks.
   - Model memory is strictly prohibited.
   - Assistant displays the polite refusal message:
     ```text
     "I cannot find sufficient evidence in your uploaded study material to answer this question. Please upload the relevant chapter or notes."
     ```
   - Rendered in a styled amber alert card (`bg-amber-50 border-amber-200 text-amber-950`) with `ShieldAlert` icon and `grounded: false`.

---

## 🛠️ Quick Automated Execution Script

To run automated checks via PowerShell:

```powershell
# 1. Typecheck & Build
npm run build

# 2. Check Git working tree is clean
git status
```
