# Rule 02: Gap Diagnosis & State Synchronization Mathematics

> **Context:** This rule governs all mathematical formulas, scoring mechanisms, confidence guardrails, threshold policies, and atomic cross-page state synchronization across GapFinder AI. Every engineer, agent, and subagent MUST preserve these invariants when modifying [`src/lib/gap-diagnosis/engine.ts`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/lib/gap-diagnosis/engine.ts), [`src/lib/context/AppContext.tsx`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/lib/context/AppContext.tsx), or any dashboard view (`/dashboard`, `/topics`, `/gap-report`, `/revision-plan`, `/analytics`, `/quiz/[id]/results`).

---

## 1. Cumulative Weighted Score Formula

Whenever a student completes a diagnostic assessment or practice quiz, topic mastery MUST NEVER be overwritten with just the latest single-quiz score. It must be computed as a cumulative weighted average reflecting all verified historical attempts.

### The Mathematical Formula:
$$S_{\text{updated}} = \text{round}\left( \frac{S_{\text{old}} \cdot N_{\text{old}} + S_{\text{new}}}{N_{\text{total}}} \right)$$

Where:
- $S_{\text{old}}$: Previous cumulative percentage score ($0 \le S_{\text{old}} \le 100$).
- $N_{\text{old}}$: Number of questions previously attempted on this topic (`top.questionsAttempted`).
- $S_{\text{new}}$: Sum of percentage points earned across all newly evaluated questions for this topic in the current attempt ($S_{\text{new}} = \sum_{i=1}^{k} \text{score}_i$).
- $N_{\text{attempt}}$: Number of new questions for this topic in the current attempt ($k$).
- $N_{\text{total}} = N_{\text{old}} + N_{\text{attempt}}$: Total cumulative questions answered for this topic.

### Edge Case Handling:
- **First-time topic attempt ($N_{\text{old}} = 0$):**
  $$S_{\text{updated}} = \text{round}\left( \frac{S_{\text{new}}}{N_{\text{attempt}}} \right)$$
- **Score Bounds:** $S_{\text{updated}}$ is clamped between $0$ and $100$ and rounded to the nearest integer with `Math.round()`.

### Code Implementation ([`src/lib/gap-diagnosis/engine.ts`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/lib/gap-diagnosis/engine.ts)):
```typescript
// Signature:
export function processQuizAttemptForTopics(
  topics: SyllabusTopic[],
  diagnoses: TopicDiagnosis[],
  attempt: QuizAttempt
): TopicUpdateResult

// Cumulative calculation snippet:
const previousAttempts = top.questionsAttempted || 0;
const newAttempts = stats.questionCount;
const updatedAttempted = previousAttempts + newAttempts;

const updatedScore = Math.round(
  (top.latestScore * previousAttempts + stats.totalScore) / updatedAttempted
);
```

---

## 2. Statistical Confidence Protection

A diagnostic gap detection system must never make premature claims about a student's cognitive mastery based on a single lucky or unlucky question.

### The Guardrail Rules:
1. **Minimum Sample Size ($N_{\text{total}} \ge 3$):**
   - A topic requires a statistical minimum of at least $N_{\text{total}} \ge \text{minQuestionsForConfidence}$ (default: **3 questions**) before receiving a definitive proficiency classification (`weak`, `medium`, or `strong`).
2. **Locked Status for Insufficient Data:**
   - If $N_{\text{total}} < \text{minQuestionsForConfidence}$, the topic's status **MUST** remain locked to `'insufficient_data'`.
   - Even if a student gets 1/1 question correct (100%) or 0/1 wrong (0%), the status remains `'insufficient_data'`.
   - UI badges display `Insufficient Data` (`bg-slate-100 text-slate-700 border-slate-200`) and the score is presented with clear qualification (or `N/A` on high-level badge summaries).
3. **Curriculum Example:**
   - Autoencoders (`topic-autoencoders`) starts with `questionsAttempted: 1` in [`src/lib/demo/sample-data.ts`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/lib/demo/sample-data.ts). Its status is strictly `'insufficient_data'` until the student answers at least 2 more questions.

```typescript
let newStatus: ProficiencyStatus = top.status;
if (updatedAttempted < top.recommendedThresholds.minQuestionsForConfidence) {
  newStatus = 'insufficient_data';
} else if (updatedScore < top.recommendedThresholds.weakMax) {
  newStatus = 'weak';
} else if (updatedScore < top.recommendedThresholds.mediumMax) {
  newStatus = 'medium';
} else {
  newStatus = 'strong';
}
```

---

## 3. Configurable Threshold Boundaries

Proficiency tier boundaries are user-configurable per topic and dynamically applied.

### Default Boundaries:
- **Weak (Critical Gap):** $\text{Score} < 50\%$ (`weakMax: 50`)
- **Medium (Developing):** $50\% \le \text{Score} < 75\%$ (`mediumMax: 75`)
- **Strong (Mastered):** $\text{Score} \ge 75\%$

