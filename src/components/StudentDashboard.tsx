import React, { useState, useEffect, useCallback, ReactNode, ErrorInfo } from 'react';
import { UserProfile, UserRole, LanguageCode } from '../types';
import { TRANSLATIONS, MOCK_LESSONS } from '../data/mockData';
import {
  Flame,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Download,
  Sparkles,
  BookOpen,
  Award,
  RefreshCw,
  Clock,
  TrendingUp,
  Target,
  AlertTriangle,
  XCircle,
  WifiOff,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ShieldCheck,
  Radio,
  Wifi
} from 'lucide-react';
import { useRealtimeUserProgress } from '../utils/firebase';

interface StudentDashboardProps {
  user: UserProfile;
  setActiveTab: (tab: string) => void;
  isOffline: boolean;
}

interface ServerProgressData {
  streakDays: number;
  completedLessonsCount: number;
  completedLessonIds: string[];
  diagnosticLevel: string;
  offlineModulesCount: number;
  weeklyLearningMinutes: number;
  masteryScore: number;
  learningRescue: {
    topic: string;
    subject: string;
    reason: string;
    suggestedAction: string;
    lessonId: string;
    priority: 'high' | 'medium' | 'enrichment';
  } | null;
  assessmentScores?: Record<string, number>;
  lastSyncTimestamp?: string;
}

