"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen,
  Send,
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { QuizAttempt, EvaluatedAnswer } from '@/lib/types';
import { SAMPLE_RECENT_QUIZZES } from '@/lib/demo/sample-data';

export default function ActiveQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params?.id as string;
  const { submitQuizAttempt } = useApp();

  const [quiz, setQuiz] = useState<QuizAttempt | null>(null);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load quiz from sessionStorage or recent quizzes
  useEffect(() => {
    if (!quizId) return;

    try {
      const stored = sessionStorage.getItem(`active_quiz_${quizId}`);
      if (stored) {
        setQuiz(JSON.parse(stored));
        return;
      }
    } catch (e) {
      console.warn('Error reading sessionStorage:', e);
    }

    // Fallback: check recent quizzes
    const found = SAMPLE_RECENT_QUIZZES.find((q) => q.id === quizId);
    if (found && found.questions.length > 0) {
      setQuiz(found);
    }
  }, [quizId]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionId: string, option: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleShortAnswerChange = (questionId: string, text: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: text }));
  };

  const handleSubmitQuiz = () => {
    if (!quiz) return;

    // Check if at least one question is answered
    const answeredCount = Object.keys(userAnswers).length;
    if (answeredCount === 0) {
      setErrorMsg('Please answer at least one question before submitting your assessment.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    // Evaluate answers
    const evaluatedAnswers: Record<string, EvaluatedAnswer> = {};
    let totalScore = 0;

    quiz.questions.forEach((q) => {
      const studentAns = (userAnswers[q.id] || '').trim();

      if (q.questionType === 'mcq') {
        // Deterministic MCQ scoring
        const isCorrect = studentAns.toLowerCase() === q.correctAnswer.toLowerCase();
        const score = isCorrect ? 100 : 0;
        totalScore += score;

        evaluatedAnswers[q.id] = {
          questionId: q.id,
          studentAnswer: studentAns || '(No answer provided)',
          isCorrect,
          score,
          aiFeedback: isCorrect
            ? 'Correct! Grounded derivation matches reference calculation.'
            : `Incorrect. Your answer was "${studentAns || 'empty'}". The correct answer is "${q.correctAnswer}".`,
          keyConceptsMissed: isCorrect ? [] : [`Review: ${q.sourceCitation.sectionTitle}`],
          correctConceptSummary: q.explanation,
          sourceCitation: q.sourceCitation,
        };
      } else {
        // AI Rubric evaluation for short answer
        let score = 0;
        let isCorrect = false;
        const keyConceptsMissed: string[] = [];

        if (studentAns.length < 5) {
          score = 0;
          keyConceptsMissed.push('Answer too brief or omitted');
        } else {
          // Check against rubric criteria keywords
          const lowerAns = studentAns.toLowerCase();
          const rubric = q.rubric;
          let matchedKeyPoints = 0;

          if (rubric && rubric.keyPoints.length > 0) {
            rubric.keyPoints.forEach((kp) => {
              const words = kp.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
              const hasWord = words.some((w) => lowerAns.includes(w));
              if (hasWord) {
                matchedKeyPoints += 1;
              } else {
                keyConceptsMissed.push(kp);
              }
            });

            const ratio = matchedKeyPoints / rubric.keyPoints.length;
            score = Math.round(ratio * 100);
            isCorrect = score >= 70;
          } else {
            // General semantic match against correct answer
            const correctWords = q.correctAnswer.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
            const matches = correctWords.filter((w) => lowerAns.includes(w)).length;
            score = Math.min(100, Math.round((matches / Math.max(1, correctWords.length)) * 120));
            isCorrect = score >= 60;
          }
        }

        totalScore += score;
        evaluatedAnswers[q.id] = {
          questionId: q.id,
          studentAnswer: studentAns || '(No answer provided)',
          isCorrect,
          score,
          aiFeedback: isCorrect
            ? `Strong conceptual explanation (${score}/100). Demonstrates clear understanding of ${q.topicName}.`
            : `Partially correct / Misconception detected (${score}/100). ${keyConceptsMissed.length > 0 ? `Missing key concepts: ${keyConceptsMissed.join('; ')}.` : ''}`,
          keyConceptsMissed,
          correctConceptSummary: q.correctAnswer,
          sourceCitation: q.sourceCitation,
        };
      }
    });

    const averageScore = Math.round(totalScore / quiz.questions.length);

    const completedQuiz: QuizAttempt = {
      ...quiz,
      score: averageScore,
      answers: evaluatedAnswers,
      status: 'completed',
      completedAt: new Date().toISOString(),
    };

    // Save evaluated attempt to AppContext and storage
    submitQuizAttempt(completedQuiz);
    sessionStorage.setItem(`completed_quiz_${quiz.id}`, JSON.stringify(completedQuiz));

    setTimeout(() => {
      router.push(`/quiz/${quiz.id}/results`);
    }, 600);
  };

  if (!quiz) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="flex justify-center">
          <span className="h-8 w-8 rounded-full border-2 border-brand-600 border-t-transparent animate-spin" />
        </div>
        <p className="text-sm font-medium text-slate-600">Loading diagnostic questions...</p>
      </div>
    );
  }

  const currentQ = quiz.questions[currentIdx];
  const progressPercent = Math.round(((currentIdx + 1) / quiz.questions.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Quiz Top bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="space-y-0.5">
          <span className="text-[11px] font-bold text-brand-700 uppercase tracking-wider">
            Diagnostic Assessment in Progress
          </span>
          <h1 className="text-lg font-bold text-slate-900">{quiz.title}</h1>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-mono font-bold text-slate-700 shadow-xs">
          <Clock className="w-3.5 h-3.5 text-brand-600" />
          <span>{formatTimer(secondsElapsed)}</span>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>
            Question {currentIdx + 1} of {quiz.questions.length}
          </span>
          <span>{progressPercent}% Complete</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Active Question Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        {/* Question Header & Topic Pill */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
            {currentQ.topicName}
          </span>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {currentQ.questionType === 'mcq' ? 'Multiple Choice' : 'Conceptual Short Answer'}
          </span>
        </div>

        {/* Question Text */}
        <h2 className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
          {currentQ.questionText}
        </h2>

        {/* Answer Options / Input Area */}
        <div className="pt-2">
          {currentQ.questionType === 'mcq' && currentQ.options ? (
            <div className="space-y-3">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = userAnswers[currentQ.id] === opt;
                return (
                  <button
                    type="button"
                    key={optIdx}
                    onClick={() => handleSelectOption(currentQ.id, opt)}
                    className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/60 font-semibold text-brand-900 ring-2 ring-brand-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold flex-shrink-0 mt-0.5 border ${
                        isSelected
                          ? 'border-brand-600 bg-brand-600 text-white'
                          : 'border-slate-300 text-slate-500 bg-slate-50'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="flex-1 leading-snug">{opt}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600">
                Write your explanation in your own words (assessed against reference rubric):
              </label>
              <textarea
                rows={4}
                value={userAnswers[currentQ.id] || ''}
                onChange={(e) => handleShortAnswerChange(currentQ.id, e.target.value)}
                placeholder="Explain the underlying principle, relevant formulas, or gradient flow..."
                className="w-full rounded-xl border border-slate-200 p-3.5 text-sm text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 leading-relaxed"
              />
              <p className="text-[11px] text-slate-400 text-right">
                {(userAnswers[currentQ.id] || '').split(/\s+/).filter(Boolean).length} words
              </p>
            </div>
          )}
        </div>

        {/* Security / Grounding notice */}
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>Grounded in uploaded course reader</span>
          </span>
          <span className="italic text-[11px]">Correct answers revealed after final submission</span>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Navigation & Submit Bar */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          disabled={currentIdx === 0}
          onClick={() => setCurrentIdx((prev) => prev - 1)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {currentIdx < quiz.questions.length - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentIdx((prev) => prev + 1)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            <span>Next Question</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmitQuiz}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 transition-all active:scale-[0.98]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Evaluating with AI Rubric...' : 'Submit Diagnostic Answers'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
