import { useState, useEffect, useCallback, useRef } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  collection,
  getDocs,
  serverTimestamp,
  FirestoreError,
  Unsubscribe
} from 'firebase/firestore';
import { getFirebaseFirestore } from '../lib/firebase';
import { UserProfile, UserProgress, LearningRescueInfo } from '../types';

/**
 * Computes default initial UserProgress from a UserProfile
 */
export function createDefaultUserProgress(user: UserProfile): UserProgress {
  const isDemo = Boolean(user.isDemo);
  const completedLessons = user.completedLessons || [];
  const streakDays = typeof user.streakDays === 'number' ? user.streakDays : (isDemo ? 30 : 0);
  const offlineModulesCount = user.offlineDownloadedModules?.length ?? (isDemo ? 2 : 0);
  const weeklyMinutes = isDemo ? 120 : (completedLessons.length * 25);
  const masteryScore = isDemo ? 75 : (completedLessons.length > 0 ? 60 : 0);
  const diagnosticLevel = user.diagnosticLevel || (isDemo ? 'Developing' : 'Not Assessed');

  const learningRescue: LearningRescueInfo | null = isDemo ? {
    topic: 'Linear Equations',
    subject: 'Mathematics',
    reason: 'Diagnostic gap identified in inverse operations and isolating variables',
    suggestedAction: 'Review foundational step-by-step guidance before multi-step problem sets',
    lessonId: 'les-math-1',
    priority: 'high',
  } : null;

  return {
    userId: user.id,
    studentName: user.name,
    email: user.email,
    gradeLevel: user.gradeLevel,
    streakDays,
    completedLessonsCount: completedLessons.length,
    completedLessonIds: completedLessons,
    diagnosticLevel,
    offlineModulesCount,
    weeklyLearningMinutes: weeklyMinutes,
    masteryScore,
    learningRescue,
    assessmentScores: user.assessmentScores || {},
    status: masteryScore >= 70 ? 'thriving' : (masteryScore >= 40 ? 'needs_support' : 'at_risk'),
    lastActive: new Date().toISOString(),
    lastSyncedAt: new Date().toISOString(),
    isDemo,
  };
}

/**
 * Sanitizes and normalizes Firestore raw document data into a valid UserProgress object
 */
export function sanitizeUserProgress(raw: unknown, fallback?: Partial<UserProgress>): UserProgress {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;

  const userId = typeof obj.userId === 'string' && obj.userId.trim() ? obj.userId : (fallback?.userId || 'usr-student-001');
  const studentName = typeof obj.studentName === 'string' && obj.studentName.trim() ? obj.studentName : (fallback?.studentName || 'Learner');
  const email = typeof obj.email === 'string' ? obj.email : fallback?.email;
  const gradeLevel = typeof obj.gradeLevel === 'string' ? obj.gradeLevel : (fallback?.gradeLevel || 'Grade 8');

  const streakDays = typeof obj.streakDays === 'number' && !isNaN(obj.streakDays) ? Math.max(0, Math.floor(obj.streakDays)) : (fallback?.streakDays ?? 0);

  const completedLessonIds = Array.isArray(obj.completedLessonIds)
    ? obj.completedLessonIds.filter((id): id is string => typeof id === 'string')
    : (Array.isArray(obj.completedLessons)
        ? obj.completedLessons.filter((id): id is string => typeof id === 'string')
        : (fallback?.completedLessonIds || []));

  const completedLessonsCount = typeof obj.completedLessonsCount === 'number'
    ? Math.max(0, obj.completedLessonsCount)
    : completedLessonIds.length;

  const diagnosticLevel = typeof obj.diagnosticLevel === 'string' ? obj.diagnosticLevel : (fallback?.diagnosticLevel || 'Not Assessed');
  const offlineModulesCount = typeof obj.offlineModulesCount === 'number' ? Math.max(0, obj.offlineModulesCount) : (fallback?.offlineModulesCount ?? 0);
  const weeklyLearningMinutes = typeof obj.weeklyLearningMinutes === 'number' ? Math.max(0, obj.weeklyLearningMinutes) : (fallback?.weeklyLearningMinutes ?? 0);
  const masteryScore = typeof obj.masteryScore === 'number' ? Math.min(100, Math.max(0, obj.masteryScore)) : (fallback?.masteryScore ?? 0);

  let learningRescue: LearningRescueInfo | null = null;
  if (obj.learningRescue && typeof obj.learningRescue === 'object') {
    const lr = obj.learningRescue as Record<string, unknown>;
    if (typeof lr.topic === 'string' && typeof lr.subject === 'string') {
      learningRescue = {
        topic: String(lr.topic),
        subject: String(lr.subject),
        reason: typeof lr.reason === 'string' ? lr.reason : '',
        suggestedAction: typeof lr.suggestedAction === 'string' ? lr.suggestedAction : '',
        lessonId: typeof lr.lessonId === 'string' ? lr.lessonId : 'les-math-1',
        priority: lr.priority === 'enrichment' ? 'enrichment' : lr.priority === 'medium' ? 'medium' : 'high',
      };
    }
  } else if (fallback?.learningRescue) {
    learningRescue = fallback.learningRescue;
  }

  let assessmentScores: Record<string, number> | undefined = undefined;
  if (obj.assessmentScores && typeof obj.assessmentScores === 'object' && !Array.isArray(obj.assessmentScores)) {
    assessmentScores = {};
    for (const [key, val] of Object.entries(obj.assessmentScores as Record<string, unknown>)) {
      if (typeof val === 'number' && !isNaN(val)) {
        assessmentScores[key] = val;
      }
    }
  } else {
    assessmentScores = fallback?.assessmentScores;
  }

  const validStatuses = ['thriving', 'needs_support', 'at_risk'] as const;
  const status = validStatuses.includes(obj.status as typeof validStatuses[number])
    ? (obj.status as typeof validStatuses[number])
    : (fallback?.status || (masteryScore >= 70 ? 'thriving' : masteryScore >= 40 ? 'needs_support' : 'at_risk'));

  const lastActive = typeof obj.lastActive === 'string' ? obj.lastActive : (fallback?.lastActive || new Date().toISOString());
  const lastSyncedAt = typeof obj.lastSyncedAt === 'string' ? obj.lastSyncedAt : (fallback?.lastSyncedAt || new Date().toISOString());
  const isDemo = typeof obj.isDemo === 'boolean' ? obj.isDemo : Boolean(fallback?.isDemo);

  return {
    userId,
    studentName,
    email,
    gradeLevel,
    streakDays,
    completedLessonsCount,
    completedLessonIds,
    diagnosticLevel,
    offlineModulesCount,
    weeklyLearningMinutes,
    masteryScore,
    learningRescue,
    assessmentScores,
    status,
    lastActive,
    lastSyncedAt,
    isDemo,
  };
}

