"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Sliders,
  RotateCcw,
  BookOpen,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { formatDate } from '@/lib/utils';

export default function RevisionPlanPage() {
  const {
    revisionPlan,
    user,
    topics,
    toggleTaskCompletion,
    recalculateRevisionPlan,
    updateUserSettings,
  } = useApp();

  const [showSettings, setShowSettings] = useState(false);
  const [examDateInput, setExamDateInput] = useState(user.examDate);
  const [dailyMinutesInput, setDailyMinutesInput] = useState(user.dailyStudyMinutes);

  const completedCount = revisionPlan.tasks.filter((t) => t.isCompleted).length;
  const totalTasks = revisionPlan.tasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Group tasks by day number
  const tasksByDay: Record<number, typeof revisionPlan.tasks> = {};
  revisionPlan.tasks.forEach((t) => {
    if (!tasksByDay[t.dayNumber]) {
      tasksByDay[t.dayNumber] = [];
    }
    tasksByDay[t.dayNumber].push(t);
  });

  const sortedDays = Object.keys(tasksByDay)
    .map(Number)
    .sort((a, b) => a - b);

  const handleSaveSettings = () => {
    updateUserSettings(examDateInput, Number(dailyMinutesInput));
    recalculateRevisionPlan();
    setShowSettings(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Personalized Adaptive Revision Plan
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Dynamic study schedule calibrated to your exam countdown ({user.examDate}) and diagnosed weak areas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>Plan Parameters</span>
          </button>

          <button
            type="button"
            onClick={recalculateRevisionPlan}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-500 transition-colors shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Re-optimize Plan</span>
          </button>
        </div>
      </div>

      {/* Plan Settings Drawer */}
      {showSettings && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6 space-y-4 animate-in fade-in-50">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-indigo-950">
              Customize Revision Parameters
            </h2>
            <span className="text-xs text-brand-700 font-medium">Adapts daily task load</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Exam Date</label>
              <input
                type="date"
                value={examDateInput}
                onChange={(e) => setExamDateInput(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Daily Available Study Time: <span className="font-bold text-brand-600">{dailyMinutesInput} mins</span>
              </label>
              <input
                type="range"
                min="15"
                max="120"
                step="15"
                value={dailyMinutesInput}
                onChange={(e) => setDailyMinutesInput(Number(e.target.value))}
                className="w-full accent-brand-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveSettings}
              className="rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
            >
              Apply & Rebalance Schedule
            </button>
          </div>
        </div>
      )}

      {/* Progress & Highlights Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Overall Plan Completion</span>
            <span className="font-bold text-brand-600">{progressPercent}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-600 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            {completedCount} of {totalTasks} tasks completed
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">Target Exam Timeline</span>
          <p className="text-lg font-extrabold text-slate-900">{formatDate(user.examDate)}</p>
          <p className="text-[11px] text-slate-500">
            Daily Budget: <span className="font-semibold text-slate-800">{user.dailyStudyMinutes} mins/day</span>
          </p>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-rose-700">Top Priority Remediation</span>
          <p className="text-base font-extrabold text-rose-900">
            {topics.find((t) => t.status === 'weak')?.name || 'All foundational gaps addressed!'}
          </p>
          <p className="text-[11px] text-rose-700/80">
            Auto-promoted to Day 1 schedule
          </p>
        </div>
      </div>

      {/* Daily Tasks Timeline */}
      <div className="space-y-6">
        {sortedDays.map((dayNum) => {
          const dayTasks = tasksByDay[dayNum];
          const allDayCompleted = dayTasks.every((t) => t.isCompleted);
          const dayTotalMinutes = dayTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0);

          return (
            <div
              key={dayNum}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm"
            >
              {/* Day Header */}
              <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50/80 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-sm text-slate-900">
                    Day {dayNum}
                  </span>
                  <span className="text-xs text-slate-500">
                    Scheduled for {formatDate(dayTasks[0]?.scheduledDate || new Date().toISOString())}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{dayTotalMinutes} mins total</span>
                  </span>
                  {allDayCompleted && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Done
                    </span>
                  )}
                </div>
              </div>

              {/* Task Items */}
              <div className="divide-y divide-slate-100 p-2 sm:p-4">
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-start gap-4 p-3.5 rounded-xl transition-all ${
                      task.isCompleted ? 'bg-slate-50/60 opacity-60' : 'hover:bg-slate-50'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleTaskCompletion(task.id)}
                      className="mt-0.5 text-slate-400 hover:text-brand-600 transition-colors flex-shrink-0"
                    >
                      {task.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 hover:text-slate-500" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <p
                          className={`text-sm font-bold ${
                            task.isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </p>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              task.priority === 'high'
                                ? 'bg-rose-100 text-rose-700'
                                : task.priority === 'medium'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {task.priority} Priority
                          </span>
                          <span className="text-xs font-semibold text-slate-600 font-mono">
                            {task.estimatedMinutes}m
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">{task.description}</p>

                      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500">
                        <span className="font-semibold text-indigo-700">{task.topicName}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-500 truncate">
                          <BookOpen className="w-3 h-3 text-slate-400" />
                          <span>
                            {task.sourceReference.documentTitle} ({task.sourceReference.sectionTitle}, p. {task.sourceReference.pageNumber})
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
