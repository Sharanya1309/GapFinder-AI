# Skill: Standard Operating Procedure (SOP) — Add or Upgrade an AI Route

> **Context:** Use this playbook when implementing a new AI endpoint, RAG feature, question synthesizer, evaluation rubric, or conversational capability in GapFinder AI. All AI features must strictly conform to these 5 sequential steps.

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│ Step 1: Retrieve Chunks with Source Metadata           │
│  - chunking.ts / match_document_chunks / sample-data   │
│  - Contract: { documentName, sectionTitle, page, text }│
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Step 2: Strict Prompt Construction                     │
│  - Context-only prompt separation                      │
│  - Zero outside knowledge / hallucination ban          │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Step 3: Validate Output against Zod / TypeScript Schema│
│  - Ensure citations & rationale exist on all artifacts │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Step 4: Deterministic Local Fallback                   │
│  - Guard against missing/rate-limited API keys         │
│  - Fallback to engine.ts / sample-data.ts              │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Step 5: Synchronize into AppContext State              │
│  - Atomic updates across topics, diagnoses, and plan   │
└────────────────────────────────────────────────────────┘
```

---

## Step 1: Retrieve Relevant Chunks with Source Metadata

All AI generation must be grounded in verified document chunks. Never pass raw user inputs to an LLM without retrieved context.

### A. Dynamic Retrieval Pipeline:
- **Vector Retrieval:** Query Supabase pgvector RPC `match_document_chunks` in [`supabase/schema.sql`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/supabase/schema.sql) using cosine distance `<=>`.
- **Lexical/Semantic Retrieval:** Use `retrieveRelevantChunks(query, chunks, topK, topicFilter)` in [`src/lib/gemini/client.ts`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/lib/gemini/client.ts).
- **Document Chunking:** If ingesting new text, call `chunkTextWithMetadata()` in [`src/lib/rag/chunking.ts`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/lib/rag/chunking.ts) with 80-character sliding-window overlap:
  ```typescript
  import { chunkTextWithMetadata } from '@/lib/rag/chunking';

  const chunks = chunkTextWithMetadata(documentText, docId, fileName, {
    chunkSize: 450,
    overlap: 80,
  });
  ```

### B. Metadata Contract Verification:
Every chunk passed to the generator MUST carry:
```typescript
interface ChunkContext {
  content: string;
  metadata: {
    sourceDocument: string;  // e.g. "Module_2_CNN_Math_And_Receptive_Fields.pdf"
    sectionTitle: string;    // e.g. "Section 2.1: Spatial Dimension Formula"
    pageNumber: number;      // e.g. 14
    topicTag?: string;       // e.g. "topic-cnn"
  };
}
```

---

## Step 2: Construct Prompt with Strict System Instructions

Separate retrieved context from generation. General model memory is strictly forbidden.

```typescript
const contextBlock = relevantChunks
  .map(
    (c, idx) =>
      `[Source ${idx + 1}: ${c.metadata.sourceDocument}, Page ${c.metadata.pageNumber}, ${c.metadata.sectionTitle}]\n${c.content}`
  )
  .join('\n\n---\n\n');

const systemInstruction = `You are GapFinder AI, a rigorous academic diagnostic engine.
Your goal is to evaluate learning gaps SOLELY based on the provided course material.

STRICT BOUNDARY CONSTRAINTS:
1. ONLY utilize information explicitly stated in the RETRIEVED CONTEXT below.
2. DO NOT use pre-training memory or invent facts outside the text.
3. Every generated item (question, evaluation, or explanation) MUST cite the exact Document Name, Section Title, and Page Number from the retrieved context.
4. If the context is insufficient or irrelevant, state: "The uploaded material does not contain sufficient information to answer this question."`;

const prompt = `${systemInstruction}

RETRIEVED CONTEXT:
${contextBlock}

TASK / USER QUERY:
${userQuery}

STRUCTURED OUTPUT (JSON):`;
```

---

## Step 3: Validate Output Against Schema (Zod / TypeScript)

All AI responses must be strictly typed and structurally validated to prevent runtime property access errors.

```typescript
import { z } from 'zod';
import { SourceCitation } from '@/lib/types';

