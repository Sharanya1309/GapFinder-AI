"use client";

import React, { useState } from 'react';
import {
  Bot,
  Send,
  BookOpen,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Layers,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { retrieveRelevantChunks, generateGroundedExplanation } from '@/lib/gemini/client';
import { ChatMessage, SourceCitation } from '@/lib/types';

export default function AssistantPage() {
  const { chunks, documents } = useApp();

  const [inputQuery, setInputQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      content:
        'Hello! I am your course-grounded study assistant for **Deep Learning (CS-682)**.\n\nI answer questions **strictly using your uploaded lecture notes and course reader**. Every answer includes verifiable document, page, and section citations. If the course material does not contain the answer, I will state that the information is missing rather than fabricating from generic model memory.',
      timestamp: new Date().toISOString(),
      grounded: true,
      citations: [
        {
          documentTitle: 'CS682_Deep_Learning_Course_Reader.pdf',
          pageNumber: 1,
          sectionTitle: 'Course Overview',
        },
      ],
    },
  ]);

  const handleSendMessage = async (queryText?: string) => {
    const text = (queryText || inputQuery).trim();
    if (!text || isGenerating) return;

    setInputQuery('');
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      grounded: true,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsGenerating(true);

    try {
      // 1. Retrieve top matching chunks from uploaded materials
      const matched = retrieveRelevantChunks(text, chunks, 2);
      const topChunks = matched.filter((m) => m.score > 0).map((m) => m.chunk);

      // 2. Synthesize grounded answer or trigger refusal if outside uploaded material
      const response = await generateGroundedExplanation(text, topChunks);

      const assistantMsg: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: 'assistant',
        content: response.text,
        timestamp: new Date().toISOString(),
        citations: response.citations,
        grounded: response.isGrounded,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'assistant',
          content: 'An error occurred while retrieving course context. Please try again.',
          timestamp: new Date().toISOString(),
          grounded: false,
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const sampleQueries = [
    'Explain the CNN output dimension formula and Valid vs Same padding',
    'Why is division by sqrt(d_k) needed in Scaled Dot-Product Attention?',
    'How does the LSTM cell state avoid vanishing gradients?',
    'What is the reparameterization trick in VAEs?',
    'Explain Quantum Key Distribution (Strict Refusal Test)',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Explain This Topic Assistant
            </h1>
            <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-200">
              Strict Grounding
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Grounded in {chunks.length} active syllabus chunks across {documents.length} documents.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <BookOpen className="w-4 h-4 text-brand-600" />
          <span>Zero-Hallucination Policy</span>
        </div>
      </div>

      {/* Suggested Prompts Pill Carousel */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Sample Inquiries (Click to Test):
        </span>
        <div className="flex flex-wrap gap-2">
          {sampleQueries.map((q, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:border-brand-500 hover:bg-brand-50/50 hover:text-brand-700 transition-colors text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm min-h-[460px] max-h-[600px] overflow-y-auto space-y-5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3.5 ${
              msg.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl flex-shrink-0 text-xs font-bold ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white'
                  : 'bg-brand-600 text-white shadow-xs'
              }`}
            >
              {msg.sender === 'user' ? 'You' : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[85%] rounded-2xl p-4 space-y-3 ${
                msg.sender === 'user'
                  ? 'bg-brand-600 text-white'
                  : msg.grounded
                  ? 'bg-slate-50 border border-slate-200/80 text-slate-900'
                  : 'bg-amber-50 border border-amber-200 text-amber-950'
              }`}
            >
              <div className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </div>

              {/* Citations Footer */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="pt-2 border-t border-slate-200/60 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-brand-800 text-[11px] uppercase tracking-wider">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Verifiable Grounding Citations:</span>
                  </div>

                  <div className="space-y-1">
                    {msg.citations.map((cite, cIdx) => (
                      <div
                        key={cIdx}
                        className="rounded-lg bg-white p-2 border border-slate-200/80 text-slate-700"
                      >
                        <div className="flex items-center justify-between font-semibold text-slate-900">
                          <span>{cite.documentTitle}</span>
                          <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">
                            Page {cite.pageNumber}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{cite.sectionTitle}</p>
                        {cite.snippet && (
                          <p className="text-[11px] text-slate-600 italic mt-1 line-clamp-2">
                            &ldquo;{cite.snippet}&rdquo;
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex items-center gap-3 text-xs text-brand-600 font-semibold p-2">
            <span className="h-2 w-2 rounded-full bg-brand-600 animate-ping" />
            <span>Scanning uploaded chunks & verifying citations...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask a question about your uploaded materials (e.g. CNN output sizes, LSTM gates)..."
          className="flex-1 rounded-xl border border-slate-200 bg-white p-3 text-xs sm:text-sm text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 shadow-xs"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isGenerating}
          className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-brand-500 disabled:opacity-50 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
