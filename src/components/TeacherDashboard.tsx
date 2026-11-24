import React, { useState, useEffect } from 'react';
import { UserProfile, StudentProgressRecord } from '../types';
import { MOCK_STUDENT_PROGRESS, TRANSLATIONS } from '../data/mockData';
import { Users, AlertTriangle, CheckCircle, Award, Sparkles, BookOpen, ArrowRight, CheckCircle2, Radio, RefreshCw } from 'lucide-react';
import { getAllStudentsProgress } from '../utils/firebase';

interface TeacherDashboardProps {
  user: UserProfile;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user }) => {
  const t = TRANSLATIONS[user.language] || TRANSLATIONS.en;
  const [students, setStudents] = useState<StudentProgressRecord[]>(MOCK_STUDENT_PROGRESS);
  const [isLiveFirestore, setIsLiveFirestore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [planApproved, setPlanApproved] = useState(false);

  useEffect(() => {
    async function fetchRoster() {
      setIsLoading(true);
      try {
        const firestoreList = await getAllStudentsProgress();
        if (firestoreList.length > 0) {
          const mapped: StudentProgressRecord[] = firestoreList.map(st => ({
            studentId: st.userId,
            studentName: st.studentName,
            gradeLevel: st.gradeLevel,
            completedCount: st.completedLessonsCount,
            averageScore: st.masteryScore,
            identifiedGaps: st.learningRescue ? [st.learningRescue.topic] : [],
            lastActive: st.lastActive || 'Today',
            status: st.status || (st.masteryScore >= 70 ? 'thriving' : st.masteryScore >= 45 ? 'needs_support' : 'at_risk'),
          }));
          setStudents(mapped);
          setIsLiveFirestore(true);
        }
      } catch (err) {
        console.warn('[TeacherDashboard] Error fetching live student progress:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRoster();
  }, []);

  const handleApprovePlan = () => {
    setPlanApproved(true);
    setToastMessage('Remedial Lesson Plan approved and assigned to 2 students needing support.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleViewReport = () => {
    setToastMessage('Detailed Gap Report: 45% recurring gap in Linear Equations (Inverse Operations).');
    setTimeout(() => setToastMessage(null), 4500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
            Teacher Professional Portal • Grade 8 STEM
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-2">Class Overview & AI Insights</h2>
          <p className="text-xs text-slate-600 mt-1">
            Monitor student learning progress and review AI-generated suggestions for human review. AI never makes final high-stakes academic decisions.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <p className="text-[10px] text-slate-500 font-medium">Total Students</p>
            <p className="text-lg font-bold text-slate-900">{students.length}</p>
          </div>
          <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-center">
            <p className="text-[10px] text-amber-700 font-medium">Needs Support</p>
            <p className="text-lg font-bold text-amber-800">2</p>
          </div>
        </div>
      </div>

      {/* AI Suggestions for Human Review */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <span>AI Insights — Suggestions for Human Review</span>
        </div>
        <p className="text-xs text-amber-800 leading-relaxed">
          Based on recent diagnostic assessments, <strong>45% of students</strong> in Grade 8 Mathematics are experiencing recurring gaps in <em>Linear Equations</em>. We suggest organizing a 15-minute foundational refresher on inverse operations before proceeding to multi-variable equations.
        </p>
        <div className="flex gap-3 pt-2">
          <button 
            onClick={handleApprovePlan}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 ${
              planApproved 
                ? 'bg-emerald-600 text-white' 
                : 'bg-amber-600 text-white hover:bg-amber-700'
            }`}
          >
            {planApproved ? <><CheckCircle2 className="w-3.5 h-3.5" /> Plan Approved</> : 'Approve Remedial Lesson Plan'}
          </button>
          <button 
            onClick={handleViewReport}
            className="px-3 py-1.5 bg-white border border-amber-300 text-amber-800 rounded-lg text-xs font-semibold hover:bg-amber-100 transition-colors cursor-pointer"
          >
            View Detailed Gap Report
          </button>
        </div>
      </div>

      {/* Student Progress Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm">Student Roster & Progress</h3>
            {isLiveFirestore && (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 text-emerald-600 animate-pulse" /> Live Firestore Synced
              </span>
            )}
          </div>
          <span className="text-xs text-slate-500">Showing all enrolled learners</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Student Name</th>
                <th className="px-6 py-3">Grade</th>
                <th className="px-6 py-3">Completed Modules</th>
                <th className="px-6 py-3">Average Score</th>
                <th className="px-6 py-3">Identified Gaps</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {students.map((st) => (
                <tr key={st.studentId} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-bold text-slate-900">{st.studentName}</td>
                  <td className="px-6 py-4">{st.gradeLevel}</td>
                  <td className="px-6 py-4 font-medium">{st.completedCount} Modules</td>
                  <td className="px-6 py-4 font-semibold text-emerald-700">{st.averageScore}%</td>
                  <td className="px-6 py-4">
                    {st.identifiedGaps.length === 0 ? (
                      <span className="text-emerald-600 font-medium">None</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {st.identifiedGaps.map((gap, i) => (
                          <span key={i} className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md text-[10px] font-semibold">
                            {gap}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      st.status === 'thriving' ? 'bg-emerald-100 text-emerald-800' :
                      st.status === 'needs_support' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {st.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
