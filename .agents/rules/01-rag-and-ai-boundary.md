# Rule 01: RAG & AI Boundary Protocol

> **Context:** This rule governs all Retrieval-Augmented Generation (RAG), text extraction, document chunking, question synthesis, evaluation rubrics, source citations, and conversational assistance in GapFinder AI. All engineers, agents, and subagents MUST strictly adhere to these boundaries.

---

## 1. Strict Separation of Retrieval vs. Generation

All AI operations in GapFinder AI must strictly separate the **Retrieval Phase (Step A)** from the **Generation Phase (Step B)**. Passing ungrounded user input directly into an LLM generation prompt without retrieved document evidence is strictly prohibited.

```
[Raw Document / User Input]
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ Step A: Retrieval Phase                                     │
│  - chunking.ts (sliding window: 450-500 chars, 80 overlap) │
│  - match_document_chunks (Supabase pgvector RPC)            │
│  - SAMPLE_CHUNKS in sample-data.ts (local preloaded cache)  │
│  - retrieveRelevantChunks() in client.ts (lexical/semantic) │
└─────────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ Grounded Chunks Context Contract                            │
│  Every chunk MUST carry:                                    │
│  { documentName, sectionTitle, pageNumber, content }        │
└─────────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ Step B: Generation Phase                                    │
│  - LLM / Synthesizer receives retrieved chunks ONLY         │
│  - General model pre-training memory is strictly FORBIDDEN   │
│  - If 0 chunks retrieved -> Trigger Refusal Protocol        │
└─────────────────────────────────────────────────────────────┘
```

### Step A: Retrieval Phase Implementation Rules

1. **Text Extraction & Ingestion ([`src/app/(app)/materials/page.tsx`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/app/(app)/materials/page.tsx)):**
   - User-uploaded PDFs, text notes, or syllabus files are ingested via `handleFileUpload`.
   - File size is strictly enforced (max 10MB per document).
   - Ingestion immediately invokes `chunkTextWithMetadata()` in [`src/lib/rag/chunking.ts`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/lib/rag/chunking.ts).

2. **Semantic Sliding-Window Chunking Contract ([`src/lib/rag/chunking.ts`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/lib/rag/chunking.ts)):**
   ```typescript
   export function chunkTextWithMetadata(
     text: string,
     documentId: string,
     sourceDocument: string,
     options: ChunkOptions = { chunkSize: 450, overlap: 80 }
   ): DocumentChunk[]
   ```
   - **80-Character Overlap Rule:** Every adjacent chunk MUST maintain an 80-character overlap (`currentBuffer.slice(-overlap) + ' ' + trimmed`). This guarantees mathematical formulas (e.g. $O = \lfloor\frac{W - K + 2P}{S}\rfloor + 1$), gradient equations, or definitions are never truncated across boundary splits.
   - **Page Estimation & Header Detection:** Page transitions are estimated every ~1,800 characters if not explicitly delimited. Regex patterns detect headers (`^(Chapter|Section|Module|Part)\s+\d+` or `#`).
   - **Automated Topic Tagging:** `inferTopicTag()` categorizes each chunk into a standard curriculum tag (`topic-ann`, `topic-cnn`, `topic-rnn`, `topic-transformers`, `topic-autoencoders`, or `general`).

3. **Mandatory Chunk Metadata Schema ([`src/lib/types.ts`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/lib/types.ts)):**
   Every chunk generated or retrieved across the system MUST conform to `DocumentChunk`:
   ```typescript
   export interface DocumentChunk {
     id: string;
     documentId: string;
     chunkIndex: number;
     content: string;
     metadata: {
       pageNumber: number;        // Verified page or density-estimated page
       sectionTitle: string;      // Section or chapter title
       sourceDocument: string;    // Document file name (documentName alias)
       topicTag?: string;         // 'topic-cnn' | 'topic-rnn' | etc.
     };
     embedding?: number[];        // 768-dim vector (text-embedding-004)
   }
   ```

4. **Retrieval Pipelines:**
   - **Live Production DB:** `match_document_chunks` RPC in [`supabase/schema.sql`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/supabase/schema.sql) with pgvector cosine distance `<=>`.
   - **Local Semantic Retriever:** `retrieveRelevantChunks(query, chunks, topK, topicFilter)` in [`src/lib/gemini/client.ts`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/lib/gemini/client.ts) performing weighted lexical scoring + phrase matching.
   - **Preloaded Course Reader:** `SAMPLE_CHUNKS` in [`src/lib/demo/sample-data.ts`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/lib/demo/sample-data.ts) featuring verified CS-682 Deep Learning chunks.

### Step B: Generation Phase Implementation Rules

1. **Context-Only Prompting:** The generator (whether Gemini 1.5 Flash via `@google/generative-ai` or the local deterministic synthesizer) receives **ONLY** the retrieved chunks.
2. **General Model Memory Forbidden:** LLM system instructions explicitly state:
   - *"Answer the student's question SOLELY using the retrieved study material below."*
   - *"DO NOT hallucinate or answer from outside knowledge."*
3. **Refusal Gate:** If Step A yields 0 chunks or match scores equal to 0, generation is aborted and the Refusal Protocol (Section 3) is triggered immediately.

---

## 2. Mandatory Citation Schema

Every generated diagnostic question, answer evaluation, gap diagnosis report, and assistant explanation MUST carry verified, traceable source citations.

