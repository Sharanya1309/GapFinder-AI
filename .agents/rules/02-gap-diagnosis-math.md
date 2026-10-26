# Rule 02: Gap Diagnosis & Scoring Mathematics

When touching scoring, quiz evaluation, topic mastery, gap reports, revision plans, or analytics (`/quiz/[id]/results`, `/topics`, `/gap-report`, `/revision-plan`, `/analytics`, `src/lib/gap-diagnosis/engine.ts`), you MUST strictly enforce the following rules:

---

## 1. Cumulative Weighted Average Formula
Topic scores must reflect the cumulative mathematical average of all questions answered across all attempts:

$$\text{New Score} = \text{round}\left(\frac{\text{Previous Score} \times N_{\text{previous}} + \text{Attempt Score}}{N_{\text{previous}} + N_{\text{attempt}}}\right)$$

- Never overwrite a cumulative topic score with only the latest single-quiz score.
- When $N_{\text{previous}} = 0$, $\text{New Score} = \text{round}(\frac{\text{Attempt Score}}{N_{\text{attempt}}})$.

---

## 2. Statistical Confidence Guardrail
- **Never diagnose a topic without sufficient evidence.**
- If $N_{\text{total\_attempts}} < \text{minQuestionsForConfidence}$ (default: **3 questions**), the topic's status **MUST** remain `'insufficient_data'`, regardless of what score was achieved on the 1 or 2 attempted questions.
- A single lucky or unlucky question must never label a student as "Mastered" or "Weak".

---

## 3. Configurable Proficiency Thresholds
When $N_{\text{total\_attempts}} \ge \text{minQuestionsForConfidence}$, status is evaluated strictly using:
- **Weak:** $\text{Score} < \text{weakMax}$ (Default: $< 50\%$)
- **Medium:** $\text{weakMax} \le \text{Score} < \text{mediumMax}$ (Default: $50\% \le \text{Score} < 75\%$)
- **Strong:** $\text{Score} \ge \text{mediumMax}$ (Default: $\ge 75\%$)

Thresholds are configurable in `/topics` and must update both `topics` and `diagnoses` synchronously.

---

## 4. Single Source of Truth & Zero Hardcoded Cards
- **All 4 dashboard views must display identical scores and statuses at all times:**
  1. `/dashboard` (Metric cards & topic bars)
  2. `/topics` (Knowledge map cards)
  3. `/gap-report` (Diagnostic breakdown cards)
  4. `/analytics` (Mastery bars & trajectory cards)
- **Hardcoded mock cards are strictly prohibited.**
  - Never render static HTML containing hardcoded scores like `CNN: Critical Gap (40%)`.
  - All cards must dynamically map over `topics` and `diagnoses` from `useApp()`.

---

## 5. Dynamic Misconception Lifecycle
- Diagnostic rationales and identified mistakes must be extracted directly from the student's evaluated answers (`ans.keyConceptsMissed` and `ans.aiFeedback`).
- When a student completes a remediation quiz and demonstrates accuracy on previously missed concepts:
  - Do NOT permanently retain the old negative diagnosis.
  - Elevate the topic status and update the rationale to highlight resolved misconceptions.
  - Adapt the styling (e.g. emerald/green badge for resolved concepts, amber for consolidating, rose for active gaps).

---

## 6. Adaptive Revision Task Priority
When `recalculateRevisionPlan()` runs, tasks must be prioritized in order of urgency:
1. **Weak Topics:** Day 1 priority remediation tasks + re-test quizzes.
2. **Insufficient Data Topics:** Diagnostic assessment tasks to achieve the 3-question baseline.
3. **Medium Topics:** Targeted practice tasks covering remaining edge cases.
4. **Strong Topics:** Periodic spaced-retention checks.
