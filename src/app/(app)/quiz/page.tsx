"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  HelpCircle,
  Sparkles,
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ShieldAlert,
  Flame,
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { generateDiagnosticQuestions } from '@/lib/quiz/generator';
import { QuizAttempt } from '@/lib/types';

export default function QuizHubPage() {
  const router = useRouter();
  const { topics, user, submitQuizAttempt } = useApp();

  const [selectedTopics, setSelectedTopics] = useState<string[]>(topics.map((t) => t.id));
  const [questionCount, setQuestionCount] = useState<number>(4);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const toggleTopic = (topicId: string) => {
    if (selectedTopics.includes(topicId)) {
      if (selectedTopics.length > 1) {
        setSelectedTopics(selectedTopics.filter((id) => id !== topicId));
      }
    } else {
      setSelectedTopics([...selectedTopics, topicId]);
    }
  };

  const handleLaunchQuiz = (topicIds: string[], count: number, customTitle?: string) => {
    setIsGenerating(true);
    const quizId = `quiz-${Date.now()}`;
    const selectedTopicNames = topics
      .filter((t) => topicIds.includes(t.id))
      .map((t) => t.name);

    const questions = generateDiagnosticQuestions(topicIds, count, quizId);

    const newQuiz: QuizAttempt = {
      id: quizId,
      userId: user.id,
      title: customTitle || `Diagnostic Assessment: ${selectedTopicNames.slice(0, 2).join(', ')}${selectedTopicNames.length > 2 ? '...' : ''}`,
      topicIds,
      topicNames: selectedTopicNames,
      totalQuestions: questions.length,
      questions,
      status: 'in_progress',
      createdAt: new Date().toISOString(),
    };

    // Store in localStorage for immediate access by test route
    sessionStorage.setItem(`active_quiz_${quizId}`, JSON.stringify(newQuiz));

    setTimeout(() => {
      router.push(`/quiz/${quizId}`);
    }, 400);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Diagnostic Quiz Engine
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Questions are strictly generated from your uploaded course reader. Answers are deterministically graded with citations revealed upon submission.
          </p>
        </div>

        <Link
          href="/analytics"
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
        >
          View Past Attempts <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Preset Fast-Launch Cards */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-brand-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Recommended Diagnostic Scans
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Preset 1: Autoencoders (Insufficient Data) */}
          <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 to-white p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold text-brand-800">
                <ShieldAlert className="w-3.5 h-3.5 text-brand-600" />
                <span>Resolve Insufficient Data</span>
              </div>
              <h3 className="font-bold text-base text-slate-900">
                Autoencoders Diagnostic Assessment
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Take 3 questions on latent bottleneck representations and ELBO objective to establish verified proficiency.
              </p>
            </div>

            <button
              type="button"
              disabled={isGenerating}
              onClick={() => handleLaunchQuiz(['topic-autoencoders'], 3, 'Diagnostic Quiz: Autoencoders & Latent Space')}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 py-2.5 px-4 text-xs font-bold text-white shadow-sm hover:bg-brand-500 transition-all active:scale-[0.98]"
            >
              <span>{isGenerating ? 'Generating...' : 'Start Assessment (3 Qs)'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Preset 2: CNN Remediation (Weak Topic) */}
          <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50/60 to-white p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-800">
                <Flame className="w-3.5 h-3.5 text-rose-600" />
                <span>Remediate Critical Gap</span>
              </div>
              <h3 className="font-bold text-base text-slate-900">
                CNN Spatial Dimensions & Pooling Re-test
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Re-assess your weak score (40%) on 2D convolution output size formulas and max-pooling backprop gradients.
              </p>
            </div>

            <button
              type="button"
              disabled={isGenerating}
              onClick={() => handleLaunchQuiz(['topic-cnn'], 3, 'CNN Remediation Diagnostic Quiz')}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 py-2.5 px-4 text-xs font-bold text-white shadow-sm hover:bg-rose-500 transition-all active:scale-[0.98]"
            >
              <span>{isGenerating ? 'Generating...' : 'Start CNN Re-test (3 Qs)'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Preset 3: Comprehensive Exam */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                <Layers className="w-3.5 h-3.5 text-slate-600" />
                <span>Full Curriculum</span>
              </div>
              <h3 className="font-bold text-base text-slate-900">
                Comprehensive Deep Learning Mock
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Balanced diagnostic test covering all 5 syllabus modules (ANN, CNN, RNN, Transformers, Autoencoders).
              </p>
            </div>

            <button
              type="button"
              disabled={isGenerating}
              onClick={() => handleLaunchQuiz(topics.map((t) => t.id), 5, 'Comprehensive Deep Learning Diagnostic Exam')}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 px-4 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-all active:scale-[0.98]"
            >
              <span>{isGenerating ? 'Generating...' : 'Start Full Mock (5 Qs)'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Custom Quiz Configurator */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Custom Diagnostic Builder</h2>
          <p className="text-xs text-slate-500">
            Select specific topics and length to construct an individualized diagnostic evaluation
          </p>
        </div>

        {/* Topic Selector */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            Select Topics to Evaluate ({selectedTopics.length} selected)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {topics.map((t) => {
              const isChecked = selectedTopics.includes(t.id);
              return (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => toggleTopic(t.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    isChecked
                      ? 'border-brand-500 bg-brand-50/50 shadow-xs ring-1 ring-brand-500/30'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-900 truncate">{t.name}</p>
                    <p className="text-[11px] text-slate-500 capitalize">{t.status.replace('_', ' ')} • {t.latestScore}%</p>
                  </div>
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                      isChecked
                        ? 'bg-brand-600 border-brand-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isChecked && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Count Slider */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Number of Questions</span>
            <span className="font-mono text-sm font-bold text-brand-600">{questionCount} Questions</span>
          </div>
          <input
            type="range"
            min="2"
            max="6"
            step="1"
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="w-full accent-brand-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>2 Quick Check</span>
            <span>4 Recommended</span>
            <span>6 Thorough</span>
          </div>
        </div>

        {/* Launch Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            disabled={isGenerating || selectedTopics.length === 0}
            onClick={() => handleLaunchQuiz(selectedTopics, questionCount)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-brand-500/25 hover:bg-brand-500 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <span>{isGenerating ? 'Generating Grounded Questions...' : 'Launch Custom Diagnostic'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