/**
 * ============================================================================
 * FIRESTORE CRUD OPERATIONS FOR USER PROGRESS
 * ============================================================================
 */

/**
 * CREATE: Initializes or creates a user progress record in Firestore
 * Collection: `user_progress/{userId}`
 */
export async function createUserProgress(progress: Partial<UserProgress> & { userId: string }): Promise<UserProgress> {
  const db = getFirebaseFirestore();
  const docRef = doc(db, 'user_progress', progress.userId);

  const now = new Date().toISOString();
  const fullProgress: UserProgress = {
    userId: progress.userId,
    studentName: progress.studentName || 'Learner',
    email: progress.email || '',
    gradeLevel: progress.gradeLevel || 'Grade 8',
    streakDays: progress.streakDays ?? 0,
    completedLessonsCount: progress.completedLessonIds ? progress.completedLessonIds.length : (progress.completedLessonsCount ?? 0),
    completedLessonIds: progress.completedLessonIds || [],
    diagnosticLevel: progress.diagnosticLevel || 'Not Assessed',
    offlineModulesCount: progress.offlineModulesCount ?? 0,
    weeklyLearningMinutes: progress.weeklyLearningMinutes ?? 0,
    masteryScore: progress.masteryScore ?? 0,
    learningRescue: progress.learningRescue ?? null,
    assessmentScores: progress.assessmentScores || {},
    status: progress.status || 'needs_support',
    lastActive: now,
    lastSyncedAt: now,
    isDemo: Boolean(progress.isDemo),
  };

  const payload = {
    ...fullProgress,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(docRef, payload, { merge: true });
  return fullProgress;
}

/**
 * READ (One-Time): Fetches user progress document from Firestore
 */
export async function getUserProgress(userId: string): Promise<UserProgress | null> {
  if (!userId) return null;

  try {
    const db = getFirebaseFirestore();
    const docRef = doc(db, 'user_progress', userId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      return sanitizeUserProgress(snap.data(), { userId });
    }
    return null;
  } catch (error) {
    console.warn(`[Firebase Progress Service] Error fetching progress for ${userId}:`, error);
    throw error;
  }
}

/**
 * READ (Real-Time Subscription): Listens to live user progress updates from Firestore
 * Returns an unsubscribe cleanup function
 */
export function subscribeToUserProgress(
  userId: string,
  onUpdate: (data: UserProgress | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!userId) {
    onUpdate(null);
    return () => {};
  }

  const db = getFirebaseFirestore();
  const docRef = doc(db, 'user_progress', userId);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const rawData = snapshot.data();
        const parsed = sanitizeUserProgress(rawData, { userId });
        onUpdate(parsed);
      } else {
        onUpdate(null);
      }
    },
    (err: FirestoreError) => {
      console.warn(`[Firebase Progress Service] Real-time subscription error for ${userId}:`, err);
      if (onError) {
        onError(err);
      }
    }
  );
}

