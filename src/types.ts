export type UserRole = 'student' | 'teacher' | 'admin';

export type LanguageCode = 'en' | 'am' | 'om' | 'so';

export type SyncState = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

export interface SyncStatusInfo {
  state: SyncState;
  lastSyncedAt: string | null;
  message?: string;
  error?: string | null;
  isFirestoreLive: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  gradeLevel: string; // e.g., 'Grade 8', 'Grade 10', 'TVET'
  language: LanguageCode;
  subjects: string[];
  learningGoals: string[];
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    screenReaderOptimized: boolean;
  };
  streakDays: number;
  completedLessons: string[];
  offlineDownloadedModules: string[];
  isDemo?: boolean; // Distinguishes between sample demonstration data and real persistent user state
  diagnosticLevel?: string; // e.g. 'Not Assessed' | 'Developing' | 'Proficient' | 'Advanced'
  assessmentScores?: Record<string, number>;
  lastSyncedAt?: string;
}

export interface AssessmentQuestion {
  id: string;
  subject: string;
  gradeLevel: string;
  question: {
    en: string;
    am: string;
    om: string;
    so: string;
  };
  options: {
    id: string;
    text: {
      en: string;
      am: string;
      om: string;
      so: string;
    };
  }[];
  correctOptionId: string;
  explanation: {
    en: string;
    am: string;
    om: string;
    so: string;
  };
  conceptGapTag: string;
}

export interface LessonModule {
  id: string;
  title: {
    en: string;
    am: string;
    om: string;
    so: string;
  };
  subject: string;
  gradeLevel: string;
  objective: {
    en: string;
    am: string;
    om: string;
    so: string;
  };
  verifiedContent: {
    en: string;
    am: string;
    om: string;
    so: string;
  };
  examples: {
    en: string;
    am: string;
    om: string;
    so: string;
  }[];
  quiz: {
    question: { en: string; am: string; om: string; so: string };
    options: { id: string; text: { en: string; am: string; om: string; so: string } }[];
    correctId: string;
    explanation: { en: string; am: string; om: string; so: string };
  }[];
  isDownloaded?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
  isHint?: boolean;
}

export interface OpportunityItem {
  id: string;
  title: string;
  provider: string;
  type: 'scholarship' | 'skills' | 'fellowship' | 'competition';
  deadline: string;
  description: string;
  location: string;
  verifiedSource: string;
  linkUrl: string;
}

export interface LearningRescueInfo {
  topic: string;
  subject: string;
  reason: string;
  suggestedAction: string;
  lessonId: string;
  priority: 'high' | 'medium' | 'enrichment';
}

export interface UserProgress {
  userId: string;
  studentName: string;
  email?: string;
  gradeLevel: string;
  streakDays: number;
  completedLessonsCount: number;
  completedLessonIds: string[];
  diagnosticLevel: string;
  offlineModulesCount: number;
  weeklyLearningMinutes: number;
  masteryScore: number;
  learningRescue: LearningRescueInfo | null;
  assessmentScores?: Record<string, number>;
  status?: 'thriving' | 'needs_support' | 'at_risk';
  lastActive?: string;
  lastSyncedAt?: string;
  isDemo?: boolean;
}

export interface StudentProgressRecord {
  studentId: string;
  studentName: string;
  gradeLevel: string;
  completedCount: number;
  averageScore: number;
  identifiedGaps: string[];
  lastActive: string;
  status: 'thriving' | 'needs_support' | 'at_risk';
}