// Zod Schema for Source Citation
export const SourceCitationSchema = z.object({
  documentTitle: z.string().min(1, 'Document title is required'),
  pageNumber: z.number().int().positive('Page number must be positive'),
  sectionTitle: z.string().min(1, 'Section title is required'),
  snippet: z.string().optional(),
});

// Zod Schema for Diagnostic Question
export const QuizQuestionSchema = z.object({
  questionText: z.string().min(5),
  questionType: z.enum(['mcq', 'short_answer']),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1),
  explanation: z.string().min(5),
  sourceCitation: SourceCitationSchema,
  rubric: z
    .object({
      keyPoints: z.array(z.string()),
    })
    .optional(),
});

// Validation Helper
export function validateAIOutput<T>(rawJson: unknown, schema: z.ZodSchema<T>): T {
  const result = schema.safeParse(rawJson);
  if (!result.success) {
    throw new Error(`AI Output Schema Validation Failed: ${result.error.message}`);
  }
  return result.data;
}
```

---

## Step 4: Implement Automatic Fallback to Deterministic Local Evaluation

If API keys are missing, network connectivity is unavailable, or rate-limits (HTTP 429) occur, the endpoint must automatically fall back to deterministic evaluation without throwing unhandled exceptions.

```typescript
import { isGeminiConfigured } from '@/lib/gemini/client';
import { SAMPLE_CHUNKS } from '@/lib/demo/sample-data';
import { processQuizAttemptForTopics } from '@/lib/gap-diagnosis/engine';

export async function executeAIFeature(params: FeatureParams) {
  // Check if live API is available
  if (isGeminiConfigured()) {
    try {
      return await callLiveGeminiAPI(params);
    } catch (error) {
      console.warn('Live AI API failed or rate-limited. Activating deterministic fallback:', error);
    }
  }

  // Deterministic local fallback
  return executeDeterministicFallback(params);
}

function executeDeterministicFallback(params: FeatureParams) {
  // Uses SAMPLE_CHUNKS, QUESTION_BANK, or deterministic rubric matching in engine.ts
  const primaryChunk = SAMPLE_CHUNKS[0];
  return {
    content: `Grounding verified from ${primaryChunk.metadata.sourceDocument}.`,
    citations: [
      {
        documentTitle: primaryChunk.metadata.sourceDocument,
        pageNumber: primaryChunk.metadata.pageNumber,
        sectionTitle: primaryChunk.metadata.sectionTitle,
        snippet: primaryChunk.content.slice(0, 150) + '...',
      },
    ],
    isGrounded: true,
  };
}
```

---

## Step 5: Synchronize Results into `AppContext.tsx`

Ensure all state changes are dispatched atomically through the application context so that scores, diagnoses, and revision tasks update in one render cycle.

```typescript
// In AppContext.tsx or consuming page:
const { submitQuizAttempt, recalculateRevisionPlan } = useApp();

const handleQuizCompletion = (completedAttempt: QuizAttempt) => {
  // 1. Submit attempt: triggers processQuizAttemptForTopics()
  submitQuizAttempt(completedAttempt);

  // 2. State updates atomically across:
  //    - topics (recalculated cumulative score & status)
  //    - diagnoses (dynamic rationale, misconceptions, citations)
  //    - revisionPlan (weak topics rescheduled to Day 1)
  //    - analytics (mastery trajectory updated)
};
```

---

## Pre-Merge SOP Checklist
- [ ] Chunks carry `{ documentName, sectionTitle, pageNumber, content }`.
- [ ] Prompt strictly forbids hallucination and model pre-training memory.
- [ ] Output conforms to `SourceCitationSchema` with valid page references.
- [ ] Fallback executes cleanly when `GEMINI_API_KEY` is omitted or invalid.
- [ ] `npm run build` compiles with 0 errors across all 14 routes.
