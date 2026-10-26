"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Network,
  HelpCircle,
  FileSpreadsheet,
  CalendarCheck,
  Bot,
  TrendingUp,
  BrainCircuit,
  RotateCcw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const pathname = usePathname();
  const { topics, resetToDemoData } = useApp();

  const weakCount = topics.filter((t) => t.status === 'weak').length;
  const insufficientCount = topics.filter((t) => t.status === 'insufficient_data').length;

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Study Materials',
      href: '/materials',
      icon: FileText,
      badge: null,
    },
    {
      name: 'Topic Map',
      href: '/topics',
      icon: Network,
      badge: weakCount > 0 ? `${weakCount} weak` : null,
      badgeColor: 'bg-rose-100 text-rose-700',
    },
    {
      name: 'Diagnostic Quiz',
      href: '/quiz',
      icon: HelpCircle,
      badge: insufficientCount > 0 ? `${insufficientCount} pending` : null,
      badgeColor: 'bg-amber-100 text-amber-700',
    },
    {
      name: 'Gap Report',
      href: '/gap-report',
      icon: FileSpreadsheet,
      badge: 'Diagnosis',
      badgeColor: 'bg-indigo-100 text-indigo-700',
    },
    {
      name: 'Revision Plan',
      href: '/revision-plan',
      icon: CalendarCheck,
      badge: 'Adaptive',
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
    {
      name: 'Explain Assistant',
      href: '/assistant',
      icon: Bot,
      badge: 'RAG',
      badgeColor: 'bg-sky-100 text-sky-700',
    },
    {
      name: 'Progress Analytics',
      href: '/analytics',
      icon: TrendingUp,
      badge: null,
    },
  ];

  const handleReset = () => {
    if (confirm('Reset to standard Deep Learning Hackathon Demo dataset?')) {
      resetToDemoData();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center px-6 border-b border-slate-100 gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-md shadow-brand-500/20">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-slate-900">GapFinder</span>
              <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700">AI</span>
            </div>
            <p className="text-[11px] font-medium text-slate-500">Learning Gap Detection</p>
          </div>
        </div>

        {/* Current Active Subject Card */}
        <div className="px-4 pt-4 pb-2">
          <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/60 to-purple-50/40 p-3">
            <div className="flex items-center justify-between text-xs text-brand-700 font-semibold mb-1">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" /> Active Course
              </span>
              <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-indigo-200 text-brand-800">
                Demo
              </span>
            </div>
            <p className="font-bold text-sm text-slate-900 truncate">Deep Learning (CS-682)</p>
            <p className="text-[11px] text-slate-500 mt-0.5">5 Topics • 2 Uploaded Texts</p>
          </div>
        </div>

        {/* Main Navigation Links */}
        <nav className="flex-1 space-y-1 px-3 py-3 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseMobile}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-semibold shadow-sm border border-brand-200/60'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-5 w-5 transition-colors ${
                      isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Judge Demo Quick Action & Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold text-slate-700">Hackathon Mode</span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-500 mb-2.5">
              Testing with live RAG citations & deterministic evaluation.
            </p>
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              Reset Demo Data
            </button>
          </div>

          <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
            <span>GapFinder AI v1.0</span>
            <Link
              href="/login"
              className="hover:text-brand-600 transition-colors flex items-center gap-0.5"
            >
              Switch User <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};