### Citation Schema Contract ([`src/lib/types.ts`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/lib/types.ts)):
```typescript
export interface SourceCitation {
  documentTitle: string;  // Document name, e.g. "Module_2_CNN_Math_And_Receptive_Fields.pdf"
  pageNumber: number;     // Source page number, e.g. 14
  sectionTitle: string;   // Section header, e.g. "Section 2.1: Spatial Dimension Formula"
  snippet?: string;       // Grounding quote from the primary source material
}
```

### Route-Level Enforcement:

1. **Diagnostic Quiz Generation ([`src/lib/quiz/generator.ts`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/lib/quiz/generator.ts) & [`src/app/(app)/quiz/page.tsx`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/app/(app)/quiz/page.tsx)):**
   - Every `QuizQuestion` in the question bank or generated dynamically must include a fully populated `sourceCitation`.
   - Questions without valid document, page, and section citations are strictly invalid and rejected.

2. **Active Quiz Taking ([`src/app/(app)/quiz/[id]/page.tsx`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/app/(app)/quiz/[id]/page.tsx)):**
   - **CRITICAL SECURITY BOUNDARY:** During active test-taking, answers, scoring rubrics, and source citations MUST remain **completely hidden** in the UI.
   - The student sees ONLY `questionText`, `questionType`, `options` (for MCQ), input textarea (for conceptual short-answer), and the active timer.
   - This prevents cheating and guarantees honest diagnostic gap detection.

3. **Answer Evaluation Review ([`src/app/(app)/quiz/[id]/results/page.tsx`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/app/(app)/quiz/[id]/results/page.tsx)):**
   - Once the quiz is submitted, the results page displays the student's answer, correct concept, score out of 100, AI diagnostic feedback, and a **Verifiable Citation Card**:
     - Document Name: `q.sourceCitation.documentTitle`
     - Section Title: `q.sourceCitation.sectionTitle`
     - Page Number: `Page ${q.sourceCitation.pageNumber}`
     - Grounding Snippet: Direct quote from the course notes.

4. **Topic Gap Report ([`src/app/(app)/gap-report/page.tsx`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/app/(app)/gap-report/page.tsx)):**
   - Each topic diagnostic card renders a dedicated **Course Reader Citations** badge list referencing `diagnosis.sourceReferences` (`documentTitle`, `sectionTitle`, `pageNumber`).

5. **Explain Assistant ([`src/app/(app)/assistant/page.tsx`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/app/(app)/assistant/page.tsx)):**
   - Every assistant response renders clickable citation chips (`BookOpen` icon, Document Name, Page Number) linking directly to the grounding chunk.

---

## 3. Zero-Hallucination Refusal Protocol

The system must never fabricate facts or answer questions beyond the scope of uploaded course documents.

### Refusal Logic ([`src/lib/gemini/client.ts`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/lib/gemini/client.ts) & [`src/app/(app)/assistant/page.tsx`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/app/(app)/assistant/page.tsx)):
1. When a user submits an assistant prompt, `retrieveRelevantChunks(query, chunks, 2)` scores all indexed chunks.
2. If:
   - Filtered top chunks have a match score of `0`, OR
   - Vector cosine similarity is below threshold, OR
   - The query concerns an unindexed subject (e.g., asking about *"Quantum Key Distribution"* or cooking recipes in the CS-682 Deep Learning course):
3. The system **MUST**:
   - Refuse to synthesize an answer from general pre-training memory.
   - Return the standardized refusal message:
     ```text
     "I cannot find sufficient evidence in your uploaded study material to answer this question. Please upload the relevant chapter or notes."
     ```
   - Set `grounded: false` on the resulting message.
   - Render the response in an amber refusal banner (`bg-amber-50 border-amber-200 text-amber-950`) with a `ShieldAlert` icon.

---

## 4. Hybrid Execution Mode (Live API vs. Deterministic Fallback)

To guarantee that hackathon judges, graders, and automated test runners experience **zero crashes** regardless of API key availability or network rate limits, all AI routes must implement dual execution modes:

### 1. Environment Detection:
```typescript
export const isGeminiConfigured = (): boolean => {
  return !!(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY.length > 5 &&
    !process.env.GEMINI_API_KEY.includes('your-google-gemini-api-key')
  );
};
```

### 2. Live API Mode (`isGeminiConfigured() === true`):
- Connects to Google Generative AI (`gemini-1.5-flash`).
- Injects strict RAG system prompt with boundary constraints.
- Wraps all API calls in `try/catch` blocks.
- If a 429 (Rate Limit) or 503 error occurs, automatically catches the exception and falls back to Deterministic Mode without throwing unhandled promise rejections.

### 3. Deterministic Local Mode (`isGeminiConfigured() === false`):
- Uses preloaded chunks from `SAMPLE_CHUNKS` in [`src/lib/demo/sample-data.ts`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/lib/demo/sample-data.ts).
- Deterministic synthesizer in [`src/lib/gemini/client.ts`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/lib/gemini/client.ts) generates accurate, cited excerpts.
- Deterministic grading engine in [`src/lib/gap-diagnosis/engine.ts`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/lib/gap-diagnosis/engine.ts) grades MCQs deterministically and scores conceptual short-answers via keyword rubric matching.
- **Guarantee:** 0 unhandled promise rejections, 0 missing citation errors, 0 runtime crashes.
