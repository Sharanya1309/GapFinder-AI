"use client";

import React from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  BookOpen,
  CalendarCheck,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { getStatusBadgeInfo } from '@/lib/utils';

export default function GapReportPage() {
  const { topics, diagnoses, recalculateRevisionPlan } = useApp();

  const weakTopics = topics.filter((t) => t.status === 'weak');
  const mediumTopics = topics.filter((t) => t.status === 'medium');
  const strongTopics = topics.filter((t) => t.status === 'strong');
  const insufficientTopics = topics.filter((t) => t.status === 'insufficient_data');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Comprehensive Learning Gap Diagnosis
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Topic-level evidence synthesis, root misconception analysis, and recommended study remediation.
          </p>
        </div>

        <Link
          href="/revision-plan"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-500 transition-colors"
        >
          <CalendarCheck className="w-4 h-4" />
          <span>View Adaptive Revision Plan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Summary Distribution Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-700">
            <span>Critical Gaps</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">{weakTopics.length}</p>
          <p className="text-[11px] text-rose-600/80 mt-1">Immediate remediation required</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-700">
            <span>Developing</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{mediumTopics.length}</p>
          <p className="text-[11px] text-amber-600/80 mt-1">Partially grasped nuances</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-700">
            <span>Mastered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{strongTopics.length}</p>
          <p className="text-[11px] text-emerald-600/80 mt-1">High retention accuracy</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Insufficient Evidence</span>
            <ShieldAlert className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-600 mt-1">{insufficientTopics.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">&lt;3 questions attempted</p>
        </div>
      </div>

      {/* Scientific Threshold Assurance Note */}
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-indigo-950 leading-relaxed">
          <span className="font-semibold">Evidence-Grounded Classification Policy:</span> GapFinder AI requires a minimum statistical sample of at least 3 diagnostic responses before definitively labeling a topic as Weak or Strong. This prevents misclassifying a student who merely had an unlucky single question.
        </p>
      </div>

      {/* Topic-by-Topic In-Depth Diagnosis Cards */}
      <div className="space-y-6">
        {topics.map((topic) => {
          const badge = getStatusBadgeInfo(topic.status);
          const diagnosis = diagnoses.find((d) => d.topicId === topic.id);
          const isInsufficient = topic.status === 'insufficient_data';

          return (
            <div
              key={topic.id}
              className={`rounded-2xl border bg-white p-6 shadow-sm space-y-5 transition-all ${
                topic.status === 'weak'
                  ? 'border-rose-200'
                  : topic.status === 'medium'
                  ? 'border-amber-200'
                  : topic.status === 'strong'
                  ? 'border-emerald-200'
                  : 'border-slate-200'
              }`}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {topic.shortCode}
                    </span>
                    <h2 className="text-base font-bold text-slate-900">{topic.name}</h2>
                  </div>
                  <p className="text-xs text-slate-500">{topic.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Mastery</span>
                    <p className="text-lg font-extrabold text-slate-900">
                      {isInsufficient ? 'N/A' : `${topic.latestScore}%`}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${badge.badgeClass}`}
                  >
                    {badge.label}
                  </span>
                </div>
              </div>

              {/* Diagnosis Reason & Statistical Basis */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Diagnostic Rationale
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    {diagnosis?.reason ||
                      (isInsufficient
                        ? `Only ${topic.questionsAttempted} question attempted. Statistical confidence threshold requires at least 3 attempts to establish verified diagnosis.`
                        : `Grounded quiz accuracy averages ${topic.latestScore}% across ${topic.questionsAttempted} questions.`)}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Evidence Level
                  </span>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Attempts:</span>
                      <span className="font-bold text-slate-900">{topic.questionsAttempted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Min Required:</span>
                      <span className="font-bold text-slate-900">
                        {topic.recommendedThresholds.minQuestionsForConfidence}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Threshold:</span>
                      <span className="font-mono text-[11px] text-slate-700">
                        &lt;{topic.recommendedThresholds.weakMax}% / &gt;{topic.recommendedThresholds.mediumMax}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Common Mistakes & Misconceptions */}
              {diagnosis && diagnosis.commonMistakes && diagnosis.commonMistakes.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Identified Misconceptions & Mistakes</span>
                  </span>
                  <ul className="space-y-1.5 text-xs">
                    {diagnosis.commonMistakes.map((mistake, mIdx) => (
                      <li
                        key={mIdx}
                        className="flex items-start gap-2 bg-rose-50/50 p-2.5 rounded-lg border border-rose-100 text-rose-900"
                      >
                        <span className="font-bold text-rose-500 mt-0.5">•</span>
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended Action & References */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="rounded-xl bg-indigo-50/60 border border-indigo-100 p-3.5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-800">
                    Recommended Revision Action
                  </span>
                  <p className="text-xs font-medium text-slate-800 leading-relaxed">
                    {diagnosis?.recommendedAction || 'Schedule a targeted 15-minute diagnostic re-test.'}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-slate-400" />
                    <span>Course Reader Citations</span>
                  </span>
                  <div className="space-y-1 text-xs text-slate-700">
                    {(diagnosis?.sourceReferences || []).map((ref, rIdx) => (
                      <div key={rIdx} className="truncate">
                        <span className="font-semibold text-slate-900">{ref.sectionTitle}</span>{' '}
                        <span className="text-slate-500">({ref.documentTitle}, p. {ref.pageNumber})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex justify-end">
                <Link
                  href={`/quiz?topic=${topic.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700"
                >
                  <span>{isInsufficient ? 'Take Diagnostic Assessment' : 'Take Targeted Remediation Quiz'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