/**
 * UPDATE: Updates specific fields of a user's progress in Firestore
 */
export async function updateUserProgress(userId: string, updates: Partial<UserProgress>): Promise<void> {
  if (!userId) throw new Error('Cannot update progress: userId is required.');

  const db = getFirebaseFirestore();
  const docRef = doc(db, 'user_progress', userId);

  const payload: Record<string, unknown> = {
    ...updates,
    updatedAt: serverTimestamp(),
    lastSyncedAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  };

  // If completedLessonIds is updated, automatically keep completedLessonsCount in sync
  if (updates.completedLessonIds) {
    payload.completedLessonsCount = updates.completedLessonIds.length;
  }

  // Use setDoc with merge to ensure creation if document didn't exist previously
  await setDoc(docRef, payload, { merge: true });
}

/**
 * DELETE: Removes a user's progress record from Firestore
 */
export async function deleteUserProgress(userId: string): Promise<void> {
  if (!userId) throw new Error('Cannot delete progress: userId is required.');

  const db = getFirebaseFirestore();
  const docRef = doc(db, 'user_progress', userId);
  await deleteDoc(docRef);
}

/**
 * HELPER CRUD: Records completion of a lesson module
 */
export async function recordLessonCompletion(
  userId: string,
  lessonId: string,
  minutesSpent: number = 25
): Promise<void> {
  if (!userId || !lessonId) return;

  const current = await getUserProgress(userId);
  const completedSet = new Set(current?.completedLessonIds || []);
  completedSet.add(lessonId);
  const updatedIds = Array.from(completedSet);

  const currentMinutes = current?.weeklyLearningMinutes ?? 0;
  const currentStreak = current?.streakDays ?? 0;
  const newMinutes = currentMinutes + minutesSpent;
  const newMastery = Math.min(100, Math.round((updatedIds.length / 5) * 100));

  await updateUserProgress(userId, {
    completedLessonIds: updatedIds,
    completedLessonsCount: updatedIds.length,
    weeklyLearningMinutes: newMinutes,
    masteryScore: newMastery,
    streakDays: Math.max(1, currentStreak),
    status: newMastery >= 70 ? 'thriving' : (newMastery >= 40 ? 'needs_support' : 'at_risk'),
  });
}

/**
 * HELPER CRUD: Records an assessment score and updates diagnostic level
 */
export async function recordAssessmentScore(
  userId: string,
  subject: string,
  score: number,
  diagnosticLevel?: string
): Promise<void> {
  if (!userId || !subject) return;

  const current = await getUserProgress(userId);
  const assessmentScores = { ...(current?.assessmentScores || {}), [subject]: score };

  const averageScore = Object.values(assessmentScores).reduce((a, b) => a + b, 0) / Object.values(assessmentScores).length;
  const resolvedLevel = diagnosticLevel || (averageScore >= 80 ? 'Proficient' : averageScore >= 50 ? 'Developing' : 'Foundational');

  // If score is low on a subject, generate targeted Learning Rescue support
  let learningRescue: LearningRescueInfo | null = null;
  if (score < 65) {
    learningRescue = {
      topic: `${subject} Core Fundamentals`,
      subject,
      reason: `Assessment score ${score}% indicates foundational concept gaps`,
      suggestedAction: 'Review foundational interactive lessons with Socratic tutoring guidance',
      lessonId: subject.toLowerCase().includes('math') ? 'les-math-1' : 'les-sci-1',
      priority: 'high',
    };
  }

  await updateUserProgress(userId, {
    assessmentScores,
    diagnosticLevel: resolvedLevel,
    learningRescue,
    masteryScore: Math.round(averageScore),
    status: averageScore >= 70 ? 'thriving' : averageScore >= 45 ? 'needs_support' : 'at_risk',
  });
}

/**
 * READ (All): Fetches all student progress documents (for teacher & admin analytics)
 */
export async function getAllStudentsProgress(): Promise<UserProgress[]> {
  try {
    const db = getFirebaseFirestore();
    const colRef = collection(db, 'user_progress');
    const snap = await getDocs(colRef);

    const results: UserProgress[] = [];
    snap.forEach((docSnap) => {
      if (docSnap.exists()) {
        results.push(sanitizeUserProgress(docSnap.data(), { userId: docSnap.id }));
      }
    });

    return results;
  } catch (error) {
    console.warn('[Firebase Progress Service] Error fetching all student progress:', error);
    return [];
  }
}

