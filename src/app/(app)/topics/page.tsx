"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Network,
  SlidersHorizontal,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Info,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { getStatusBadgeInfo } from '@/lib/utils';
import { SyllabusTopic } from '@/lib/types';

export default function TopicsPage() {
  const { topics, updateTopicThresholds } = useApp();
  const [editingTopic, setEditingTopic] = useState<SyllabusTopic | null>(null);
  const [weakMax, setWeakMax] = useState(50);
  const [mediumMax, setMediumMax] = useState(75);
  const [minConfidence, setMinConfidence] = useState(3);

  const handleOpenConfig = (topic: SyllabusTopic) => {
    setEditingTopic(topic);
    setWeakMax(topic.recommendedThresholds.weakMax);
    setMediumMax(topic.recommendedThresholds.mediumMax);
    setMinConfidence(topic.recommendedThresholds.minQuestionsForConfidence);
  };

  const handleSaveConfig = () => {
    if (!editingTopic) return;
    updateTopicThresholds(editingTopic.id, Number(weakMax), Number(mediumMax), Number(minConfidence));
    setEditingTopic(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Topic Diagnostic Knowledge Map
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Curriculum topics extracted from your syllabus. Evidence sufficiency requires at least 3 attempts to prevent false diagnoses.
          </p>
        </div>

        <Link
          href="/quiz"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-500 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Launch Diagnostic Quiz</span>
        </Link>
      </div>

      {/* Threshold Explanation Banner */}
      <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 flex-shrink-0">
            <Info className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-slate-900">Configurable Diagnostic Thresholds</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Topics are categorized into <span className="font-semibold text-rose-600">Weak (&lt;50%)</span>,{' '}
              <span className="font-semibold text-amber-600">Medium (50%–75%)</span>, and{' '}
              <span className="font-semibold text-emerald-600">Strong (&gt;75%)</span>.
              Crucially, topics with fewer than <span className="font-semibold text-slate-800">3 questions answered</span> are marked as{' '}
              <span className="font-semibold text-slate-700">Insufficient Data</span> to protect against premature conclusions.
            </p>
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topics.map((topic) => {
          const badge = getStatusBadgeInfo(topic.status);
          const isInsufficient = topic.status === 'insufficient_data';

          return (
            <div
              key={topic.id}
              className={`rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-card-hover ${
                topic.status === 'weak'
                  ? 'border-rose-200'
                  : topic.status === 'medium'
                  ? 'border-amber-200'
                  : topic.status === 'strong'
                  ? 'border-emerald-200'
                  : 'border-slate-200'
              }`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {topic.shortCode}
                    </span>
                    <h2 className="text-base font-bold text-slate-900">{topic.name}</h2>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {topic.description}
                  </p>
                </div>

                <span
                  className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border ${badge.badgeClass}`}
                >
                  {badge.label}
                </span>
              </div>

              {/* Score & Questions Evidence Stat */}
              <div className="mt-5 rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Diagnostic Mastery Score</span>
                  <span className="font-extrabold text-base text-slate-900">
                    {isInsufficient ? 'Insufficient Evidence' : `${topic.latestScore}%`}
                  </span>
                </div>

                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${badge.progressColor}`}
                    style={{
                      width: isInsufficient ? '20%' : `${topic.latestScore}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
                  <span className="flex items-center gap-1.5">
                    {topic.questionsAttempted >= topic.recommendedThresholds.minQuestionsForConfidence ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    <span>
                      {topic.questionsAttempted} attempts (min {topic.recommendedThresholds.minQuestionsForConfidence} required)
                    </span>
                  </span>

                  <button
                    type="button"
                    onClick={() => handleOpenConfig(topic)}
                    className="inline-flex items-center gap-1 text-slate-600 hover:text-brand-600 font-semibold"
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                    <span>Config</span>
                  </button>
                </div>
              </div>

              {/* Related Sections Grounding */}
              <div className="mt-4 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Grounded Course Sections
                </span>
                <ul className="space-y-1 text-xs text-slate-600">
                  {topic.relatedSections.map((sec, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 text-slate-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      <span className="truncate">{sec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={`/gap-report`}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  View Gap Details
                </Link>

                <Link
                  href={`/quiz?topic=${topic.id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-colors"
                >
                  <span>{isInsufficient ? 'Take First Assessment' : 'Re-test Topic'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Threshold Configuration Modal */}
      {editingTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in-50">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Configure Thresholds: {editingTopic.shortCode}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Customize classification boundaries and statistical confidence minimums
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Weak Maximum Threshold</span>
                  <span className="font-mono text-rose-600">&lt; {weakMax}%</span>
                </label>
                <input
                  type="range"
                  min="20"
                  max="60"
                  step="5"
                  value={weakMax}
                  onChange={(e) => setWeakMax(Number(e.target.value))}
                  className="w-full accent-rose-600"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Medium Maximum Threshold</span>
                  <span className="font-mono text-amber-600">{weakMax}% – {mediumMax}%</span>
                </label>
                <input
                  type="range"
                  min="55"
                  max="85"
                  step="5"
                  value={mediumMax}
                  onChange={(e) => setMediumMax(Number(e.target.value))}
                  className="w-full accent-amber-600"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Min Questions for Statistical Confidence</span>
                  <span className="font-mono text-slate-900">{minConfidence} Questions</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={minConfidence}
                  onChange={(e) => setMinConfidence(Number(e.target.value))}
                  className="w-full accent-brand-600"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Topics with fewer attempts are safely marked &quot;Insufficient Data&quot;.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingTopic(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveConfig}
                className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-500"
              >
                Save Thresholds
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
