"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrainCircuit, Sparkles, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const { user } = useApp();
  const [email, setEmail] = useState('judge@gapfinder.ai');
  const [password, setPassword] = useState('GapFinderJudge2026!');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleJudgeOneClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 400);
  };

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/dashboard');
      } catch (err: any) {
        setErrorMessage(err.message || 'Authentication failed. Please check credentials or use 1-Click Judge Demo.');
        setIsLoading(false);
      }
    } else {
      // In demo mode, any valid format email/password grants seamless access
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-lg shadow-brand-500/25 mb-3">
          <BrainCircuit className="h-7 w-7" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          GapFinder <span className="text-brand-600">AI</span>
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Personalized Learning Gap Detection & Adaptive Revision
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-elevated rounded-2xl border border-slate-200/80 space-y-6">
          {/* Judge Demo Quick Access Highlight */}
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4">
            <div className="flex items-center gap-2 text-brand-800 font-bold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Hackathon Judge Fast-Pass</span>
            </div>
            <p className="text-xs text-indigo-950 mb-3 leading-relaxed">
              Instantly enter with preloaded Deep Learning syllabus, 5 topics, authentic course reader chunks, and diagnostic history.
            </p>
            <button
              type="button"
              onClick={handleJudgeOneClick}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 py-2.5 px-4 text-xs font-bold text-white shadow-md shadow-brand-500/20 hover:bg-brand-500 transition-all active:scale-[0.98]"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>1-Click Judge Demo Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-medium">Or Sign In with Supabase Auth</span>
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleStandardLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  placeholder="student@university.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Documented credentials box for judges */}
            <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-3 text-[11px] text-slate-600">
              <span className="font-semibold text-slate-800">Demo Credentials:</span>
              <div className="mt-1 flex items-center justify-between text-slate-500">
                <span>Email: <code className="text-slate-800 font-mono">judge@gapfinder.ai</code></span>
                <span>Pass: <code className="text-slate-800 font-mono">GapFinderJudge2026!</code></span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 rounded-xl bg-slate-900 py-2.5 px-4 text-xs font-semibold text-white shadow hover:bg-slate-800 transition-colors"
            >
              {isLoading ? 'Verifying...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500">
            Need an account?{' '}
            <Link href="/register" className="font-semibold text-brand-600 hover:text-brand-500">
              Create a student account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
