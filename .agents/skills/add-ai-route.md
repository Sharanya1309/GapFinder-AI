# Skill: Add an AI Route in GapFinder AI

This guide details the standard procedure for implementing a server-side AI or RAG endpoint in Next.js 14 App Router for GapFinder AI.

---

## 1. Route Location & Pattern

All server-side AI endpoints must be created in `src/app/api/<route_name>/route.ts`.
Do NOT run heavy AI or API secret key operations in Client Components (`"use client"`).

### Standard Route Structure:
```
src/app/api/
├── materials/
│   └── extract/route.ts      # Server-side PDF/Document extraction
├── quiz/
│   ├── generate/route.ts     # RAG chunk-grounded question generator
│   └── evaluate/route.ts     # AI rubric short-answer evaluator
└── assistant/
    └── chat/route.ts         # Grounded conversational endpoint
```

---

## 2. Implementation Template (Using Gemini 1.5 Flash)

```typescript
// src/app/api/quiz/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const { topicName, chunks, questionCount } = await req.json();

    if (!chunks || chunks.length === 0) {
      return NextResponse.json(
        { error: 'No grounded chunks provided for question generation.' },
        { status: 400 }
      );
    }

    // Check if API key is present; otherwise fall back to local grounded bank
    if (!apiKey || apiKey.includes('your-google-gemini-api-key')) {
      return NextResponse.json({
        fallback: true,
        message: 'GEMINI_API_KEY not configured. Falling back to local grounded question bank.',
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const contextText = chunks
      .map(
        (c: any, idx: number) =>
          `[Source ${idx + 1}: ${c.metadata.sourceDocument}, Page ${c.metadata.pageNumber}, ${c.metadata.sectionTitle}]\n${c.content}`
      )
      .join('\n\n---\n\n');

    const prompt = `You are GapFinder AI. Generate ${questionCount} diagnostic quiz questions strictly grounded in the context below.
Output MUST be a valid JSON array of objects conforming to this schema:
[
  {
    "questionText": "string",
    "questionType": "mcq" | "short_answer",
    "options": ["string", "string", "string", "string"], // for MCQ only
    "correctAnswer": "string",
    "explanation": "string",
    "sourceCitation": {
      "documentTitle": "string",
      "pageNumber": number,
      "sectionTitle": "string",
      "snippet": "string"
    },
    "rubric": {
      "keyPoints": ["string"]
    }
  }
]

CONTEXT:
${contextText}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsedQuestions = JSON.parse(responseText);

    return NextResponse.json({
      success: true,
      questions: parsedQuestions,
    });
  } catch (error: any) {
    console.error('AI Route Generation Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate AI questions' },
      { status: 500 }
    );
  }
}
```

---

## 3. Mandatory Checklist for New AI Routes

- [ ] **Environment Security:** `GEMINI_API_KEY` accessed only on the server; never prefixed with `NEXT_PUBLIC_`.
- [ ] **Structured Output:** Enforce `responseMimeType: "application/json"` or use Zod to validate AI output before returning to client.
- [ ] **Citation Preservation:** Ensure every generated question or answer extracts and retains `documentTitle`, `pageNumber`, and `sectionTitle`.
- [ ] **Graceful Fallback:** If the API key is not configured or network fails, provide a fallback response rather than returning an unhandled error to the client.
- [ ] **Hidden Answers:** If generating quiz questions, keep `correctAnswer` server-side or only send it after quiz completion.