### Dynamic Evaluation Contract:
- Threshold values MUST NOT be hardcoded in rendering components. All status evaluations must read dynamically from `topic.recommendedThresholds`:
  ```typescript
  export interface RecommendedThresholds {
    weakMax: number;                 // Upper bound for 'weak' (e.g. 50)
    mediumMax: number;               // Upper bound for 'medium' (e.g. 75)
    minQuestionsForConfidence: number; // Minimum sample size (default: 3)
  }
  ```
- Users can adjust thresholds in [`src/app/(app)/topics/page.tsx`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/app/(app)/topics/page.tsx) via `updateTopicThresholds()`:
  ```typescript
  updateTopicThresholds(topicId: string, weakMax: number, mediumMax: number, minConfidence: number)
  ```
- When a user modifies threshold sliders, both `topics` and `diagnoses` in [`src/lib/context/AppContext.tsx`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/lib/context/AppContext.tsx) MUST be updated atomically and synchronously.

---

## 4. Atomic Cross-Page State Synchronization

Whenever a quiz is submitted (`submitQuizAttempt`) or thresholds are adjusted (`updateTopicThresholds`), all dependent domain states must update **atomically in a single render pass**.

```
               [Quiz Submitted / Thresholds Updated]
                                │
                                ▼
               ┌─────────────────────────────────┐
               │ processQuizAttemptForTopics()   │
               │ in src/lib/gap-diagnosis/engine │
               └─────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐       ┌───────────────┐       ┌────────────────┐
│ updatedTopics │       │updatedDiagnose│       │ recalculate    │
│  (scores &    │       │  (rationale,  │       │ RevisionPlan() │
│   statuses)   │       │ mistakes,     │       │ (adaptive day  │
│               │       │  citations)   │       │  scheduling)   │
└───────────────┘       └───────────────┘       └────────────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                ▼
              [Atomic Synchronous UI State Update]
 ┌───────────────────────┬───────────────────────┬───────────────────────┐
 │ /dashboard & /topics  │ /gap-report           │ /revision-plan        │
 │ Instant score & badge │ Dynamic rationale &   │ Weak topics pushed    │
 │ reflection            │ citation updates      │ to Day 1 priority     │
 └───────────────────────┴───────────────────────┴───────────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ /analytics      │
                       │ Trajectory &    │
                       │ mastery bars    │
                       └─────────────────┘
```

### The 4 Synchronized Views:
1. **Topic Scores & Statuses ([`/topics`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/app/(app)/topics/page.tsx) and [`/dashboard`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/app/(app)/dashboard/page.tsx)):**
   - Renders exact cumulative scores ($S_{\text{updated}}$) and badges derived from `topic.status`.
   - Never differs between the Knowledge Map and the Dashboard Overview.
2. **In-Depth Diagnostic Breakdown ([`/gap-report`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/app/(app)/gap-report/page.tsx)):**
   - Displays `diagnosis.reason`, dynamic misconception bullets (`diagnosis.commonMistakes`), and verified PDF citations (`diagnosis.sourceReferences`).
   - If a student demonstrates remediation on a previously failed topic, the rationale elevates from *"Critical knowledge gap diagnosed"* to *"Proficiency elevated to Developing... prior misconceptions resolved."*
3. **Adaptive Revision Timeline ([`/revision-plan`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/app/(app)/revision-plan/page.tsx)):**
   - Automatically re-optimizes task schedules when topics update:
     1. **Weak topics** are strictly forced to **Day 1** high-priority remediation + diagnostic re-quiz.
     2. **Insufficient Data topics** receive diagnostic assessment tasks to reach the 3-question baseline.
     3. **Medium topics** receive targeted edge-case reinforcement tasks.
     4. **Strong topics** receive spaced-repetition checks.
   - Calendared across days derived from `user.examDate` countdown and calibrated to `user.dailyStudyMinutes`.
4. **Progress Analytics & Gap Reduction ([`/analytics`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/app/(app)/analytics/page.tsx)):**
   - Mastery bars and trajectory cards map dynamically over `topics` and `diagnoses`.
   - Overall diagnostic average recalculates from all completed quizzes.

---

## 5. Strict Ban on Hardcoded Mock Data in UI Pages

- **STRICT PROHIBITION:** No dashboard page, component, or card may render static hardcoded score numbers (e.g. `<p>CNN: 40%</p>` or `<span className="badge">Weak</span>` without checking `topic.status`).
- All numbers, badges, progress bars, rationales, and citations MUST be dynamically derived from `useApp()` (`topics`, `diagnoses`, `quizzes`, `revisionPlan`).
- On application mount, [`src/lib/context/AppContext.tsx`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/lib/context/AppContext.tsx) runs an automatic reconciliation pass across `localStorage` to ensure `diagnoses` always mirror `topics` scores and statuses.
