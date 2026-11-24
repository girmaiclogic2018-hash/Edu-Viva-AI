import React, { useState, useEffect } from 'react';
import { UserProfile } from './types';
import { loadStoredUser, saveStoredUser } from './utils/storage';
import { syncOnLogin, pushUserDataToFirestore } from './utils/syncService';
import { SkeletonLoader } from './components/SkeletonLoader';
import { Navbar } from './components/Navbar';
import { StudentDashboard } from './components/StudentDashboard';
import { LessonViewer } from './components/LessonViewer';
import { AITutorChat } from './components/AITutorChat';
import { AssessmentView } from './components/AssessmentView';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { OpportunityHub } from './components/OpportunityHub';
import { CommunityHub } from './components/CommunityHub';
import { OfflineManager } from './components/OfflineManager';
import { LearningUniverse } from './components/LearningUniverse';
import { LearningRescue } from './components/LearningRescue';
import { AboutFounderModal } from './components/AboutFounderModal';
import { BrandHeritageModal } from './components/BrandHeritageModal';
import { ContactView } from './components/ContactView';
import { DocumentationModal } from './components/DocumentationModal';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [user, setUser] = useState<UserProfile>(loadStoredUser);
  const [isInitialSyncing, setIsInitialSyncing] = useState<boolean>(true);

  const handleUserLogin = async (newUser: UserProfile) => {
    setIsInitialSyncing(true);
    setUser(newUser);
    try {
      const result = await syncOnLogin(newUser);
      if (result.user) {
        setUser((prev) => {
          if (JSON.stringify(prev) !== JSON.stringify(result.user)) {
            return result.user;
          }
          return prev;
        });
      }
    } catch (err) {
      console.warn('[App] User login sync warning:', err);
    } finally {
      setTimeout(() => {
        setIsInitialSyncing(false);
      }, 450);
    }
  };

  // Initialize bidirectional cloud sync on startup / login
  useEffect(() => {
    let isMounted = true;
    setIsInitialSyncing(true);

    syncOnLogin(user)
      .then((result) => {
        if (isMounted && result.user) {
          setUser((prev) => {
            // If remote had new or merged fields, update local state
            if (JSON.stringify(prev) !== JSON.stringify(result.user)) {
              return result.user;
            }
            return prev;
          });
        }
      })
      .catch((err) => {
        console.warn('[App] Initial cloud sync notice:', err);
      })
      .finally(() => {
        if (isMounted) {
          // Graceful transition delay so skeleton smoothly resolves
          setTimeout(() => {
            if (isMounted) setIsInitialSyncing(false);
          }, 450);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Persist to localStorage and debounce push to Firestore on user change
  useEffect(() => {
    saveStoredUser(user, false);
    const timer = setTimeout(() => {
      pushUserDataToFirestore(user).catch((err) => {
        console.warn('[App] Auto-sync to Firestore warning:', err);
      });
    }, 800);
    return () => clearTimeout(timer);
  }, [user]);

  const [activeTab, setActiveTab] = useState<string>('studentHub');
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [showDocs, setShowDocs] = useState<boolean>(false);
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
  const [showBrandModal, setShowBrandModal] = useState<boolean>(false);
  const [showRescueModal, setShowRescueModal] = useState<boolean>(false);
  const [themeMode, setThemeMode] = useState<string>('ethiopian-knowledge');

  // Global Keyboard Navigation for Accessibility (Alt + 1-8)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        return;
      }

      if (e.altKey || e.ctrlKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            setActiveTab('studentHub');
            break;
          case '2':
            e.preventDefault();
            setActiveTab('lessons');
            break;
          case '3':
            e.preventDefault();
            setActiveTab('aiTutor');
            break;
          case '4':
            e.preventDefault();
            setActiveTab('assessment');
            break;
          case '5':
            e.preventDefault();
            setActiveTab('learningUniverse');
            break;
          case '6':
            e.preventDefault();
            setActiveTab('opportunities');
            break;
          case '7':
            e.preventDefault();
            setActiveTab('communityHub');
            break;
          case '8':
            e.preventDefault();
            setActiveTab('offlineManager');
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen habesha-gradient-bg bg-slate-50 flex flex-col font-sans text-slate-900 relative">
      {/* Top Cultural Habesha Tibeb Accent Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-600 shadow-sm"></div>

      {/* Subtle Background Watermark / Aura */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-amber-500/5 via-emerald-500/5 to-transparent pointer-events-none blur-3xl"></div>
      
      {/* Top Navbar */}
      <Navbar
        user={user}
        setUser={setUser}
        isOffline={isOffline}
        setIsOffline={setIsOffline}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setShowDocs={setShowDocs}
        setShowAuth={setShowAuth}
        setShowBrandModal={setShowBrandModal}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isInitialSyncing ? (
          <SkeletonLoader
            message="Connecting to EDUVIVA Cloud Database..."
            subMessage={`Fetching and synchronizing learning progress for ${user.name || 'Learner'}...`}
          />
        ) : (
          <>
            {activeTab === 'studentHub' && (
              <StudentDashboard user={user} setActiveTab={setActiveTab} isOffline={isOffline} />
            )}
            {activeTab === 'lessons' && (
              <LessonViewer user={user} setUser={setUser} setActiveTab={setActiveTab} />
            )}
            {activeTab === 'aiTutor' && (
              <AITutorChat user={user} />
            )}
            {activeTab === 'assessment' && (
              <AssessmentView user={user} setUser={setUser} setActiveTab={setActiveTab} />
            )}
            {activeTab === 'teacherDash' && (
              <TeacherDashboard user={user} />
            )}
            {activeTab === 'adminDash' && (
              <AdminDashboard user={user} />
            )}
            {activeTab === 'opportunities' && (
              <OpportunityHub user={user} />
            )}
            {activeTab === 'communityHub' && (
              <CommunityHub user={user} />
            )}
            {activeTab === 'offlineManager' && (
              <OfflineManager user={user} />
            )}
            {activeTab === 'learningUniverse' && (
              <LearningUniverse user={user} setActiveTab={setActiveTab} />
            )}
            {activeTab === 'contact' && (
              <ContactView user={user} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 EDUVIVA AI. Founded by Girma Haile Bunaro. Global Inclusive AI Education Platform.</p>
          <div className="flex space-x-4 items-center">
            <button onClick={() => setShowAboutModal(true)} className="text-teal-700 font-bold hover:underline">
              About & Founder
            </button>
            <button onClick={() => setShowDocs(true)} className="hover:text-emerald-700 font-medium">
              System Documentation & PRD
            </button>
            <button onClick={() => setActiveTab('opportunities')} className="hover:text-emerald-700 font-medium">
              Opportunity Engine
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showDocs && <DocumentationModal onClose={() => setShowDocs(false)} />}
      {showAuth && <AuthModal user={user} setUser={handleUserLogin} onClose={() => setShowAuth(false)} />}
      {showAboutModal && <AboutFounderModal user={user} isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />}
      {showBrandModal && (
        <BrandHeritageModal
          user={user}
          isOpen={showBrandModal}
          onClose={() => setShowBrandModal(false)}
          currentThemeMode={themeMode}
          setThemeMode={setThemeMode}
        />
      )}
      {showRescueModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <LearningRescue
            user={user}
            onRetry={() => {
              setShowRescueModal(false);
              setActiveTab('aiTutor');
            }}
            onDismiss={() => setShowRescueModal(false)}
          />
        </div>
      )}

    </div>
  );
}
