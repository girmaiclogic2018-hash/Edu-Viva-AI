import React from 'react';
import { UserProfile } from '../types';
import { Sparkles, Heart, ArrowRight, RefreshCw, BookOpen, CheckCircle } from 'lucide-react';

interface LearningRescueProps {
  user: UserProfile;
  conceptName?: string;
  onRetry: () => void;
  onDismiss: () => void;
}

export const LearningRescue: React.FC<LearningRescueProps> = ({
  user,
  conceptName = 'Algebraic Equations & Variable Isolation',
  onRetry,
  onDismiss,
}) => {
  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl border border-teal-200 p-8 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
      
      <div className="flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center shadow-inner">
          <Heart className="w-8 h-8 fill-teal-500 text-teal-600 animate-pulse" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <span className="text-[10px] font-extrabold uppercase tracking-widest bg-teal-100 text-teal-800 px-3 py-1 rounded-full">
          EDUVIVA Learning Rescue Support
        </span>
        <h3 className="text-2xl font-extrabold text-slate-900">You're getting closer!</h3>
        <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
          Every expert learner faces challenging concepts. Let's take a quick step back and strengthen <strong className="text-teal-700">{conceptName}</strong> before moving forward together.
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 text-xs">
        <h4 className="font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-teal-600" /> Recommended Micro-Rescue Steps:
        </h4>
        <ul className="space-y-2 text-slate-600">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> Review core definition with interactive visual hints.
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> Practice 2 guided Socratic questions with the AI Tutor.
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> Attempt a supportive, stress-free mini check-in quiz.
          </li>
        </ul>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={onDismiss}
          className="px-5 py-2.5 text-slate-600 hover:text-slate-900 font-semibold text-xs transition-colors"
        >
          Return to Dashboard
        </button>
        <button
          onClick={onRetry}
          className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
        >
          Start Rescue Session <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