interface FetchErrorInfo {
  userMessage: string;
  technicalDetails?: string;
  isNetworkError: boolean;
  timestamp: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Validation schema result for UserProfile
 */
export interface UserProfileSchemaValidationResult {
  isValid: boolean;
  errors: string[];
  validatedProfile?: UserProfile;
}

/**
 * Strict schema validation checker for UserProfile structure
 * Ensures all required fields, types, enum constraints, and nested structures match UserProfile
 */
export function validateUserProfileSchema(raw: unknown): UserProfileSchemaValidationResult {
  const errors: string[] = [];

  if (!raw || typeof raw !== 'object') {
    return {
      isValid: false,
      errors: ['Data payload must be a non-null JSON object representing a UserProfile.'],
    };
  }

  const obj = raw as Record<string, unknown>;

  // 1. Validate ID
  if (typeof obj.id !== 'string' || obj.id.trim().length === 0) {
    errors.push("Missing or invalid 'id': must be a non-empty string.");
  }

  // 2. Validate Name
  if (typeof obj.name !== 'string' || obj.name.trim().length === 0) {
    errors.push("Missing or invalid 'name': must be a non-empty string.");
  }

  // 3. Validate Email
  if (typeof obj.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(obj.email.trim())) {
    errors.push("Missing or invalid 'email': must be a well-formed email string.");
  }

  // 4. Validate Role enum ('student' | 'teacher' | 'admin')
  const validRoles: UserRole[] = ['student', 'teacher', 'admin'];
  if (typeof obj.role !== 'string' || !validRoles.includes(obj.role as UserRole)) {
    errors.push(`Invalid 'role': must be one of [${validRoles.join(', ')}]. Received: '${String(obj.role)}'.`);
  }

  // 5. Validate GradeLevel
  if (typeof obj.gradeLevel !== 'string' || obj.gradeLevel.trim().length === 0) {
    errors.push("Missing or invalid 'gradeLevel': must be a non-empty string.");
  }

  // 6. Validate LanguageCode enum ('en' | 'am' | 'om' | 'so')
  const validLanguages: LanguageCode[] = ['en', 'am', 'om', 'so'];
  if (typeof obj.language !== 'string' || !validLanguages.includes(obj.language as LanguageCode)) {
    errors.push(`Invalid 'language': must be one of [${validLanguages.join(', ')}]. Received: '${String(obj.language)}'.`);
  }

  // 7. Validate Array fields: subjects & learningGoals
  if (!Array.isArray(obj.subjects)) {
    errors.push("Missing or invalid 'subjects': must be an array of strings.");
  } else if (obj.subjects.some(item => typeof item !== 'string')) {
    errors.push("All items in 'subjects' array must be strings.");
  }

  if (!Array.isArray(obj.learningGoals)) {
    errors.push("Missing or invalid 'learningGoals': must be an array of strings.");
  } else if (obj.learningGoals.some(item => typeof item !== 'string')) {
    errors.push("All items in 'learningGoals' array must be strings.");
  }

  // 8. Validate completedLessons and offlineDownloadedModules arrays
  if (!Array.isArray(obj.completedLessons)) {
    errors.push("Missing or invalid 'completedLessons': must be an array of strings.");
  } else if (obj.completedLessons.some(item => typeof item !== 'string')) {
    errors.push("All items in 'completedLessons' array must be strings.");
  }

  if (!Array.isArray(obj.offlineDownloadedModules)) {
    errors.push("Missing or invalid 'offlineDownloadedModules': must be an array of strings.");
  } else if (obj.offlineDownloadedModules.some(item => typeof item !== 'string')) {
    errors.push("All items in 'offlineDownloadedModules' array must be strings.");
  }

  // 9. Validate streakDays
  if (typeof obj.streakDays !== 'number' || isNaN(obj.streakDays) || obj.streakDays < 0) {
    errors.push("Missing or invalid 'streakDays': must be a non-negative number.");
  }

  // 10. Validate accessibility nested structure
  if (!obj.accessibility || typeof obj.accessibility !== 'object') {
    errors.push("Missing or invalid 'accessibility': must be an object with accessibility flags.");
  } else {
    const acc = obj.accessibility as Record<string, unknown>;
    if (typeof acc.highContrast !== 'boolean') {
      errors.push("'accessibility.highContrast' must be a boolean.");
    }
    if (typeof acc.largeText !== 'boolean') {
      errors.push("'accessibility.largeText' must be a boolean.");
    }
    if (typeof acc.screenReaderOptimized !== 'boolean') {
      errors.push("'accessibility.screenReaderOptimized' must be a boolean.");
    }
  }

  // 11. Validate optional attributes if present
  if (obj.isDemo !== undefined && typeof obj.isDemo !== 'boolean') {
    errors.push("Optional field 'isDemo' must be a boolean if provided.");
  }

  if (obj.diagnosticLevel !== undefined && typeof obj.diagnosticLevel !== 'string') {
    errors.push("Optional field 'diagnosticLevel' must be a string if provided.");
  }

  if (obj.assessmentScores !== undefined) {
    if (!obj.assessmentScores || typeof obj.assessmentScores !== 'object' || Array.isArray(obj.assessmentScores)) {
      errors.push("Optional field 'assessmentScores' must be a key-value record of numbers.");
    } else {
      const scores = obj.assessmentScores as Record<string, unknown>;
      for (const [k, v] of Object.entries(scores)) {
        if (typeof v !== 'number' || isNaN(v)) {
          errors.push(`Assessment score for '${k}' must be a number.`);
          break;
        }
      }
    }
  }

  if (obj.lastSyncedAt !== undefined && typeof obj.lastSyncedAt !== 'string') {
    errors.push("Optional field 'lastSyncedAt' must be a string if provided.");
  }

  // Return validation output
  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
    };
  }

  const accObj = obj.accessibility as Record<string, boolean>;
  const validatedProfile: UserProfile = {
    id: String(obj.id),
    name: String(obj.name),
    email: String(obj.email),
    role: obj.role as UserRole,
    gradeLevel: String(obj.gradeLevel),
    language: obj.language as LanguageCode,
    subjects: (obj.subjects as string[]).map(String),
    learningGoals: (obj.learningGoals as string[]).map(String),
    accessibility: {
      highContrast: Boolean(accObj.highContrast),
      largeText: Boolean(accObj.largeText),
      screenReaderOptimized: Boolean(accObj.screenReaderOptimized),
    },
    streakDays: Math.floor(Number(obj.streakDays)),
    completedLessons: (obj.completedLessons as string[]).map(String),
    offlineDownloadedModules: (obj.offlineDownloadedModules as string[]).map(String),
    isDemo: obj.isDemo !== undefined ? Boolean(obj.isDemo) : undefined,
    diagnosticLevel: typeof obj.diagnosticLevel === 'string' ? obj.diagnosticLevel : undefined,
    assessmentScores: obj.assessmentScores as Record<string, number> | undefined,
    lastSyncedAt: typeof obj.lastSyncedAt === 'string' ? obj.lastSyncedAt : undefined,
  };

  return {
    isValid: true,
    errors: [],
    validatedProfile,
  };
}

/**
 * UI Error Boundary component to capture and display user-friendly fallback if dashboard rendering fails
 */
