"use client";

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Award,
  AlertTriangle,
  CheckCircle2,
  CalendarCheck,
  ArrowRight,
  Clock,
  Sparkles,
  BarChart3,
  HelpCircle,
  FileCheck2,
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { formatDate, getStatusBadgeInfo } from '@/lib/utils';

export default function AnalyticsPage() {
  const { quizzes, topics, revisionPlan, diagnoses } = useApp();

  const completedQuizzes = quizzes.filter((q) => q.status === 'completed');
  const averageScore = completedQuizzes.length > 0
    ? Math.round(
        completedQuizzes.reduce((acc, q) => acc + (q.score || 0), 0) /
          completedQuizzes.length
      )
    : 0;

  const weakTopics = topics.filter((t) => t.status === 'weak');
  const mediumTopics = topics.filter((t) => t.status === 'medium');
  const strongTopics = topics.filter((t) => t.status === 'strong');

  const completedTasks = revisionPlan.tasks.filter((t) => t.isCompleted).length;
  const planCompletionPercent = revisionPlan.tasks.length > 0
    ? Math.round((completedTasks / revisionPlan.tasks.length) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Progress & Diagnostic Performance Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tracking knowledge gap closures, score evolution across attempts, and syllabus mastery.
          </p>
        </div>

        <Link
          href="/quiz"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-500 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Take New Diagnostic</span>
        </Link>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Overall Diagnostic Average</span>
            <Award className="w-4 h-4 text-brand-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{averageScore}%</p>
          <p className="text-[11px] text-slate-500">Across {completedQuizzes.length} completed attempts</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Revision Plan Adherence</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-600">{planCompletionPercent}%</p>
          <p className="text-[11px] text-slate-500">{completedTasks} of {revisionPlan.tasks.length} tasks completed</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Mastered Topics</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-600">{strongTopics.length}</p>
          <p className="text-[11px] text-slate-500">{strongTopics.map((t) => t.shortCode).join(', ')}</p>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-700">
            <span>Topics Needing Attention</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-3xl font-extrabold text-rose-600">{weakTopics.length}</p>
          <p className="text-[11px] text-rose-700 font-medium">
            {weakTopics.map((t) => t.shortCode).join(', ') || 'No critical gaps!'}
          </p>
        </div>
      </div>

      {/* Topic Growth & Mastery Trajectory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Mastery Distribution */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Syllabus Topic Mastery Progression</h2>
            <p className="text-xs text-slate-500">Current score levels calibrated by diagnostic assessments</p>
          </div>

          <div className="space-y-4">
            {topics.map((t) => {
              const badge = getStatusBadgeInfo(t.status);
              return (
                <div key={t.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{t.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.badgeClass}`}>
                        {badge.label}
                      </span>
                      <span className="font-extrabold text-slate-900 w-9 text-right">
                        {t.status === 'insufficient_data' ? 'N/A' : `${t.latestScore}%`}
                      </span>
                    </div>
                  </div>

                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${badge.progressColor}`}
                      style={{
                        width: t.status === 'insufficient_data' ? '15%' : `${t.latestScore}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gap Reduction Status & Improvements */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Knowledge Gap Reduction Trajectory</h2>
              <p className="text-xs text-slate-500">How diagnostic revisions close specific conceptual deficits</p>
            </div>

            <div className="mt-4 space-y-3">
              {topics.map((t) => {
                const badge = getStatusBadgeInfo(t.status);
                const diagnosis = diagnoses.find((d) => d.topicId === t.id);
                const isInsufficient = t.status === 'insufficient_data';

                return (
                  <div
                    key={t.id}
                    className={`rounded-xl border p-3.5 space-y-1 ${badge.bgSubtle} ${badge.borderColor}`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-900">{t.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.badgeClass}`}>
                        {isInsufficient ? 'Insufficient Data' : `${badge.label} (${t.latestScore}%)`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {diagnosis?.reason ||
                        (isInsufficient
                          ? `Only ${t.questionsAttempted} question attempted. Diagnostic assessment needed to establish proficiency.`
                          : `Evaluated across ${t.questionsAttempted} questions with an average score of ${t.latestScore}%.`)}
                    </p>
                    {diagnosis?.sourceReferences && diagnosis.sourceReferences.length > 0 && (
                      <p className="text-[10px] text-slate-500 pt-0.5 font-medium truncate">
                        Citation: {diagnosis.sourceReferences[0].sectionTitle} ({diagnosis.sourceReferences[0].documentTitle})
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/revision-plan"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              <span>Review Adaptive Remediation Timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Historical Assessment Attempts Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Diagnostic Attempt History</h2>
            <p className="text-xs text-slate-500">Full audit log of quiz evaluations</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">Assessment Title</th>
                <th className="pb-3">Topics Assessed</th>
                <th className="pb-3">Questions</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Score</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quizzes.map((quiz) => (
                <tr key={quiz.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 font-bold text-slate-900">{quiz.title}</td>
                  <td className="py-3.5 text-slate-600">{quiz.topicNames.join(', ')}</td>
                  <td className="py-3.5 text-slate-600">{quiz.totalQuestions} Questions</td>
                  <td className="py-3.5 text-slate-500">{formatDate(quiz.createdAt)}</td>
                  <td className="py-3.5 font-bold">
                    <span
                      className={`text-sm ${
                        (quiz.score || 0) < 50
                          ? 'text-rose-600'
                          : (quiz.score || 0) < 75
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {quiz.score !== undefined ? `${quiz.score}%` : 'In Progress'}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <Link
                      href={`/quiz/${quiz.id}/results`}
                      className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-semibold"
                    >
                      <span>Review</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
