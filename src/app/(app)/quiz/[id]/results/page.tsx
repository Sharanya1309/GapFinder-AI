"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CalendarCheck,
  FileSpreadsheet,
  HelpCircle,
  Sparkles,
  Layers,
  Award,
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { QuizAttempt } from '@/lib/types';
import { SAMPLE_RECENT_QUIZZES } from '@/lib/demo/sample-data';
import { getStatusBadgeInfo } from '@/lib/utils';

export default function QuizResultsPage() {
  const params = useParams();
  const quizId = params?.id as string;
  const { quizzes, topics } = useApp();

  const [quiz, setQuiz] = useState<QuizAttempt | null>(null);

  useEffect(() => {
    if (!quizId) return;

    // Check AppContext quizzes
    const found = quizzes.find((q) => q.id === quizId);
    if (found && found.answers) {
      setQuiz(found);
      return;
    }

    // Check sessionStorage
    try {
      const stored = sessionStorage.getItem(`completed_quiz_${quizId}`);
      if (stored) {
        setQuiz(JSON.parse(stored));
        return;
      }
    } catch (e) {
      console.warn('Error reading sessionStorage:', e);
    }

    // Fallback: check sample quizzes
    const sample = SAMPLE_RECENT_QUIZZES.find((q) => q.id === quizId);
    if (sample) setQuiz(sample);
  }, [quizId, quizzes]);

  if (!quiz) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="flex justify-center">
          <span className="h-8 w-8 rounded-full border-2 border-brand-600 border-t-transparent animate-spin" />
        </div>
        <p className="text-sm font-medium text-slate-600">Loading diagnostic evaluation results...</p>
      </div>
    );
  }

  const score = quiz.score || 0;
  const isPassing = score >= 75;
  const isWeak = score < 50;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Banner: Score & Classification */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-brand-700 uppercase tracking-wider">
              Diagnostic Assessment Evaluated
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {quiz.title}
            </h1>
            <p className="text-xs text-slate-500">
              Evaluated against ground-truth course reader • Results recorded to syllabus topics
            </p>
          </div>

          {/* Big Score Box */}
          <div className="flex items-center gap-4 self-start sm:self-auto bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-500 uppercase">Assessment Score</span>
              <p
                className={`text-3xl font-extrabold ${
                  isWeak ? 'text-rose-600' : score < 75 ? 'text-amber-600' : 'text-emerald-600'
                }`}
              >
                {score}%
              </p>
            </div>
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                isWeak
                  ? 'bg-rose-100 text-rose-600'
                  : score < 75
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-emerald-100 text-emerald-600'
              }`}
            >
              <Award className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Diagnosis & Recommendations Alert */}
        <div
          className={`rounded-xl p-4 border flex items-start gap-3 ${
            isWeak
              ? 'bg-rose-50/70 border-rose-200 text-rose-900'
              : score < 75
              ? 'bg-amber-50/70 border-amber-200 text-amber-900'
              : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
          }`}
        >
          {isWeak ? (
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          ) : score < 75 ? (
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          )}

          <div className="space-y-1">
            <h2 className="font-bold text-sm">
              {isWeak
                ? 'Knowledge Gap Diagnosed — Remediation Plan Updated'
                : score < 75
                ? 'Developing Understanding — Secondary Practice Scheduled'
                : 'Concept Mastered — Spaced Repetition Active'}
            </h2>
            <p className="text-xs leading-relaxed opacity-90">
              {isWeak
                ? 'Your answers indicate misconceptions regarding fundamental definitions and formulas. Specific review tasks have been prioritized in your adaptive revision plan.'
                : score < 75
                ? 'Good grasp of high-level intuition, but missed specific rubric nuances. Recommended to review the cited sections below.'
                : 'Excellent accuracy! You demonstrated strong conceptual clarity. Maintenance review tasks scheduled.'}
            </p>
          </div>
        </div>

        {/* Quick Action Navigation */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/gap-report"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-500 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>View Updated Gap Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/revision-plan"
            className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
            <span>Review Adaptive Revision Plan</span>
          </Link>
        </div>
      </div>

      {/* Question by Question Detailed Evaluation */}
      <div className="space-y-6">
        <h2 className="text-base font-bold text-slate-900">
          Question-Level Grounded Evaluation ({quiz.questions.length} Items)
        </h2>

        {quiz.questions.map((q, idx) => {
          const evalAns = quiz.answers?.[q.id];
          const isCorrect = evalAns?.isCorrect;
          const scoreItem = evalAns?.score ?? 0;

          return (
            <div
              key={q.id}
              className={`rounded-2xl border bg-white p-6 shadow-sm space-y-5 transition-all ${
                isCorrect ? 'border-emerald-200/80' : scoreItem > 0 ? 'border-amber-200/80' : 'border-rose-200/80'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    {q.topicName}
                  </span>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider">
                    {q.questionType === 'mcq' ? 'Multiple Choice' : 'AI Rubric Short Answer'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                      isCorrect
                        ? 'bg-emerald-100 text-emerald-800'
                        : scoreItem > 0
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>{scoreItem}/100</span>
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                {q.questionText}
              </p>

              {/* Student Answer vs Reference */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Student's Answer */}
                <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 space-y-1">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Your Response
                  </span>
                  <p className="font-medium text-slate-800 whitespace-pre-wrap">
                    {evalAns?.studentAnswer || '(No response provided)'}
                  </p>
                </div>

                {/* Correct Concept / Reference */}
                <div className="rounded-xl bg-emerald-50/50 border border-emerald-200/70 p-3.5 space-y-1">
                  <span className="font-bold text-emerald-700 uppercase tracking-wider text-[10px]">
                    Correct Reference Concept
                  </span>
                  <p className="font-medium text-emerald-950 whitespace-pre-wrap">
                    {q.correctAnswer}
                  </p>
                </div>
              </div>

              {/* AI Feedback & Rubric Explanation */}
              <div className="rounded-xl bg-indigo-50/50 border border-indigo-100 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-800">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  <span>Evaluation Analysis & Misconception Breakdown:</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {evalAns?.aiFeedback || q.explanation}
                </p>

                {evalAns?.keyConceptsMissed && evalAns.keyConceptsMissed.length > 0 && (
                  <div className="pt-2 text-xs text-rose-700 font-medium">
                    <span className="font-bold">Missing Key Concepts:</span>{' '}
                    {evalAns.keyConceptsMissed.join(' • ')}
                  </div>
                )}
              </div>

              {/* Verifiable Citation Footer */}
              <div className="rounded-xl bg-slate-50 border border-slate-200/60 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900">
                      {q.sourceCitation.documentTitle}
                    </span>
                    <span className="text-slate-500 ml-1.5">
                      ({q.sourceCitation.sectionTitle}, Page {q.sourceCitation.pageNumber})
                    </span>
                  </div>
                </div>

                {q.sourceCitation.snippet && (
                  <span className="italic text-slate-500 text-[11px] truncate max-w-sm">
                    &ldquo;{q.sourceCitation.snippet}&rdquo;
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