export class DashboardErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[StudentDashboard Error Boundary]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-xl mx-auto my-8 shadow-sm">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-rose-900 mb-1">
            Unable to load Student Dashboard
          </h3>
          <p className="text-xs text-rose-700 mb-4 max-w-md mx-auto">
            An unexpected error occurred while rendering your progress. Your local learning data and offline lessons are securely preserved.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reload Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Inner Dashboard Component with real-time Firebase synchronization and error-handling wrapper
 */
const StudentDashboardView: React.FC<StudentDashboardProps> = ({ user, setActiveTab, isOffline }) => {
  const t = TRANSLATIONS[user.language] || TRANSLATIONS.en;

  // Real-time Firestore user progress hook
  const {
    progressData,
    isLoading,
    isLive,
    error: firebaseError,
    lastSyncedTimestamp,
    refresh: refreshFirebaseProgress,
  } = useRealtimeUserProgress(user, isOffline);

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [schemaVerified, setSchemaVerified] = useState<boolean>(false);

  // User-friendly Error State Wrapper
  const [fetchError, setFetchError] = useState<FetchErrorInfo | null>(null);
  const [showErrorDetails, setShowErrorDetails] = useState<boolean>(false);

  // Schema validation on user profile and incoming data
  useEffect(() => {
    const validationResult = validateUserProfileSchema(user);
    if (!validationResult.isValid) {
      console.warn('[StudentDashboard] User profile schema validation issues:', validationResult.errors);
      setSchemaVerified(false);
      setFetchError({
        userMessage: 'Initial profile data has minor schema inconsistencies. Operating with safe local fallback values.',
        technicalDetails: `Schema warnings: ${validationResult.errors.join(' | ')}`,
        isNetworkError: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } else {
      setSchemaVerified(true);
    }
  }, [user]);

  // Sync error notification from Firebase hook
  useEffect(() => {
    if (firebaseError) {
      setFetchError({
        userMessage: isOffline
          ? 'You are currently working in offline mode. Locally cached progress and lessons are active.'
          : 'Notice: Real-time Firestore sync encountered a temporary connection issue. Showing local cached statistics.',
        technicalDetails: firebaseError.message || String(firebaseError),
        isNetworkError: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } else if (isLive) {
      // Clear error when successfully live
      setFetchError(null);
    }
  }, [firebaseError, isLive, isOffline]);

  // Manual refresh trigger
  const handleSyncProgress = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (isOffline) {
        setFetchError({
          userMessage: 'Offline mode is currently active. Your lessons and study statistics are saved locally on this device.',
          technicalDetails: 'Network offline: Local storage serves your learning journey.',
          isNetworkError: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        return;
      }
      await refreshFirebaseProgress();
      setFetchError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setFetchError({
        userMessage: 'Unable to refresh remote progress data. Local statistics remain safe and up-to-date.',
        technicalDetails: msg,
        isNetworkError: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [isOffline, refreshFirebaseProgress]);

  // Dynamic recommendations based on remaining modules
  const recommendedLessons = MOCK_LESSONS.filter(
    lesson => !progressData.completedLessonIds.includes(lesson.id)
  ).slice(0, 2);

  const displayLessons = recommendedLessons.length > 0 ? recommendedLessons : MOCK_LESSONS.slice(0, 2);

  return (
    <div className="space-y-6">
      
      {/* Error-Handling Notice / Warning Banner */}
      {fetchError && (
        <div
          id="student-dashboard-error-banner"
          className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 text-xs text-amber-900 shadow-xs transition-all animate-in fade-in"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl mt-0.5 shrink-0">
                {isOffline ? <WifiOff className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-amber-950">
                    {isOffline ? 'Offline Mode Active' : 'Live Sync Notice'}
                  </h4>
                  <span className="text-[10px] bg-amber-200/80 text-amber-900 font-semibold px-2 py-0.5 rounded-full">
                    {fetchError.timestamp}
                  </span>
                </div>
                <p className="mt-1 text-amber-800 leading-relaxed">
                  {fetchError.userMessage}
                </p>

                {/* Technical Details Toggle */}
                {fetchError.technicalDetails && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => setShowErrorDetails(prev => !prev)}
                      className="text-[11px] font-semibold text-amber-900 hover:text-amber-950 inline-flex items-center gap-1 underline cursor-pointer"
                    >
                      {showErrorDetails ? (
                        <>Hide diagnostic info <ChevronUp className="w-3 h-3" /></>
                      ) : (
                        <>Show diagnostic info <ChevronDown className="w-3 h-3" /></>
                      )}
                    </button>

                    {showErrorDetails && (
                      <div className="mt-1.5 p-2.5 bg-amber-100/70 border border-amber-200 rounded-lg font-mono text-[10px] text-amber-900 break-all select-all">
                        {fetchError.technicalDetails}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons: Retry and Dismiss */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={handleSyncProgress}
                disabled={isRefreshing}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Retrying...' : 'Retry Sync'}</span>
              </button>
              <button
                type="button"
                onClick={() => setFetchError(null)}
                className="p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-200/50 rounded-lg transition-colors cursor-pointer"
                title="Dismiss message"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10">
          <Sparkles className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-emerald-700/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-emerald-100 mb-3">
            <span>✨ Ethiopia Pilot Program</span>
            <span>•</span>
            <span>{user.gradeLevel}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Welcome back, {user.name}! 🇪🇹
          </h2>
          <p className="text-emerald-100 text-sm leading-relaxed mb-6">
            {t.tagline}. Continue your personalized learning journey today with your AI tutor and offline-ready lessons.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('lessons')}
              className="px-5 py-2.5 bg-white text-emerald-900 rounded-xl text-xs font-bold hover:bg-emerald-50 transition-colors shadow-md flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              Continue Learning
            </button>
            <button
              onClick={() => setActiveTab('aiTutor')}
              className="px-5 py-2.5 bg-emerald-600 border border-emerald-400 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 transition-colors shadow-md flex items-center gap-2 cursor-pointer"
            >
              🤖 Ask AI Tutor
            </button>
            <button
              onClick={handleSyncProgress}
              disabled={isRefreshing || isLoading}
              className="px-3.5 py-2.5 bg-emerald-900/60 border border-emerald-500/50 hover:bg-emerald-900 text-emerald-100 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Sync latest live progress from Firestore"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Progress'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Demo vs Real Data Status Banner */}
      {user.isDemo ? (
        <div className="bg-amber-500/10 border border-amber-300/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-900">
            <span className="px-2 py-0.5 bg-amber-200 text-amber-900 font-bold rounded-md uppercase tracking-wider text-[10px]">
              Sample Demo Mode
            </span>
            <span className="font-medium">
              Viewing simulated statistics. Take the diagnostic assessment to establish your actual profile.
            </span>
          </div>
          <button
            onClick={() => setActiveTab('assessment')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            Take Diagnostic to Record Real Progress →
          </button>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-300/80 rounded-2xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            {isLive ? (
              <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 font-bold rounded-md uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-emerald-700 animate-pulse" />
                Live Firestore Stream
              </span>
            ) : isOffline ? (
              <span className="px-2 py-0.5 bg-amber-200 text-amber-900 font-bold rounded-md uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <WifiOff className="w-3 h-3 text-amber-700" />
                Offline Local Cache
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 font-bold rounded-md uppercase tracking-wider text-[10px]">
                Live Learner Account
              </span>
            )}
            <span className="font-medium">
              Diagnostic Level: <strong>{progressData.diagnosticLevel}</strong>
            </span>
          </div>
          <div className="flex items-center gap-3">
            {schemaVerified && (
              <span className="text-[11px] text-emerald-800 bg-emerald-100/80 border border-emerald-200 font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Schema Verified
              </span>
            )}
            {lastSyncedTimestamp && (
              <span className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3" /> Last Synced: {lastSyncedTimestamp}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Primary Metrics Grid - Dynamic API Data */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Streak */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4 relative overflow-hidden">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs text-slate-500 font-medium">{t.streak}</p>
              {user.isDemo && <span className="text-[9px] bg-slate-100 text-slate-500 px-1 rounded">Demo</span>}
            </div>
            <p className="text-xl font-bold text-slate-900">{progressData.streakDays} Days</p>
          </div>
        </div>

        {/* Modules Completed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4 relative overflow-hidden">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs text-slate-500 font-medium">{t.completed}</p>
              {user.isDemo && <span className="text-[9px] bg-slate-100 text-slate-500 px-1 rounded">Demo</span>}
            </div>
            <p className="text-xl font-bold text-slate-900">{progressData.completedLessonsCount} Modules</p>
          </div>
        </div>

        {/* Diagnostic Level */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4 relative overflow-hidden">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs text-slate-500 font-medium">Diagnostic Level</p>
              {user.isDemo && <span className="text-[9px] bg-slate-100 text-slate-500 px-1 rounded">Demo</span>}
            </div>
            <p className="text-sm font-bold text-slate-900">
              {progressData.diagnosticLevel}
            </p>
          </div>
        </div>

        {/* Offline Cache */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4 relative overflow-hidden">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl shrink-0">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs text-slate-500 font-medium">Offline Storage</p>
              {user.isDemo && <span className="text-[9px] bg-slate-100 text-slate-500 px-1 rounded">Demo</span>}
            </div>
            <p className="text-sm font-bold text-slate-900">
              {progressData.offlineModulesCount > 0 ? `${progressData.offlineModulesCount} Cached` : '0 Cached'}
            </p>
          </div>
        </div>
      </div>

      {/* Secondary Dynamic Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Weekly Study Time</p>
              <p className="text-lg font-bold text-slate-900">{progressData.weeklyLearningMinutes} Minutes</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-md">
              Target: 150 min/wk
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Curriculum Mastery</p>
              <p className="text-lg font-bold text-slate-900">{progressData.masteryScore}%</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md">
              {progressData.masteryScore >= 80 ? 'Excelling' : progressData.masteryScore >= 50 ? 'On Track' : 'Starting Out'}
            </span>
          </div>
        </div>
      </div>

      {/* Learning Rescue / Target Support System Alert */}
      {progressData.learningRescue ? (
        <div className={`border rounded-2xl p-5 flex items-start space-x-4 ${
          progressData.learningRescue.priority === 'enrichment'
            ? 'bg-blue-50/80 border-blue-200 text-blue-900'
            : 'bg-amber-50/80 border-amber-200 text-amber-900'
        }`}>
          <div className={`p-2.5 rounded-xl mt-0.5 ${
            progressData.learningRescue.priority === 'enrichment'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-amber-100 text-amber-800'
          }`}>
            {progressData.learningRescue.priority === 'enrichment' ? (
              <Target className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm">
                {progressData.learningRescue.priority === 'enrichment' ? 'Enrichment Challenge' : 'Learning Rescue Support'}
              </h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                progressData.learningRescue.priority === 'enrichment'
                  ? 'bg-blue-200 text-blue-800'
                  : 'bg-amber-200 text-amber-800'
              }`}>
                {progressData.learningRescue.subject}
              </span>
            </div>
            <p className="text-xs mt-1.5 leading-relaxed opacity-90">
              Focus Topic: <strong>{progressData.learningRescue.topic}</strong>. {progressData.learningRescue.reason}. {progressData.learningRescue.suggestedAction}.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('lessons')}
                className={`px-3 py-1.5 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                  progressData.learningRescue.priority === 'enrichment'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {progressData.learningRescue.priority === 'enrichment' ? 'Explore Challenge Module' : 'Review Foundational Lesson'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveTab('aiTutor')}
                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                Ask AI Tutor for Clarification
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start space-x-4">
          <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl mt-0.5">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-emerald-900 text-sm">All Core Topics On Track</h4>
            <p className="text-xs text-emerald-700 mt-1">
              You are maintaining steady momentum across your registered subjects! Keep progressing through the modules below or take a diagnostic quiz to assess new topics.
            </p>
          </div>
        </div>
      )}

      {/* Recommended Next Activity */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 text-base">{t.nextActivity}</h3>
          <button
            onClick={() => setActiveTab('lessons')}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
          >
            View All Lessons <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {displayLessons.map((lesson) => {
            const isDone = progressData.completedLessonIds.includes(lesson.id);
            return (
              <div
                key={lesson.id}
                onClick={() => setActiveTab('lessons')}
                className="p-5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer bg-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      {lesson.subject} • {lesson.gradeLevel}
                    </span>
                    <div className="flex items-center gap-2">
                      {isDone && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> Completed
                        </span>
                      )}
                      {lesson.isDownloaded && (
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Download className="w-3 h-3 text-emerald-600" /> Offline Ready
                        </span>
                      )}
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">{lesson.title[user.language] || lesson.title.en}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">{lesson.objective[user.language] || lesson.objective.en}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-emerald-700">
                  <span>{isDone ? 'Practice Again' : 'Start Lesson'}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

/**
 * Export StudentDashboard wrapped in Error Boundary
 */
export const StudentDashboard: React.FC<StudentDashboardProps> = (props) => {
  return (
    <DashboardErrorBoundary>
      <StudentDashboardView {...props} />
    </DashboardErrorBoundary>
  );
};
