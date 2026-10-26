# Rule 01: RAG & AI Boundary Protocol

> **Context:** This rule governs all Retrieval-Augmented Generation (RAG), text extraction, document chunking, question synthesis, evaluation rubrics, and conversational assistance in GapFinder AI.

---

## 1. Strict Separation of Retrieval vs. Generation

All AI operations in GapFinder AI must strictly separate the **Retrieval Phase (Step A)** from the **Generation Phase (Step B)**.

```
[Raw Document / Input]
         │
         ▼
[Step A: Retrieval]  ─── chunking.ts / match_document_chunks / sample-data.ts
         │
         ▼
[Grounded Chunks Context]  ─── Mandatory { documentName, sectionTitle, pageNumber, content }
         │
         ▼
[Step B: Generation] ─── LLM (Gemini 1.5 Flash) with context ONLY. Memory forbidden.
```

### Step A: Retrieval Phase
- Documents must be divided into meaningful semantic chunks using `chunkTextWithMetadata()` in [`src/lib/rag/chunking.ts`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/lib/rag/chunking.ts):
  ```typescript
  // Signature:
  export function chunkTextWithMetadata(
    text: string,
    documentId: string,
    sourceDocument: string,
    options?: ChunkOptions // { chunkSize: 450-500, overlap: 80 }
  ): DocumentChunk[]
  ```
- **Overlap Requirement:** Every chunk must maintain an 80-character sliding-window overlap to prevent truncating formulas, gradient equations, or definitions across chunk boundaries.
- **Chunk Metadata Contract:** Every chunk MUST conform to `DocumentChunk` in [`src/lib/types.ts`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/lib/types.ts):
  ```typescript
  export interface DocumentChunk {
    id: string;
    documentId: string;
    chunkIndex: number;
    content: string;
    metadata: {
      pageNumber: number;      // Parsed or density-estimated page (1,800 chars/page)
      sectionTitle: string;    // Regex-extracted module/chapter header
      sourceDocument: string;  // File name, e.g. "Module_2_CNN_Math_And_Receptive_Fields.pdf"
      topicTag?: string;       // Curriculum tag: 'topic-cnn' | 'topic-rnn' | etc.
    };
    embedding?: number[];      // 768-dimensional vector (text-embedding-004)
  }
  ```
- Retrieval must query either:
  1. Live vector database: `match_document_chunks` RPC in [`supabase/schema.sql`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/supabase/schema.sql).
  2. Local semantic retriever: `retrieveRelevantChunks(query, chunks, topK, topicFilter)` in [`src/lib/gemini/client.ts`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/lib/gemini/client.ts).
  3. Preloaded sample pack: `SAMPLE_CHUNKS` in [`src/lib/demo/sample-data.ts`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/lib/demo/sample-data.ts).

### Step B: Generation Phase
- The LLM generator (`gemini-1.5-flash`) must **ONLY** receive the retrieved chunks from Step A.
- **Zero Outside Memory:** Model memory is strictly prohibited from introducing topics, concepts, or facts absent from the retrieved chunks.
- If Step A returns 0 relevant chunks, Step B must never attempt generation—it must immediately invoke the Refusal Protocol (Section 3).

---

## 2. Mandatory Citation Schema

Every generated artifact across the entire application must carry verifiable source citations.

### Citation Schema Contract ([`src/lib/types.ts`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/lib/types.ts)):
```typescript
export interface SourceCitation {
  documentTitle: string;  // Exact file name (e.g. "CS682_Deep_Learning_Course_Reader.pdf")
  pageNumber: number;     // Page citation (e.g. 14)
  sectionTitle: string;   // Section name (e.g. "Section 2.1: Spatial Dimension Formula")
  snippet?: string;       // Direct quotation of the grounding source passage
}
```

### Route-Level Enforcement:
1. **Diagnostic Quiz Generation ([`src/lib/quiz/generator.ts`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/lib/quiz/generator.ts)):**
   - Every `QuizQuestion` must have `q.sourceCitation` populated.
   - Questions lacking valid source citations are invalid and must be rejected.
2. **Active Quiz Taking ([`src/app/(app)/quiz/[id]/page.tsx`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/app/(app)/quiz/[id]/page.tsx)):**
   - **CRITICAL SECURITY RULE:** Citations, `correctAnswer`, and `explanation` MUST remain **hidden** during active test-taking. Students must only see `questionText`, `questionType`, `options`, and `topicName`.
3. **Answer Evaluation Review ([`src/app/(app)/quiz/[id]/results/page.tsx`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/app/(app)/quiz/[id]/results/page.tsx)):**
   - Citations are revealed alongside the evaluated student response, scoring rubric, and AI rationale.
4. **Gap Report ([`src/app/(app)/gap-report/page.tsx`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/app/(app)/gap-report/page.tsx)):**
   - Every topic card must render `diagnosis.sourceReferences` listing verified document citations.
5. **Explain Assistant ([`src/app/(app)/assistant/page.tsx`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/app/(app)/assistant/page.tsx)):**
   - Every assistant response must include clickable citation chips with document name and page number badges.

---

## 3. Zero-Hallucination Refusal Protocol

In [`src/lib/gemini/client.ts`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/lib/gemini/client.ts) (`generateGroundedExplanation`) and [`src/app/(app)/assistant/page.tsx`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/app/(app)/assistant/page.tsx):

- When a student asks a query:
  1. `retrieveRelevantChunks(text, chunks, 2)` scores all indexed chunks.
  2. If the highest score is `0` or no chunks match the topic (e.g., testing with off-topic queries like *"Explain Quantum Key Distribution"* or cooking recipes in the CS-682 Deep Learning course):
     - The assistant **MUST NOT** hallucinate an answer from pre-training memory.
     - The assistant **MUST** trigger an explicit refusal response:
       ```
       "I cannot find sufficient evidence in your uploaded study material to answer this question. Please upload the relevant chapter or notes."
       ```
     - Sets `grounded: false`.
     - Displays the response in a styled amber alert card (`bg-amber-50 border-amber-200 text-amber-950`).

---

## 4. Hybrid Execution Mode (Live API vs. Deterministic Fallback)

To ensure **100% testability and zero crashes** during hackathon evaluations:

- **Condition Check:**
  ```typescript
  export const isGeminiConfigured = (): boolean => {
    return !!(
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY.length > 5 &&
      !process.env.GEMINI_API_KEY.includes('your-google-gemini-api-key')
    );
  };
  ```
- **When Live API is Available (`isGeminiConfigured() === true`):**
  - Calls Gemini 1.5 Flash (`@google/generative-ai`) with strict system prompts:
    ```
    You are GapFinder AI, a rigorous academic assistant. Answer the student's question SOLELY using the retrieved study material below.
    RULES:
    1. Cite the exact document and page/section for every claim.
    2. If the context does not contain enough information, state: "The uploaded material does not contain sufficient information to answer this question."
    3. DO NOT hallucinate or answer from outside knowledge.
    ```
- **When Offline / No API Key / Rate-Limited (`isGeminiConfigured() === false`):**
  - Seamlessly falls back to the local grounded synthesizer in [`src/lib/gemini/client.ts`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/lib/gemini/client.ts).
  - Quotes genuine excerpts from [`SAMPLE_CHUNKS`](file:///c:/Users/shiva/OneDrive/Desktop/igebra%20Hackathon/src/lib/demo/sample-data.ts) with full citations.
  - Generates zero runtime exceptions or unhandled promise rejections.
