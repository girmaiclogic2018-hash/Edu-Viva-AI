import React from 'react';
import { Cloud, Sparkles, Database, RefreshCw, Flame, BookOpen, Award, Layers } from 'lucide-react';

interface SkeletonLoaderProps {
  /** Optional custom sync message or subtext */
  message?: string;
  subMessage?: string;
  /** Layout mode */
  variant?: 'dashboard' | 'content' | 'minimal';
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  message = 'Connecting to EDUVIVA Cloud Firestore...',
  subMessage = 'Fetching your latest learning streaks, diagnostic mastery, and offline curriculum...',
  variant = 'dashboard',
}) => {
  if (variant === 'minimal') {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label="Loading cloud data"
        className="w-full p-6 bg-white rounded-2xl border border-slate-200 shadow-sm animate-pulse space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="h-5 bg-slate-200 rounded-md w-1/3"></div>
          <div className="h-4 bg-slate-200 rounded-full w-20"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-100 rounded w-full"></div>
          <div className="h-4 bg-slate-100 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Fetching user learning progress from cloud"
      className="w-full space-y-8 animate-fadeIn"
    >
      {/* Cloud Sync Announcement Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-emerald-500/20">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6 text-emerald-300 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>{message}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                    <Database className="w-3 h-3 animate-pulse" /> Live Sync
                  </span>
                </h2>
              </div>
              <p className="text-xs text-emerald-100/80 mt-1 max-w-2xl">{subMessage}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-xs font-medium text-emerald-200">
            <Cloud className="w-4 h-4 text-emerald-300 animate-pulse" />
            <span>Reconciling Local & Cloud Progress</span>
          </div>
        </div>

        {/* Shimmer progress bar */}
        <div className="mt-5 w-full bg-emerald-950/60 rounded-full h-1.5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-400 via-amber-300 to-teal-300 rounded-full w-2/3 animate-[pulse_1.5s_ease-in-out_infinite]"></div>
        </div>
      </div>

      {/* Greeting & Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/80 shadow-sm animate-pulse">
        <div className="space-y-2.5 w-full max-w-md">
          <div className="h-7 bg-slate-200 rounded-lg w-3/4"></div>
          <div className="h-4 bg-slate-100 rounded-md w-full"></div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="h-9 w-28 bg-slate-200 rounded-xl"></div>
          <div className="h-9 w-32 bg-slate-200 rounded-xl"></div>
        </div>
      </div>

      {/* 4 Metric Pill Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Flame, color: 'text-amber-500' },
          { icon: BookOpen, color: 'text-emerald-500' },
          { icon: Award, color: 'text-teal-500' },
          { icon: Layers, color: 'text-indigo-500' },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 bg-slate-200 rounded w-20"></div>
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <item.icon className={`w-4 h-4 ${item.color} opacity-40`} />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="h-7 bg-slate-200 rounded-md w-16"></div>
              <div className="h-3 bg-slate-100 rounded w-28"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: AI Rescue & Tracks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Learning Tracks & Content Skeletons */}
        <div className="lg:col-span-2 space-y-6">
          {/* Rescue Banner Skeleton */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100/70 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-500 opacity-50" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-4 bg-slate-200 rounded w-36"></div>
                  <div className="h-3 bg-slate-100 rounded w-52"></div>
                </div>
              </div>
              <div className="h-6 w-16 bg-slate-100 rounded-full"></div>
            </div>
            <div className="h-12 bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between">
              <div className="h-3.5 bg-slate-200 rounded w-48"></div>
              <div className="h-7 bg-slate-200 rounded-lg w-24"></div>
            </div>
          </div>

          {/* Active Courses Skeleton Grid */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5 animate-pulse">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="h-5 bg-slate-200 rounded w-40"></div>
              <div className="h-4 bg-slate-100 rounded w-24"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-lg bg-slate-200"></div>
                    <div className="h-4 bg-slate-200 rounded-full w-14"></div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                  </div>
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between">
                      <div className="h-2.5 bg-slate-200 rounded w-10"></div>
                      <div className="h-2.5 bg-slate-200 rounded w-8"></div>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: AI Tutor & Quick Actions Skeleton */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100/70 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-teal-600 opacity-50" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="h-4 bg-slate-200 rounded w-28"></div>
                <div className="h-3 bg-slate-100 rounded w-40"></div>
              </div>
            </div>
            <div className="h-20 bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col justify-center space-y-2">
              <div className="h-3 bg-slate-200 rounded w-full"></div>
              <div className="h-3 bg-slate-200 rounded w-4/5"></div>
            </div>
            <div className="h-10 bg-slate-200 rounded-xl w-full"></div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-slate-200"></div>
                  <div className="h-3 bg-slate-200 rounded w-24"></div>
                </div>
                <div className="h-3 bg-slate-100 rounded w-12"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
