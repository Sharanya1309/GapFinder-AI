"use client";

import React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck2,
  HelpCircle,
  Sparkles,
  TrendingUp,
  Upload,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { getStatusBadgeInfo, formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { user, topics, revisionPlan, quizzes, documents, toggleTaskCompletion } = useApp();

  // Metrics calculation
  const totalTopics = topics.length;
  const weakTopics = topics.filter((t) => t.status === 'weak');
  const mediumTopics = topics.filter((t) => t.status === 'medium');
  const strongTopics = topics.filter((t) => t.status === 'strong');
  const insufficientTopics = topics.filter((t) => t.status === 'insufficient_data');

  // Overall mastery percentage across assessed topics
  const assessedTopics = topics.filter((t) => t.status !== 'insufficient_data');
  const averageMastery = assessedTopics.length > 0
    ? Math.round(assessedTopics.reduce((acc, t) => acc + t.latestScore, 0) / assessedTopics.length)
    : 0;

  // Revision tasks for today/upcoming
  const pendingTasks = revisionPlan.tasks.filter((t) => !t.isCompleted).slice(0, 4);
  const completedTasksCount = revisionPlan.tasks.filter((t) => t.isCompleted).length;
  const planProgressPercent = revisionPlan.tasks.length > 0
    ? Math.round((completedTasksCount / revisionPlan.tasks.length) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* 1. Hero / Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-elevated">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-brand-200 backdrop-blur-md border border-white/10">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>AI Knowledge Gap Diagnosis Active</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user.fullName.split(' ')[0]} 👋
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            GapFinder AI analyzed your course material for <span className="font-semibold text-white">{user.subject}</span>.
            We identified <span className="font-semibold text-rose-300">{weakTopics.length} critical knowledge gap</span> and{' '}
            <span className="font-semibold text-amber-300">{insufficientTopics.length} unassessed area</span> requiring diagnostic verification.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/quiz"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/30 hover:bg-brand-400 transition-all active:scale-[0.98]"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Take Diagnostic Quiz</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/gap-report"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/20 transition-all border border-white/15"
            >
              <span>View Gap Diagnosis Report</span>
            </Link>
          </div>
        </div>

        {/* Subtle decorative background glow */}
        <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Topics */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm card-interactive">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Course Syllabus</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-brand-600">
              <Brain className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalTopics}</span>
            <span className="text-xs text-slate-500">Curriculum Topics</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
            <span>Overall Mastery</span>
            <span className="font-bold text-slate-900">{averageMastery}%</span>
          </div>
        </div>

        {/* Weak Topics */}
        <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 shadow-sm card-interactive">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Critical Gaps</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600">{weakTopics.length}</span>
            <span className="text-xs font-medium text-rose-700">Need Immediate Review</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-rose-700 pt-2 border-t border-rose-200/60 font-medium">
            <span>Score &lt; 50%</span>
            <span>{weakTopics.map((t) => t.shortCode).join(', ') || 'None'}</span>
          </div>
        </div>

        {/* Medium Topics */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-sm card-interactive">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Developing</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <TrendingUp className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600">{mediumTopics.length}</span>
            <span className="text-xs font-medium text-amber-700">Partially Understood</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-amber-700 pt-2 border-t border-amber-200/60 font-medium">
            <span>Score 50% - 75%</span>
            <span>{mediumTopics.map((t) => t.shortCode).join(', ') || 'None'}</span>
          </div>
        </div>

        {/* Strong Topics */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm card-interactive">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Mastered</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">{strongTopics.length}</span>
            <span className="text-xs font-medium text-emerald-700">High Confidence</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-emerald-700 pt-2 border-t border-emerald-200/60 font-medium">
            <span>Score &gt; 75%</span>
            <span>{strongTopics.map((t) => t.shortCode).join(', ') || 'None'}</span>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Grid: Knowledge Map & Adaptive Study Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Topic Knowledge Gap Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Topic Diagnostic Map</h2>
                <p className="text-xs text-slate-500">
                  Evidence-based proficiency grounded in your lecture notes and quizzes
                </p>
              </div>
              <Link
                href="/topics"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
              >
                Configure Map <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-5 space-y-4">
              {topics.map((topic) => {
                const badge = getStatusBadgeInfo(topic.status);

                return (
                  <div
                    key={topic.id}
                    className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{topic.name}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.badgeClass}`}
                        >
                          {badge.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>
                          {topic.questionsAttempted} {topic.questionsAttempted === 1 ? 'question' : 'questions'}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">
                          {topic.status === 'insufficient_data' ? 'N/A' : `${topic.latestScore}%`}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${badge.progressColor}`}
                        style={{
                          width: topic.status === 'insufficient_data' ? '15%' : `${topic.latestScore}%`,
                        }}
                      />
                    </div>

                    {/* Topic Context Footer */}
                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="truncate max-w-[280px]">
                        Cited in: <span className="text-slate-700 font-medium">{topic.relatedSections[0]}</span>
                      </span>
                      <Link
                        href={`/quiz?topic=${topic.id}`}
                        className="text-brand-600 font-semibold hover:underline"
                      >
                        {topic.status === 'insufficient_data' ? 'Take Diagnostic' : 'Re-assess'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Note about Sample Deep Learning Data */}
            <div className="mt-4 rounded-xl bg-indigo-50/70 border border-indigo-100 p-3.5 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-indigo-900 leading-relaxed">
                <span className="font-semibold">Sample Course Loaded:</span> Deep Learning (ANN 90%, CNN 40%, RNN 65%, Transformers 80%).
                These scores reflect baseline diagnostic evidence. As you take new quizzes, GapFinder AI re-evaluates topics deterministically in real time.
              </p>
            </div>
          </div>

          {/* Recent Quiz Attempts */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Recent Diagnostic Assessments</h2>
                <p className="text-xs text-slate-500">Ground-truth evaluations against course reader</p>
              </div>
              <Link
                href="/analytics"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
              >
                Full Analytics <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {quizzes.slice(0, 3).map((quiz) => (
                <div key={quiz.id} className="py-3.5 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-sm text-slate-900">{quiz.title}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{quiz.topicNames.join(', ')}</span>
                      <span>•</span>
                      <span>{formatDate(quiz.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span
                        className={`text-base font-extrabold ${
                          (quiz.score || 0) < 50
                            ? 'text-rose-600'
                            : (quiz.score || 0) < 75
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {quiz.score !== undefined ? `${quiz.score}%` : 'In Progress'}
                      </span>
                      <p className="text-[10px] text-slate-400 font-medium">Result</p>
                    </div>

                    <Link
                      href={`/quiz/${quiz.id}/results`}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Personalized Revision Plan & Actions */}
        <div className="space-y-6">
          {/* Personalized Revision Plan Preview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Personalized Revision Plan</h2>
                <p className="text-xs text-slate-500">Targeted remediation for your weak areas</p>
              </div>
              <Link
                href="/revision-plan"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                View Plan
              </Link>
            </div>

            {/* Plan Progress Metric */}
            <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Study Plan Completion</span>
                <span className="font-bold text-brand-600">{planProgressPercent}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand-600 transition-all duration-300"
                  style={{ width: `${planProgressPercent}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>{completedTasksCount} done</span>
                <span>{revisionPlan.tasks.length - completedTasksCount} remaining</span>
              </div>
            </div>

            {/* Next Tasks List */}
            <div className="mt-4 space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Recommended Next Tasks
              </p>

              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-100 bg-white hover:border-indigo-200 transition-all text-left group"
                >
                  <button
                    type="button"
                    onClick={() => toggleTaskCompletion(task.id)}
                    className="mt-0.5 text-slate-400 hover:text-brand-600 transition-colors"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{task.title}</p>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          task.priority === 'high'
                            ? 'bg-rose-100 text-rose-700'
                            : task.priority === 'medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{task.description}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {task.estimatedMinutes}m
                      </span>
                      <span>•</span>
                      <span className="truncate text-slate-600 font-medium">
                        {task.sourceReference.documentTitle.split('.')[0]}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/revision-plan"
              className="mt-4 block w-full text-center rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Manage Revision Schedule
            </Link>
          </div>

          {/* Quick RAG Assistant Card */}
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-white p-5 shadow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Brain className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Explain This Topic</h3>
                <p className="text-[11px] text-slate-500">Document-grounded RAG answers only</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Ask anything about <span className="font-medium text-slate-800">CNN padding, backprop or Transformers</span>. Answers include verifiable page & section citations and refuse hallucinated content.
            </p>

            <Link
              href="/assistant"
              className="flex items-center justify-between w-full rounded-xl bg-white border border-indigo-200 px-3.5 py-2 text-xs font-semibold text-brand-700 shadow-2xs hover:bg-indigo-50/50 transition-colors"
            >
              <span>Ask Document Assistant</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Study Materials Summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900">Course Materials</h3>
              <Link
                href="/materials"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                Upload More
              </Link>
            </div>

            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCheck2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="font-medium text-slate-800 truncate">{doc.fileName}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 flex-shrink-0 font-medium">
                    {doc.chunkCount} chunks
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
