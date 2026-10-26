"use client";

import React from 'react';
import { Menu, Clock, Calendar, ShieldCheck, User } from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/lib/context/AppContext';

interface NavbarProps {
  onOpenMobile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobile }) => {
  const { user } = useApp();

  // Calculate days left to exam
  const today = new Date();
  const exam = new Date(user.examDate);
  const diffTime = exam.getTime() - today.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      {/* Left: Mobile hamburger & breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobile}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          aria-label="Open navigation sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-900">{user.subject}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500 font-medium">Gap Detection Hub</span>
        </div>
      </div>

      {/* Right: Study target counters & user chip */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Days to Exam Pill */}
        <div className="flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50/70 px-3 py-1 text-xs font-semibold text-indigo-700">
          <Calendar className="h-3.5 w-3.5 text-indigo-600" />
          <span>{daysLeft} days to exam</span>
        </div>

        {/* Daily Study Target */}
        <div className="hidden md:flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
          <Clock className="h-3.5 w-3.5 text-slate-500" />
          <span>{user.dailyStudyMinutes}m / day</span>
        </div>

        {/* Quick Quiz CTA */}
        <Link
          href="/quiz"
          className="hidden sm:inline-flex items-center justify-center rounded-lg bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
        >
          Take Diagnostic
        </Link>

        {/* User / Judge Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-xs ring-2 ring-brand-500/20">
            <User className="h-4 w-4" />
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-semibold text-slate-900 leading-none">{user.fullName}</p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium mt-0.5">
              <ShieldCheck className="h-3 w-3" />
              <span>Judge Demo Account</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
