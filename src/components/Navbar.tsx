import React from 'react';
import { UserProfile, LanguageCode, UserRole } from '../types';
import { TRANSLATIONS } from '../data/mockData';
import { EduvivaLogo } from './EduvivaLogo';
import { BookOpen, Wifi, WifiOff, Globe, Shield, User, Award, FileText, CheckCircle2, Mail } from 'lucide-react';
import { SyncStatusIndicator } from '../utils/storage';

interface NavbarProps {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  isOffline: boolean;
  setIsOffline: (val: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setShowDocs: (val: boolean) => void;
  setShowAuth: (val: boolean) => void;
  setShowBrandModal: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  setUser,
  isOffline,
  setIsOffline,
  activeTab,
  setActiveTab,
  setShowDocs,
  setShowAuth,
  setShowBrandModal,
}) => {
  const t = TRANSLATIONS[user.language] || TRANSLATIONS.en;

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUser({ ...user, language: e.target.value as LanguageCode });
  };

  const handleRoleSwitch = (role: UserRole) => {
    setUser({ ...user, role });
    if (role === 'student' && activeTab === 'teacherDash') setActiveTab('studentHub');
    if (role === 'teacher' && activeTab === 'studentHub') setActiveTab('teacherDash');
    if (role === 'admin' && activeTab !== 'adminDash') setActiveTab('adminDash');
  };

  return (
    <header className="bg-white border-b border-emerald-100 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo & Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('studentHub')}>
          <EduvivaLogo size="sm" showWordmark={true} />
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1">
          {user.role === 'student' && (
            <>
              <button
                onClick={() => setActiveTab('studentHub')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'studentHub' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t.studentHub}
              </button>
              <button
                onClick={() => setActiveTab('lessons')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'lessons' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t.lessons}
              </button>
              <button
                onClick={() => setActiveTab('aiTutor')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'aiTutor' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                🤖 {t.aiTutor}
              </button>
              <button
                onClick={() => setActiveTab('assessment')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'assessment' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t.assessment}
              </button>
              <button
                onClick={() => setActiveTab('learningUniverse')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'learningUniverse' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                ✨ Universe
              </button>
              <button
                onClick={() => setActiveTab('opportunities')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'opportunities' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t.opportunities}
              </button>
              <button
                onClick={() => setActiveTab('communityHub')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'communityHub' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Community Hub
              </button>
              <button
                onClick={() => setActiveTab('offlineManager')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'offlineManager' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Offline Manager
              </button>
            </>
          )}

          {user.role === 'teacher' && (
            <button
              onClick={() => setActiveTab('teacherDash')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'teacherDash' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t.teacherDash}
            </button>
          )}

          {user.role === 'admin' && (
            <button
              onClick={() => setActiveTab('adminDash')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'adminDash' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t.adminDash}
            </button>
          )}

          <button
            onClick={() => setActiveTab('contact')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
              activeTab === 'contact' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Mail className="w-4 h-4" /> Contact
          </button>
          <button
            onClick={() => setShowDocs(true)}
            className="px-3 py-2 rounded-lg text-sm font-medium text-emerald-700 hover:bg-emerald-50 flex items-center gap-1"
          >
            <FileText className="w-4 h-4" />
            PRD & Specs
          </button>
          <button
            onClick={() => setShowBrandModal(true)}
            className="px-3 py-2 rounded-lg text-sm font-medium text-teal-700 hover:bg-teal-50 flex items-center gap-1 font-bold"
          >
            ✨ Brand & Heritage
          </button>
        </nav>

        {/* Right Controls: Sync Indicator, Language, Offline Toggle, Role, Profile */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          
          {/* Firestore Auto-Save & Sync Indicator */}
          <SyncStatusIndicator user={user} />

          {/* Offline Toggle Simulation */}
          <button
            onClick={() => setIsOffline(!isOffline)}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              isOffline
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}
            title="Toggle online/offline mode for testing low-connectivity architecture"
          >
            {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isOffline ? t.offlineMode : t.onlineMode}</span>
          </button>

          {/* Language Selector */}
          <div className="relative flex items-center">
            <Globe className="w-4 h-4 text-slate-500 absolute left-2 pointer-events-none" />
            <select
              value={user.language}
              onChange={handleLanguageChange}
              className="pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="en">English</option>
              <option value="am">አማርኛ (Amharic)</option>
              <option value="om">Afaan Oromoo</option>
              <option value="so">Soomaali</option>
            </select>
          </div>

          {/* Role Switcher */}
          <div className="hidden lg:flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => handleRoleSwitch('student')}
              className={`px-2 py-1 rounded-md transition-all ${user.role === 'student' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'}`}
            >
              Student
            </button>
            <button
              onClick={() => handleRoleSwitch('teacher')}
              className={`px-2 py-1 rounded-md transition-all ${user.role === 'teacher' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'}`}
            >
              Teacher
            </button>
            <button
              onClick={() => handleRoleSwitch('admin')}
              className={`px-2 py-1 rounded-md transition-all ${user.role === 'admin' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'}`}
            >
              Admin
            </button>
          </div>

          {/* Profile / Auth Button */}
          <button
            onClick={() => setShowAuth(true)}
            className="flex items-center space-x-1.5 p-1.5 sm:px-3 sm:py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors"
          >
            <User className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">{user.name}</span>
          </button>

        </div>

      </div>
    </header>
  );
};
