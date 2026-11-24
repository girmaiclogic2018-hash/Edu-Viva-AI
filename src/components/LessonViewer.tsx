import React, { useState } from 'react';
import { UserProfile, LessonModule } from '../types';
import { MOCK_LESSONS, TRANSLATIONS } from '../data/mockData';
import { BookOpen, CheckCircle, Download, Award, Sparkles, ArrowRight, HelpCircle } from 'lucide-react';
import { recordLessonCompletion } from '../utils/firebase';

interface LessonViewerProps {
  user: UserProfile;
  setUser?: React.Dispatch<React.SetStateAction<UserProfile>>;
  setActiveTab: (tab: string) => void;
}

export const LessonViewer: React.FC<LessonViewerProps> = ({ user, setUser, setActiveTab }) => {
  const t = TRANSLATIONS[user.language] || TRANSLATIONS.en;
  const [selectedLesson, setSelectedLesson] = useState<LessonModule>(MOCK_LESSONS[0]);
  const [viewMode, setViewMode] = useState<'verified' | 'ai'>('verified');
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(() => 
    user.offlineDownloadedModules?.includes(selectedLesson.id) || selectedLesson.isDownloaded || false
  );

  const handleQuizAnswer = (optionId: string) => {
    setSelectedQuizAnswer(optionId);
    setShowExplanation(true);
  };

  const toggleDownload = () => {
    const nextVal = !isDownloaded;
    setIsDownloaded(nextVal);
    if (setUser) {
      setUser(prev => {
        const current = prev.offlineDownloadedModules || [];
        const updated = nextVal
          ? Array.from(new Set([...current, selectedLesson.id]))
          : current.filter(id => id !== selectedLesson.id);
        return { ...prev, offlineDownloadedModules: updated };
      });
    }
  };

  const handleCompleteLesson = () => {
    // Record to remote Firestore progress in background
    recordLessonCompletion(user.id, selectedLesson.id, 25).catch(err => {
      console.warn('[LessonViewer] Background Firestore progress sync warning:', err);
    });

    if (setUser) {
      setUser(prev => {
        const currentCompleted = prev.completedLessons || [];
        const isNew = !currentCompleted.includes(selectedLesson.id);
        const updated = isNew ? [...currentCompleted, selectedLesson.id] : currentCompleted;
        const updatedStreak = isNew ? Math.max(1, (prev.streakDays || 0) + 1) : (prev.streakDays || 1);
        return {
          ...prev,
          completedLessons: updated,
          streakDays: updatedStreak,
          isDemo: false, // Transition to active user progress
          lastSyncedAt: new Date().toISOString(),
        };
      });
    }
    setActiveTab('studentHub');
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Sidebar: Lesson List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3 h-fit">
        <h3 className="font-bold text-slate-900 text-sm px-2">Curriculum Modules</h3>
        <div className="space-y-2">
          {MOCK_LESSONS.map((lesson) => {
            const isSelected = lesson.id === selectedLesson.id;
            return (
              <button
                key={lesson.id}
                onClick={() => {
                  setSelectedLesson(lesson);
                  setSelectedQuizAnswer(null);
                  setShowExplanation(false);
                  setIsDownloaded(lesson.isDownloaded || false);
                }}
                className={`w-full text-left p-3 rounded-xl transition-all flex flex-col space-y-1 ${
                  isSelected ? 'bg-emerald-50 border border-emerald-500 text-emerald-900 shadow-xs' : 'bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">{lesson.subject}</span>
                  {lesson.isDownloaded && <Download className="w-3 h-3 text-emerald-600" />}
                </div>
                <h4 className="font-bold text-xs">{lesson.title[user.language] || lesson.title.en}</h4>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Lesson Content */}
      <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Header & Verification Badge Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
              {selectedLesson.subject} • {selectedLesson.gradeLevel}
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-2">
              {selectedLesson.title[user.language] || selectedLesson.title.en}
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleDownload}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                isDownloaded
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              {isDownloaded ? t.downloaded : t.downloadContent}
            </button>
          </div>
        </div>

        {/* Objective */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Learning Objective</h4>
          <p className="text-xs sm:text-sm font-medium text-slate-800">
            {selectedLesson.objective[user.language] || selectedLesson.objective.en}
          </p>
        </div>

        {/* Content Source Distinction Toggle */}
        <div className="flex items-center justify-between bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('verified')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              viewMode === 'verified' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Award className="w-4 h-4 text-emerald-600" />
            {t.verifiedBadge}
          </button>
          <button
            onClick={() => setViewMode('ai')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              viewMode === 'ai' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            {t.aiExplanationBadge}
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-4">
          <div className="text-sm text-slate-700 leading-relaxed">
            {viewMode === 'verified' ? (
              <p>{selectedLesson.verifiedContent[user.language] || selectedLesson.verifiedContent.en}</p>
            ) : (
              <p className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 text-amber-900">
                🤖 <strong>AI Socratic Companion Explanation:</strong> Let's break this down into simple terms! Think of this concept like balancing a seesaw: whatever operation you perform on one side, you must perform on the other to maintain equality.
              </p>
            )}
          </div>

          {/* Examples */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">Examples</h4>
            {selectedLesson.examples.map((ex, i) => (
              <div key={i} className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs font-medium text-slate-800">
                {ex[user.language] || ex.en}
              </div>
            ))}
          </div>
        </div>

        {/* Practice Quiz */}
        <div className="border-t border-slate-200 pt-6 space-y-4">
          <h4 className="font-bold text-slate-900 text-sm">Practice Quiz</h4>
          {selectedLesson.quiz.map((q, idx) => (
            <div key={idx} className="space-y-3">
              <p className="text-xs sm:text-sm font-semibold text-slate-800">
                {idx + 1}. {q.question[user.language] || q.question.en}
              </p>
              <div className="space-y-2">
                {q.options.map((opt) => {
                  const isSelected = selectedQuizAnswer === opt.id;
                  const isCorrect = opt.id === q.correctId;
                  let btnStyle = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';
                  if (showExplanation) {
                    if (isCorrect) btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-900 font-bold';
                    else if (isSelected && !isCorrect) btnStyle = 'bg-rose-100 border-rose-500 text-rose-900';
                  } else if (isSelected) {
                    btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => !showExplanation && handleQuizAnswer(opt.id)}
                      disabled={showExplanation}
                      className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all ${btnStyle}`}
                    >
                      {opt.text[user.language] || opt.text.en}
                    </button>
                  );
                })}
              </div>

              {showExplanation && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                  <p className="font-bold">Explanation:</p>
                  <p>{q.explanation[user.language] || q.explanation.en}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-200 flex justify-between">
          <button
            onClick={() => setActiveTab('aiTutor')}
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            🤖 Need help? Ask AI Tutor
          </button>
          <button
            onClick={handleCompleteLesson}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            Complete Module & Return <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
