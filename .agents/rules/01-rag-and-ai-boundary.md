# Rule 01: RAG & AI Boundary Protocol

When touching RAG, chunking, question generation, or the explain assistant (`/materials`, `/quiz`, `/assistant`, `src/lib/rag/`, `src/lib/gemini/`), you MUST strictly enforce the following rules:

---

## 1. Zero Hallucination & Strict Grounding
- **Never answer from generic model memory alone.** All answers, explanations, and quiz questions must be strictly derived from retrieved document chunks.
- If the uploaded study materials do not contain sufficient evidence to answer a question, the assistant **MUST explicitly refuse**:
  > *"I cannot find sufficient evidence in your uploaded study material to answer this question. Please upload the relevant chapter or notes."*
- Never present an unverified citation as verified.

---

## 2. Mandatory Verifiable Citations
Every retrieved chunk, generated question, evaluated answer, and assistant response must carry complete citation metadata:
```typescript
export interface SourceCitation {
  documentTitle: string;  // e.g. "Module_2_CNN_Math_And_Receptive_Fields.pdf"
  pageNumber: number;     // Estimated or parsed page number
  sectionTitle: string;   // e.g. "Section 2.1: Spatial Dimension Formula"
  snippet?: string;       // Direct quotation of the relevant text
}
```
- Missing citations or empty source references are strictly prohibited.

---

## 3. Active Quiz Security Boundary
- **Never expose correct answers or citations before submission.**
- During test-taking in `/quiz/[id]`, the student must only receive `questionText`, `questionType`, `options` (for MCQ), and `topicName`.
- The `correctAnswer`, `explanation`, and `sourceCitation` must only be revealed in `/quiz/[id]/results` after the student's responses have been submitted.

---

## 4. Chunking Semantic Boundaries
- Text chunking in `chunkTextWithMetadata()` must preserve:
  - 80-character sliding overlap to prevent cutting critical equations or definitions in half.
  - Section headers detected via regex (`Chapter`, `Section`, `Module`, `#`).
  - Cumulative character density tracking (~1,800 characters per page) to approximate physical page numbers.
  - Topic tagging inferred from curriculum keywords.

---

## 5. Offline / Hackathon Demo Resilience
- The system must provide **100% uptime for hackathon judges**.
- If `GEMINI_API_KEY` is missing or invalid:
  - Do not crash or display unhandled promise rejections.
  - Fall back gracefully to the local grounded synthesizer in `src/lib/gemini/client.ts`.
  - Maintain genuine Deep Learning citations and strict out-of-context refusal behavior.
