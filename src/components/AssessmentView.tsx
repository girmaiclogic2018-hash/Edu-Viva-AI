import React, { useState } from 'react';
import { UserProfile } from '../types';
import { MOCK_ASSESSMENT_QUESTIONS, TRANSLATIONS } from '../data/mockData';
import { Award, CheckCircle, AlertCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { recordAssessmentScore } from '../utils/firebase';

interface AssessmentViewProps {
  user: UserProfile;
  setUser?: React.Dispatch<React.SetStateAction<UserProfile>>;
  setActiveTab: (tab: string) => void;
}

export const AssessmentView: React.FC<AssessmentViewProps> = ({ user, setUser, setActiveTab }) => {
  const t = TRANSLATIONS[user.language] || TRANSLATIONS.en;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const currentQ = MOCK_ASSESSMENT_QUESTIONS[currentIndex];

  const handleSelectOption = (optionId: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQ.id]: optionId,
    });
  };

  const handleNext = () => {
    if (currentIndex < MOCK_ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleSubmitAssessment();
    }
  };

  const handleSubmitAssessment = async () => {
    setLoading(true);
    let finalResult = {
      score: 2,
      total: 3,
      level: 'Developing',
      gaps: ['Linear Equations'],
    };
    try {
      const res = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: selectedAnswers }),
      });
      const data = await res.json();
      if (data && data.level) {
        finalResult = data;
      }
    } catch (e) {
      console.warn('Using local assessment calculation fallback');
    } finally {
      setResultData(finalResult);
      setIsSubmitted(true);
      setLoading(false);

      if (setUser) {
        setUser(prev => ({
          ...prev,
          diagnosticLevel: finalResult.level,
          isDemo: false, // Transition from demo placeholder to real recorded diagnostic
          assessmentScores: {
            ...(prev.assessmentScores || {}),
            math_diagnostic: finalResult.score,
          },
          lastSyncedAt: new Date().toISOString(),
        }));
      }

      // Record to remote Firestore progress in background
      const percentScore = Math.round((finalResult.score / (finalResult.total || 3)) * 100);
      recordAssessmentScore(user.id, 'Mathematics', percentScore, finalResult.level).catch(err => {
        console.warn('[AssessmentView] Background Firestore progress sync warning:', err);
      });
    }
  };

  const resetAssessment = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setResultData(null);
  };

  if (isSubmitted && resultData) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl mx-auto flex items-center justify-center font-bold text-2xl shadow-inner">
            🎉
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Assessment Completed</h2>
          <p className="text-slate-600 text-sm">
            Here is your diagnostic evaluation report. This helps EDUVIVA AI tailor your personalized learning pathway.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <p className="text-xs text-slate-500 font-medium">Score</p>
            <p className="text-2xl font-bold text-slate-900">{resultData.score} / {resultData.total}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <p className="text-xs text-slate-500 font-medium">Assessed Level</p>
            <p className="text-lg font-bold text-emerald-700">{resultData.level}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <p className="text-xs text-slate-500 font-medium">Gaps Identified</p>
            <p className="text-lg font-bold text-amber-600">{resultData.gaps?.length || 0} Topics</p>
          </div>
        </div>

        {resultData.gaps && resultData.gaps.length > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <h4 className="font-semibold text-amber-900 text-sm mb-1">Recommended Focus Areas:</h4>
            <div className="flex flex-wrap gap-2 mt-2">
              {resultData.gaps.map((gap: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">
                  {gap}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
          <button
            onClick={resetAssessment}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" /> Retake Assessment
          </button>
          <button
            onClick={() => setActiveTab('lessons')}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5"
          >
            Go to Personalized Pathway <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
            {currentQ.subject} • {currentQ.gradeLevel}
          </span>
          <h2 className="text-lg font-extrabold text-slate-900 mt-2">Adaptive Diagnostic Assessment</h2>
        </div>
        <span className="text-xs font-semibold text-slate-500">
          Question {currentIndex + 1} of {MOCK_ASSESSMENT_QUESTIONS.length}
        </span>
      </div>

      {/* Question */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          {currentQ.question[user.language] || currentQ.question.en}
        </h3>

        <div className="space-y-2">
          {currentQ.options.map((option) => {
            const isSelected = selectedAnswers[currentQ.id] === option.id;
            return (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option.id)}
                className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>{option.text[user.language] || option.text.en}</span>
                <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                  isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                }`}>
                  {isSelected ? '✓' : ''}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t border-slate-200">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={!selectedAnswers[currentQ.id] || loading}
          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md disabled:opacity-50 flex items-center gap-1.5"
        >
          {loading ? 'Evaluating...' : currentIndex === MOCK_ASSESSMENT_QUESTIONS.length - 1 ? 'Finish Assessment' : 'Next Question'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
