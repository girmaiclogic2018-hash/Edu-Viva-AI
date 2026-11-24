import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { Sparkles, Compass, CheckCircle2, Lock, ArrowRight, BookOpen, Star, Target, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';

interface LearningUniverseProps {
  user: UserProfile;
  setActiveTab?: (tab: string) => void;
}

export const LearningUniverse: React.FC<LearningUniverseProps> = ({ user, setActiveTab }) => {
  const [selectedSphere, setSelectedSphere] = useState<string>('math');
  const [viewMode, setViewMode] = useState<'visual' | 'accessibleList'>('visual');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const universeSpheres = [
    {
      id: 'math',
      name: 'Mathematics & Logic',
      description: 'Algebra, Geometry, Trigonometry, and Quantitative Reasoning',
      progress: 78,
      status: 'active',
      milestones: [
        { title: 'Linear Equations & Graphs', status: 'mastered' },
        { title: 'Quadratic Functions', status: 'mastered' },
        { title: 'Trigonometric Ratios', status: 'current' },
        { title: 'Calculus Introduction', status: 'locked' },
      ],
      color: 'from-teal-500 to-emerald-600',
    },
    {
      id: 'physics',
      name: 'Physical Sciences',
      description: 'Mechanics, Thermodynamics, Electromagnetism, and Optics',
      progress: 65,
      status: 'active',
      milestones: [
        { title: 'Newtonian Motion Laws', status: 'mastered' },
        { title: 'Work, Energy & Power', status: 'mastered' },
        { title: 'Waves & Electromagnetism', status: 'current' },
        { title: 'Quantum Physics Basics', status: 'locked' },
      ],
      color: 'from-blue-500 to-indigo-600',
    },
    {
      id: 'civics',
      name: 'Civics & Ethical Education',
      description: 'Democratic Systems, Constitution, Human Rights, and Community Leadership',
      progress: 90,
      status: 'mastered',
      milestones: [
        { title: 'Constitutional Rights & Duties', status: 'mastered' },
        { title: 'Democratic Participation', status: 'mastered' },
        { title: 'Ethics & Social Justice', status: 'mastered' },
        { title: 'Global Citizenship', status: 'current' },
      ],
      color: 'from-amber-500 to-orange-600',
    },
    {
      id: 'stem',
      name: 'Applied AI & Technology',
      description: 'Digital Literacy, Coding Fundamentals, and AI Problem Solving',
      progress: 45,
      status: 'upcoming',
      milestones: [
        { title: 'Digital Safety & Data Privacy', status: 'mastered' },
        { title: 'Algorithm Logic & Scratch', status: 'current' },
        { title: 'Python & AI Prompts', status: 'locked' },
        { title: 'Community Tech Project', status: 'locked' },
      ],
      color: 'from-purple-500 to-pink-600',
    },
  ];

  const currentSphereIndex = universeSpheres.findIndex(s => s.id === selectedSphere);
  const currentSphereData = universeSpheres[currentSphereIndex] || universeSpheres[0];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      // Swiped left -> next sphere
      const nextIndex = (currentSphereIndex + 1) % universeSpheres.length;
      setSelectedSphere(universeSpheres[nextIndex].id);
    } else if (distance < -minSwipeDistance) {
      // Swiped right -> previous sphere
      const prevIndex = (currentSphereIndex - 1 + universeSpheres.length) % universeSpheres.length;
      setSelectedSphere(universeSpheres[prevIndex].id);
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handlePrevSphere = () => {
    const prevIndex = (currentSphereIndex - 1 + universeSpheres.length) % universeSpheres.length;
    setSelectedSphere(universeSpheres[prevIndex].id);
  };

  const handleNextSphere = () => {
    const nextIndex = (currentSphereIndex + 1) % universeSpheres.length;
    setSelectedSphere(universeSpheres[nextIndex].id);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-teal-500/20 text-teal-300 text-[10px] font-extrabold uppercase tracking-widest rounded-full border border-teal-500/30">
              Signature Feature • The Light of Learning
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">EDUVIVA Learning Universe</h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Visualizing your intellectual pathway, mastered milestones, and future goals across essential subjects and skills. Swipe or tap below to explore.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md self-start md:self-auto">
          <button
            onClick={() => setViewMode('visual')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'visual' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Universe Map
          </button>
          <button
            onClick={() => setViewMode('accessibleList')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'accessibleList' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Accessible Text List
          </button>
        </div>
      </div>

      {viewMode === 'visual' ? (
        <div 
          className="grid md:grid-cols-12 gap-6"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          
          {/* Spheres Navigation Sidebar */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Knowledge Sphere</h3>
              <div className="flex items-center gap-1 md:hidden">
                <button 
                  onClick={handlePrevSphere}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 active:bg-slate-100"
                  aria-label="Previous sphere"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-bold text-slate-600">{currentSphereIndex + 1} / {universeSpheres.length}</span>
                <button 
                  onClick={handleNextSphere}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 active:bg-slate-100"
                  aria-label="Next sphere"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {universeSpheres.map((sphere) => (
              <div
                key={sphere.id}
                onClick={() => setSelectedSphere(sphere.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between active:scale-[0.99] ${
                  selectedSphere === sphere.id
                    ? 'bg-white border-teal-600 shadow-md ring-2 ring-teal-500/20'
                    : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${sphere.color}`}></span>
                    <h4 className="font-bold text-slate-900 text-sm">{sphere.name}</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{sphere.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-teal-700">{sphere.progress}%</span>
                  <p className="text-[9px] text-slate-400 font-medium">Mastered</p>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Sphere Deep Dive */}
          <div className="md:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider bg-teal-50 text-teal-800 px-3 py-1 rounded-full border border-teal-200">
                  Active Knowledge Sphere (Swipe left/right on mobile)
                </span>
                <span className="text-xs font-bold text-slate-600">{currentSphereData.progress}% Progress</span>
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-slate-900">{currentSphereData.name}</h3>
                <p className="text-xs text-slate-600 mt-1">{currentSphereData.description}</p>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${currentSphereData.color} transition-all duration-500`}
                  style={{ width: `${currentSphereData.progress}%` }}
                ></div>
              </div>

              <div className="space-y-3 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Learning Milestones & Concepts</h4>
                <div className="space-y-2.5">
                  {currentSphereData.milestones.map((milestone, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                        milestone.status === 'mastered'
                          ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                          : milestone.status === 'current'
                          ? 'bg-teal-50 border-teal-300 text-teal-900 font-semibold shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {milestone.status === 'mastered' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : milestone.status === 'current' ? (
                          <Target className="w-4 h-4 text-teal-600 shrink-0 animate-pulse" />
                        ) : (
                          <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span>{milestone.title}</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/80 border border-slate-200">
                        {milestone.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-teal-600" /> Curriculum aligned with East African standards
              </span>
              <button
                onClick={() => {
                  setToastMessage(`Opening curriculum modules for ${currentSphereData.name}...`);
                  setTimeout(() => {
                    setToastMessage(null);
                    if (setActiveTab) setActiveTab('lessons');
                  }, 800);
                }}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                Continue Pathway <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* Accessible Text List View for Screen Readers & Simplified Navigation */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Accessible Learning Universe Overview</h3>
          <p className="text-xs text-slate-600">
            This screen-reader friendly view outlines all knowledge spheres, mastered concepts, and active milestones without reliance on spatial graphics.
          </p>
          <div className="space-y-6">
            {universeSpheres.map((sphere) => (
              <div key={sphere.id} className="border border-slate-200 rounded-2xl p-5 space-y-3 bg-slate-50">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 text-base">{sphere.name}</h4>
                  <span className="text-xs font-bold text-teal-700 bg-teal-100 px-3 py-1 rounded-full">{sphere.progress}% Mastered</span>
                </div>
                <p className="text-xs text-slate-600">{sphere.description}</p>
                <div className="space-y-2 pt-2">
                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Milestones:</h5>
                  <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                    {sphere.milestones.map((m, i) => (
                      <li key={i}>
                        <span className="font-medium text-slate-900">{m.title}</span> — Status: <strong className="uppercase text-teal-700">{m.status}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-teal-400 shrink-0 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