/**
 * ============================================================================
 * REACT HOOK FOR REAL-TIME PROGRESS SYNCHRONIZATION
 * ============================================================================
 */

export interface UseRealtimeUserProgressResult {
  progressData: UserProgress;
  isLoading: boolean;
  isLive: boolean;
  error: Error | null;
  lastSyncedTimestamp: string | null;
  updateProgress: (updates: Partial<UserProgress>) => Promise<void>;
  completeLesson: (lessonId: string, minutesSpent?: number) => Promise<void>;
  saveAssessment: (subject: string, score: number, level?: string) => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * React Hook that manages live Firestore subscription for user progress,
 * with automatic document initialization and fallback recovery.
 */
export function useRealtimeUserProgress(
  user: UserProfile,
  isOffline: boolean = false
): UseRealtimeUserProgressResult {
  const defaultProgress = useRef(createDefaultUserProgress(user));
  const [progressData, setProgressData] = useState<UserProgress>(defaultProgress.current);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastSyncedTimestamp, setLastSyncedTimestamp] = useState<string | null>(null);

  // Synchronize default fallback when user prop changes
  useEffect(() => {
    defaultProgress.current = createDefaultUserProgress(user);
  }, [user]);

  // Establish Firestore real-time listener
  useEffect(() => {
    if (isOffline) {
      setIsLoading(false);
      setIsLive(false);
      setProgressData(defaultProgress.current);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeToUserProgress(
      user.id,
      async (liveData) => {
        if (liveData) {
          setProgressData(liveData);
          setIsLive(true);
          setIsLoading(false);
          setLastSyncedTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        } else {
          // If progress doc doesn't exist in Firestore yet, initialize it
          try {
            const initial = createDefaultUserProgress(user);
            await createUserProgress(initial);
            setProgressData(initial);
            setIsLive(true);
            setIsLoading(false);
            setLastSyncedTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          } catch (initErr) {
            console.warn('[Firebase Progress Hook] Initial doc creation fallback:', initErr);
            setProgressData(defaultProgress.current);
            setIsLive(false);
            setIsLoading(false);
          }
        }
      },
      (err) => {
        console.warn('[Firebase Progress Hook] Subscription warning:', err);
        setError(err);
        setIsLive(false);
        setIsLoading(false);
        // Fallback to local profile progress
        setProgressData(defaultProgress.current);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user.id, user, isOffline]);

  // Mutation: Update Progress
  const updateProgress = useCallback(
    async (updates: Partial<UserProgress>) => {
      if (isOffline) {
        setProgressData((prev) => ({ ...prev, ...updates }));
        return;
      }
      try {
        await updateUserProgress(user.id, updates);
      } catch (err) {
        console.error('[Firebase Progress Hook] Failed to update progress:', err);
        throw err;
      }
    },
    [user.id, isOffline]
  );

  // Mutation: Complete Lesson
  const completeLesson = useCallback(
    async (lessonId: string, minutesSpent: number = 25) => {
      if (isOffline) {
        setProgressData((prev) => {
          const completedSet = new Set(prev.completedLessonIds);
          completedSet.add(lessonId);
          const updatedIds = Array.from(completedSet);
          return {
            ...prev,
            completedLessonIds: updatedIds,
            completedLessonsCount: updatedIds.length,
            weeklyLearningMinutes: prev.weeklyLearningMinutes + minutesSpent,
          };
        });
        return;
      }
      await recordLessonCompletion(user.id, lessonId, minutesSpent);
    },
    [user.id, isOffline]
  );

  // Mutation: Save Assessment
  const saveAssessment = useCallback(
    async (subject: string, score: number, level?: string) => {
      if (isOffline) {
        setProgressData((prev) => ({
          ...prev,
          assessmentScores: { ...(prev.assessmentScores || {}), [subject]: score },
          diagnosticLevel: level || prev.diagnosticLevel,
        }));
        return;
      }
      await recordAssessmentScore(user.id, subject, score, level);
    },
    [user.id, isOffline]
  );

  // Manual Refresh Trigger
  const refresh = useCallback(async () => {
    if (isOffline) return;
    setIsLoading(true);
    try {
      const data = await getUserProgress(user.id);
      if (data) {
        setProgressData(data);
        setIsLive(true);
        setLastSyncedTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (err) {
      console.warn('[Firebase Progress Hook] Manual refresh failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user.id, isOffline]);

  return {
    progressData,
    isLoading,
    isLive,
    error,
    lastSyncedTimestamp,
    updateProgress,
    completeLesson,
    saveAssessment,
    refresh,
  };
}
